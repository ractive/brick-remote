import React from "react";
import {Hub} from "node-poweredup";
import {Card, Descriptions, Button, Progress} from "antd";
import usePoweredup from "../poweredup";
import * as Consts from "node-poweredup/dist/node/consts";
import {DeviceType, HubType} from "node-poweredup/dist/node/consts";

export interface HubDetailsProps {
    hub: Hub | undefined
}

const HubDetails  = (props : HubDetailsProps) => {
    const poweredUP = usePoweredup();

    function disconnect(hub : Hub | undefined) {
        if (hub) {
            poweredUP.getConnectedHubByUUID(hub.uuid).disconnect()
                .then(() => console.log("Disconnected"))
                .catch((err : any) => console.log(err.message));
        }
    }

    function hubType(hubType : Consts.HubType) : string {
        switch (hubType) {
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

    function portDeviceType(type : Consts.DeviceType) : string {
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

    if (!props.hub) {
        return <Card title="Select a hub on the left" bordered={false}>
        </Card>;
    }

    return <Card title={props.hub!.name} bordered={false}>
        <Descriptions title="Hub Info" layout={"horizontal"} bordered  column={1}>
            <Descriptions.Item label="UUID">{ props.hub!.uuid }</Descriptions.Item>
            <Descriptions.Item label="Name">{ props.hub!.name }</Descriptions.Item>
            <Descriptions.Item label="Type">{ hubType(props.hub!.getHubType()) }</Descriptions.Item>
            <Descriptions.Item label="Port A">{ portDeviceType(props.hub!.getPortDeviceType("A")) }</Descriptions.Item>
            <Descriptions.Item label="Port B">{ portDeviceType(props.hub!.getPortDeviceType("B")) }</Descriptions.Item>
            <Descriptions.Item label="Port C">{ portDeviceType(props.hub!.getPortDeviceType("C")) }</Descriptions.Item>
            <Descriptions.Item label="Port D">{ portDeviceType(props.hub!.getPortDeviceType("D")) }</Descriptions.Item>
            <Descriptions.Item label="Battery level">
                <Progress
                    strokeColor={{
                        '0%': '#ff0000',
                        '100%': '#87d068',
                    }}
                    strokeLinecap="square"
                    status="normal"
                    percent={props.hub!.batteryLevel}
                />
            </Descriptions.Item>
        </Descriptions>
        <Button onClick={() => disconnect(props.hub)}>Disconnect</Button>
    </Card>
};

export default HubDetails;