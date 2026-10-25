import { App as AntApp, Button, Layout, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useReducer, useState } from "react";
import Help from "./components/Help";
import HelpModal from "./components/HelpModal";
import HubDetails from "./components/HubDetails";
import type { IMotorControlDefinition } from "./components/MotorControl";
import RemoteControl from "./components/RemoteControl";
import type { ITiltControlProps } from "./components/TiltControl";
import type { ITrackControlDefinition } from "./components/TrackControl";
import type { HubHolder } from "./HubHolder";
import { HubsContext } from "./HubsContext";
import { canRename, connectHub, hubsReducer } from "./hubsReducer";
import usePoweredup, { type BaseHub } from "./poweredup";
import { display } from "./Utils";
import "./App.css";

const { Header, Content, Sider, Footer } = Layout;

export interface IAppProps {
  // Creates a hub that does not need bluetooth, see "?fakeHub"
  createFakeHub?: () => BaseHub;
}

const App = ({ createFakeHub }: IAppProps) => {
  const { modal } = AntApp.useApp();
  const [collapsed, setCollapsed] = useState(false);
  const poweredUP = usePoweredup();
  const [hubs, dispatch] = useReducer(hubsReducer, []);
  const [motorControlProps, setMotorControlProps] = useState<
    IMotorControlDefinition[]
  >([]);
  const [trackControlProps, setTrackControlProps] = useState<
    ITrackControlDefinition[]
  >([]);
  const [tiltControlProps, setTiltControlProps] = useState<ITiltControlProps[]>(
    [],
  );
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const onDiscover = (hub: BaseHub) => {
      connectHub(hub, dispatch).catch((e: unknown) =>
        console.log("Error connecting to hub", e),
      );
    };
    poweredUP.on("discover", onDiscover);
    return () => {
      poweredUP.removeListener("discover", onDiscover);
    };
  }, [poweredUP]);

  useEffect(() => {
    if (!createFakeHub) {
      return;
    }
    const hub = createFakeHub();
    connectHub(hub, dispatch).catch((e: unknown) =>
      console.log("Error connecting to fake hub", e),
    );
    return () => {
      void hub.disconnect();
    };
  }, [createFakeHub]);

  useEffect(() => {
    if (!("bluetooth" in navigator) && !createFakeHub) {
      modal.error({
        content:
          "Bluetooth is not available in your browser. Use Chrome or Edge to load this page.",
        title: "Bluetooth not available",
      });
    }
  }, [modal, createFakeHub]);

  function scan() {
    setScanning(true);
    console.log("Scanning for hubs...");
    poweredUP
      .scan()
      .then((result: boolean) => {
        console.log("Scanning result:", result);
      })
      .catch((e: Error) => console.log("Error scanning for hubs:", e))
      .finally(() => setScanning(false));
  }

  function addMotorControlProps(add: IMotorControlDefinition): void {
    setMotorControlProps((props) =>
      props.some(
        (p) => p.hubUuid === add.hubUuid && p.motorPort === add.motorPort,
      )
        ? props
        : [...props, add],
    );
  }

  function addTrackControlProps(add: ITrackControlDefinition): void {
    setTrackControlProps((props) =>
      props.some(
        (p) =>
          p.hubUuid === add.hubUuid &&
          p.motorPortLeft === add.motorPortLeft &&
          p.motorPortRight === add.motorPortRight,
      )
        ? props
        : [...props, add],
    );
  }

  function addTiltControlProps(add: ITiltControlProps): void {
    setTiltControlProps((props) =>
      props.some((p) => p.hubUuid === add.hubUuid && p.axis === add.axis)
        ? props
        : [...props, add],
    );
  }

  function removeMotorControlProps(remove: IMotorControlDefinition): void {
    setMotorControlProps((props) =>
      props.filter(
        (p) => p.hubUuid !== remove.hubUuid || p.motorPort !== remove.motorPort,
      ),
    );
  }

  function removeTrackControlProps(remove: ITrackControlDefinition): void {
    setTrackControlProps((props) =>
      props.filter(
        (p) =>
          p.hubUuid !== remove.hubUuid ||
          p.motorPortLeft !== remove.motorPortLeft ||
          p.motorPortRight !== remove.motorPortRight,
      ),
    );
  }

  function setHubName(hubHolder: HubHolder, name: string): void {
    const { hub } = hubHolder;
    if (!canRename(hub)) {
      return;
    }
    hub
      .setName(name)
      .then(() => dispatch({ type: "rename", hub, name }))
      .catch((e: unknown) => console.log("Error setting hub name", e));
  }

  return (
    <HubsContext.Provider value={hubs}>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          width="400px"
          breakpoint="lg"
          collapsible={true}
          collapsed={collapsed}
          onCollapse={() => setCollapsed(!collapsed)}
        >
          <div style={{ padding: "15px" }} className={display(!collapsed)}>
            <Spin spinning={scanning}>
              <Button
                type="primary"
                onClick={scan}
                icon={<SearchOutlined />}
                block={true}
              >
                Scan for hubs
              </Button>
            </Spin>
            <br />
            {hubs.map((hub) => (
              <HubDetails
                key={hub.getUuid()}
                hubHolder={hub}
                addMotorControlProps={addMotorControlProps}
                addTrackControlProps={addTrackControlProps}
                addTiltControlProps={addTiltControlProps}
                renameHub={(name) => setHubName(hub, name)}
              />
            ))}
          </div>
        </Sider>
        <Layout>
          <Header style={{ background: "#fff", padding: "0px 10px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <h1 style={{ flex: "1 0 auto" }}>Brick Remote</h1>
              <div>
                <HelpModal />
              </div>
            </div>
          </Header>
          <Content style={{ margin: "10px" }}>
            {hubs.length > 0 ? (
              <RemoteControl
                motorControlProps={motorControlProps}
                tiltControlProps={tiltControlProps}
                trackControlProps={trackControlProps}
                removeMotorControl={removeMotorControlProps}
                removeTrackControl={removeTrackControlProps}
              />
            ) : (
              <Help />
            )}
          </Content>
          <Footer style={{ fontSize: "9pt" }}>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="/icons/icons8-bulldozer-96.png"
            >
              Bulldozer
            </a>
            ,{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="/icons/icons8-speedometer-100.png"
            >
              Speedometer
            </a>{" "}
            and other icons by{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://icons8.com"
            >
              Icons8
            </a>
          </Footer>
        </Layout>
      </Layout>
    </HubsContext.Provider>
  );
};

export default App;
