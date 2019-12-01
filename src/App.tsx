import {Button, Layout, Modal, Spin} from "antd";
import {Hub} from "node-poweredup";
import {LPF2Hub} from "node-poweredup/dist/node/lpf2hub";
import React, {useEffect, useReducer, useState} from "react";
import HubDetails from "./components/HubDetails";
import {IMotorControlDefinition} from "./components/MotorControl";
import RemoteControl from "./components/RemoteControl";
import {ITiltControlProps} from "./components/TiltControl";
import {ITrackControlDefinition} from "./components/TrackControl";
import {HubHolder} from "./HubHolder";
import {HubsContext} from "./HubsContext";
import usePoweredup from "./poweredup";
import {display} from "./Utils";

// tslint:disable-next-line:ordered-imports
import "./App.css";

const { Header, Content, Sider, Footer } = Layout;

const App: React.FC = () => {
    enum ActionType {
        CONNECT,
        DISCONNECT,
        RENAME,
    }

    interface IAction {
        type: ActionType;
        payload: {
            hub?: Hub,
            name?: string,
        };
    }

    const reducer = (hubHolders: HubHolder[], action: IAction): HubHolder[] => {
        const hub = action.payload.hub;
        const hubUuid = hub ? hub.uuid : "";
        switch (action.type) {
            case ActionType.CONNECT:
                if (!hubHolders.find((hubHolder) => hubHolder.getUuid() === hubUuid)) {
                    return [...hubHolders, new HubHolder(hub)];
                }
                break;
            case ActionType.DISCONNECT:
                return hubHolders.filter((hubHolder) => hubHolder.getUuid() !== hubUuid);
            case ActionType.RENAME:
                const i = hubHolders.findIndex((hubHolder) => hubHolder.getUuid() === hubUuid);
                if (i >= 0 && action.payload.name) {
                    if (hub instanceof LPF2Hub) {
                        (hub as LPF2Hub).setName(action.payload.name)
                            .catch((e) => {console.log("Error setting hub name", e); });
                    }
                    return [
                        ...hubHolders.slice(0, i),
                        new HubHolder(hubHolders[i].hub, action.payload.name),
                        ...hubHolders.slice(i + 1),
                    ];
                }
                break;
        }

        return hubHolders;
    };

    const [collapsed, setCollapsed] = useState(false);
    const poweredUP = usePoweredup();
    const [hubs, dispatch] = useReducer(reducer, new Array<HubHolder>());
    const [motorControlProps, setMotorControlProps] = useState(new Array<IMotorControlDefinition>());
    const [trackControlProps, setTrackControlProps] = useState(new Array<ITrackControlDefinition>());
    const [tiltControlProps, setTiltControlProps] = useState(new Array<ITiltControlProps>());
    const [scanning, setScanning] = useState(false);

    // eslint-disable-next-line
    function debugEvents(hub: Hub) {
        hub.on("attach", (port, device) => {
            console.log(`Device attached to port ${port} (Device ID: ${device})`);
        });

        hub.on("tilt", (port, x, y) => {
            console.log(`Tilt detected on port ${port} (X: ${x}, Y: ${y})`);
        });

        hub.on("distance", (port, distance) => {
            console.log(`Motion detected on port ${port} (Distance: ${distance})`);
        });

        hub.on("accel", (port, x, y, z) => {
            console.log(`Acceleration detected on port ${port} (Acceleration: x=${x}, y=${y}, z=${z})`);
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
        poweredUP.on("discover", async (hub: Hub) => { // Wait to discover hubs
            console.log("Connecting to hub:", hub.uuid);
            await hub.connect(); // Connect to hub
            console.log("Connected ✔");

            dispatch({type: ActionType.CONNECT, payload: {hub}});

            // debugEvents(hub);

            setScanning(false);

            hub.on("disconnect", () => {
                dispatch({type: ActionType.DISCONNECT, payload: {hub}});
            });
        });
    }, [ActionType.CONNECT, ActionType.DISCONNECT, poweredUP]);

    useEffect(() => {
        // dispatch({type: ActionType.CONNECT, payload: {hub: undefined}});
        // dispatch({type: ActionType.CONNECT, payload: {hub: undefined}});
    }, [ActionType.CONNECT]);

    useEffect(() => {
        if (!("bluetooth" in navigator)) {
            Modal.error({
                content: "Bluetooth is not available in your browser. Use chrome or edge beta to load this page.",
                title: "Bluetooth not available",
            });
        }
    }, []);

    function scan() {
        setScanning(true);
        console.log("Scanning for hubs...");
        poweredUP.scan()
            .then((result: boolean) => {
                console.log("Scanning result:", result);
            })
            .catch((e: any) => console.log("Error scanning for hubs:", e))
            .finally(() => setScanning(false));
    }

    function addMotorControlProps(newMotorControlProps: IMotorControlDefinition): void {
        setMotorControlProps([...motorControlProps, newMotorControlProps]);
    }

    function addTrackControlProps(newTrackControlProps: ITrackControlDefinition): void {
        setTrackControlProps([...trackControlProps, newTrackControlProps]);
    }

    function removeMotorControlProps(remove: IMotorControlDefinition): void {
        setMotorControlProps(motorControlProps
            .filter((p) => p.hubUuid !== remove.hubUuid || p.motorPort !== remove.motorPort));
    }
    function removeTrackControlProps(remove: ITrackControlDefinition): void {
        setTrackControlProps(trackControlProps
            .filter((p) => p.hubUuid !== remove.hubUuid ||
                p.motorPortLeft !== remove.motorPortLeft ||
                p.motorPortRight !== remove.motorPortRight)
        );
    }

    function addTiltControlProps(newTiltCotrolProps: ITiltControlProps): void {
        setTiltControlProps([...tiltControlProps, newTiltCotrolProps]);
    }

    function setHubName(hubHolder: HubHolder, name: string): void {
        if (hubHolder.hub) {
            dispatch({type: ActionType.RENAME, payload : { hub: hubHolder.hub, name }});
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
                    <div style={{padding: "15px"}} className={display(!collapsed)}>
                        <Spin spinning={scanning}>
                            <Button type="primary" onClick={scan} icon="search" block={true}>
                                Scan for hubs
                            </Button>
                        </Spin>
                        <br/>
                            {
                                hubs.map((hub) => (
                                    <HubDetails
                                        key={hub.getUuid()}
                                        hubHolder={hub}
                                        addMotorControlProps={addMotorControlProps}
                                        addTrackControlProps={addTrackControlProps}
                                        addTiltControlProps={addTiltControlProps}
                                        renameHub={(name) => setHubName(hub, name)}
                                    />
                                ))
                            }
                         <br/>
                         {/*<Controls />*/}
                    </div>
                </Sider>
                <Layout>
                    <Header style={{ background: "#fff", padding: "0px 10px"}}><h1>Hub controls</h1></Header>
                    <Content style={{ margin: "10px" }}>
                        {
                            hubs.length > 0 ?
                                (
                                    <RemoteControl
                                        motorControlProps={motorControlProps}
                                        tiltControlProps={tiltControlProps}
                                        trackControlProps={trackControlProps}
                                        removeMotorControl={removeMotorControlProps}
                                        removeTrackControl={removeTrackControlProps}
                                    />
                                ) : (
                                    /* tslint:disable:max-line-length */
                                    <div>
                                        <h2 id="about">About</h2>
                                        <p>This is a prototype of a web application that allows controlling Lego ™ smarthubs via bluetooth.
                                            It&#39;s a <a href="https://reactjs.org/">react</a> app using the <a href="https://github.com/nathankellenicki/node-poweredup">node-poweredup</a>
                                            node library for communication.</p>
                                        <p>I only tested it with the Control+ hubs, but powered up and the boost move hubs should work as well.</p>
                                        <p>On Android you probably need to "scan for hubs" multiple times until a hub appears. I try to investigate why this happens on mobile phones.</p>
                                        <p>More information can be found on github: <a href="https://github.com/ractive/brick-remote">github.com/ractive/brick-remote</a></p>
                                        <p><img src="https://user-images.githubusercontent.com/783861/69193780-deee2300-0b27-11ea-9d40-cef99e0f73c4.png" alt="brick-remote-screenshot" width="90%" /></p>
                                        <h2 id="howto">Howto</h2>
                                        <p>Turn on the control+ hub by pressing its button, click on the blue &quot;Scan for hubs&quot; button in the
                                            webapp and pair the hub. You can pair multiple hubs by pressing the &quot;Scan for hubs&quot; button again.</p>
                                        <p>The hub will then appear on the left side listing the ports A to D and the two tilt indicators for the
                                            X any Y axis. </p>
                                        <p><img alt="brick-remote-pair" src="https://user-images.githubusercontent.com/783861/69191588-160e0580-0b23-11ea-993d-069fa5e7e45d.png" width="90%"/></p>
                                        <h3 id="tilt-indicator">Tilt indicator</h3>
                                        <p>Pressing the button for a tilt indicator in the hub details on the left, adds an indicator to the controls panel
                                            on the right. It shows the tilt in degrees for the corresponding axis. </p>
                                        <p>(I think the tilt indicators are only supported by the Control+ hubs)</p>
                                        <h3 id="motor-control">Motor Control</h3>
                                        <p>Pressing the &quot;motor control&quot; button in the hub details on the left for a specific port, adds an element
                                            to control the speed of a single motor. You can assign keyboard shortcuts to increase and decrease the speed
                                            of the motor and to stop the motor completely. Configre the keyboard shortcuts by pressing the &quot;cog&quot; symbol on
                                            the top of the control.</p>
                                        <h3 id="track-control">Track Control</h3>
                                        <p>Pressing the &quot;track control&quot; button in the hub details on the left for a specific port, lets you choose
                                            what other motor should be part of the track control being added. A track control lets you easily
                                            control vehicles with tracks that are driven by two motors. You can steer the vehicle by increasing and
                                            decreasing the speed and by turning lef and right (instead of controlling the two motors individually).
                                            You can set keyboard shortcuts by clicking on the &quot;cog&quot; symbol on the top of the track control.</p>
                                        <h3 id="keyboard-shortcuts">Keyboard shortcuts</h3>
                                        <p>This app uses the <a href="https://github.com/jaywcjlove/hotkeys">hotkeys</a> library to handle keyboard input so
                                            that you can use their supported keys <a href="https://github.com/jaywcjlove/hotkeys#supported-keys">in this way</a>.
                                            That means that you can set e.g. <code>up</code> or <code>ctrl+a</code> or <code>space</code> as keyboard shortcuts when configuring the controls by
                                            pressing the &quot;cog&quot; symbol.</p>
                                        <p><img alt="brick-remote-keyboard-shortcuts" src="https://user-images.githubusercontent.com/783861/69191586-15756f00-0b23-11ea-8a0f-3b0c28b4cc84.png" width="50%" height="50%" /></p>
                                    </div>
                                )
                        }
                    </Content>
                    <Footer style={{fontSize: "9pt"}}>
                        <a target="_blank" rel="noopener noreferrer" href="/icons/icons8-bulldozer-96.png">
                            Bulldozer
                        </a>, <a target="_blank" rel="noopener noreferrer" href="/icons/icons8-speedometer-100.png">
                           Speedometer
                        </a> and other icons by <a target="_blank" rel="noopener noreferrer" href="https://icons8.com">
                            Icons8
                        </a>
                    </Footer>
                </Layout>
            </Layout>
        </HubsContext.Provider>
  );
};

export default App;
