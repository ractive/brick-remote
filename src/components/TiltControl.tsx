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
        <div className="tiltControl">
            <div className="tiltValue">{props.axis === Axis.X ? tiltX : tiltY}&deg;</div>
            <Icon type="vertical-align-middle" rotate={tilt} className="tiltIcon" />
        </div>
    );
};

export default TiltControl;
