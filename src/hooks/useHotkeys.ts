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

  useEffect(() => {
    // One handler per action: hotkeys-js normalizes the key definition (strips whitespace,
    // splits "a,b" into two keys), so the reported key can't be mapped back to the binding.
    const registered = Object.entries(bindings)
      .filter(([, keys]) => keys.trim().length > 0)
      .map(([id, keys]) => {
        const handler = () => actionsRef.current[id]?.handle();
        hotkeys(keys, handler);
        return () => hotkeys.unbind(keys, handler);
      });
    return () => registered.forEach((unbind) => unbind());
  }, [bindings]);
}
