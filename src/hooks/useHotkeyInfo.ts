import { useHotkeys } from "./useHotkeys";

export interface IHotKeyInfo {
  [id: string]: {
    key: string;
    label: string;
    handle(key: string): void;
  };
}

export function useHotkeyInfo(hotkeyInfo: IHotKeyInfo): void {
  useHotkeys(
    Object.values(hotkeyInfo).map((k) => k.key),
    (e, handler) => {
      const keyInfo = Object.values(hotkeyInfo).find(
        (k) => handler.key === k.key
      );
      if (keyInfo) {
        keyInfo.handle(handler.key);
      }
    },
    [hotkeyInfo]
  );
}
