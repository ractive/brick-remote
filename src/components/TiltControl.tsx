import {Icon, Tooltip} from "antd";
import React from "react";
import useTiltEffect from "../hooks/useTiltEffect";

export enum Axis { X = "X", Y = "Y"}

export interface ITiltControlProps {
    hubUuid: string;
    axis: Axis;
}

const TiltControl = (props: ITiltControlProps) => {
    const [tiltX, tiltY] = useTiltEffect(props.hubUuid);

    const tilt = props.axis === Axis.X ? tiltX : tiltY;
    return (
        <div className="tilt-control">
            <div className="tilt-value">{props.axis === Axis.X ? tiltX : tiltY}&deg;</div>
            <Tooltip title={`${props.axis} axis`}>
                <Icon type="vertical-align-middle" rotate={tilt} className="tilt-icon" />
            </Tooltip>
        </div>
    );
};

export default TiltControl;
