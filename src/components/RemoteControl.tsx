import { Card } from "antd";
import { useContext } from "react";
import { HubsContext } from "../HubsContext";
import MotorControl, { type IMotorControlDefinition } from "./MotorControl";
import TiltControl, { type ITiltControlProps } from "./TiltControl";
import TrackControl, { type ITrackControlDefinition } from "./TrackControl";

export interface IRemoteControlProps {
  motorControlProps: IMotorControlDefinition[];
  trackControlProps: ITrackControlDefinition[];
  tiltControlProps: ITiltControlProps[];
  removeMotorControl(motorControlProps: IMotorControlDefinition): void;
  removeTrackControl(trackControlProps: ITrackControlDefinition): void;
}

const RemoteControl = (props: IRemoteControlProps) => {
  const hubs = useContext(HubsContext);

  function key(trackControl: ITrackControlDefinition): string {
    return (
      trackControl.hubUuid +
      "_" +
      trackControl.motorPortLeft +
      "_" +
      trackControl.motorPortRight
    );
  }

  // Controls of a disconnected hub are hidden and come back when it reconnects
  return (
    <div className="remote-control">
      {hubs
        .filter((hub) => hub.connected)
        .map((hub) => {
          const hubUuid = hub.getUuid();
          const motorControls = props.motorControlProps.filter(
            (p) => p.hubUuid === hubUuid,
          );
          const trackControls = props.trackControlProps.filter(
            (p) => p.hubUuid === hubUuid,
          );
          const tiltControls = props.tiltControlProps.filter(
            (p) => p.hubUuid === hubUuid,
          );
          if (
            motorControls.length +
              trackControls.length +
              tiltControls.length ===
            0
          ) {
            return null;
          }
          return (
            <Card title={hub.name} key={hubUuid} className="remote-control-hub">
              <div className="hub-controls">
                {motorControls
                  .sort((a, b) => a.motorPort.localeCompare(b.motorPort))
                  .map((motorControl) => (
                    <MotorControl
                      {...motorControl}
                      key={motorControl.hubUuid + "_" + motorControl.motorPort}
                      remove={() => props.removeMotorControl(motorControl)}
                    />
                  ))}
                {trackControls
                  .sort((a, b) =>
                    a.motorPortLeft.localeCompare(b.motorPortLeft),
                  )
                  .map((trackControl) => (
                    <TrackControl
                      {...trackControl}
                      key={key(trackControl)}
                      remove={() => props.removeTrackControl(trackControl)}
                    />
                  ))}
                <div>
                  {tiltControls.map((p) => (
                    <TiltControl
                      key={p.axis}
                      axis={p.axis}
                      hubUuid={p.hubUuid}
                    />
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
    </div>
  );
};

export default RemoteControl;
