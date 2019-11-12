import {Card} from "antd";
import React, {useContext} from "react";
import {hubByUuid, HubsContext} from "../HubsContext";
import MotorControl, {IMotorControlDefinition} from "./MotorControl";
import TiltControl, {ITiltControlProps} from "./TiltControl";
import TrackControl from "./TrackControl";

export interface IRemoteControlProps {
   motorControlProps: IMotorControlDefinition[];
   tiltControlProps: ITiltControlProps[];
   removeMotorControl(motorControlProps: IMotorControlDefinition): void;
}

const RemoteControl = (props: IRemoteControlProps) => {
    const hubs = useContext(HubsContext);

    const hubUuids = new Set<string>([
        ...props.motorControlProps
            .map((p) => p.hubUuid),
        ...props.tiltControlProps
            .map((p) => p.hubUuid),
    ]);

    return (
        <div
            style={{height: "100%"}}
        >
            {
                Array.from(hubUuids).map((hubUuid) =>
                    (
                        <Card title={hubByUuid(hubs, hubUuid).name} key={hubUuid}>
                            <div className="hub-controls">
                            {
                                props.motorControlProps
                                    .filter((p) => p.hubUuid === hubUuid)
                                    .sort((a, b) => a.motorPort.localeCompare(b.motorPort))
                                    .map((motorControl) => (
                                        <MotorControl
                                            key={motorControl.hubUuid + "_" + motorControl.motorPort}
                                            hubUuid={motorControl.hubUuid}
                                            motorPort={motorControl.motorPort}
                                            remove={() => props.removeMotorControl(motorControl)}
                                        />
                                        )
                                    )
                            }
                                <TrackControl
                                    remove={() => { console.log("remove"); }}
                                    hubUuid={hubUuid}
                                    motorPortLeft={"A"}
                                    motorPortRight={"B"}
                                />
                            </div>
                            <div>
                                {
                                    props.tiltControlProps
                                        .filter((p) => p.hubUuid === hubUuid)
                                        .map((p) => <TiltControl key={p.axis} axis={p.axis}  hubUuid={p.hubUuid}/>)
                                }
                            </div>
                        </Card>
                    )
                )
            }
        </div>
    );
};

export default RemoteControl;
