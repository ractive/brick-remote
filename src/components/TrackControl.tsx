import {Button, Card, Col, Icon, Row, Slider, Tooltip} from "antd";
import {SliderValue} from "antd/lib/slider";
import React, {useState} from "react";
import { useHotkeys } from "react-hotkeys-hook";
import ControlConfig, {IHotKeyInfo} from "./ControlConfig";

export interface ITrackControlDefinition {
    hubUuid: string;
    motorPortLeft: string;
    motorPortRight: string;
}

export interface ITrackControlProps extends ITrackControlDefinition {
    remove(TrackControlDefinition: ITrackControlDefinition): void;
}

const TrackControl = (props: ITrackControlProps) => {
    const step = 10;

    // tslint:disable:object-literal-sort-keys
    const hotKeyInfo: IHotKeyInfo = {
        inc: {
            key: "up",
            label: "Hotkey to increase the speed"
        },
        dec: {
            key: "down",
            label: "Hotkey to decrease the speed"
        },
        left: {
            key: "left",
            label: "Hotkey to increase turning left"
        },
        right: {
            key: "right",
            label: "Hotkey to increase turning right"
        },
        stop: {
            key: "space",
            label: "Hotkey to stop"
        }
    };

    const [motorSpeedRight, setMotorSpeedRight] = useState(0);
    const [motorSpeedLeft, setMotorSpeedLeft] = useState(0);
    const [hotKeys, setHotKeys] = useState(hotKeyInfo);

    function dec(v: number): number {
        return Math.max(v - step, -100);
    }
    function inc(v: number): number {
        return Math.min(v + step, 100);
    }
    function onInc() {
        setMotorSpeedLeft((v) => inc(v));
        setMotorSpeedRight((v) => inc(v));
    }
    function onDec() {
        setMotorSpeedLeft((v) => dec(v));
        setMotorSpeedRight((v) => dec(v));
    }
    function onLeft() {
        const speedDiff = motorSpeedLeft - motorSpeedRight;
        if (motorSpeedLeft < 100 || (motorSpeedLeft === 100 && motorSpeedRight === 100)) {
            setMotorSpeedLeft((v) => dec(v));
        }
        if (speedDiff !== step || motorSpeedLeft === 100) {
            setMotorSpeedRight((v) => inc(v));
        }
    }
    function onRight() {
        const speedDiff = motorSpeedLeft - motorSpeedRight;
        if (motorSpeedRight < 100 || (motorSpeedLeft === 100 && motorSpeedRight === 100)) {
            setMotorSpeedRight((v) => dec(v));
        }
        if (speedDiff !== -step || motorSpeedRight === 100) {
            setMotorSpeedLeft((v) => inc(v));
        }
    }
    function onStop() {
        setMotorSpeedLeft(0);
        setMotorSpeedRight(0);
    }

    useHotkeys(
        Object.values(hotKeys).map((k) => k.key).join(","),
        (e, handler) => {
            switch (handler.key) {
                case hotKeys.inc.key:
                    return onInc();
                case hotKeys.dec.key:
                    return onDec();
                case hotKeys.left.key:
                    return onLeft();
                case hotKeys.right.key:
                    return onRight();
                case hotKeys.stop.key:
                    return onStop();
            }
        },
        [hotKeys, motorSpeedRight, motorSpeedLeft],
    );

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
            extra={(
                <>
                    <Tooltip title="Config">
                        <ControlConfig
                            setHotkeys={setHotKeys}
                            hotkeyInfo={hotKeyInfo}
                        />
                    </Tooltip>
                    <Tooltip title="Remove">
                        <Icon className="small-icon" type="close" onClick={() => props.remove(props)}/>
                    </Tooltip>
                </>
            )}
            className="motor-control-card"
        >
            <div className="motor-control-card-body">
                <div>{`Ports ${props.motorPortLeft}/${props.motorPortRight}`}</div>
                <div className="track-control-container">
                    <Slider
                        value={motorSpeedLeft}
                        marks={{0: "0"}}
                        defaultValue={0}
                        style={{height: "300px"}}
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
                        marks={{0: "0"}}
                        defaultValue={0}
                        style={{height: "300px"}}
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
                                    className="shortcut-button"
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
                                    className="shortcut-button"
                                    onClick={onInc}
                                />
                            </Tooltip>
                        </Col>
                        <Col span={8}>
                            <Tooltip title={hotKeys.dec.key}>
                                <Button
                                    icon="caret-down"
                                    size="small"
                                    className="shortcut-button"
                                    onClick={onInc}
                                />
                            </Tooltip>
                        </Col>
                        <Col span={8}>
                            <Tooltip title={hotKeys.right.key}>
                                <Button
                                    icon="caret-right"
                                    size="small"
                                    className="shortcut-button"
                                    onClick={onInc}
                                />
                            </Tooltip>
                        </Col>
                    </Row>
                </div>
                <div>
                    <Tooltip title={hotKeys.stop.key}>
                        <Button icon="stop" onClick={onStop}/>
                    </Tooltip>
                </div>
            </div>
        </Card>
    );
};

export default TrackControl;
