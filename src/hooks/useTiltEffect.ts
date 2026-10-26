import { useContext, useEffect, useState } from "react";
import { findHub, HubsContext } from "../HubsContext";

const useTiltEffect = (hubUuid: string): [number, number] => {
  const [tilt, setTilt] = useState<[number, number]>([0, 0]);

  const hubHolder = findHub(useContext(HubsContext), hubUuid);
  const hub = hubHolder?.connected ? hubHolder.hub : undefined;
  const tiltPort = hubHolder?.tiltPort;

  useEffect(() => {
    const device = hub && tiltPort ? hub.getDeviceAtPort(tiltPort) : undefined;
    if (!device) {
      return;
    }
    const listener = ({ x, y }: { x: number; y: number }) => setTilt([x, y]);
    // Adding the listener subscribes the sensor to tilt updates
    device.on("tilt", listener);
    return () => {
      device.removeListener("tilt", listener);
    };
  }, [hub, tiltPort]);

  return tilt;
};

export default useTiltEffect;
