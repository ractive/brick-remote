import { App, Button, Input, Popover, Tooltip } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import React, { useState } from "react";
import {
  type HotkeyActions,
  type HotkeyBindings,
  useHotkeys,
} from "../hooks/useHotkeys";

export interface IControlConfigProps {
  actions: HotkeyActions;
  bindings: HotkeyBindings;
  setBindings(bindings: HotkeyBindings): void;
}

const ControlConfig: React.FC<IControlConfigProps> = (
  props: IControlConfigProps,
) => {
  const { modal } = App.useApp();
  const [open, setOpen] = useState(false);
  const [bindings, setBindings] = useState<HotkeyBindings>(props.bindings);

  useHotkeys(
    { close: { label: "Close", handle: () => setOpen(false) } },
    { close: "esc" },
  );

  function show() {
    setBindings(props.bindings);
    setOpen(true);
  }

  function handleSubmit() {
    props.setBindings(bindings);
    setOpen(false);
  }

  function showHelp() {
    modal.info({
      content: (
        <div>
          <p>
            You can assign hotkeys to perform actions like to increase or
            decrease the motor speed. When such a hotkey is pressed the motor
            speed is changed.
          </p>
          <p>
            You can define a single character (like <code>a</code>), special
            keys (like <code>up</code>) and modifiers plus a key (like{" "}
            <code>ctrl+b</code>).
          </p>
          <p>
            The allowed keys are all characters, numbers and the following
            special keys:
            <code>
              backspace, tab, clear, enter, return, esc, escape, space, up,
              down, left, right, home, end, pageup, pagedown, del, delete and f1
              through f19
            </code>
          </p>
          <p>
            Modifiers are:{" "}
            <code>shift, option, alt, ctrl, control, command</code>
          </p>
          <div>
            Examples of hotkey definitions that you can use:
            <ul>
              <li>
                <code>q</code>
              </li>
              <li>
                <code>up</code>
              </li>
              <li>
                <code>ctrl+a</code>
              </li>
              <li>
                <code>shift+pageup</code>
              </li>
              <li>
                <code>command+f4</code>
              </li>
            </ul>
          </div>
        </div>
      ),
      icon: <QuestionCircleOutlined />,
      title: "Hotkey help",
      width: "600px",
      zIndex: 2000,
    });
  }

  return (
    <Tooltip title="Keyboard control configuration">
      <Popover
        trigger="click"
        open={open}
        onOpenChange={(o) => (o ? show() : setOpen(false))}
        content={
          <>
            <div className="small-form">
              {Object.entries(props.actions).map(([id, { label }]) => (
                <React.Fragment key={id}>
                  <label htmlFor={"hotkeyinfo_" + id}>{label}:</label>
                  <Input
                    id={"hotkeyinfo_" + id}
                    value={bindings[id] ?? ""}
                    onChange={(e) =>
                      setBindings({ ...bindings, [id]: e.target.value })
                    }
                  />
                </React.Fragment>
              ))}
            </div>
            <div style={{ width: "100%", marginTop: "10px" }}>
              <Button
                icon={<CheckOutlined />}
                aria-label="Save hotkeys"
                onClick={handleSubmit}
              />
              <Button
                icon={<CloseOutlined />}
                aria-label="Cancel"
                onClick={() => setOpen(false)}
              />
              <Button
                icon={<QuestionCircleOutlined />}
                aria-label="Hotkey help"
                onClick={showHelp}
                style={{ float: "right" }}
              />
            </div>
          </>
        }
      >
        <SettingOutlined
          className="small-icon"
          aria-label="Configure hotkeys"
        />
      </Popover>
    </Tooltip>
  );
};

export default ControlConfig;
