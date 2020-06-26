import {Button, Input, Modal, Popover, Tooltip} from "antd";
import {QuestionCircleOutlined, SettingOutlined} from '@ant-design/icons';
import React, {MouseEvent, useState} from "react";
import {IHotKeyInfo} from "../hooks/useHotkeyInfo";
import {useHotkeys} from "../hooks/useHotkeys";

export interface IControlConfigProps {
    hotkeyInfo: IHotKeyInfo;
    setHotkeys(hotKeys: IHotKeyInfo): void;
}

const ControlConfig = (props: IControlConfigProps) => {
    const [visible, setVisible] = useState(false);
    const [hotKeys, setHotKeys] = useState<IHotKeyInfo>({...props.hotkeyInfo});

    useHotkeys(
        [ "esc" ],
        (_) => setVisible(false),
        []
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
            [id]: {key, label: hotKeys[id].label, handle: hotKeys[id].handle}
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
            icon: <QuestionCircleOutlined />,
            title: "Hotkey help",
            width: "600px",
            zIndex: 2000,
        });
    }

    return (
        <Tooltip title="Keyboard control configuration">
            <Popover
                trigger="click"
                visible={visible}
                content={(
                    <>
                        <div className="small-form">
                            {
                                Object.entries(props.hotkeyInfo).map(([id, {label}]) => (
                                    <React.Fragment key={id}>
                                        <label htmlFor={"hotkeyinfo_" + id}>{label}:</label>
                                        <Input
                                            id={"hotkeyinfo_" + id}
                                            value={hotKeys[id].key}
                                            onChange={(e) => setKey(id, e.target.value)}
                                        />
                                    </React.Fragment>
                                ))
                            }
                        </div>
                        <div style={{width: "100%", marginTop: "10px"}}>
                            <Button icon="check" onClick={handleSubmit} />
                            <Button icon="close" onClick={handleCancel} />
                            <Button icon="question-circle" onClick={showHelp} style={{float: "right"}}/>
                        </div>
                    </>
                )}
            >
                <SettingOutlined className="small-icon" onClick={() => setVisible(true)}/>
            </Popover>
        </Tooltip>
    );
};

export default ControlConfig;
