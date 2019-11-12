import {Button, Icon, Input, Modal, Popover, Tooltip} from "antd";
import React, {MouseEvent, useState} from "react";
import { useHotkeys } from "react-hotkeys-hook";

export interface IHotKeyInfo {
    [id: string]: {
        key: string;
        label: string;
    };
}

export interface IControlConfigProps {
    hotkeyInfo: IHotKeyInfo;
    setHotkeys(hotKeys: IHotKeyInfo): void;
}

const ControlConfig = (props: IControlConfigProps) => {
    const [visible, setVisible] = useState(false);
    const [hotKeys, setHotKeys] = useState<IHotKeyInfo>({...props.hotkeyInfo});
    useHotkeys("esc",
        (_) => {
            if (visible) {
                setVisible(false);
            }
        },
        [visible, setVisible],
    );

    function handleSubmit(event: MouseEvent<HTMLElement>) {
        props.setHotkeys(hotKeys);
        setVisible(false);
        event.preventDefault();
    }

    function handleCancel(event: MouseEvent<HTMLElement>) {
        setVisible(false);
        event.preventDefault();
    }

    function setKey(id: string, key: string) {
        setHotKeys({
            ...hotKeys,
            [id]: {key, label: hotKeys[id].label}
        });
    }

    function showHelp() {
        Modal.info({
            content: (
                <div>
                    <p>
                        You can assign hotkeys to perform actions like to increase or decrease the motor speed.
                        When such a hotkey is pressed the motor speed is changed.
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

    return (
        <Tooltip title="Motor control configuration">
            <Popover
                trigger="click"
                visible={visible}
                content={(
                    <>
                        <div className="small-form">
                            {
                                Object.entries(props.hotkeyInfo).map(([id, {label}]) => (
                                    <>
                                        <label htmlFor={"hotkeyinfo_" + id}>{label}:</label>
                                        <Input
                                            id={"hotkeyinfo_" + id}
                                            value={hotKeys[id].key}
                                            onChange={(e) => setKey(id, e.target.value)}
                                        />
                                    </>
                                ))
                            }
                        </div>
                        <div style={{width: "100%"}}>
                            <Button icon="check" onClick={handleSubmit} />
                            <Button icon="close" onClick={handleCancel} />
                            <Button icon="question-circle" onClick={showHelp} style={{float: "right"}}/>
                        </div>
                    </>
                )}
            >
                <Icon className="small-icon" type="setting" onClick={() => setVisible(true)}/>
            </Popover>
        </Tooltip>
    );
};

export default ControlConfig;
