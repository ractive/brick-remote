import { EventEmitter } from "events";
import type { IBLEAbstraction } from "node-poweredup/dist/interfaces.js";
import { Consts, PoweredUPLib } from "../poweredup";

// A fake bluetooth peripheral that speaks the LEGO Wireless Protocol 3 (LWP3) like a Technic
// Control+ hub. It is wrapped in the library's real TechnicMediumHub, so everything above the
// bluetooth layer (message parsing, device classes, command queueing) is the real node-poweredup
// code. Used for the "?fakeHub" dev mode and the tests.

const { DeviceType } = Consts;

const MessageType = {
  HUB_PROPERTIES: 0x01,
  HUB_ATTACHED_IO: 0x04,
  PORT_VALUE_SINGLE: 0x45,
  PORT_INPUT_FORMAT_SETUP_SINGLE: 0x41,
  PORT_INPUT_FORMAT_SINGLE: 0x47,
  PORT_OUTPUT_COMMAND: 0x81,
  PORT_OUTPUT_COMMAND_FEEDBACK: 0x82,
} as const;

const HubProperty = {
  ADVERTISING_NAME: 0x01,
  FW_VERSION: 0x03,
  HW_VERSION: 0x04,
  RSSI: 0x05,
  BATTERY_VOLTAGE: 0x06,
  PRIMARY_MAC_ADDRESS: 0x0d,
} as const;

const HubPropertyOperation = {
  SET: 0x01,
  ENABLE_UPDATES: 0x02,
  REQUEST_UPDATE: 0x05,
  UPDATE: 0x06,
} as const;

// Port ids of the Technic Medium Hub, see node-poweredup's TechnicMediumHub PortMap
export const PortId: Record<string, number> = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  HUB_LED: 50,
  CURRENT_SENSOR: 59,
  VOLTAGE_SENSOR: 60,
  ACCELEROMETER: 97,
  GYRO_SENSOR: 98,
  TILT_SENSOR: 99,
};

const BUILT_IN_DEVICES: [string, number][] = [
  ["HUB_LED", DeviceType.HUB_LED],
  ["CURRENT_SENSOR", DeviceType.CURRENT_SENSOR],
  ["VOLTAGE_SENSOR", DeviceType.VOLTAGE_SENSOR],
  ["ACCELEROMETER", DeviceType.TECHNIC_MEDIUM_HUB_ACCELEROMETER],
  ["GYRO_SENSOR", DeviceType.TECHNIC_MEDIUM_HUB_GYRO_SENSOR],
  ["TILT_SENSOR", DeviceType.TECHNIC_MEDIUM_HUB_TILT_SENSOR],
];

export interface SimulatedHubOptions {
  uuid?: string;
  name?: string;
  batteryLevel?: number;
  // External devices by port name, e.g. { A: DeviceType.TECHNIC_LARGE_LINEAR_MOTOR }
  ports?: Record<string, number>;
}

export class SimulatedHubDevice
  extends EventEmitter
  implements IBLEAbstraction
{
  public uuid: string;
  public name: string;
  public connecting = false;
  public connected = false;
  // Last power sent to each port (by port name), -100..100
  public readonly power: Record<string, number> = {};
  public readonly sentMessages: Uint8Array[] = [];

  private batteryLevel: number;
  private readonly initialPorts: Record<string, number>;
  private readonly subscribedPorts = new Set<number>();
  private notify?: (data: Buffer) => void;

  constructor(options: SimulatedHubOptions = {}) {
    super();
    this.uuid = options.uuid ?? "simulated-hub";
    this.name = options.name ?? "Simulated Hub";
    this.batteryLevel = options.batteryLevel ?? 87;
    this.initialPorts = options.ports ?? {
      A: DeviceType.TECHNIC_LARGE_LINEAR_MOTOR,
      B: DeviceType.TECHNIC_LARGE_LINEAR_MOTOR,
      D: DeviceType.TECHNIC_XLARGE_LINEAR_MOTOR,
    };
  }

  public async connect(): Promise<void> {
    this.connected = true;
  }

  public async disconnect(): Promise<void> {
    if (this.connected) {
      this.connected = false;
      this.subscribedPorts.clear();
      this.emit("disconnect");
    }
  }

  public async discoverCharacteristicsForService(): Promise<void> {}

  public subscribeToCharacteristic(
    _uuid: string,
    callback: (data: Buffer) => void,
  ): void {
    this.notify = callback;
    // A real hub reports its attached devices as soon as notifications are enabled
    setTimeout(() => {
      BUILT_IN_DEVICES.forEach(([port, type]) => this.attach(port, type));
      Object.entries(this.initialPorts).forEach(([port, type]) =>
        this.attach(port, type),
      );
    });
  }

  public addToCharacteristicMailbox(): void {}

  public readFromCharacteristic(): void {}

  public async writeToCharacteristic(
    _uuid: string,
    data: Buffer,
  ): Promise<void> {
    const message = Uint8Array.from(data);
    this.sentMessages.push(message);
    // Answer asynchronously like a real peripheral
    setTimeout(() => this.handle(message));
  }

  // ------------------------------------------------------------------------------------------
  // Hub side behaviour, callable from tests and the dev console

  public attach(port: string, deviceType: number): void {
    // [portId, event=attached, type (u16), hw version (i32), sw version (i32)]
    this.send(MessageType.HUB_ATTACHED_IO, [
      PortId[port],
      0x01,
      ...u16(deviceType),
      ...i32(0x10000000),
      ...i32(0x10000000),
    ]);
  }

  public detach(port: string): void {
    delete this.power[port];
    this.send(MessageType.HUB_ATTACHED_IO, [PortId[port], 0x00]);
  }

  public setTilt(x: number, y: number, z = 0): void {
    const portId = PortId.TILT_SENSOR;
    if (this.subscribedPorts.has(portId)) {
      // TechnicMediumHubTiltSensor reads z (negated), y and x as int16
      this.send(MessageType.PORT_VALUE_SINGLE, [
        portId,
        ...i16(-z),
        ...i16(y),
        ...i16(x),
      ]);
    }
  }

  public setBatteryLevel(level: number): void {
    this.batteryLevel = level;
    this.sendProperty(HubProperty.BATTERY_VOLTAGE, [level]);
  }

  // ------------------------------------------------------------------------------------------

  private handle(message: Uint8Array): void {
    // [length, hub id, message type, ...payload]
    const type = message[2];
    const payload = message.subarray(3);
    switch (type) {
      case MessageType.HUB_PROPERTIES:
        this.handleProperty(payload);
        break;
      case MessageType.PORT_INPUT_FORMAT_SETUP_SINGLE: {
        const [portId, mode] = payload;
        this.subscribedPorts.add(portId);
        this.send(MessageType.PORT_INPUT_FORMAT_SINGLE, [...payload]);
        if (portId === PortId.TILT_SENSOR && mode === 0) {
          this.setTilt(0, 0);
        }
        break;
      }
      case MessageType.PORT_OUTPUT_COMMAND: {
        // [portId, startup and completion, sub command, mode, ...data]
        const [portId, , subCommand, mode, value] = payload;
        const port = portName(portId);
        if (port && subCommand === 0x51 && mode === 0x00) {
          this.power[port] = (value << 24) >> 24; // signed int8
          this.emit("power", port, this.power[port]);
        }
        // Buffer empty, command completed, idle
        this.send(MessageType.PORT_OUTPUT_COMMAND_FEEDBACK, [portId, 0x0a]);
        break;
      }
    }
  }

  private handleProperty(payload: Uint8Array): void {
    const [property, operation] = payload;
    if (operation === HubPropertyOperation.SET) {
      if (property === HubProperty.ADVERTISING_NAME) {
        this.name = new TextDecoder().decode(payload.subarray(2));
        this.emit("name", this.name);
      }
      return;
    }
    if (
      operation !== HubPropertyOperation.REQUEST_UPDATE &&
      operation !== HubPropertyOperation.ENABLE_UPDATES
    ) {
      return;
    }
    switch (property) {
      case HubProperty.FW_VERSION:
      case HubProperty.HW_VERSION:
        this.sendProperty(property, i32(0x10000000));
        break;
      case HubProperty.RSSI:
        this.sendProperty(property, [-50 & 0xff]);
        break;
      case HubProperty.BATTERY_VOLTAGE:
        this.sendProperty(property, [this.batteryLevel]);
        break;
      case HubProperty.PRIMARY_MAC_ADDRESS:
        this.sendProperty(property, [0x90, 0x84, 0x2b, 0x00, 0x00, 0x01]);
        break;
    }
  }

  private sendProperty(property: number, value: number[]): void {
    this.send(MessageType.HUB_PROPERTIES, [
      property,
      HubPropertyOperation.UPDATE,
      ...value,
    ]);
  }

  private send(type: number, payload: number[]): void {
    if (!this.connected || !this.notify) {
      return;
    }
    const message = Uint8Array.from([
      payload.length + 3,
      0x00,
      type,
      ...payload,
    ]);
    // The library only needs Buffer methods on what it concatenates internally
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    this.notify(message as Buffer);
  }
}

function portName(portId: number): string | undefined {
  return Object.keys(PortId).find((name) => PortId[name] === portId);
}

function u16(value: number): number[] {
  return [value & 0xff, (value >> 8) & 0xff];
}

function i16(value: number): number[] {
  return u16(value & 0xffff);
}

function i32(value: number): number[] {
  return [0, 8, 16, 24].map((shift) => (value >> shift) & 0xff);
}

export function createSimulatedHub(options?: SimulatedHubOptions) {
  const device = new SimulatedHubDevice(options);
  const hub = new PoweredUPLib.TechnicMediumHub(device);
  return { hub, device };
}
