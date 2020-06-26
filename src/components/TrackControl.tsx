import { Button, Card, Col, Row, Slider, Switch, Tooltip } from "antd";
import {
  DoubleRightOutlined,
  DoubleLeftOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { SliderValue } from "antd/lib/slider";
import React, { useEffect, useState } from "react";
import { useButtonActiveIndicator } from "../hooks/useButtonActiveIndicator";
import { IHotKeyInfo, useHotkeyInfo } from "../hooks/useHotkeyInfo";
import usePoweredup from "../poweredup";
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
  props: ITrackControlProps
) => {
  const step = 10;

  // tslint:disable:object-literal-sort-keys
  const hotKeyInfo: IHotKeyInfo = {
    inc: {
      key: "",
      label: "Hotkey to increase the speed",
      handle: onInc,
    },
    dec: {
      key: "",
      label: "Hotkey to decrease the speed",
      handle: onDec,
    },
    left: {
      key: "",
      label: "Hotkey to increase turning left",
      handle: onLeft,
    },
    right: {
      key: "",
      label: "Hotkey to increase turning right",
      handle: onRight,
    },
    stop: {
      key: "",
      label: "Hotkey to stop",
      handle: onStop,
    },
  };

  const [incIndicator, setIncIndicator] = useButtonActiveIndicator();
  const [decIndicator, setDecIndicator] = useButtonActiveIndicator();
  const [leftIndicator, setLeftIndicator] = useButtonActiveIndicator();
  const [rightIndicator, setRightIndicator] = useButtonActiveIndicator();
  const [stopIndicator, setStopIndicator] = useButtonActiveIndicator();

  const poweredUP = usePoweredup();
  const [motorSpeedRight, setMotorSpeedRight] = useState(0);
  const [motorSpeedLeft, setMotorSpeedLeft] = useState(0);
  const [invertedLeft, setInvertedLeft] = useState(false);
  const [invertedRight, setInvertedRight] = useState(false);
  const [hotKeys, setHotKeys] = useState(hotKeyInfo);

  useEffect(() => {
    function driveTracks() {
      const left = invertedLeft ? -motorSpeedLeft : motorSpeedLeft;
      const right = invertedRight ? motorSpeedRight : -motorSpeedRight;

      console.log("drive tracks", left, right);

      const hub = poweredUP.getConnectedHubByUUID(
        decodeURIComponent(props.hubUuid)
      );
      if (hub) {
        hub
          .setMotorSpeed(props.motorPortLeft, left)
          .catch((err: unknown) =>
            console.log("Error while setting motorSpeedLeft", err)
          );
        hub
          .setMotorSpeed(props.motorPortRight, right)
          .catch((err: unknown) =>
            console.log("Error while setting motorSpeedRight", err)
          );
      }
    }

    driveTracks();
  }, [
    motorSpeedRight,
    motorSpeedLeft,
    invertedLeft,
    invertedRight,
    props.motorPortLeft,
    props.motorPortRight,
    props.hubUuid,
    poweredUP,
  ]);

  useHotkeyInfo(hotKeys);

  function shortcutButtonClassName(indicator: boolean): string {
    return "shortcut-button " + (indicator ? "shortcut-button-pressed" : "");
  }

  function dec(v: number): number {
    return Math.max(v - step, -100);
  }
  function inc(v: number): number {
    return Math.min(v + step, 100);
  }
  function onInc() {
    setIncIndicator();
    setMotorSpeedLeft((v) => inc(v));
    setMotorSpeedRight((v) => inc(v));
  }
  function onDec() {
    setDecIndicator();
    setMotorSpeedLeft((v) => dec(v));
    setMotorSpeedRight((v) => dec(v));
  }
  function onLeft() {
    setLeftIndicator();
    const speedDiff = motorSpeedLeft - motorSpeedRight;
    if (
      motorSpeedLeft < 100 ||
      (motorSpeedLeft === 100 && motorSpeedRight === 100)
    ) {
      setMotorSpeedLeft((v) => dec(v));
    }
    if (speedDiff !== step || motorSpeedLeft === 100) {
      setMotorSpeedRight((v) => inc(v));
    }
  }
  function onRight() {
    setRightIndicator();
    const speedDiff = motorSpeedLeft - motorSpeedRight;
    if (
      motorSpeedRight < 100 ||
      (motorSpeedLeft === 100 && motorSpeedRight === 100)
    ) {
      setMotorSpeedRight((v) => dec(v));
    }
    if (speedDiff !== -step || motorSpeedRight === 100) {
      setMotorSpeedLeft((v) => inc(v));
    }
  }
  function onStop() {
    setStopIndicator();
    setMotorSpeedLeft(0);
    setMotorSpeedRight(0);
  }

  function onChangeMotorSpeedRight(value: SliderValue) {
    const speed = value instanceof Array ? value[0] : value;
    setMotorSpeedRight(speed);
  }

  function onChangeMotorSpeedLeft(value: SliderValue) {
    const speed = value instanceof Array ? value[0] : value;
    setMotorSpeedLeft(speed);
  }

  return (
    <Card
      size="small"
      extra={
        <>
          <Tooltip title="Config">
            <ControlConfig setHotkeys={setHotKeys} hotkeyInfo={hotKeyInfo} />
          </Tooltip>
          <Tooltip title="Remove">
            <CloseOutlined
              className="small-icon"
              onClick={() => props.remove(props)}
            />
          </Tooltip>
        </>
      }
      className="motor-control-card"
    >
      <div className="motor-control-card-body">
        <div>{`Ports ${props.motorPortLeft} & ${props.motorPortRight}`}</div>
        <div>
          <Tooltip title="Invert the rotation of left motor">
            <Switch
              size="small"
              checkedChildren={<DoubleRightOutlined rotate={90} />}
              unCheckedChildren={<DoubleLeftOutlined rotate={90} />}
              checked={invertedLeft}
              onChange={(checked) => setInvertedLeft(checked)}
            />
          </Tooltip>
          &nbsp;
          <Tooltip title="Invert the rotation of right motor">
            <Switch
              size="small"
              checkedChildren={<DoubleRightOutlined rotate={90} />}
              unCheckedChildren={<DoubleLeftOutlined rotate={90} />}
              checked={invertedRight}
              onChange={(checked) => setInvertedRight(checked)}
            />
          </Tooltip>
        </div>
        <div className="track-control-container">
          <Slider
            value={motorSpeedLeft}
            marks={{ 0: "0" }}
            defaultValue={0}
            style={{ height: "200px" }}
            vertical={true}
            min={-100}
            max={100}
            step={step}
            included={true}
            onChange={onChangeMotorSpeedLeft}
            onAfterChange={onChangeMotorSpeedLeft}
          />
          <Slider
            value={motorSpeedRight}
            marks={{ 0: "0" }}
            defaultValue={0}
            style={{ height: "200px" }}
            vertical={true}
            min={-100}
            max={100}
            step={step}
            included={true}
            onChange={onChangeMotorSpeedRight}
            onAfterChange={onChangeMotorSpeedRight}
          />
        </div>
        <div>
          <Row>
            <Col span={8} offset={8}>
              <Tooltip title={hotKeys.inc.key}>
                <Button
                  icon="caret-up"
                  size="small"
                  className={shortcutButtonClassName(incIndicator)}
                  onClick={onInc}
                />
              </Tooltip>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <Tooltip title={hotKeys.left.key}>
                <Button
                  icon="caret-left"
                  size="small"
                  className={shortcutButtonClassName(leftIndicator)}
                  onClick={onLeft}
                />
              </Tooltip>
            </Col>
            <Col span={8}>
              <Tooltip title={hotKeys.dec.key}>
                <Button
                  icon="caret-down"
                  size="small"
                  className={shortcutButtonClassName(decIndicator)}
                  onClick={onDec}
                />
              </Tooltip>
            </Col>
            <Col span={8}>
              <Tooltip title={hotKeys.right.key}>
                <Button
                  icon="caret-right"
                  size="small"
                  className={shortcutButtonClassName(rightIndicator)}
                  onClick={onRight}
                />
              </Tooltip>
            </Col>
          </Row>
        </div>
        <div>
          <Tooltip title={hotKeys.stop.key}>
            <Button
              icon="stop"
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
