import React, {useState} from "react";
import {Select, Slider, Switch, Icon} from "antd";
import {SliderValue} from "antd/lib/slider";
import usePoweredup from "../poweredup";
import {Hub} from "node-poweredup";

const { Option } = Select;

export interface MotorSliderProps {
    hub: Hub | undefined;
    defaultMotorPort: string;
}

const MotorSlider = (props: MotorSliderProps) => {
    const poweredUP = usePoweredup();
    const [motorPort, setMotorPort] = useState(props.defaultMotorPort);
    const [motorSpeed, setMotorSpeed] = useState(0);
    const [inverted, setInverted] = useState(false);

    async function driveMotor() {
        console.log("driveMotor", motorPort, motorSpeed, inverted);
        if (props.hub) {
            const hub = poweredUP.getConnectedHubByUUID(decodeURIComponent(props.hub!.uuid));
            await hub.setMotorSpeed(motorPort, inverted ? -motorSpeed : motorSpeed);
        }
    }

    async function onChangeMotorSpeed(value: SliderValue) {
        setMotorSpeed(value instanceof Array ? value[0] : value);
        await driveMotor();
    }

    async function onSelectMotor(value : string) {
        setMotorPort(value);
        await driveMotor();
    }

    async function onInvert(checked : boolean, event : Event) {
        setInverted(checked);
        await driveMotor();
    }

    return <div style={{marginLeft: 50, padding: "10px", backgroundColor: "lightgray", width: "70px"}}>
        <Select defaultValue={props.defaultMotorPort} onSelect={onSelectMotor} style={{marginBottom: "10px"}}>
            <Option value="A">A</Option>
            <Option value="B">B</Option>
            <Option value="C">C</Option>
            <Option value="D">D</Option>
        </Select>
        <br/>
        <Switch
            style={{marginBottom: "10px"}}
            checkedChildren={<Icon type="double-right" rotate={90} />}
            unCheckedChildren={<Icon type="double-left" rotate={90} />}
            checked={inverted}
            onChange={onInvert}
        />
        <br/>
        <Slider
            marks={{0: "0", [-100]: "-100", 100: "100"}}
            defaultValue={ 0 }
            style={{height: "300px"}}
            vertical
            min={ -100 }
            max={ 100 }
            step={ 10 }
            onChange={onChangeMotorSpeed}
            onAfterChange={onChangeMotorSpeed}
            included={ false }
        />
    </div>
};

export default MotorSlider;