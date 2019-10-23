import {Button, Descriptions, Icon, Progress, Tooltip} from "antd";
import * as Consts from "node-poweredup/dist/node/consts";
import {DeviceType, HubType} from "node-poweredup/dist/node/consts";
import React, {useEffect, useState} from "react";
import {HubHolder} from "../HubHolder";
import {IMotorControlProps} from "./MotorControl";

export interface IHubDetailsProps {
    hubHolder: HubHolder;
    addMotorControlProps(motorControlProps: IMotorControlProps): void;
}

interface IMotorDetailsProps {
    port: string;
    hubHolder: HubHolder;
    addMotorControlProps(motorControlProps: IMotorControlProps): void;
}

const MotorDetails = (props: IMotorDetailsProps) => {
    function portDeviceType(type: Consts.DeviceType): string {
        switch (type) {
            case DeviceType.UNKNOWN:
                return "UNKNOWN";
            case DeviceType.BASIC_MOTOR:
                return "BASIC_MOTOR";
            case DeviceType.TRAIN_MOTOR:
                return "TRAIN_MOTOR";
            case DeviceType.LED_LIGHTS:
                return "LED_LIGHTS";
            case DeviceType.BOOST_LED:
                return "BOOST_LED";
            case DeviceType.WEDO2_TILT:
                return "WEDO2_TILT";
            case DeviceType.WEDO2_DISTANCE:
                return "WEDO2_DISTANCE";
            case DeviceType.BOOST_DISTANCE:
                return "BOOST_DISTANCE";
            case DeviceType.BOOST_TACHO_MOTOR:
                return "BOOST_TACHO_MOTOR";
            case DeviceType.BOOST_MOVE_HUB_MOTOR:
                return "BOOST_MOVE_HUB_MOTOR";
            case DeviceType.BOOST_TILT:
                return "BOOST_TILT";
            case DeviceType.DUPLO_TRAIN_BASE_MOTOR:
                return "DUPLO_TRAIN_BASE_MOTOR";
            case DeviceType.DUPLO_TRAIN_BASE_SPEAKER:
                return "DUPLO_TRAIN_BASE_SPEAKER";
            case DeviceType.DUPLO_TRAIN_BASE_COLOR:
                return "DUPLO_TRAIN_BASE_COLOR";
            case DeviceType.DUPLO_TRAIN_BASE_SPEEDOMETER:
                return "DUPLO_TRAIN_BASE_SPEEDOMETER";
            case DeviceType.CONTROL_PLUS_LARGE_MOTOR:
                return "CONTROL_PLUS_LARGE_MOTOR";
            case DeviceType.CONTROL_PLUS_XLARGE_MOTOR:
                return "CONTROL_PLUS_XLARGE_MOTOR";
            case DeviceType.POWERED_UP_REMOTE_BUTTON:
                return "POWERED_UP_REMOTE_BUTTON";
        }
    }

    return <div className="hubDetails">
        <div>{portDeviceType(props.hubHolder.hub.getPortDeviceType(props.port))}</div>
        <Tooltip title="Add a control for this port to the &quot;Hub Controls&quot; panel on the right.">
            <Button
                size="small"
                icon="double-right"
                style={{float: "right"}}
                onClick={() => props.addMotorControlProps({motorPort: props.port, hubUuid: props.hubHolder.uuid()})}
            />
        </Tooltip>
    </div>;
};

interface ITiltIndicatorProps {
    tilt: number;
}
const TiltIndicator = ({tilt}: ITiltIndicatorProps) => (
    <div className="hubDetails">
        <div>{tilt}</div>
        <Icon type="vertical-align-middle" rotate={tilt} style={{fontSize: "20px", float: "right"}} />
    </div>
);

const HubDetails = (props: IHubDetailsProps) => {
    const [tiltX, setTiltX] = useState(0);
    const [tiltY, setTiltY] = useState(0);

    useEffect(() => {
        function tiltListener(port: string, x: number, y: number) {
            setTiltX(x);
            setTiltY(y);
        }

        props.hubHolder.hub.on("tilt", tiltListener);
        return () => {
            props.hubHolder.hub.removeListener("tilt", tiltListener);
        };
    });

    function disconnect(hubHolder: HubHolder) {
        hubHolder.hub.disconnect()
            .then(() => console.log("Disconnected"))
            .catch((err: any) => console.log(err.message));
    }

    function hubType(type: Consts.HubType): string {
        switch (type) {
            case HubType.UNKNOWN:
                return "UNKNOWN";
            case HubType.WEDO2_SMART_HUB:
                return "WEDO2_SMART_HUB";
            case HubType.BOOST_MOVE_HUB:
                return "BOOST_MOVE_HUB";
            case HubType.POWERED_UP_HUB:
                return "POWERED_UP_HUB";
            case HubType.POWERED_UP_REMOTE:
                return "POWERED_UP_REMOTE";
            case HubType.DUPLO_TRAIN_HUB:
                return "DUPLO_TRAIN_HUB";
            case HubType.CONTROL_PLUS_HUB:
                return "CONTROL_PLUS_HUB";
        }
    }

    return <div>
        <Descriptions layout={"horizontal"} bordered column={1} size="small">
            <Descriptions.Item label="UUID">{ props.hubHolder.uuid() }</Descriptions.Item>
            <Descriptions.Item label="Type">{ hubType(props.hubHolder.hub.getHubType()) }</Descriptions.Item>
            <Descriptions.Item label="Tilt X"><TiltIndicator tilt={tiltX}/></Descriptions.Item>
            <Descriptions.Item label="Tilt Y"><TiltIndicator tilt={tiltY}/></Descriptions.Item>
            <Descriptions.Item label="Port A">
                <MotorDetails hubHolder={props.hubHolder} addMotorControlProps={props.addMotorControlProps} port="A"/>
            </Descriptions.Item>
            <Descriptions.Item label="Port B">
                <MotorDetails hubHolder={props.hubHolder} addMotorControlProps={props.addMotorControlProps} port="B"/>
            </Descriptions.Item>
            <Descriptions.Item label="Port C">
                <MotorDetails hubHolder={props.hubHolder} addMotorControlProps={props.addMotorControlProps} port="C"/>
            </Descriptions.Item>
            <Descriptions.Item label="Port D">
                <MotorDetails hubHolder={props.hubHolder} addMotorControlProps={props.addMotorControlProps} port="D"/>
            </Descriptions.Item>
            <Descriptions.Item label="Battery level">
                <Progress
                    strokeColor={{
                        "0%": "#ff0000",
                        "100%": "#87d068",
                    }}
                    strokeLinecap="square"
                    status="normal"
                    percent={props.hubHolder.hub.batteryLevel}
                />
            </Descriptions.Item>
        </Descriptions>
        <br/>
        <Button onClick={() => disconnect(props.hubHolder)}>Disconnect</Button>
    </div>;
};

export default HubDetails;
