import { renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useHotkeys } from "./useHotkeys";

describe("useHotkeys", () => {
  it("fires bindings that hotkeys-js normalizes", async () => {
    const user = userEvent.setup();
    const inc = vi.fn<() => void>();
    const stop = vi.fn<() => void>();
    renderHook(() =>
      useHotkeys(
        {
          inc: { label: "inc", handle: inc },
          stop: { label: "stop", handle: stop },
        },
        // Whitespace around "+" and several keys for one action
        { inc: "shift + w", stop: "a, b" },
      ),
    );

    await user.keyboard("{Shift>}w{/Shift}");
    expect(inc).toHaveBeenCalledTimes(1);

    await user.keyboard("ab");
    expect(stop).toHaveBeenCalledTimes(2);
  });

  it("unbinds the keys on unmount", async () => {
    const user = userEvent.setup();
    const inc = vi.fn<() => void>();
    const { unmount } = renderHook(() =>
      useHotkeys({ inc: { label: "inc", handle: inc } }, { inc: "q" }),
    );
    unmount();
    await user.keyboard("q");
    expect(inc).not.toHaveBeenCalled();
  });
});
