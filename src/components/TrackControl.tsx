import { Button, Card, Col, Row, Slider, Switch, Tooltip } from "antd";
import {
  CaretDownOutlined,
  CaretLeftOutlined,
  CaretRightOutlined,
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
import {
  faster,
  slower,
  STEP,
  type TrackSpeeds,
  turnLeft,
  turnRight,
} from "../tracks";
import ControlConfig from "./ControlConfig";

export interface ITrackControlDefinition {
  hubUuid: string;
  motorPortLeft: string;
  motorPortRight: string;
}

export interface ITrackControlProps extends ITrackControlDefinition {
  remove(TrackControlDefinition: ITrackControlDefinition): void;
}

const TrackControl: React.FC<ITrackControlProps> = (
  props: ITrackControlProps,
) => {
  const [incIndicator, setIncIndicator] = useButtonActiveIndicator();
  const [decIndicator, setDecIndicator] = useButtonActiveIndicator();
  const [leftIndicator, setLeftIndicator] = useButtonActiveIndicator();
  const [rightIndicator, setRightIndicator] = useButtonActiveIndicator();
  const [stopIndicator, setStopIndicator] = useButtonActiveIndicator();

  const hub = findHub(useContext(HubsContext), props.hubUuid)?.hub;
  const { motorPortLeft, motorPortRight } = props;
  const [speeds, setSpeeds] = useState<TrackSpeeds>({ left: 0, right: 0 });
  const [invertedLeft, setInvertedLeft] = useState(false);
  const [invertedRight, setInvertedRight] = useState(false);

  // The motors face opposite directions, so the right one is inverted by default
  const powerLeft = invertedLeft ? -speeds.left : speeds.left;
  const powerRight = invertedRight ? speeds.right : -speeds.right;

  useEffect(() => {
    setMotorPower(hub, motorPortLeft, powerLeft);
  }, [hub, motorPortLeft, powerLeft]);

  useEffect(() => {
    setMotorPower(hub, motorPortRight, powerRight);
  }, [hub, motorPortRight, powerRight]);

  // Stop the motors when the control is removed
  useEffect(
    () => () => {
      setMotorPower(hub, motorPortLeft, 0);
      setMotorPower(hub, motorPortRight, 0);
    },
    [hub, motorPortLeft, motorPortRight],
  );

  function onInc() {
    setIncIndicator();
    setSpeeds(faster);
  }
  function onDec() {
    setDecIndicator();
    setSpeeds(slower);
  }
  function onLeft() {
    setLeftIndicator();
    setSpeeds(turnLeft);
  }
  function onRight() {
    setRightIndicator();
    setSpeeds(turnRight);
  }
  function onStop() {
    setStopIndicator();
    setSpeeds({ left: 0, right: 0 });
  }

  const actions: HotkeyActions = {
    inc: { label: "Hotkey to increase the speed", handle: onInc },
    dec: { label: "Hotkey to decrease the speed", handle: onDec },
    left: { label: "Hotkey to increase turning left", handle: onLeft },
    right: { label: "Hotkey to increase turning right", handle: onRight },
    stop: { label: "Hotkey to stop", handle: onStop },
  };
  const [bindings, setBindings] = useState(() => emptyBindings(actions));
  useHotkeys(actions, bindings);

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
        <div>{`Ports ${motorPortLeft} & ${motorPortRight}`}</div>
        <div>
          <Tooltip title="Invert the rotation of left motor">
            <Switch
              size="small"
              aria-label="Invert left motor"
              checkedChildren={<DoubleRightOutlined rotate={90} />}
              unCheckedChildren={<DoubleLeftOutlined rotate={90} />}
              checked={invertedLeft}
              onChange={setInvertedLeft}
            />
          </Tooltip>
          &nbsp;
          <Tooltip title="Invert the rotation of right motor">
            <Switch
              size="small"
              aria-label="Invert right motor"
              checkedChildren={<DoubleRightOutlined rotate={90} />}
              unCheckedChildren={<DoubleLeftOutlined rotate={90} />}
              checked={invertedRight}
              onChange={setInvertedRight}
            />
          </Tooltip>
        </div>
        <div className="track-control-container">
          <Slider
            value={speeds.left}
            marks={{ 0: "0" }}
            style={{ height: "200px" }}
            vertical={true}
            min={-100}
            max={100}
            step={STEP}
            included={true}
            onChange={(left) => setSpeeds((s) => ({ ...s, left }))}
          />
          <Slider
            value={speeds.right}
            marks={{ 0: "0" }}
            style={{ height: "200px" }}
            vertical={true}
            min={-100}
            max={100}
            step={STEP}
            included={true}
            onChange={(right) => setSpeeds((s) => ({ ...s, right }))}
          />
        </div>
        <div>
          <Row>
            <Col span={8} offset={8}>
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
            <Col span={8}>
              <Tooltip title={bindings.left}>
                <Button
                  icon={<CaretLeftOutlined />}
                  aria-label="Turn left"
                  size="small"
                  className={shortcutButtonClassName(leftIndicator)}
                  onClick={onLeft}
                />
              </Tooltip>
            </Col>
            <Col span={8}>
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
            <Col span={8}>
              <Tooltip title={bindings.right}>
                <Button
                  icon={<CaretRightOutlined />}
                  aria-label="Turn right"
                  size="small"
                  className={shortcutButtonClassName(rightIndicator)}
                  onClick={onRight}
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

export default TrackControl;
