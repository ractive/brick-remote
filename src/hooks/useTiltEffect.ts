import { useContext, useEffect, useState } from "react";
import { hubByUuid, HubsContext } from "../HubsContext";

const useTiltEffect = (hubUuid: string): number[] => {
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);

  const hubs = useContext(HubsContext);
  const hubHolder = hubByUuid(hubs, hubUuid);

  useEffect(() => {
    function tiltListener(port: string, x: number, y: number) {
      setTiltX(x);
      setTiltY(y);
    }

    if (hubHolder.hub && hubHolder.connected) {
      hubHolder.hub.on("tilt", tiltListener);
      return () => {
        hubHolder.hub?.removeListener("tilt", tiltListener);
      };
    }
  }, [hubHolder]);

  return [tiltX, tiltY];
};

export default useTiltEffect;
