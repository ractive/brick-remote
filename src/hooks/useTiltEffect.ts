import {useEffect, useState} from "react";
import usePoweredup from "../poweredup";

const useTiltEffect = (hubUuid: string) => {
    const [tiltX, setTiltX] = useState(0);
    const [tiltY, setTiltY] = useState(0);

    const poweredUP = usePoweredup();
    const hub = poweredUP.getConnectedHubByUUID(decodeURIComponent(hubUuid));

    useEffect(() => {
        function tiltListener(port: string, x: number, y: number) {
            setTiltX(x);
            setTiltY(y);
        }

        if (hub) {
            hub.on("tilt", tiltListener);
            return () => {
                hub.removeListener("tilt", tiltListener);
            };
        }
    }, [hub]);

    return [tiltX, tiltY];
};

export default useTiltEffect;
