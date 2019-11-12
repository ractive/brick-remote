import {Icon} from "antd";
import React from "react";
import useTiltEffect from "../hooks/useTiltEffect";

export enum Axis { X, Y}

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
            <Icon type="vertical-align-middle" rotate={tilt} className="tilt-icon" />
        </div>
    );
};

export default TiltControl;
