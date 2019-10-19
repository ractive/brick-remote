import {Hub} from "node-poweredup";

export class HubHolder {
    hub: Hub;
    name: string;

    constructor(hub: Hub, name?: string) {
        this.hub = hub;
        if (name) {
            this.name = name;
        } else {
            this.name = hub.name;
        }
    }

    uuid() : string {
        return this.hub!.uuid;
    }
}