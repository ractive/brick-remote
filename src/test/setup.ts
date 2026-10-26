import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// antd's responsive components (Layout.Sider breakpoints, Grid) need matchMedia
window.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList;

// ...and ResizeObserver, which jsdom does not implement either
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Keep the test output readable, the app logs every hub connection
vi.spyOn(console, "log").mockImplementation(() => {});

afterEach(() => cleanup());
