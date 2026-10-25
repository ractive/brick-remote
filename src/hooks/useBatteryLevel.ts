import { useCallback, useSyncExternalStore } from "react";
import type { BaseHub } from "../poweredup";

export function useBatteryLevel(hub: BaseHub): number {
  const subscribe = useCallback(
    (onChange: () => void) => {
      hub.on("batteryLevel", onChange);
      return () => {
        hub.removeListener("batteryLevel", onChange);
      };
    },
    [hub],
  );
  return useSyncExternalStore(subscribe, () => hub.batteryLevel);
}
