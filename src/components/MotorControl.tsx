import {Button, Card, Col, Icon, Row, Slider, Switch, Tooltip} from "antd";
import { SliderValue } from "antd/lib/slider";
import React, {useEffect, useState} from "react";
import {useButtonActiveIndicator} from "../hooks/useButtonActiveIndicator";
import {IHotKeyInfo, useHotkeyInfo} from "../hooks/useHotkeyInfo";
import usePoweredup from "../poweredup";
import ControlConfig from "./ControlConfig";

export interface IMotorControlDefinition {
    hubUuid: string;
    motorPort: string;
}

export interface IMotorControlProps extends IMotorControlDefinition {
    remove(motorControlDefinition: IMotorControlDefinition): void;
}

const MotorControl = (props: IMotorControlProps) => {
    const step = 10;

    // tslint:disable:object-literal-sort-keys
    const hotKeyInfo: IHotKeyInfo = {
        inc: {
            key: "",
            label: "Hotkey to increase the speed",
            handle: onInc
        },
        dec: {
            key: "",
            label: "Hotkey to decrease the speed",
            handle: onDec
        },
        stop: {
            key: "",
            label: "Hotkey to stop the motor",
            handle: onStop
        }
    };

    const [incIndicator, setIncIndicator] = useButtonActiveIndicator();
    const [decIndicator, setDecIndicator] = useButtonActiveIndicator();
    const [stopIndicator, setStopIndicator] = useButtonActiveIndicator();

    const poweredUP = usePoweredup();
    const [motorSpeed, setMotorSpeed] = useState(0);
    const [inverted, setInverted] = useState(false);
    const [hotKeys, setHotKeys] = useState(hotKeyInfo);

    function onInc() {
        setIncIndicator();
        setMotorSpeed((v) => Math.min(v + step, 100));
    }

    function onDec() {
        setDecIndicator();
        setMotorSpeed((v) => Math.max(v - step, -100));
    }

    function onStop() {
        setStopIndicator();
        setMotorSpeed(0);
    }

    useEffect(() => {
            function driveMotor() {
                console.log("driveMotor", motorSpeed, inverted);
                const hub = poweredUP.getConnectedHubByUUID(decodeURIComponent(props.hubUuid));
                if (hub) {
                    hub.setMotorSpeed(props.motorPort, inverted ? -motorSpeed : motorSpeed)
                        .catch((err: any) => console.log("Error while setting motorSpeed", err));
                }
            }

            driveMotor();
     }, [motorSpeed, inverted, props.motorPort, props.hubUuid, poweredUP]);

    useHotkeyInfo(hotKeys);

    function onChangeMotorSpeed(value: SliderValue) {
        const speed = value instanceof Array ? value[0] : value;
        setMotorSpeed(speed);
    }

    function shortcutButtonClassName(indicator: boolean): string {
        return "shortcut-button " + (indicator ? "shortcut-button-pressed" : "");
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
                <div>{"Port " + props.motorPort}</div>
                <div>
                    <Tooltip title="Invert the rotation of the motor">
                        <Switch
                            size="small"
                            checkedChildren={<Icon type="double-right" rotate={90} />}
                            unCheckedChildren={<Icon type="double-left" rotate={90} />}
                            checked={inverted}
                            onChange={(checked) => setInverted(checked)}
                        />
                    </Tooltip>
                </div>
                <div>
                    <Tooltip title="Speed of the motor">
                        <Slider
                            value={motorSpeed}
                            marks={{0: "0"}}
                            defaultValue={0}
                            style={{height: "200px"}}
                            vertical={true}
                            min={-100}
                            max={100}
                            step={step}
                            onChange={onChangeMotorSpeed}
                            onAfterChange={onChangeMotorSpeed}
                            included={true}
                        />
                    </Tooltip>
                </div>
                <div>
                    <Row>
                        <Col span={24}>
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
                        <Col span={24}>
                            <Tooltip title={hotKeys.dec.key}>
                                <Button
                                    icon="caret-down"
                                    size="small"
                                    className={shortcutButtonClassName(decIndicator)}
                                    onClick={onDec}
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

export default MotorControl;
