// The prebuilt browser bundle assigns the library to window.PoweredUP. Importing the ESM
// sources instead would pull in node's Buffer, process and the native noble bindings.
import "node-poweredup/dist/browser/poweredup.js";
import type * as NodePoweredUP from "node-poweredup";

export type { BaseHub, BasicMotor, Device } from "node-poweredup";

declare global {
  interface Window {
    PoweredUP: typeof NodePoweredUP;
  }
}

// node-poweredup 10.1.0 queues motor commands with process.nextTick, but its browser bundle does
// not polyfill process, so every motor command would throw "process is not defined".
if (typeof globalThis.process === "undefined") {
  Object.defineProperty(globalThis, "process", {
    value: {
      nextTick: (fn: (...args: unknown[]) => void, ...args: unknown[]) =>
        queueMicrotask(() => fn(...args)),
    },
  });
}

export const PoweredUPLib = window.PoweredUP;
export const { Consts } = PoweredUPLib;

const poweredUP = new PoweredUPLib.PoweredUP();

const usePoweredup = () => poweredUP;

export default usePoweredup;
