import { App as AntApp } from "antd";
import qs from "qs";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const queryParams = qs.parse(window.location.search, {
  ignoreQueryPrefix: true,
});

// The debug package used by node-poweredup reads localStorage.debug when the library is loaded,
// so it has to be set before importing the app below.
if (Object.prototype.hasOwnProperty.call(queryParams, "debug")) {
  if (typeof queryParams.debug === "string" && queryParams.debug) {
    // Calling e.g. with "?debug=*"
    localStorage.setItem("debug", queryParams.debug);
  } else {
    // Remove when just calling with "?debug"
    localStorage.removeItem("debug");
  }
}

if (Object.prototype.hasOwnProperty.call(queryParams, "jsconsole")) {
  const script = document.createElement("script");
  script.async = true;
  script.src =
    "https://www.jsconsole.net/include.js?598c719d-4012-4f4d-075c-873a05e490c1";
  document.head.appendChild(script);
}

const { default: App } = await import("./App");
const createFakeHub = Object.prototype.hasOwnProperty.call(
  queryParams,
  "fakeHub",
)
  ? await import("./sim/fakeHub").then((m) => m.createFakeHub)
  : undefined;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AntApp>
      <App createFakeHub={createFakeHub} />
    </AntApp>
  </StrictMode>,
);
