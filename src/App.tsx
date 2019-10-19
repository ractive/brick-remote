import React, {useEffect, useReducer, useState, MouseEvent, KeyboardEvent} from 'react';
import './App.css';
import {Button, Layout, Spin, Card, Tooltip, Popover, Input} from 'antd';
import usePoweredup from "./poweredup";
import {Hub} from "node-poweredup";
import HubDetails from "./components/HubDetails";
import {MotorControlProps} from "./components/MotorControl";
import {HubHolder} from "./HubHolder";
import RemoteControl from "./components/RemoteControl";
import {display} from "./Utils";
import { HubsContext } from './HubsContext';

const { Header, Footer, Content, Sider } = Layout;

const App: React.FC = () => {
    interface HubRenameForm {
        hubName: string
        handleNameChange(newName: string) : void;
    }
    const HubRenamePopover = ({hubName, handleNameChange} : HubRenameForm) => {
        const [name, setName] = useState(hubName);
        const [visible, setVisible] = useState(false);

        function handlePressEnter(event: KeyboardEvent<HTMLInputElement>) {
            handleNameChange(name);
            setVisible(false);
            event.preventDefault();
        }

        function handleSubmit(event: MouseEvent<HTMLElement>) {
            handleNameChange(name);
            setVisible(false);
            event.preventDefault();
        }

        function handleCancel(event: MouseEvent<HTMLElement>) {
            setVisible(false);
            event.preventDefault();
        }

        return <Tooltip title="Rename hub">
            <Popover placement="bottomRight" title="Rename hub"  trigger="click" visible={visible} content={
                <div>
                    <Input type="text" value={name} onChange={e => setName(e.target.value)} autoFocus={true} onPressEnter={handlePressEnter}/>
                    <Button icon="check" onClick={handleSubmit} />
                    <Button icon="close" />
                </div>
            }>
                <Button icon="edit" onClick={() => setVisible(!visible)} />
            </Popover>
        </Tooltip>
    };

    enum ActionType {
        CONNECT,
        DISCONNECT,
        RENAME
    }

    interface Action {
        type: ActionType
        payload: {
            hub: Hub,
            name?: string
        }
    }

    const reducer = (hubHolders: HubHolder[], action: Action) : HubHolder[] => {
        const hub = action.payload.hub;
        switch (action.type) {
            case ActionType.CONNECT:
                if (!hubHolders.find(hubHolder => hubHolder.uuid() === hub.uuid)) {
                    return [...hubHolders, new HubHolder(hub)];
                }
                break;
            case ActionType.DISCONNECT:
                return hubHolders.filter(hubHolder => hubHolder.uuid() !== hub.uuid);
            case ActionType.RENAME:
                const i = hubHolders.findIndex(hubHolder => hubHolder.uuid() === hub.uuid);
                if (i >= 0 && action.payload.name) {
                    return [
                        ...hubHolders.slice(0, i),
                        new HubHolder(hubHolders[i].hub, action.payload.name),
                        ...hubHolders.slice(i + 1)
                    ]
                }
                break;
        }

        return hubHolders;
    };

    const [collapsed, setCollapsed] = useState(false);
    const poweredUP = usePoweredup();
    const [hubs, dispatch] = useReducer(reducer, new Array<HubHolder>());
    const [motorControlProps, setMotorControlProps] = useState(new Array<MotorControlProps>());
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        console.log("useEffect...");
        poweredUP.on("discover", async (hub: Hub) => { // Wait to discover hubs
            console.log("Connect...");
            await hub.connect(); // Connect to hub
            console.log("Connected");
            dispatch({type: ActionType.CONNECT, payload: {hub: hub}});

            hub.on("attach", (port, device) => {
                console.log(`Device attached to port ${port} (Device ID: ${device})`) ;
            });

            // hub.on("tilt", (port, x, y) => {
            //     console.log(`Tilt detected on port ${port} (X: ${x}, Y: ${y})`);
            // });

            hub.on("distance", (port, distance) => {
                console.log(`Motion detected on port ${port} (Distance: ${distance})`);
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
                console.log(`Device attached to port ${port} (Device ID: ${device})`) ;
            });

            hub.on("detach", (port) => {
                console.log(`Device detached from port ${port}`) ;
            });

            setScanning(false);

            hub.on("disconnect", () => {
                console.log("disconnect event received...");
                dispatch({type: ActionType.DISCONNECT, payload: {hub: hub}});
                console.log("disconnect action dispatched!");
            });
        });
    }, [ActionType.CONNECT, ActionType.DISCONNECT, poweredUP]);

    function scan() {
        console.log("Scan...");
        setScanning(true);
        return poweredUP.scan();
        // dispatch({type: ActionType.CONNECT, payload: {hub: new Hub(new WebBLEDevice({}))}});
    }

    function addMotorControlProps(newMotorCotrolProps: MotorControlProps) : void {
        setMotorControlProps([...motorControlProps, newMotorCotrolProps])
    }

    function setHubName(hubHolder: HubHolder, name: string) : void {
        dispatch({type: ActionType.RENAME, payload : { hub: hubHolder.hub, name: name }})
    }

    return (
        <HubsContext.Provider value={hubs}>
            <Layout style={{ minHeight: '100vh' }}>
                <Sider width={"25%"} collapsible collapsed={collapsed} onCollapse={() =>setCollapsed(!collapsed)}  >
                    <div style={{"padding": "15px"}} className={display(!collapsed)}>
                        <Spin spinning={scanning}>
                            <Button type="primary" onClick={scan} icon="search" block>
                                Scan for hubs
                            </Button>
                        </Spin>
                        <br/>
                        <br/>
                            {
                                hubs.map(hub =>
                                    <Card title={hub.name} key={hub.uuid()} extra={
                                            <HubRenamePopover hubName={hub.name} handleNameChange={(name) => setHubName(hub, name)} />
                                        }>
                                        <HubDetails hubHolder={hub} addMotorControlProps={addMotorControlProps} />
                                    </Card>)
                            }
                    </div>
                </Sider>
                <Layout>
                    <Header style={{ background: '#fff', padding: "0px 10px"}}><h1>Hub controls</h1></Header>
                    <Content style={{ margin: '10px' }}>
                        <RemoteControl motorControlProps={motorControlProps}/>
                    </Content>
                    <Footer style={{ textAlign: 'center' }}></Footer>
                </Layout>
            </Layout>
        </HubsContext.Provider>
  );
};

export default App;
