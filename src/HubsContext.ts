import {createContext} from "react";
import {HubHolder} from "./HubHolder";

export const HubsContext = createContext(new Array<HubHolder>());
export const hubByUuid = (hubs: HubHolder[], uuid: string) => {
    const hub = hubs.find((h) => h.getUuid() === uuid);
    if (!hub) {
        throw new Error("No hub found with uuid " + uuid);
    }

    return hub;
};
