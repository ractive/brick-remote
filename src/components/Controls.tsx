import {Card, Col, Row, Tooltip} from "antd";
import React, {useContext} from "react";
import {HubsContext} from "../HubsContext";

const Controls = () => {
    const hubs = useContext(HubsContext);
    if (hubs.length === 0) {
        return null;
    }
    return (
        <Card title="Controls">
            <Row>
                <Col span={12}>
                    <Tooltip title="Motor control">
                        <img src="/icons/icons8-speedometer-100.png" alt="Motor control" />
                    </Tooltip>
                </Col>
                <Col span={12}>
                    <Tooltip title="Track control">
                        <img src="/icons/icons8-bulldozer-96.png" alt="Track control" />
                    </Tooltip>
                </Col>
            </Row>
            <Row>
                <Col span={12}>
                    <Tooltip title="Motor control">
                        <img src="/icons/icons8-hill-descent-control-96.png" alt="Tilt indicator" />
                    </Tooltip>
                </Col>
            </Row>
        </Card>
    );
};

export default Controls;
