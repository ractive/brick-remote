import {Button, Card, Icon, Slider, Switch, Tooltip} from "antd";
import { SliderValue } from "antd/lib/slider";
import React, {useEffect, useState} from "react";
import {IHotKeyInfo} from "../hooks/useHotkeyInfo";
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

    const poweredUP = usePoweredup();
    const [motorSpeed, setMotorSpeed] = useState(0);
    const [inverted, setInverted] = useState(false);
    const [hotKeys, setHotKeys] = useState(hotKeyInfo);

    function onInc() {
        setMotorSpeed((v) => Math.min(v + step, 100));
    }

    function onDec() {
        setMotorSpeed((v) => Math.max(v - step, -100));
    }

    function onStop() {
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

    function onChangeMotorSpeed(value: SliderValue) {
        const speed = value instanceof Array ? value[0] : value;
        setMotorSpeed(speed);
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
                            style={{marginBottom: "10px"}}
                            checkedChildren={<Icon type="double-right" rotate={90} />}
                            unCheckedChildren={<Icon type="double-left" rotate={90} />}
                            checked={inverted}
                            onChange={(checked) => setInverted(checked)}
                        />
                    </Tooltip>
                </div>
                <Tooltip title={hotKeys.inc.key}>
                    <Button
                        icon="caret-up"
                        size="small"
                        className="shortcut-button"
                        onClick={onInc}
                    />
                </Tooltip>
                <div>
                    <Tooltip title="Speed of the motor">
                        <Slider
                            value={motorSpeed}
                            marks={{0: "0"}}
                            defaultValue={0}
                            style={{height: "300px"}}
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
                    <Tooltip title={hotKeys.dec.key}>
                        <Button
                            icon="caret-down"
                            size="small"
                            className="shortcut-button"
                            onClick={onDec}
                        />
                    </Tooltip>
                </div>
                <div>
                    <Tooltip title={hotKeys.stop.key}>
                        <Button icon="stop" onClick={onStop} />
                    </Tooltip>
                </div>
            </div>
        </Card>
    );
};

export default MotorControl;
