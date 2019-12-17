import {Button, Card, Descriptions, Dropdown, Icon, Menu, Progress, Tooltip, Typography} from "antd";
import * as Consts from "node-poweredup/dist/node/consts";
import {DeviceType} from "node-poweredup/dist/node/consts";
import React, {useEffect, useMemo, useState} from "react";
import useTiltEffect from "../hooks/useTiltEffect";
import {HubHolder} from "../HubHolder";
import {IMotorControlDefinition} from "./MotorControl";
import {Axis, ITiltControlProps} from "./TiltControl";
import {ITrackControlDefinition} from "./TrackControl";

const { Paragraph } = Typography;

export interface IHubDetailsProps {
    hubHolder: HubHolder;
    addMotorControlProps(motorControlProps: IMotorControlDefinition): void;
    addTrackControlProps(trackControlProps: ITrackControlDefinition): void;
    addTiltControlProps(tiltControlProps: ITiltControlProps): void;
    renameHub(newName: string): void;
}

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
                    <Icon type="down" style={{marginLeft: "3px"}}/>
                </Button>
            </Dropdown>
        </Tooltip>
    );
};

const PortDetails = ({port, hubDetails}: {port: string, hubDetails: IHubDetailsProps}) => {
    const motorName = useMemo(() => {
        function portDeviceType(type: Consts.DeviceType): string {
            switch (type) {
                case DeviceType.VOLTAGE:
                    return "Voltage";
                case DeviceType.CURRENT:
                    return "Current";
                case DeviceType.PIEZO_TONE:
                    return "Piezo tone";
                case DeviceType.RGB_LIGHT:
                    return "RGB light";
                case DeviceType.RSSI:
                    return "RSSI";
                case DeviceType.CONTROL_PLUS_ACCELEROMETER:
                    return "Accelerometer";
                case DeviceType.CONTROL_PLUS_TILT:
                    return "Tilt sensor";
                case DeviceType.UNKNOWN:
                    return "unknown";
                case DeviceType.BASIC_MOTOR:
                    return "Basic motor";
                case DeviceType.TRAIN_MOTOR:
                    return "Train motor";
                case DeviceType.LED_LIGHTS:
                    return "LED lights";
                case DeviceType.WEDO2_TILT:
                    return "Tilt sensor";
                case DeviceType.WEDO2_DISTANCE:
                    return "Distance sensor";
                case DeviceType.BOOST_DISTANCE:
                    return "Distance sensor";
                case DeviceType.BOOST_TACHO_MOTOR:
                    return "Tacho motor";
                case DeviceType.BOOST_MOVE_HUB_MOTOR:
                    return "Hub motor";
                case DeviceType.BOOST_TILT:
                    return "Tilt sensor";
                case DeviceType.DUPLO_TRAIN_BASE_MOTOR:
                    return "Base motor";
                case DeviceType.DUPLO_TRAIN_BASE_SPEAKER:
                    return "Speaker";
                case DeviceType.DUPLO_TRAIN_BASE_COLOR:
                    return "Color sensor";
                case DeviceType.DUPLO_TRAIN_BASE_SPEEDOMETER:
                    return "Speedometer";
                case DeviceType.CONTROL_PLUS_LARGE_MOTOR:
                    return "Large motor";
                case DeviceType.CONTROL_PLUS_XLARGE_MOTOR:
                    return "X-large motor";
                case DeviceType.POWERED_UP_REMOTE_BUTTON:
                    return "PoweredUp remote button";
                default:
                    return "unknown:" + type;
            }
        }

        function portType() {
            if (hubDetails.hubHolder.ports.has(port)) {
                return hubDetails.hubHolder.hub
                    ? portDeviceType(hubDetails.hubHolder.hub.getPortDeviceType(port))
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

const BatteryDetails = (props: {hubHolder: HubHolder}) => {
    const [now, setNow] = useState(0);
    // Update "now" every second
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
        <Progress
            strokeColor={{"0%": "#ff0000", "100%": "#87d068"}}
            strokeLinecap="square"
            status="normal"
            percent={props.hubHolder.hub ? batteryLevel : 0}
        />
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

    return props.hubHolder.connected ? (
        <Card
            title={(
                <Paragraph ellipsis={{rows: 14}} editable={{ onChange: props.renameHub }} style={{marginBottom: "0"}}>
                    {props.hubHolder.getHubName()}
                </Paragraph>
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
    ) : <Card title="Connecting...."><div>...</div></Card>;
};

export default HubDetails;
