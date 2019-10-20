import {Hub} from "node-poweredup";

export class HubHolder {
    public hub: Hub;
    public name: string;

    constructor(hub: Hub, name?: string) {
        this.hub = hub;
        if (name) {
            this.name = name;
        } else {
            this.name = hub.name;
        }
    }

    public uuid(): string {
        return this.hub!.uuid;
    }
}
