import {Button, Card, Icon, Slider, Switch, Tooltip} from "antd";
import { SliderValue } from "antd/lib/slider";
import React, {useEffect, useState} from "react";
import { useHotkeys } from "react-hotkeys-hook";
import usePoweredup from "../poweredup";
import ControlConfig, {IHotKeyInfo} from "./ControlConfig";

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
            label: "Hotkey to increase the speed"
        },
        dec: {
            key: "",
            label: "Hotkey to decrease the speed"
        },
        stop: {
            key: "",
            label: "Hotkey to stop the motor"
        }
    };

    const poweredUP = usePoweredup();
    const [motorSpeed, setMotorSpeed] = useState(0);
    const [inverted, setInverted] = useState(false);
    const [hotKeys, setHotKeys] = useState(hotKeyInfo);

    useHotkeys(
        Object.values(hotKeys).map((k) => k.key).join(","),
        (e, handler) => {
            switch (handler.key) {
                case hotKeys.inc.key:
                    return setMotorSpeed((v) => Math.min(v + step, 100));
                case hotKeys.dec.key:
                    return setMotorSpeed((v) => Math.max(v - step, -100));
                case hotKeys.stop.key:
                    return setMotorSpeed(0);
            }
        },
        [hotKeys],
    );

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
                {
                    hotKeys.inc.key &&
                    (
                        <div>
                            <Tooltip title="Shortcut to increase motor speed">
                                <Button>{hotKeys.inc.key}</Button>
                            </Tooltip>
                        </div>
                    )
                }
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
                {
                    hotKeys.dec.key &&
                    (
                        <div>
                            <Tooltip title="Shortcut to decrease motor speed">
                                <Button>{hotKeys.dec.key}</Button>
                            </Tooltip>
                        </div>
                    )
                }
                <div>
                    <Tooltip title="Stop the motor">
                        <Button icon="stop" onClick={() => setMotorSpeed(0)}>{hotKeys.stop.key}</Button>
                    </Tooltip>
                </div>
            </div>
        </Card>
    );
};

export default MotorControl;
