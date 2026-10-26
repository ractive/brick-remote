import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App as AntApp } from "antd";
import { StrictMode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";
import { Consts } from "./poweredup";
import {
  createSimulatedHub,
  type SimulatedHubDevice,
} from "./sim/SimulatedHubDevice";

let device: SimulatedHubDevice;
let createFakeHub: () => ReturnType<typeof createSimulatedHub>["hub"];

beforeEach(() => {
  // StrictMode mounts effects twice, so the app may create and drop a first hub
  createFakeHub = () => {
    const sim = createSimulatedHub({ name: "Test Hub" });
    device = sim.device;
    return sim.hub;
  };
});

async function renderApp() {
  const user = userEvent.setup();
  render(
    <StrictMode>
      <AntApp>
        <App createFakeHub={createFakeHub} />
      </AntApp>
    </StrictMode>,
  );
  await screen.findByText("TECHNIC_XLARGE_LINEAR_MOTOR");
  return user;
}

const sidebar = () =>
  screen.getByText("UUID").closest<HTMLElement>(".ant-card")!;

describe("App with a simulated Control+ hub", () => {
  it("shows the hub, its ports and battery", async () => {
    await renderApp();
    const hub = within(sidebar());
    expect(hub.getByText("Test Hub")).toBeInTheDocument();
    expect(hub.getByText("TECHNIC_MEDIUM_HUB")).toBeInTheDocument();
    expect(hub.getAllByText("TECHNIC_LARGE_LINEAR_MOTOR")).toHaveLength(2);
    expect(hub.getByText("not attached")).toBeInTheDocument();
    expect(hub.getByText("87%")).toBeInTheDocument();

    act(() => device.setBatteryLevel(42));
    expect(await hub.findByText("42%")).toBeInTheDocument();
  });

  it("drives a motor with the motor control", async () => {
    const user = await renderApp();
    await user.click(screen.getByLabelText("Add motor control for port A"));

    await user.click(screen.getByLabelText("Faster"));
    await user.click(screen.getByLabelText("Faster"));
    await waitFor(() => expect(device.power.A).toBe(20));

    await user.click(screen.getByLabelText("Invert motor"));
    await waitFor(() => expect(device.power.A).toBe(-20));

    await user.click(screen.getByLabelText("Stop"));
    await waitFor(() => expect(device.power.A).toBe(0));
  });

  it("stops the motor when its control is removed", async () => {
    const user = await renderApp();
    await user.click(screen.getByLabelText("Add motor control for port B"));
    await user.click(screen.getByLabelText("Faster"));
    await waitFor(() => expect(device.power.B).toBe(10));

    await user.click(screen.getByLabelText("Remove control"));
    await waitFor(() => expect(device.power.B).toBe(0));
    expect(screen.queryByLabelText("Faster")).not.toBeInTheDocument();
  });

  it("steers two motors with the track control", async () => {
    const user = await renderApp();
    await user.click(screen.getByLabelText("Add track control for port A"));
    await user.click(await screen.findByText("A & B"));

    await user.click(screen.getByLabelText("Faster"));
    // The right motor is mounted mirrored and therefore inverted by default
    await waitFor(() => expect(device.power).toMatchObject({ A: 10, B: -10 }));

    await user.click(screen.getByLabelText("Stop"));
    await user.click(screen.getByLabelText("Turn left"));
    // Turning on the spot: left track backwards, right track forwards
    await waitFor(() => expect(device.power).toMatchObject({ A: -10, B: -10 }));
  });

  it("drives a motor with a configured hotkey", async () => {
    const user = await renderApp();
    await user.click(screen.getByLabelText("Add motor control for port D"));

    await user.click(screen.getByLabelText("Configure hotkeys"));
    await user.type(
      await screen.findByLabelText("Hotkey to increase the speed:"),
      "w",
    );
    await user.click(screen.getByLabelText("Save hotkeys"));

    await user.keyboard("www");
    await waitFor(() => expect(device.power.D).toBe(30));
  });

  it("shows the tilt of the hub", async () => {
    const user = await renderApp();
    const hub = within(sidebar());
    act(() => device.setTilt(12, -30));
    expect(await hub.findByText("12°")).toBeInTheDocument();
    expect(hub.getByText("-30°")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Add tilt indicator X"));
    act(() => device.setTilt(5, 0));
    await waitFor(() => expect(screen.getAllByText("5°")).toHaveLength(2));
  });

  it("updates the ports when devices are attached and detached", async () => {
    await renderApp();
    const hub = within(sidebar());
    act(() => device.detach("B"));
    await waitFor(() =>
      expect(hub.getAllByText("not attached")).toHaveLength(2),
    );

    act(() =>
      device.attach("C", Consts.DeviceType.TECHNIC_LARGE_ANGULAR_MOTOR),
    );
    expect(
      await hub.findByText("TECHNIC_LARGE_ANGULAR_MOTOR"),
    ).toBeInTheDocument();
  });

  it("renames the hub", async () => {
    const user = await renderApp();
    await user.click(within(sidebar()).getByRole("button", { name: /edit/i }));
    const input = within(sidebar()).getByRole("textbox");
    await user.clear(input);
    await user.type(input, "Bulldozer");
    // Leaving the field ends editing (antd's Enter handling relies on legacy keyCodes)
    await user.tab();

    await waitFor(() => expect(device.name).toBe("Bulldozer"));
    expect(await within(sidebar()).findByText("Bulldozer")).toBeInTheDocument();
  });

  it("keeps the old name when a too long name is rejected", async () => {
    const user = await renderApp();
    await user.click(within(sidebar()).getByRole("button", { name: /edit/i }));
    const input = within(sidebar()).getByRole("textbox");
    await user.clear(input);
    await user.type(input, "A much too long hub name");
    await user.tab();

    expect(
      await screen.findByText(/must not be longer than 14/),
    ).toBeInTheDocument();
    expect(within(sidebar()).getByText("Test Hub")).toBeInTheDocument();
    expect(
      within(sidebar()).queryByText("A much too long hub name"),
    ).not.toBeInTheDocument();
    expect(device.name).toBe("Test Hub");
  });

  it("removes the hub when it disconnects", async () => {
    const user = await renderApp();
    await user.click(screen.getByLabelText("Add motor control for port A"));
    await user.click(screen.getByRole("button", { name: "Disconnect" }));

    await waitFor(() =>
      expect(screen.queryByText("UUID")).not.toBeInTheDocument(),
    );
    expect(screen.queryByLabelText("Faster")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "About" })).toBeInTheDocument();
  });
});
