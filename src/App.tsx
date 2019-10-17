import React, {useEffect, useReducer, useState} from 'react';
import './App.css';
import {Button, Col, Icon, Layout, Menu, Row} from 'antd';
import usePoweredup from "./poweredup";
import {SelectParam} from "antd/es/menu";
import {Hub} from "node-poweredup";
import HubDetails from "./components/HubDetails";
import MotorSlider from "./components/MotorSlider";

//type Hub = any;

const { Header, Footer, Content, Sider } = Layout;
const { SubMenu } = Menu;

const App: React.FC = () => {
    enum ActionType {
        CONNECT, DISCONNECT
    }

    interface Action {
        type: ActionType
        payload: {
            hub: Hub
        }
    }

    const reducer = (state: Hub[], action: Action) : Hub[] => {
        const hub = action.payload.hub;
        switch (action.type) {
            case ActionType.CONNECT:
                return [...state, hub];
            case ActionType.DISCONNECT:
                return state.filter(h => h.uuid !== hub.uuid);
            default:
                return state;
        }
    };

    const [collapsed, setCollapsed] = useState(false);
    const poweredUP = usePoweredup();
    const [hubs, dispatch] = useReducer(reducer, new Array<Hub>());
    const [selectedHub, setSelectedHub] = useState<Hub | undefined>(undefined);

    useEffect(() => {
        console.log("useEffect...");
        poweredUP.on("discover", async (hub: any) => { // Wait to discover hubs
            console.log("Connect...");
            await hub.connect(); // Connect to hub
            console.log("Connected");
            console.log(hub);
            dispatch({type: ActionType.CONNECT, payload: {hub: hub}});

            return () => hub.on("disconnect", () => {
                console.log("Disconnect...");
                dispatch({type: ActionType.DISCONNECT, payload: {hub: hub}});
                console.log("Disconnect!");
            })
        });
    }, [hubs, ActionType.CONNECT, ActionType.DISCONNECT, poweredUP]);

    function scan() {
        console.log("Scan...");
        return poweredUP.scan();
    }

    function onSelect(uuid: SelectParam) {
        setSelectedHub(hubs.find(h => h.uuid === uuid.key))
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider width={"25%"} collapsible collapsed={collapsed} onCollapse={() =>setCollapsed(!collapsed)}>
                <br/>
                <Button style={{"margin": "15px"}} type="primary" onClick={scan} icon="search">Scan for hubs</Button>
                <Menu theme="dark" defaultSelectedKeys={[]} defaultOpenKeys={['hubs']} mode="inline" onSelect={onSelect}>
                    { hubs.length > 0 &&
                        <SubMenu
                            key="hubs"
                            title={
                                <span>
                              <Icon type="wifi" />
                              <span>Hubs</span>
                            </span>
                            }
                        >
                            {
                                hubs.map(hub =>
                                    <Menu.Item key={hub.uuid}>{hub.name}</Menu.Item>)
                            }
                        </SubMenu>
                    }
                </Menu>
            </Sider>
            <Layout>
                <Header style={{ background: '#fff', padding: "0px 10px"}}><h1>Hub controls</h1></Header>
                <Content style={{ margin: '10px' }}>
                    <Row type="flex" justify="start">
                        <Col span={8}>
                            <HubDetails hub={selectedHub}/>
                        </Col>
                        <Col span={2}>
                            <MotorSlider defaultMotorPort="A" hub={selectedHub}/>
                        </Col>
                        <Col span={2}>
                            <MotorSlider defaultMotorPort="B" hub={selectedHub}/>
                        </Col>
                    </Row>
                </Content>
                <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
            </Layout>
    </Layout>
  );
};

export default App;
