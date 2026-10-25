import hotkeys from "hotkeys-js";
import { useEffect, useRef } from "react";

export interface HotkeyAction {
  label: string;
  handle(): void;
}

// Hotkey id => action, e.g. { inc: { label: "...", handle: onInc } }
export type HotkeyActions = Record<string, HotkeyAction>;
// Hotkey id => key definition in hotkeys-js syntax, e.g. { inc: "up" }
export type HotkeyBindings = Record<string, string>;

export const emptyBindings = (actions: HotkeyActions): HotkeyBindings =>
  Object.fromEntries(Object.keys(actions).map((id) => [id, ""]));

// Binds the keys to the actions. The latest actions are always called, so they may close over
// the current render's state.
export function useHotkeys(
  actions: HotkeyActions,
  bindings: HotkeyBindings,
): void {
  const actionsRef = useRef(actions);
  useEffect(() => {
    actionsRef.current = actions;
  });

  const keysString = Object.values(bindings).filter(Boolean).join(",");

  useEffect(() => {
    if (keysString.length === 0) {
      return;
    }
    const handler = (_: KeyboardEvent, { key }: { key: string }) => {
      const id = Object.keys(bindings).find((id) => bindings[id] === key);
      if (id) {
        actionsRef.current[id]?.handle();
      }
    };
    hotkeys(keysString, handler);
    return () => hotkeys.unbind(keysString, handler);
  }, [keysString, bindings]);
}
