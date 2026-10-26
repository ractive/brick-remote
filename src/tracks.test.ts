import { describe, expect, it } from "vitest";
import { faster, slower, turnLeft, turnRight } from "./tracks";

describe("track steering", () => {
  it("changes both tracks by one step and clamps at +-100", () => {
    expect(faster({ left: 0, right: 0 })).toEqual({ left: 10, right: 10 });
    expect(faster({ left: 100, right: 95 })).toEqual({ left: 100, right: 100 });
    expect(slower({ left: -100, right: 0 })).toEqual({
      left: -100,
      right: -10,
    });
  });

  it("turns on the spot when standing", () => {
    expect(turnLeft({ left: 0, right: 0 })).toEqual({ left: -10, right: 10 });
    expect(turnRight({ left: 0, right: 0 })).toEqual({ left: 10, right: -10 });
  });

  it("steers while driving at full speed", () => {
    expect(turnLeft({ left: 100, right: 100 })).toEqual({
      left: 90,
      right: 100,
    });
    expect(turnRight({ left: 100, right: 100 })).toEqual({
      left: 100,
      right: 90,
    });
  });

  it("is symmetric", () => {
    for (const left of [-100, -30, 0, 40, 100]) {
      for (const right of [-100, -20, 0, 50, 100]) {
        const r = turnRight({ left, right });
        const l = turnLeft({ left: right, right: left });
        expect(r).toEqual({ left: l.right, right: l.left });
      }
    }
  });
});
