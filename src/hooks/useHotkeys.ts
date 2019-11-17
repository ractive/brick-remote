import hotkeys, {HotkeysEvent} from "hotkeys-js";
import {useCallback, useEffect} from "react";

// Inspired by https://github.com/JohannesKlauss/react-hotkeys-hook/blob/master/src/index.ts
type KeyHandler = (keyboardEvent: KeyboardEvent, hotkeysEvent: HotkeysEvent) => void;

export function useHotkeys(keys: string[], keyHandler: KeyHandler, deps: any[] = []) {
    const callback = useCallback(keyHandler, deps);

    useEffect(() => {
        // filter empty strings
        const keysString = keys.filter(Boolean).join(",");
        hotkeys(keysString, callback);
        return () => hotkeys.unbind(keysString, callback);
    }, [keys, callback]);
}
