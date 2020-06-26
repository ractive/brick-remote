import { Card } from "antd";
import React, { useContext } from "react";
import { hubByUuid, HubsContext } from "../HubsContext";
import MotorControl, { IMotorControlDefinition } from "./MotorControl";
import TiltControl, { ITiltControlProps } from "./TiltControl";
import TrackControl, { ITrackControlDefinition } from "./TrackControl";

export interface IRemoteControlProps {
  motorControlProps: IMotorControlDefinition[];
  trackControlProps: ITrackControlDefinition[];
  tiltControlProps: ITiltControlProps[];
  removeMotorControl(motorControlProps: IMotorControlDefinition): void;
  removeTrackControl(trackControlProps: ITrackControlDefinition): void;
}

const RemoteControl: React.FC<IRemoteControlProps> = (
  props: IRemoteControlProps
) => {
  const hubs = useContext(HubsContext);

  const hubUuids = new Set<string>([
    ...props.motorControlProps.map((p) => p.hubUuid),
    ...props.trackControlProps.map((p) => p.hubUuid),
    ...props.tiltControlProps.map((p) => p.hubUuid),
  ]);

  function key(trackControl: ITrackControlDefinition): string {
    return (
      trackControl.hubUuid +
      "_" +
      trackControl.motorPortLeft +
      "_" +
      trackControl.motorPortRight
    );
  }

  return (
    <div className="remote-control">
      {Array.from(hubUuids).map((hubUuid) => (
        <Card
          title={hubByUuid(hubs, hubUuid).name}
          key={hubUuid}
          className="remote-control-hub"
        >
          <div className="hub-controls">
            {props.motorControlProps
              .filter((p) => p.hubUuid === hubUuid)
              .sort((a, b) => a.motorPort.localeCompare(b.motorPort))
              .map((motorControl) => (
                <MotorControl
                  {...motorControl}
                  key={motorControl.hubUuid + "_" + motorControl.motorPort}
                  remove={() => props.removeMotorControl(motorControl)}
                />
              ))}
            {props.trackControlProps
              .filter((p) => p.hubUuid === hubUuid)
              .sort((a, b) => a.motorPortLeft.localeCompare(b.motorPortLeft))
              .map((trackControl) => (
                <TrackControl
                  {...trackControl}
                  key={key(trackControl)}
                  remove={() => props.removeTrackControl(trackControl)}
                />
              ))}
            <div>
              {props.tiltControlProps
                .filter((p) => p.hubUuid === hubUuid)
                .map((p) => (
                  <TiltControl key={p.axis} axis={p.axis} hubUuid={p.hubUuid} />
                ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default RemoteControl;
