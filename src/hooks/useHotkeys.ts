import hotkeys, { HotkeysEvent } from "hotkeys-js";
import { useCallback, useEffect } from "react";

// Inspired by https://github.com/JohannesKlauss/react-hotkeys-hook/blob/master/src/index.ts
type KeyHandler = (
  keyboardEvent: KeyboardEvent,
  hotkeysEvent: HotkeysEvent
) => void;

export function useHotkeys(
  keys: string[],
  keyHandler: KeyHandler,
  deps: unknown[] = []
): void {
  // filter empty strings
  const keysString = keys.filter(Boolean).join(",");

  const callback = useCallback(keyHandler, deps);
  useEffect(() => {
    if (keysString.length > 0) {
      hotkeys(keysString, callback);
      return () => hotkeys.unbind(keysString, callback);
    }
  }, [keysString, callback]);
}
