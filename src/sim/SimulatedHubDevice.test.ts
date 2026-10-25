import { describe, expect, it, vi } from "vitest";
import { motorAt } from "../motors";
import { Consts, PoweredUPLib, type BaseHub, type Device } from "../poweredup";
import { createSimulatedHub } from "./SimulatedHubDevice";

function nextEvent<T>(hub: BaseHub, event: string) {
  return new Promise<T>((resolve) => hub.once(event, resolve));
}

async function connectedHub() {
  const sim = createSimulatedHub();
  const attached: Device[] = [];
  sim.hub.on("attach", (device: Device) => attached.push(device));
  await sim.hub.connect();
  await vi.waitFor(() => expect(sim.hub.getDeviceAtPort("D")).toBeDefined());
  return { ...sim, attached };
}

describe("simulated Control+ hub driven by the real node-poweredup", () => {
  it("connects and reports hub properties", async () => {
    const { hub } = await connectedHub();
    expect(hub.type).toBe(Consts.HubType.TECHNIC_MEDIUM_HUB);
    expect(hub.batteryLevel).toBe(87);
    expect(hub.primaryMACAddress).toBe("90:84:2b:00:00:01");
  });

  it("emits attach with a device that knows its port name", async () => {
    const { attached } = await connectedHub();
    const motor = attached.find((d) => d.portName === "A");
    expect(motor?.type).toBe(Consts.DeviceType.TECHNIC_LARGE_LINEAR_MOTOR);
    expect(attached.map((d) => d.portName)).toContain("TILT_SENSOR");
  });

  it("sends motor power as port output commands", async () => {
    const { hub, device } = await connectedHub();
    const motor = motorAt(hub, "A");
    expect(motor).toBeInstanceOf(PoweredUPLib.TechnicLargeLinearMotor);
    await motor?.setPower(-40, true);
    expect(device.power.A).toBe(-40);
    await motor?.setPower(70, true);
    expect(device.power.A).toBe(70);
  });

  it("delivers tilt values to device listeners", async () => {
    const { hub, device } = await connectedHub();
    const tilt = hub.getDeviceAtPort("TILT_SENSOR")!;
    const values: { x: number; y: number }[] = [];
    tilt.on("tilt", (v) => values.push(v));
    await vi.waitFor(() => expect(values).toHaveLength(1)); // initial value on subscribe
    device.setTilt(12, -30);
    await vi.waitFor(() =>
      expect(values.at(-1)).toMatchObject({ x: 12, y: -30 }),
    );
  });

  it("emits detach and disconnect", async () => {
    const { hub, device } = await connectedHub();
    const detached = nextEvent<Device>(hub, "detach");
    device.detach("B");
    expect((await detached).portName).toBe("B");

    const disconnected = nextEvent(hub, "disconnect");
    await hub.disconnect();
    await disconnected;
    expect(hub.connected).toBe(false);
  });

  it("renames the hub", async () => {
    const { hub, device } = await connectedHub();
    await hub.setName("Bulldozer");
    await vi.waitFor(() => expect(device.name).toBe("Bulldozer"));
    expect(hub.name).toBe("Bulldozer");
  });
});
