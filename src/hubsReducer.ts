import type { Dispatch } from "react";
import { HubHolder } from "./HubHolder";
import type { BaseHub, Device } from "./poweredup";

export type HubAction =
  | { type: "discover"; hub: BaseHub }
  | { type: "connect"; hub: BaseHub }
  | { type: "disconnect"; hub: BaseHub }
  | { type: "rename"; hub: BaseHub; name: string }
  | { type: "attach"; hub: BaseHub; port: string; deviceType: number }
  | { type: "detach"; hub: BaseHub; port: string };

// Actions are matched by hub instance, not by uuid: the library creates a new instance every time
// a hub is picked in the bluetooth chooser, also for a hub that is already in the list
export function hubsReducer(
  hubHolders: HubHolder[],
  action: HubAction,
): HubHolder[] {
  const update = (fn: (hubHolder: HubHolder) => HubHolder) =>
    hubHolders.map((h) => (h.hub === action.hub ? fn(h) : h));

  switch (action.type) {
    case "discover":
      // A new instance replaces an older one of the same hub, whose events then match nothing
      return [
        ...hubHolders.filter(
          (h) => h.hub !== action.hub && h.getUuid() !== action.hub.uuid,
        ),
        new HubHolder(action.hub),
      ];
    case "connect":
      return update((h) => h.with({ connected: true }));
    case "disconnect":
      return hubHolders.filter((h) => h.hub !== action.hub);
    case "rename":
      return update((h) => h.with({ name: action.name }));
    case "attach":
      return update((h) => h.withDevice(action.port, action.deviceType));
    case "detach":
      return update((h) => h.withDevice(action.port, undefined));
  }
}

// Wires a discovered hub's events to the reducer and connects to it
export async function connectHub(
  hub: BaseHub,
  dispatch: Dispatch<HubAction>,
): Promise<void> {
  dispatch({ type: "discover", hub });
  hub.on("attach", ({ portName: port, type: deviceType }: Device) => {
    if (port) {
      dispatch({ type: "attach", hub, port, deviceType });
    }
  });
  hub.on("detach", ({ portName: port }: Device) => {
    if (port) {
      dispatch({ type: "detach", hub, port });
    }
  });
  hub.on("disconnect", () => dispatch({ type: "disconnect", hub }));

  console.log("Connecting to hub:", hub.uuid);
  try {
    await hub.connect();
  } catch (e) {
    // Don't leave a "Connecting...." card behind that can't be dismissed
    dispatch({ type: "disconnect", hub });
    throw e;
  }
  console.log("Connected ✔");
  dispatch({ type: "connect", hub });
}

export function canRename(
  hub: BaseHub,
): hub is BaseHub & { setName(name: string): Promise<void> } {
  return "setName" in hub && typeof hub.setName === "function";
}
