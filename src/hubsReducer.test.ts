import { describe, expect, it, vi } from "vitest";
import { connectHub, hubsReducer } from "./hubsReducer";
import { createSimulatedHub } from "./sim/SimulatedHubDevice";

describe("hubsReducer", () => {
  it("replaces an older instance of the same hub on discover", () => {
    const first = createSimulatedHub({ uuid: "same" }).hub;
    const second = createSimulatedHub({ uuid: "same" }).hub;
    const other = createSimulatedHub({ uuid: "other" }).hub;

    let state = hubsReducer([], { type: "discover", hub: first });
    state = hubsReducer(state, { type: "discover", hub: other });
    state = hubsReducer(state, { type: "discover", hub: second });
    expect(state.map((h) => h.hub)).toEqual([other, second]);

    // Late events of the replaced instance change nothing
    expect(hubsReducer(state, { type: "disconnect", hub: first })).toEqual(
      state,
    );
  });

  it("removes the hub again when connecting fails", async () => {
    const { hub } = createSimulatedHub();
    vi.spyOn(hub, "connect").mockRejectedValue(new Error("GATT error"));
    const dispatch = vi.fn<Parameters<typeof connectHub>[1]>();

    await expect(connectHub(hub, dispatch)).rejects.toThrow("GATT error");
    expect(dispatch.mock.calls.map(([a]) => a.type)).toEqual([
      "discover",
      "disconnect",
    ]);
  });
});
