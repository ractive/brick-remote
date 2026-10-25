import type { BaseHub } from "../poweredup";
import {
  createSimulatedHub,
  type SimulatedHubDevice,
} from "./SimulatedHubDevice";

declare global {
  interface Window {
    // The simulated peripheral of the "?fakeHub" mode, for poking at it in the dev console
    simulatedHub?: SimulatedHubDevice;
  }
}

// Creates a simulated Control+ hub with motors on A, B and D whose tilt sensor slowly rocks
export function createFakeHub(): BaseHub {
  const { hub, device } = createSimulatedHub({
    uuid: "fake-hub",
    name: "Fake Hub",
  });
  window.simulatedHub = device;

  let t = 0;
  const interval = setInterval(() => {
    t += 1;
    device.setTilt(
      Math.round(20 * Math.sin(t / 5)),
      Math.round(10 * Math.cos(t / 7)),
    );
  }, 500);
  device.on("disconnect", () => clearInterval(interval));
  device.on("power", (port: string, power: number) =>
    console.log(`[fakeHub] port ${port} power ${power}`),
  );

  return hub;
}
