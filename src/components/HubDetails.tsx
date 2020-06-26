import {
    Button,
    Card,
    Descriptions,
    Dropdown,
    Menu,
    message,
    Progress,
    Skeleton,
    Spin,
    Tooltip,
    Typography
} from "antd";
import {DownOutlined} from '@ant-design/icons';
import * as Consts from "node-poweredup/dist/node/consts";
import {DeviceType} from "node-poweredup/dist/node/consts";
import React, {useEffect, useMemo, useState} from "react";
import useTiltEffect from "../hooks/useTiltEffect";
import {HubHolder} from "../HubHolder";
import {IMotorControlDefinition} from "./MotorControl";
import {Axis, ITiltControlProps} from "./TiltControl";
import {ITrackControlDefinition} from "./TrackControl";

const { Paragraph } = Typography;

// --------------------------------------------------------------------------------------------------------------------

export interface IHubDetailsProps {
    hubHolder: HubHolder;
    addMotorControlProps(motorControlProps: IMotorControlDefinition): void;
    addTrackControlProps(trackControlProps: ITrackControlDefinition): void;
    addTiltControlProps(tiltControlProps: ITiltControlProps): void;
    renameHub(newName: string): void;
}

// --------------------------------------------------------------------------------------------------------------------

interface ITrackControlMenuProps {
    port: string;
    ports: string[];
    addTrackControlProps(motorPortB: string): void;
}

const TrackControlMenu = (props: ITrackControlMenuProps) => {
    const menu = (
        <Menu onClick={({key}) => props.addTrackControlProps(key)}>
            {props.ports.map((p) => (
                <Menu.Item key={p}>
                    {`${props.port} & ${p}`}
                </Menu.Item>
            ))}
        </Menu>
    );

    return (
        <Tooltip title="Add a track control to the &quot;Brick Remotes&quot; panel on the right for two motors on the ports...">
            <Dropdown overlay={menu} trigger={["click"]}>
                <Button size="small">
                    Add <img className="small-image" src="/icons/icons8-bulldozer-96.png" alt="Track Control" />
                    <DownOutlined style={{marginLeft: "3px"}}/>
                </Button>
            </Dropdown>
        </Tooltip>
    );
};

// --------------------------------------------------------------------------------------------------------------------

const PortDetails = ({port, hubDetails}: {port: string, hubDetails: IHubDetailsProps}) => {
    const motorName = useMemo(() => {
        function portDeviceType(type: Consts.DeviceType): string {
            switch (type) {
                case DeviceType.UNKNOWN:
                    return "UNKNOWN";
                case DeviceType.SIMPLE_MEDIUM_LINEAR_MOTOR:
                    return "SIMPLE_MEDIUM_LINEAR_MOTOR";
                case DeviceType.TRAIN_MOTOR:
                    return "TRAIN_MOTOR";
                case DeviceType.LIGHT:
                    return "LIGHT";
                case DeviceType.VOLTAGE_SENSOR :
                    return "VOLTAGE_SENSOR";
                case DeviceType.CURRENT_SENSOR :
                    return "CURRENT_SENSOR";
                case DeviceType.PIEZO_BUZZER :
                    return "PIEZO_BUZZER";
                case DeviceType.HUB_LED :
                    return "HUB_LED";
                case DeviceType.TILT_SENSOR :
                    return "TILT_SENSOR";
                case DeviceType.MOTION_SENSOR :
                    return "MOTION_SENSOR";
                case DeviceType.COLOR_DISTANCE_SENSOR :
                    return "COLOR_DISTANCE_SENSOR";
                case DeviceType.MEDIUM_LINEAR_MOTOR :
                    return "MEDIUM_LINEAR_MOTOR";
                case DeviceType.MOVE_HUB_MEDIUM_LINEAR_MOTOR :
                    return "MOVE_HUB_MEDIUM_LINEAR_MOTOR";
                case DeviceType.MOVE_HUB_TILT_SENSOR :
                    return "MOVE_HUB_TILT_SENSOR";
                case DeviceType.DUPLO_TRAIN_BASE_MOTOR :
                    return "DUPLO_TRAIN_BASE_MOTOR";
                case DeviceType.DUPLO_TRAIN_BASE_SPEAKER :
                    return "DUPLO_TRAIN_BASE_SPEAKER";
                case DeviceType.DUPLO_TRAIN_BASE_COLOR_SENSOR :
                    return "DUPLO_TRAIN_BASE_COLOR_SENSOR";
                case DeviceType.DUPLO_TRAIN_BASE_SPEEDOMETER :
                    return "DUPLO_TRAIN_BASE_SPEEDOMETER";
                case DeviceType.TECHNIC_LARGE_LINEAR_MOTOR :
                    return "TECHNIC_LARGE_LINEAR_MOTOR";
                case DeviceType.TECHNIC_XLARGE_LINEAR_MOTOR :
                    return "TECHNIC_XLARGE_LINEAR_MOTOR";
                case DeviceType.TECHNIC_MEDIUM_ANGULAR_MOTOR :
                    return "TECHNIC_MEDIUM_ANGULAR_MOTOR";
                case DeviceType.TECHNIC_LARGE_ANGULAR_MOTOR :
                    return "TECHNIC_LARGE_ANGULAR_MOTOR";
                case DeviceType.TECHNIC_MEDIUM_HUB_GEST_SENSOR :
                    return "TECHNIC_MEDIUM_HUB_GEST_SENSOR";
                case DeviceType.REMOTE_CONTROL_BUTTON :
                    return "REMOTE_CONTROL_BUTTON";
                case DeviceType.REMOTE_CONTROL_RSSI :
                    return "REMOTE_CONTROL_RSSI";
                case DeviceType.TECHNIC_MEDIUM_HUB_ACCELEROMETER :
                    return "TECHNIC_MEDIUM_HUB_ACCELEROMETER";
                case DeviceType.TECHNIC_MEDIUM_HUB_GYRO_SENSOR :
                    return "TECHNIC_MEDIUM_HUB_GYRO_SENSOR";
                case DeviceType.TECHNIC_MEDIUM_HUB_TILT_SENSOR :
                    return "TECHNIC_MEDIUM_HUB_TILT_SENSOR";
                case DeviceType.TECHNIC_MEDIUM_HUB_TEMPERATURE_SENSOR :
                    return "TECHNIC_MEDIUM_HUB_TEMPERATURE_SENSOR";
                case DeviceType.TECHNIC_COLOR_SENSOR :
                    return "TECHNIC_COLOR_SENSOR";
                case DeviceType.TECHNIC_DISTANCE_SENSOR :
                    return "TECHNIC_DISTANCE_SENSOR";
                case DeviceType.TECHNIC_FORCE_SENSOR :
                    return "TECHNIC_FORCE_SENSOR";
                case DeviceType.TECHNIC_MEDIUM_ANGULAR_MOTOR_GREY :
                    return "TECHNIC_MEDIUM_ANGULAR_MOTOR_GREY";
                case DeviceType.TECHNIC_LARGE_ANGULAR_MOTOR_GREY:
                    return "TECHNIC_LARGE_ANGULAR_MOTOR_GREY";
                default:
                    return "unknown:" + type;
            }
        }

        function portType() {
            if (hubDetails.hubHolder.ports.has(port)) {
                return hubDetails.hubHolder.hub
                    ? portDeviceType(hubDetails.hubHolder.hub.getDeviceAtPort(port)!.type)
                    : "undefined";
            } else {
                return "not attached";
            }
        }

        return portType();
    }, [hubDetails.hubHolder, port]);

    const addMotorControlProps = () => {
        hubDetails.addMotorControlProps(
        {motorPort: port, hubUuid: hubDetails.hubHolder.getUuid()});
    };

    const addTrackControlProps = (motorPortRight: string) => {
        hubDetails.addTrackControlProps(
            {motorPortLeft: port, motorPortRight, hubUuid: hubDetails.hubHolder.getUuid()});
    };

    return (
        <div className="hub-details">
            <div>{motorName}</div>
            <div style={{flex: "2 0 70px", textAlign: "right"}}>
                <Tooltip title="Add a motor control for this port to the &quot;Brick Remote&quot; panel on the right">
                    <Button
                        size="small"
                        onClick={addMotorControlProps}
                    >
                        Add
                        <img className="small-image" src="/icons/icons8-speedometer-100.png" alt="Motor Control" />
                    </Button>
                </Tooltip>
                &nbsp;
                <TrackControlMenu
                    addTrackControlProps={addTrackControlProps}
                    port={port}
                    ports={["A", "B", "C", "D"].filter((e) => e !== port)}
                />
            </div>
        </div>
    );
};

// --------------------------------------------------------------------------------------------------------------------

interface ITiltDetailsProps {
    axis: Axis;
    hubHolder: HubHolder;
    addTiltControlProps(): void;
}

const TiltDetails = (props: ITiltDetailsProps) => {
    const [tiltX, tiltY] = useTiltEffect(props.hubHolder.getUuid());

    return (
        <div className="hub-details">
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

// --------------------------------------------------------------------------------------------------------------------

const BatteryDetails = (props: {hubHolder: HubHolder}) => {
    const [now, setNow] = useState(0);
    // Update "now" within an interval to force re-reading the battery level
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date().getTime()), 10000);
        return () => clearInterval(interval);
    });
    // Read the battery level whenever "now" changes
    const batteryLevel = useMemo(
        () => props.hubHolder.hub && now ? props.hubHolder.hub.batteryLevel : 0,
        [props.hubHolder, now]
    );

    return (
        <Spin spinning={batteryLevel === 0}>
            <Progress
                strokeColor={{"0%": "#ff0000", "100%": "#87d068"}}
                strokeLinecap="square"
                status="normal"
                percent={batteryLevel}
            />
        </Spin>
    );
};

// --------------------------------------------------------------------------------------------------------------------

const HubDetails = (props: IHubDetailsProps) => {
    function disconnect(hubHolder: HubHolder) {
        if (hubHolder.hub) {
            hubHolder.hub.disconnect()
                .then(() => console.log("Disconnected"))
                .catch((err: any) => console.log(err.message));
        }
    }

    function renameHub(value: string) {
        if (value.length > 14) {
            message.error( { content: "The hub name must not be longer then 14 characters", duration: 5 } );
        } else {
            props.renameHub(value);
        }
    }

    return props.hubHolder.connected ? (
        <Card
            title={(
                <>
                    <Paragraph ellipsis={{rows: 14}} editable={{ onChange: renameHub }} style={{marginBottom: "0"}}>
                        {props.hubHolder.name}
                    </Paragraph>
                </>
            )}
            bodyStyle={{padding: 0}}
        >
        <Descriptions layout={"horizontal"} bordered={true} column={1} size="small">
            <Descriptions.Item label="UUID">{props.hubHolder.getUuid()}</Descriptions.Item>
            <Descriptions.Item label="Type">{props.hubHolder.getHubType()}</Descriptions.Item>
            {
                // Why can't I use a fragment here and add both Description.Item elements?
                props.hubHolder.ports.has("TILT") ? (
                    <Descriptions.Item label="Tilt X">
                        <TiltDetails
                            axis={Axis.X}
                            hubHolder={props.hubHolder}
                            addTiltControlProps={
                                () => props.addTiltControlProps({axis: Axis.X, hubUuid: props.hubHolder.getUuid()})
                            }
                        />
                    </Descriptions.Item>
                ) : null
            }
            {
                props.hubHolder.ports.has("TILT") ? (
                    <Descriptions.Item label="Tilt Y">
                        <TiltDetails
                            axis={Axis.Y}
                            hubHolder={props.hubHolder}
                            addTiltControlProps={
                                () => props.addTiltControlProps({axis: Axis.Y, hubUuid: props.hubHolder.getUuid()})
                            }
                        />
                    </Descriptions.Item>
                ) : null
            }

            <Descriptions.Item label="Port A">
                <PortDetails
                    hubDetails={props}
                    port="A"
                />
            </Descriptions.Item>
            <Descriptions.Item label="Port B">
                <PortDetails
                    hubDetails={props}
                    port="B"
                />
            </Descriptions.Item>
            <Descriptions.Item label="Port C">
                <PortDetails
                    hubDetails={props}
                    port="C"
                />
            </Descriptions.Item>
            <Descriptions.Item label="Port D">
                <PortDetails
                    hubDetails={props}
                    port="D"
                />
            </Descriptions.Item>
            <Descriptions.Item label="Battery">
                <BatteryDetails hubHolder={props.hubHolder}/>
            </Descriptions.Item>
        </Descriptions>
        <Button style={{margin: "10px"}} onClick={() => disconnect(props.hubHolder)}>Disconnect</Button>
        </Card>
    ) : <Card title="Connecting...."><Skeleton /></Card>;
};

export default HubDetails;
