import { Button, Card, Col, Row, Slider, Switch, Tooltip } from "antd";
import {
  CaretDownOutlined,
  CaretUpOutlined,
  CloseOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  StopOutlined,
} from "@ant-design/icons";
import React, { useContext, useEffect, useState } from "react";
import { findHub, HubsContext } from "../HubsContext";
import { useButtonActiveIndicator } from "../hooks/useButtonActiveIndicator";
import {
  emptyBindings,
  type HotkeyActions,
  useHotkeys,
} from "../hooks/useHotkeys";
import { setMotorPower } from "../motors";
import { STEP } from "../tracks";
import ControlConfig from "./ControlConfig";

export interface IMotorControlDefinition {
  hubUuid: string;
  motorPort: string;
}

export interface IMotorControlProps extends IMotorControlDefinition {
  remove(motorControlDefinition: IMotorControlDefinition): void;
}

const MotorControl: React.FC<IMotorControlProps> = (
  props: IMotorControlProps,
) => {
  const [incIndicator, setIncIndicator] = useButtonActiveIndicator();
  const [decIndicator, setDecIndicator] = useButtonActiveIndicator();
  const [stopIndicator, setStopIndicator] = useButtonActiveIndicator();

  const hub = findHub(useContext(HubsContext), props.hubUuid)?.hub;
  const [motorSpeed, setMotorSpeed] = useState(0);
  const [inverted, setInverted] = useState(false);

  function onInc() {
    setIncIndicator();
    setMotorSpeed((v) => Math.min(v + STEP, 100));
  }

  function onDec() {
    setDecIndicator();
    setMotorSpeed((v) => Math.max(v - STEP, -100));
  }

  function onStop() {
    setStopIndicator();
    setMotorSpeed(0);
  }

  const actions: HotkeyActions = {
    inc: { label: "Hotkey to increase the speed", handle: onInc },
    dec: { label: "Hotkey to decrease the speed", handle: onDec },
    stop: { label: "Hotkey to stop the motor", handle: onStop },
  };
  const [bindings, setBindings] = useState(() => emptyBindings(actions));
  useHotkeys(actions, bindings);

  useEffect(() => {
    setMotorPower(hub, props.motorPort, inverted ? -motorSpeed : motorSpeed);
  }, [hub, props.motorPort, motorSpeed, inverted]);

  // Stop the motor when the control is removed
  useEffect(
    () => () => setMotorPower(hub, props.motorPort, 0),
    [hub, props.motorPort],
  );

  function shortcutButtonClassName(indicator: boolean): string {
    return "shortcut-button " + (indicator ? "shortcut-button-pressed" : "");
  }

  return (
    <Card
      size="small"
      extra={
        <>
          <Tooltip title="Config">
            <ControlConfig
              actions={actions}
              bindings={bindings}
              setBindings={setBindings}
            />
          </Tooltip>
          <Tooltip title="Remove">
            <CloseOutlined
              className="small-icon"
              aria-label="Remove control"
              onClick={() => props.remove(props)}
            />
          </Tooltip>
        </>
      }
      className="motor-control-card"
    >
      <div className="motor-control-card-body">
        <div>{"Port " + props.motorPort}</div>
        <div>
          <Tooltip title="Invert the rotation of the motor">
            <Switch
              size="small"
              aria-label="Invert motor"
              checkedChildren={<DoubleRightOutlined rotate={90} />}
              unCheckedChildren={<DoubleLeftOutlined rotate={90} />}
              checked={inverted}
              onChange={setInverted}
            />
          </Tooltip>
        </div>
        <div>
          <Tooltip title="Speed of the motor">
            <Slider
              value={motorSpeed}
              marks={{ 0: "0" }}
              style={{ height: "200px" }}
              vertical={true}
              min={-100}
              max={100}
              step={STEP}
              onChange={setMotorSpeed}
              included={true}
            />
          </Tooltip>
        </div>
        <div>
          <Row>
            <Col span={24}>
              <Tooltip title={bindings.inc}>
                <Button
                  icon={<CaretUpOutlined />}
                  aria-label="Faster"
                  size="small"
                  className={shortcutButtonClassName(incIndicator)}
                  onClick={onInc}
                />
              </Tooltip>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Tooltip title={bindings.dec}>
                <Button
                  icon={<CaretDownOutlined />}
                  aria-label="Slower"
                  size="small"
                  className={shortcutButtonClassName(decIndicator)}
                  onClick={onDec}
                />
              </Tooltip>
            </Col>
          </Row>
        </div>
        <div>
          <Tooltip title={bindings.stop}>
            <Button
              icon={<StopOutlined />}
              aria-label="Stop"
              size="small"
              className={shortcutButtonClassName(stopIndicator)}
              onClick={onStop}
            />
          </Tooltip>
        </div>
      </div>
    </Card>
  );
};

export default MotorControl;
