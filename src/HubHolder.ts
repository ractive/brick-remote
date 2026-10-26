import { type BaseHub, Consts } from "./poweredup";

const TILT_SENSORS = new Set<number>([
  Consts.DeviceType.TILT_SENSOR,
  Consts.DeviceType.MOVE_HUB_TILT_SENSOR,
  Consts.DeviceType.TECHNIC_MEDIUM_HUB_TILT_SENSOR,
]);

// Immutable snapshot of a hub's state for rendering; the reducer in App replaces it on changes
export class HubHolder {
  public readonly hub: BaseHub;
  public readonly name: string;
  public readonly connected: boolean;
  // Device type by port name, e.g. "A" => TECHNIC_LARGE_LINEAR_MOTOR
  public readonly devices: ReadonlyMap<string, number>;

  constructor(
    hub: BaseHub,
    name: string = hub.name,
    connected = false,
    devices: ReadonlyMap<string, number> = new Map(),
  ) {
    this.hub = hub;
    this.name = name;
    this.connected = connected;
    this.devices = devices;
  }

  public with(
    changes: Partial<Pick<HubHolder, "name" | "connected" | "devices">>,
  ): HubHolder {
    return new HubHolder(
      this.hub,
      changes.name ?? this.name,
      changes.connected ?? this.connected,
      changes.devices ?? this.devices,
    );
  }

  public withDevice(port: string, deviceType: number | undefined): HubHolder {
    const devices = new Map(this.devices);
    if (deviceType === undefined) {
      devices.delete(port);
    } else {
      devices.set(port, deviceType);
    }
    return this.with({ devices });
  }

  public getUuid(): string {
    return this.hub.uuid;
  }

  public getPrimaryMACAddress(): string {
    return this.hub.primaryMACAddress;
  }

  public getHubType(): string {
    return Consts.HubType[this.hub.type] ?? `unknown:${this.hub.type}`;
  }

  public deviceTypeName(port: string): string {
    const type = this.devices.get(port);
    if (type === undefined) {
      return "not attached";
    }
    return Consts.DeviceType[type] ?? `unknown:${type}`;
  }

  public get tiltPort(): string | undefined {
    for (const [port, type] of this.devices) {
      if (TILT_SENSORS.has(type)) {
        return port;
      }
    }
    return undefined;
  }
}
