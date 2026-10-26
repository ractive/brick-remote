import type { BaseHub, BasicMotor } from "./poweredup";
import { PoweredUPLib } from "./poweredup";

export function motorAt(
  hub: BaseHub | undefined,
  port: string,
): BasicMotor | undefined {
  const device = hub?.connected ? hub.getDeviceAtPort(port) : undefined;
  return device instanceof PoweredUPLib.BasicMotor ? device : undefined;
}

// Sends the power to the motor at the given port. Interrupts queued commands so that the latest
// value from the slider or a hotkey always wins instead of queueing up behind older ones.
export function setMotorPower(
  hub: BaseHub | undefined,
  port: string,
  power: number,
): void {
  const motor = motorAt(hub, port);
  if (motor) {
    motor
      .setPower(power, true)
      ?.catch((err: unknown) =>
        console.log(`Error while setting power on port ${port}`, err),
      );
  }
}
