import {Button, Card, Descriptions, Progress, Tooltip, Typography} from "antd";
import * as Consts from "node-poweredup/dist/node/consts";
import {DeviceType} from "node-poweredup/dist/node/consts";
import React, {useEffect, useState} from "react";
import useTiltEffect from "../hooks/useTiltEffect";
import {HubHolder} from "../HubHolder";
import {IMotorControlDefinition} from "./MotorControl";
import {Axis, ITiltControlProps} from "./TiltControl";

const { Paragraph } = Typography;

export interface IHubDetailsProps {
    hubHolder: HubHolder;
    addMotorControlProps(motorControlProps: IMotorControlDefinition): void;
    addTiltControlProps(tiltControlProps: ITiltControlProps): void;
    renameHub(newName: string): void;
}

interface IPortDetailsProps {
    port: string;
    hubHolder: HubHolder;
    addMotorControlProps(): void;
}

const PortDetails = (props: IPortDetailsProps) => {

    const [motorName, setMotorName] = useState("unknown");

    useEffect(() => {
        function portDeviceType(type: Consts.DeviceType): string {
            switch (type) {
                case DeviceType.UNKNOWN:
                    return "unknown";
                case DeviceType.BASIC_MOTOR:
                    return "Basic motor";
                case DeviceType.TRAIN_MOTOR:
                    return "Train motor";
                case DeviceType.LED_LIGHTS:
                    return "LED lights";
                case DeviceType.BOOST_LED:
                    return "boost LED";
                case DeviceType.WEDO2_TILT:
                    return "wedo2 tils";
                case DeviceType.WEDO2_DISTANCE:
                    return "wedo2 distance";
                case DeviceType.BOOST_DISTANCE:
                    return "boost distance";
                case DeviceType.BOOST_TACHO_MOTOR:
                    return "boost tacho motor";
                case DeviceType.BOOST_MOVE_HUB_MOTOR:
                    return "boost move hub motor";
                case DeviceType.BOOST_TILT:
                    return "boost tils";
                case DeviceType.DUPLO_TRAIN_BASE_MOTOR:
                    return "Duplo train motor";
                case DeviceType.DUPLO_TRAIN_BASE_SPEAKER:
                    return "Duplo train speaker";
                case DeviceType.DUPLO_TRAIN_BASE_COLOR:
                    return "Duplo train color";
                case DeviceType.DUPLO_TRAIN_BASE_SPEEDOMETER:
                    return "Duplo train spodometer";
                case DeviceType.CONTROL_PLUS_LARGE_MOTOR:
                    return "Control+ large motor";
                case DeviceType.CONTROL_PLUS_XLARGE_MOTOR:
                    return "Control+ x-large motor";
                case DeviceType.POWERED_UP_REMOTE_BUTTON:
                    return "PoweredUp remote button";
            }
        }
        function portType() {
            return props.hubHolder.hub
                ? portDeviceType(props.hubHolder.hub.getPortDeviceType(props.port))
                : "undefined";
        }

        const interval = setInterval(() => {
            setMotorName(portType);
        }, 2000);
        return () => clearInterval(interval);
    }, [props.hubHolder.hub, props.port]);

    return (
        <div className="hubDetails">
            <div>{motorName}</div>
            <Tooltip title="Add a control for this port to the &quot;Hub Controls&quot; panel on the right.">
                <Button
                    size="small"
                    style={{float: "right"}}
                    /* tslint:disable-next-line:max-line-length */
                    onClick={props.addMotorControlProps}
                >
                    Add
                    <img className="small-image" src="/icons/icons8-speedometer-100.png" alt="Motor Control" />
                </Button>
            </Tooltip>
        </div>
    );
};

interface ITiltDetailsProps {
    axis: Axis;
    hubHolder: HubHolder;
    addTiltControlProps(): void;
}

const TiltDetails = (props: ITiltDetailsProps) => {
    const [tiltX, tiltY] = useTiltEffect(props.hubHolder.getUuid());

    return (
        <div className="hubDetails">
            <div>{props.axis === Axis.X ? tiltX : tiltY}&deg;</div>
            <Tooltip title="Add a tilt indicator for this axis.">
                <Button
                    size="small"
                    style={{float: "right"}}
                    onClick={props.addTiltControlProps}
                >
                    Add
                    <img className="small-image" src="/icons/icons8-hill-descent-control-96.png" alt="Tilt Control" />
                </Button>
            </Tooltip>
        </div>
    );
};

const HubDetails = (props: IHubDetailsProps) => {
    function disconnect(hubHolder: HubHolder) {
        if (hubHolder.hub) {
            hubHolder.hub.disconnect()
                .then(() => console.log("Disconnected"))
                .catch((err: any) => console.log(err.message));
        }
    }

    return (
        <Card
            /* tslint:disable-next-line:jsx-no-multiline-js */
            title={(
                <Paragraph editable={{ onChange: props.renameHub }} style={{marginBottom: "0"}}>
                    {props.hubHolder.getHubName()}
                </Paragraph>
            )}
            bodyStyle={{padding: 0}}
        >
        <Descriptions layout={"horizontal"} bordered={true} column={1} size="small">
            <Descriptions.Item label="UUID">{props.hubHolder.getUuid()}</Descriptions.Item>
            <Descriptions.Item label="Type">{props.hubHolder.getHubType()}</Descriptions.Item>
            <Descriptions.Item label="Tilt X">
                <TiltDetails
                    axis={Axis.X}
                    hubHolder={props.hubHolder}
                    addTiltControlProps={
                        () => props.addTiltControlProps({axis: Axis.X, hubUuid: props.hubHolder.getUuid()})
                    }
                />
            </Descriptions.Item>
            <Descriptions.Item label="Tilt Y">
                <TiltDetails
                    axis={Axis.Y}
                    hubHolder={props.hubHolder}
                    addTiltControlProps={
                        () => props.addTiltControlProps({axis: Axis.Y, hubUuid: props.hubHolder.getUuid()})
                    }
                />
            </Descriptions.Item>
            <Descriptions.Item label="Port A">
                <PortDetails
                    hubHolder={props.hubHolder}
                    addMotorControlProps={
                        () => props.addMotorControlProps({motorPort: "A", hubUuid: props.hubHolder.getUuid()})
                    }
                    port="A"
                />
            </Descriptions.Item>
            <Descriptions.Item label="Port B">
                <PortDetails
                    hubHolder={props.hubHolder}
                    addMotorControlProps={
                        () => props.addMotorControlProps({motorPort: "B", hubUuid: props.hubHolder.getUuid()})
                    }
                    port="B"
                />
            </Descriptions.Item>
            <Descriptions.Item label="Port C">
                <PortDetails
                    hubHolder={props.hubHolder}
                    addMotorControlProps={
                        () => props.addMotorControlProps({motorPort: "C", hubUuid: props.hubHolder.getUuid()})
                    }
                    port="C"
                />
            </Descriptions.Item>
            <Descriptions.Item label="Port D">
                <PortDetails
                    hubHolder={props.hubHolder}
                    addMotorControlProps={
                        () => props.addMotorControlProps({motorPort: "D", hubUuid: props.hubHolder.getUuid()})
                    }
                    port="D"
                />
            </Descriptions.Item>
            <Descriptions.Item label="Battery">
                <Progress
                    strokeColor={{"0%": "#ff0000", "100%": "#87d068"}}
                    strokeLinecap="square"
                    status="normal"
                    percent={props.hubHolder.hub ? props.hubHolder.hub.batteryLevel : 0}
                />
            </Descriptions.Item>
        </Descriptions>
        <Button style={{margin: "10px"}} onClick={() => disconnect(props.hubHolder)}>Disconnect</Button>
        </Card>
    );
};

export default HubDetails;
