import {Card} from "antd";
import React, {useContext} from "react";
import {hubByUuid, HubsContext} from "../HubsContext";
import MotorControl, {IMotorControlProps} from "./MotorControl";

export interface IRemoteControlProps {
   motorControlProps: IMotorControlProps[];
}

const RemoteControl = (props: IRemoteControlProps) => {
    const hubs = useContext(HubsContext);
    function groupBy<K, V>(result: Map<K, V[]>, element: V, keyExtractor: (v: V) => K): Map<K, V[]> {
        if (!result.get(keyExtractor(element))) {
            result.set(keyExtractor(element), []);
        }
        // @ts-ignore
        result.get(keyExtractor(element)).push(element);
        return result;
    }

    return <div>
        {
            Array.from(props.motorControlProps
                .reduce(
                    (result, element) => groupBy(result, element, (e) => e.hubUuid),
                    new Map<string, IMotorControlProps[]>(),
                )
                .entries()).map(([hubUuid, motorControlProps]) =>
                    <Card title={hubByUuid(hubs, hubUuid).name} key={hubUuid}>
                        {
                            motorControlProps
                                .sort((a, b) => a.motorPort.localeCompare(b.motorPort))
                                .map((motorControl) =>
                                    <div key={motorControl.hubUuid + "_" + motorControl.motorPort}
                                         style={{display: "inline-block", padding: "5px"}}>
                                        <MotorControl hubUuid={motorControl.hubUuid}
                                                      motorPort={motorControl.motorPort}/>
                                    </div>,
                            )
                        }
                    </Card>,
            )
        }
    </div>;
};

export default RemoteControl;
