import {
  App,
  Button,
  Card,
  Descriptions,
  Dropdown,
  Progress,
  Skeleton,
  Spin,
  Tooltip,
  Typography,
} from "antd";
import type { DescriptionsProps } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useBatteryLevel } from "../hooks/useBatteryLevel";
import useTiltEffect from "../hooks/useTiltEffect";
import type { HubHolder } from "../HubHolder";
import type { IMotorControlDefinition } from "./MotorControl";
import { Axis, type ITiltControlProps } from "./TiltControl";
import type { ITrackControlDefinition } from "./TrackControl";

const { Paragraph } = Typography;

const PORTS = ["A", "B", "C", "D"];

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

const TrackControlMenu = (props: ITrackControlMenuProps) => (
  <Tooltip title='Add a track control to the "Brick Remotes" panel on the right for two motors on the ports...'>
    <Dropdown
      menu={{
        items: props.ports.map((p) => ({
          key: p,
          label: `${props.port} & ${p}`,
        })),
        onClick: ({ key }) => props.addTrackControlProps(key),
      }}
      trigger={["click"]}
    >
      <Button
        size="small"
        aria-label={`Add track control for port ${props.port}`}
      >
        Add{" "}
        <img
          className="small-image"
          src="/icons/icons8-bulldozer-96.png"
          alt="Track Control"
        />
        <DownOutlined style={{ marginLeft: "3px" }} />
      </Button>
    </Dropdown>
  </Tooltip>
);

// --------------------------------------------------------------------------------------------------------------------

const PortDetails = ({
  port,
  hubDetails,
}: {
  port: string;
  hubDetails: IHubDetailsProps;
}) => {
  const { hubHolder } = hubDetails;

  const addMotorControlProps = () => {
    hubDetails.addMotorControlProps({
      motorPort: port,
      hubUuid: hubHolder.getUuid(),
    });
  };

  const addTrackControlProps = (motorPortRight: string) => {
    hubDetails.addTrackControlProps({
      motorPortLeft: port,
      motorPortRight,
      hubUuid: hubHolder.getUuid(),
    });
  };

  return (
    <div className="hub-details">
      <div>{hubHolder.deviceTypeName(port)}</div>
      <div style={{ flex: "2 0 70px", textAlign: "right" }}>
        <Tooltip title='Add a motor control for this port to the "Brick Remote" panel on the right'>
          <Button
            size="small"
            aria-label={`Add motor control for port ${port}`}
            onClick={addMotorControlProps}
          >
            Add
            <img
              className="small-image"
              src="/icons/icons8-speedometer-100.png"
              alt="Motor Control"
            />
          </Button>
        </Tooltip>
        &nbsp;
        <TrackControlMenu
          addTrackControlProps={addTrackControlProps}
          port={port}
          ports={PORTS.filter((e) => e !== port)}
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
          aria-label={`Add tilt indicator ${props.axis}`}
          style={{ float: "right" }}
          onClick={() => props.addTiltControlProps()}
        >
          Add
          <img
            className="small-image"
            src="/icons/icons8-hill-descent-control-96.png"
            alt="Tilt Control"
          />
        </Button>
      </Tooltip>
    </div>
  );
};

// --------------------------------------------------------------------------------------------------------------------

const BatteryDetails = (props: { hubHolder: HubHolder }) => {
  const batteryLevel = useBatteryLevel(props.hubHolder.hub);

  return (
    <Spin spinning={batteryLevel === 0}>
      <Progress
        strokeColor={{ "0%": "#ff0000", "100%": "#87d068" }}
        strokeLinecap="square"
        status="normal"
        percent={batteryLevel}
        aria-label="Battery level"
      />
    </Spin>
  );
};

// --------------------------------------------------------------------------------------------------------------------

const HubDetails = (props: IHubDetailsProps) => {
  const { hubHolder } = props;
  const { message } = App.useApp();

  function disconnect() {
    hubHolder.hub
      .disconnect()
      .then(() => console.log("Disconnected"))
      .catch((err: Error) => console.log(err.message));
  }

  function renameHub(value: string) {
    if (value.length > 14) {
      void message.error({
        content: "The hub name must not be longer then 14 characters",
        duration: 5,
      });
    } else if (value !== hubHolder.name) {
      props.renameHub(value);
    }
  }

  if (!hubHolder.connected) {
    return (
      <Card title="Connecting....">
        <Skeleton />
      </Card>
    );
  }

  const tiltItem = (axis: Axis) => ({
    key: `tilt${axis}`,
    label: `Tilt ${axis}`,
    children: (
      <TiltDetails
        axis={axis}
        hubHolder={hubHolder}
        addTiltControlProps={() =>
          props.addTiltControlProps({ axis, hubUuid: hubHolder.getUuid() })
        }
      />
    ),
  });

  const items: DescriptionsProps["items"] = [
    { key: "uuid", label: "UUID", children: hubHolder.getUuid() },
    { key: "type", label: "Type", children: hubHolder.getHubType() },
    ...(hubHolder.tiltPort ? [tiltItem(Axis.X), tiltItem(Axis.Y)] : []),
    ...PORTS.map((port) => ({
      key: `port${port}`,
      label: `Port ${port}`,
      children: <PortDetails hubDetails={props} port={port} />,
    })),
    {
      key: "battery",
      label: "Battery",
      children: <BatteryDetails hubHolder={hubHolder} />,
    },
  ];

  return (
    <Card
      title={
        <Paragraph
          ellipsis={{ rows: 14 }}
          editable={{ onChange: renameHub }}
          style={{ marginBottom: "0" }}
        >
          {hubHolder.name}
        </Paragraph>
      }
      styles={{ body: { padding: 0 } }}
    >
      <Descriptions
        layout="horizontal"
        bordered={true}
        column={1}
        size="small"
        items={items}
      />
      <Button style={{ margin: "10px" }} onClick={disconnect}>
        Disconnect
      </Button>
    </Card>
  );
};

export default HubDetails;
