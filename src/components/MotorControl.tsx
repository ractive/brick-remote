import {Button, Icon, Slider, Switch, Tooltip} from "antd";
import { SliderValue } from "antd/lib/slider";
import React, {useEffect, useState} from "react";
import usePoweredup from "../poweredup";

export interface IMotorControlProps {
    hubUuid: string;
    motorPort: string;
}

const MotorControl = (props: IMotorControlProps) => {
    const poweredUP = usePoweredup();
    const [motorSpeed, setMotorSpeed] = useState(0);
    const [inverted, setInverted] = useState(false);
    useEffect(() => {
            function driveMotor() {
                console.log("driveMotor", motorSpeed, inverted);
                const hub = poweredUP.getConnectedHubByUUID(decodeURIComponent(props.hubUuid));
                hub.setMotorSpeed(props.motorPort, inverted ? -motorSpeed : motorSpeed)
                    .catch((err: any) => console.log("Error while setting motorSpeed", err));
            }

            driveMotor();
        }, [motorSpeed, inverted, props.motorPort, props.hubUuid, poweredUP]);

    function onChangeMotorSpeed(value: SliderValue) {
        const speed = value instanceof Array ? value[0] : value;
        setMotorSpeed(speed);
    }

    return <div className="motor-control">
        <div style={{textAlign: "center"}}>{props.motorPort}</div>
        <Tooltip title="Invert the motor speed">
            <Switch
                style={{marginBottom: "10px"}}
                checkedChildren={<Icon type="double-right" rotate={90} />}
                unCheckedChildren={<Icon type="double-left" rotate={90} />}
                checked={inverted}
                onChange={(checked) => setInverted(checked)}

            />
        </Tooltip>
        <br/>
        <Tooltip title="Speed of the motor">
            <Slider
                value={motorSpeed}
                marks={{0: "0"}}
                defaultValue={ 0 }
                style={{height: "300px"}}
                vertical
                min={ -100 }
                max={ 100 }
                step={ 10 }
                onChange={onChangeMotorSpeed}
                onAfterChange={onChangeMotorSpeed}
                included={ true }
            />
        </Tooltip>
        <Tooltip title="Stop the motor">
            <Button icon="stop" onClick={() => setMotorSpeed(0)}  />
        </Tooltip>
    </div>;
};

export default MotorControl;
