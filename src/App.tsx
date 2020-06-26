import { Button, Layout, Modal, Spin } from "antd";
import { Hub } from "node-poweredup";
import qs from "qs";
import React, { useEffect, useReducer, useState } from "react";
import Help from "./components/Help";
import HelpModal from "./components/HelpModal";
import HubDetails from "./components/HubDetails";
import { IMotorControlDefinition } from "./components/MotorControl";
import RemoteControl from "./components/RemoteControl";
import { ITiltControlProps } from "./components/TiltControl";
import { ITrackControlDefinition } from "./components/TrackControl";
import { HubHolder } from "./HubHolder";
import { HubsContext } from "./HubsContext";
import usePoweredup from "./poweredup";
import { display } from "./Utils";

// tslint:disable-next-line:ordered-imports
import "./App.css";

const { Header, Content, Sider, Footer } = Layout;

const App: React.FC = () => {
  enum ActionType {
    CONNECT,
    DISCONNECT,
    RENAME,
    ATTACH_PORT,
    DISCOVER,
    DETACH_PORT,
  }

  interface IAction {
    type: ActionType;
    payload: {
      hub?: Hub;
      name?: string;
      port?: string;
      processed?: boolean;
    };
  }

  const reducer = (hubHolders: HubHolder[], action: IAction): HubHolder[] => {
    function clone(hubHolder: HubHolder): HubHolder {
      const newHubHolder = new HubHolder(hubHolder.hub, hubHolder.name);
      newHubHolder.connected = hubHolder.connected;
      hubHolder.ports.forEach((port) => newHubHolder.addPort(port));
      return newHubHolder;
    }

    function modifiedHubHolder(modifyFn: (hubHolder: HubHolder) => void) {
      const i = hubHolders.findIndex(
        (hubHolder) => hubHolder.getUuid() === hubUuid
      );
      if (i >= 0) {
        const newHubHolder = clone(hubHolders[i]);
        modifyFn(newHubHolder);

        return [
          ...hubHolders.slice(0, i),
          newHubHolder,
          ...hubHolders.slice(i + 1),
        ];
      } else {
        return hubHolders;
      }
    }

    const hub = action.payload.hub;
    const hubUuid = hub ? hub.uuid : "undefined";
    switch (action.type) {
      case ActionType.DISCOVER:
        if (!hubHolders.find((hubHolder) => hubHolder.getUuid() === hubUuid)) {
          return [...hubHolders, new HubHolder(hub)];
        }
        break;
      case ActionType.DISCONNECT:
        return hubHolders.filter(
          (hubHolder) => hubHolder.getUuid() !== hubUuid
        );
      case ActionType.RENAME: {
        return modifiedHubHolder((hubHolder) => {
          if (action.payload.name) {
            if (!action.payload.processed && hub) {
              hub
                .setName(action.payload.name)
                .then(() => {
                  console.log("Hub name set");
                  // prevent setting the name a 2nd time as reducers can be called twice for
                  // whatever reason: https://github.com/facebook/react/issues/16295
                  action.payload.processed = true;
                })
                .catch((e) => {
                  console.log("Error setting hub name", e);
                });
            }

            hubHolder.name = action.payload.name;
          }
        });
      }
      case ActionType.CONNECT: {
        return modifiedHubHolder((hubHolder) => (hubHolder.connected = true));
      }
      case ActionType.ATTACH_PORT: {
        return modifiedHubHolder(
          (hubHolder) =>
            action.payload.port && hubHolder.addPort(action.payload.port)
        );
      }
      case ActionType.DETACH_PORT: {
        return modifiedHubHolder(
          (hubHolder) =>
            action.payload.port && hubHolder.removePort(action.payload.port)
        );
      }
    }

    return hubHolders;
  };

  const [collapsed, setCollapsed] = useState(false);
  const poweredUP = usePoweredup();
  const [hubs, dispatch] = useReducer(reducer, new Array<HubHolder>());
  const [motorControlProps, setMotorControlProps] = useState(
    new Array<IMotorControlDefinition>()
  );
  const [trackControlProps, setTrackControlProps] = useState(
    new Array<ITrackControlDefinition>()
  );
  const [tiltControlProps, setTiltControlProps] = useState(
    new Array<ITiltControlProps>()
  );
  const [scanning, setScanning] = useState(false);

  // eslint-disable-next-line
  function debugEvents(hub: Hub) {
    hub.on("tilt", (port, x, y) => {
      // console.log(`Tilt detected on port ${port} (X: ${x}, Y: ${y})`);
    });

    hub.on("distance", (port, distance) => {
      console.log(`Motion detected on port ${port} (Distance: ${distance})`);
    });

    hub.on("accel", (port, x, y, z) => {
      // console.log(`Acceleration detected on port ${port} (Acceleration: x=${x}, y=${y}, z=${z})`);
    });

    hub.on("gyro", (port, x, y, z) => {
      // console.log(`Gyro on port ${port} (Gyro: x=${x}, y=${y}, z=${z})`);
    });

    hub.on("rotate", (port, rotation) => {
      console.log(`Rotation detected on port ${port} (Rotation: ${rotation})`);
    });
    hub.on("speed", (port, speed) => {
      console.log(`Speed detected on port ${port} (Speed: ${speed})`);
    });

    hub.on("color", (port, color) => {
      console.log(`Color detected on port ${port} (Color: ${color})`);
    });

    hub.on("rotate", (port, rotation) => {
      console.log(`Rotation detected on port ${port} (Rotation: ${rotation})`);
    });

    hub.on("button", (button, state) => {
      console.log(`Button press detected (Button: ${button}, State: ${state})`);
    });

    hub.on("attach", (port, device) => {
      console.log(`Device attached to port ${port} (Device ID: ${device})`);
    });

    hub.on("detach", (port) => {
      console.log(`Device detached from port ${port}`);
    });
  }

  useEffect(() => {
    poweredUP.on("discover", async (hub: Hub) => {
      // Wait to discover hubs
      // debugEvents(hub);
      dispatch({ type: ActionType.DISCOVER, payload: { hub } });

      hub.on("attach", (port, device) => {
        dispatch({ type: ActionType.ATTACH_PORT, payload: { hub, port } });
      });

      hub.on("detach", (port) => {
        dispatch({ type: ActionType.DETACH_PORT, payload: { hub, port } });
      });

      console.log("Connecting to hub:", hub.uuid);
      await hub.connect();
      console.log("Connected ✔");

      dispatch({ type: ActionType.CONNECT, payload: { hub } });

      hub.on("disconnect", () => {
        dispatch({ type: ActionType.DISCONNECT, payload: { hub } });
      });
    });
  }, [ActionType, poweredUP]);

  useEffect(() => {
    const queryParams = qs.parse(window.location.search, {
      ignoreQueryPrefix: true,
    });
    if (Object.prototype.hasOwnProperty.call(queryParams, "fakeHub")) {
      dispatch({ type: ActionType.DISCOVER, payload: { hub: undefined } });
      dispatch({
        type: ActionType.ATTACH_PORT,
        payload: { hub: undefined, port: "TILT" },
      });
      dispatch({ type: ActionType.CONNECT, payload: { hub: undefined } });
    }
    if (Object.prototype.hasOwnProperty.call(queryParams, "debug")) {
      if (queryParams.debug) {
        // Calling e.g. with "?debug=*"
        localStorage.setItem("debug", queryParams.debug.toString());
      } else {
        // Remove when just calling with "?debug"
        localStorage.removeItem("debug");
      }
    }
    if (Object.prototype.hasOwnProperty.call(queryParams, "jsconsole")) {
      const script = document.createElement("script");
      script.async = true;
      script.src =
        "https://www.jsconsole.net/include.js?598c719d-4012-4f4d-075c-873a05e490c1";
      document.head.appendChild(script);
    }
  }, [ActionType.CONNECT, ActionType.ATTACH_PORT, ActionType.DISCOVER]);

  useEffect(() => {
    if (!("bluetooth" in navigator)) {
      Modal.error({
        content:
          "Bluetooth is not available in your browser. Use Chrome or Edge (chromium version) to load this page.",
        title: "Bluetooth not available",
      });
    }
  }, []);

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

  function addMotorControlProps(
    newMotorControlProps: IMotorControlDefinition
  ): void {
    setMotorControlProps([...motorControlProps, newMotorControlProps]);
  }

  function addTrackControlProps(
    newTrackControlProps: ITrackControlDefinition
  ): void {
    setTrackControlProps([...trackControlProps, newTrackControlProps]);
  }

  function removeMotorControlProps(remove: IMotorControlDefinition): void {
    setMotorControlProps(
      motorControlProps.filter(
        (p) => p.hubUuid !== remove.hubUuid || p.motorPort !== remove.motorPort
      )
    );
  }
  function removeTrackControlProps(remove: ITrackControlDefinition): void {
    setTrackControlProps(
      trackControlProps.filter(
        (p) =>
          p.hubUuid !== remove.hubUuid ||
          p.motorPortLeft !== remove.motorPortLeft ||
          p.motorPortRight !== remove.motorPortRight
      )
    );
  }

  function addTiltControlProps(newTiltCotrolProps: ITiltControlProps): void {
    setTiltControlProps([...tiltControlProps, newTiltCotrolProps]);
  }

  function setHubName(hubHolder: HubHolder, name: string): void {
    if (hubHolder.hub) {
      dispatch({
        type: ActionType.RENAME,
        payload: { hub: hubHolder.hub, name },
      });
    }
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
              <Button type="primary" onClick={scan} icon="search" block={true}>
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
            <br />
            {/*<Controls />*/}
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
