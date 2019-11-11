import {Button, Card, Icon, Slider, Tooltip} from "antd";
import React, {useState} from "react";
import useHotkeys from "use-hotkeys";
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

    function dec(v: number): number {
        return Math.max(v - step, -100);
    }
    function inc(v: number): number {
        return Math.min(v + step, 100);
    }

    const [motorSpeedRight, setMotorSpeedRight] = useState(0);
    const [motorSpeedLeft, setMotorSpeedLeft] = useState(0);
    const [hotKeys, setHotKeys] = useState(hotKeyInfo);

    useHotkeys((key) => {
            console.log("Key ", key, "left: ", motorSpeedLeft, "right: ", motorSpeedRight);
            switch (key) {
                case hotKeys.inc.key:
                    setMotorSpeedLeft((v) => inc(v));
                    setMotorSpeedRight((v) => inc(v));
                    break;
                case hotKeys.dec.key:
                    setMotorSpeedLeft((v) => dec(v));
                    setMotorSpeedRight((v) => dec(v));
                    break;
                case hotKeys.left.key:
                    if (motorSpeedLeft < 100) {
                        setMotorSpeedLeft((v) => dec(v));
                    }
                    setMotorSpeedRight((v) => inc(v));
                    break;
                case hotKeys.right.key:
                    setMotorSpeedLeft((v) => inc(v));
                    if (motorSpeedRight < 100) {
                        setMotorSpeedRight((v) => dec(v));
                    }
                    break;
                case hotKeys.stop.key:
                    setMotorSpeedLeft(0);
                    setMotorSpeedRight(0);
                    break;
            }
        },
        Object.values(hotKeys).map((k) => k.key),
        [hotKeys, motorSpeedRight, motorSpeedLeft],
    );

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
                    />
                </div>
                <div>
                    <Tooltip title="Stop the motor">
                        <Button icon="stop" onClick={() => console.log("stop")}>x</Button>
                    </Tooltip>
                </div>
            </div>
        </Card>
    );
};

export default TrackControl;
