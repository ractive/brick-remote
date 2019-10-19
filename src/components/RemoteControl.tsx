import React, {useContext} from "react";
import MotorControl, {MotorControlProps} from "./MotorControl";
import {Collapse} from "antd";
import {HubsContext, hubByUuid} from "../HubsContext";

export interface RemoteControlProps {
   motorControlProps: MotorControlProps[];
}

const RemoteControl = (props : RemoteControlProps) => {
    const hubs = useContext(HubsContext);
    function groupBy<K, V>(result: Map<K, V[]>, element: V, keyExtractor : (v: V) => K) : Map<K, V[]> {
        if (!result.get(keyExtractor(element))) {
            result.set(keyExtractor(element), []);
        }
        // @ts-ignore
        result.get(keyExtractor(element)).push(element);
        return result;
    }

    return <Collapse defaultActiveKey={props.motorControlProps.map(m => m.hubUuid)}>
        {
            Array.from(props.motorControlProps
                .reduce(
                    (result, element) => groupBy(result, element, element => element.hubUuid),
                    new Map<string, MotorControlProps[]>()
                )
                .entries()).map(([hubUuid, motorControlProps]) =>
                    <Collapse.Panel header={hubByUuid(hubs, hubUuid).name} key={hubUuid}>
                        {
                            motorControlProps
                                .sort((a, b) => a.motorPort.localeCompare(b.motorPort))
                                .map(motorControlProps =>
                                    <div key={motorControlProps.hubUuid + "_" + motorControlProps.motorPort}
                                         style={{display: "inline-block", padding: "5px"}}>
                                        <MotorControl hubUuid={motorControlProps.hubUuid}
                                                      motorPort={motorControlProps.motorPort}/>
                                    </div>
                            )
                        }
                    </Collapse.Panel>
            )
        }
    </Collapse>
};

export default RemoteControl;