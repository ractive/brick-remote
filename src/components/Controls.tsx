import {Card, Col, Row, Tooltip} from "antd";
import React, {useContext} from "react";
import {HubsContext} from "../HubsContext";

const Control = ({imgSrc, alt}: {imgSrc: string, alt: string}) => {

    return (
        <div
            style={{
                marginBottom: "20px",
                textAlign: "center",
                width: "140px" /* two per row */
            }}
        >
            <img src={imgSrc} alt={alt} />
            <div>{alt}</div>
        </div>
    );
}

const Controls = () => {
    const hubs = useContext(HubsContext);

    if (hubs.length === 0) {
        return null;
    }
    return (
        <Card title="Controls">
            <div style={{display: "flex", flexWrap: "wrap", justifyContent: "left"}}>
                <Tooltip title="Motor control">
                    <Control
                        imgSrc="/icons/icons8-speedometer-100.png"
                        alt="Motor control"
                    />
                </Tooltip>
                <Tooltip title="Track control">
                    <Control
                        imgSrc="/icons/icons8-bulldozer-96.png"
                        alt="Track control"
                    />
                </Tooltip>
                <Tooltip title="Tilt indicator">
                    <Control
                        imgSrc="/icons/icons8-hill-descent-control-96.png"
                        alt="Tilt indicator"
                    />
                </Tooltip>
            </div>
        </Card>
    );
};

export default Controls;
