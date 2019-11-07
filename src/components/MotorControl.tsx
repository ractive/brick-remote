import {Button, Card, Icon, Input, Modal, Popover, Slider, Switch, Tooltip} from "antd";
import { SliderValue } from "antd/lib/slider";
import React, {MouseEvent, useEffect, useState} from "react";
import useHotkeys from "use-hotkeys";
import usePoweredup from "../poweredup";

type HotKeys = [string, string, string];

interface IMotorControlConfigProps {
    setHotkeys(hotKeys: HotKeys): void;
}

const MotorControlConfig = (props: IMotorControlConfigProps) => {
    const [visible, setVisible] = useState(false);
    const [hotKeys, setHotKeys] = useState<HotKeys>(["", "", ""]);

    function handleSubmit(event: MouseEvent<HTMLElement>) {
        props.setHotkeys(hotKeys);
        setVisible(false);
        event.preventDefault();
    }

    function handleCancel(event: MouseEvent<HTMLElement>) {
        setVisible(false);
        event.preventDefault();
    }

    function showHelp() {
        Modal.info({
            content: (
                <div>
                    <p>
                        You can assign hotkeys to increase or decrease the motor speed. When such a hotkey is pressed
                        the motor speed is changed.
                    </p>
                    <p>
                        You can define a single character (like <code>a</code>), special keys (like <code>up</code>) and
                        modifiers plus a key (like <code>ctrl+b</code>).
                    </p>
                    <p>
                        The allowed keys are all characters, numbers and the following special keys:
                        <code>
                            backspace, tab, clear, enter, return, esc, escape, space, up, down, left, right, home,
                            end, pageup, pagedown, del, delete and f1 through f19
                        </code>
                    </p>
                    <p>
                        Modifiers are: <code>shift, option, alt, ctrl, control, command</code>
                    </p>
                    <p>
                        Examples of hotkey definitions that you can use:<br/>
                        <ul>
                            <li><code>q</code></li>
                            <li><code>up</code></li>
                            <li><code>ctrl+a</code></li>
                            <li><code>shift+pageup</code></li>
                            <li><code>command+f4</code></li>
                            <li><code>ctrl+a</code></li>
                        </ul>
                    </p>
                </div>
            ),
            icon: <Icon type="question-circle" />,
            title: "Hotkey help",
            width: "600px",
            zIndex: 2000,
        });
    }

    return <Tooltip title="Motor control configuration">
      <Popover trigger="click" visible={visible} content={
            <div className="smallForm">
                <div>
                    <label htmlFor="incSpeed">Hotkey to increase speed:</label>
                    <Input
                        id="incSpeed"
                        value={hotKeys[0]}
                        onChange={(e) => setHotKeys([e.target.value, hotKeys[1], hotKeys[2]])}
                    />
                </div>
                <div>
                    <label htmlFor="decSpeed">Hotkey to decrease speed:</label>
                    <Input
                        id="decSpeed"
                        value={hotKeys[1]}
                        onChange={(e) => setHotKeys([hotKeys[0], e.target.value, hotKeys[2]])}
                    />
                </div>
                <div>
                    <label htmlFor="stop">Hotkey to stop motor:</label>
                    <Input
                        id="stop"
                        value={hotKeys[2]}
                        onChange={(e) => setHotKeys([hotKeys[0], hotKeys[1], e.target.value])}
                    />
                </div>
                <div style={{width: "100%"}}>
                    <Button icon="check" onClick={handleSubmit} />
                    <Button icon="close" onClick={handleCancel} />
                    <Button icon="question-circle" onClick={showHelp} style={{float: "right"}}/>
                </div>
            </div>
          }>
          <Icon className="small-icon" type="setting" onClick={() => setVisible(true)}/>
      </Popover>
    </Tooltip>;
};

export interface IMotorControlDefinition {
    hubUuid: string;
    motorPort: string;
}

export interface IMotorControlProps extends IMotorControlDefinition {
    remove(motorControlDefinition: IMotorControlDefinition): void;
}

const MotorControl = (props: IMotorControlProps) => {
    const step = 10;

    const initialHotKeys: HotKeys = ["", "", ""];

    const poweredUP = usePoweredup();
    const [motorSpeed, setMotorSpeed] = useState(0);
    const [inverted, setInverted] = useState(false);
    const [hotKeys, setHotKeys] = useState(initialHotKeys);

    useHotkeys((key) => {
            switch (key) {
                case hotKeys[0]:
                    return setMotorSpeed((v) => Math.min(v + step, 100));
                case hotKeys[1]:
                    return setMotorSpeed((v) => Math.max(v - step, -100));
                case hotKeys[2]:
                    return setMotorSpeed(0);
            }
        },
        hotKeys,
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

    return <Card
            size="small"
            extra={
                <>
                    <Tooltip title="Config">
                        <MotorControlConfig setHotkeys={setHotKeys}/>
                    </Tooltip>
                    <Tooltip title="Remove">
                        <Icon className="small-icon" type="close" onClick={() => props.remove(props)}/>
                    </Tooltip>
                </>
            }
            className="motor-control-card"
        >
        <div className="motor-control">
            <div>{"Port " + props.motorPort}</div>
            <div>
                <Tooltip title="Invert the motor speed">
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
                hotKeys[0].length > 0 &&
                <div>
                    <Tooltip title="Shortcut to increase motor speed">
                        <Button>{hotKeys[0]}</Button>
                    </Tooltip>
                </div>
            }
            <div>
                <Tooltip title="Speed of the motor">
                    <Slider
                        value={motorSpeed}
                        marks={{0: "0"}}
                        defaultValue={ 0 }
                        style={{height: "300px"}}
                        vertical
                        min={ -100 }
                        max={ 100 }
                        step={ step }
                        onChange={onChangeMotorSpeed}
                        onAfterChange={onChangeMotorSpeed}
                        included={ true }
                    />
                </Tooltip>
            </div>
            {
                hotKeys[1].length > 0 &&
                <div>
                    <Tooltip title="Shortcut to decrease motor speed">
                        <Button>{hotKeys[1]}</Button>
                    </Tooltip>
                </div>
            }
            <div>
                <Tooltip title="Stop the motor">
                    <Button icon="stop" onClick={() => setMotorSpeed(0)}>{hotKeys[2]}</Button>
                </Tooltip>
            </div>
        </div>
    </Card>;
};

export default MotorControl;
