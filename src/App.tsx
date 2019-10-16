import React, { useEffect, useReducer } from 'react';
import './App.css';
import {Layout, Menu, Breadcrumb, Button} from 'antd';
import usePoweredup from "./poweredup";
//import {Hub} from "node-poweredup";

type Hub = any;

const { Header, Footer, Content } = Layout;

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

    interface State {
        hubs: Map<string, Hub>;
        counter: number
    }

    const initialState: State = { hubs: new Map<string, Hub>(), counter: 0 };

    const reducer = (state: State, action: Action) : State => {
        const hub = action.payload.hub;
        switch (action.type) {
            case ActionType.CONNECT:
                state.hubs = new Map(state.hubs).set(hub.uuid, hub);
                state.counter = state.counter + 1;
                break;
            case ActionType.DISCONNECT:
                state.hubs.delete(hub.uuid);
                state.counter = state.counter - 1;
                break;
            default:
                throw new Error();
        }
        return state;
    };


    const poweredUP = usePoweredup();
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        console.log("useEffect...");
        poweredUP.on("discover", async (hub: any) => { // Wait to discover hubs
            console.log("connect...");
            await hub.connect(); // Connect to hub
            dispatch({type: ActionType.CONNECT, payload: {hub: hub}});

            return () => hub.on("disconnect", () => {
                dispatch({type: ActionType.DISCONNECT, payload: {hub: hub}});
            })
        });
        document.title = "Hello useEffect";
    }, [state, ActionType.CONNECT, ActionType.DISCONNECT, poweredUP]);

    const hubsList = Array.from(state.hubs.values())
        .map(hub => <li>{hub.uuid}</li>);

    function scan() {
        console.log("Scan...");
        return poweredUP.scan();
    }

    return (
      <Layout className="layout">
          <Header>
              <div className="logo" />
              <Menu
                  theme="dark"
                  mode="horizontal"
                  defaultSelectedKeys={['2']}
                  style={{ lineHeight: '64px' }}
              >
                  <Menu.Item key="1">nav 1</Menu.Item>
                  <Menu.Item key="2">nav 2</Menu.Item>
                  <Menu.Item key="3">nav 3</Menu.Item>
              </Menu>
          </Header>
          <Content style={{ padding: '0 50px' }}>
              <Breadcrumb style={{ margin: '16px 0' }}>
                  <Breadcrumb.Item>Home</Breadcrumb.Item>
                  <Breadcrumb.Item>List</Breadcrumb.Item>
                  <Breadcrumb.Item>App</Breadcrumb.Item>
              </Breadcrumb>
              <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
                  <Button onClick={scan}>Scan...</Button>
                  State: {state.hubs.size}
                  <ul>
                      {hubsList}
                  </ul>

              </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
      </Layout>
  );
};

export default App;
