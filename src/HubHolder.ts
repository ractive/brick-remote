import {Hub} from "node-poweredup";
import {HubType} from "node-poweredup/dist/node/consts";
import * as Consts from "node-poweredup/dist/node/consts";

export class HubHolder {
    private static hubType(type: Consts.HubType): string {
        switch (type) {
            case HubType.UNKNOWN:
                return "UNKNOWN";
            case HubType.WEDO2_SMART_HUB:
                return "WEDO2_SMART_HUB";
            case HubType.BOOST_MOVE_HUB:
                return "BOOST_MOVE_HUB";
            case HubType.POWERED_UP_HUB:
                return "POWERED_UP_HUB";
            case HubType.POWERED_UP_REMOTE:
                return "POWERED_UP_REMOTE";
            case HubType.DUPLO_TRAIN_HUB:
                return "DUPLO_TRAIN_HUB";
            case HubType.CONTROL_PLUS_HUB:
                return "CONTROL_PLUS_HUB";
        }
    }
    public hub?: Hub;
    public name: string;
    private readonly _ports: Set<string> = new Set<string>();
    private _connected: boolean = false;

    constructor(hub?: Hub, name?: string) {
        this.hub = hub;
        if (name) {
            this.name = name;
        } else if (hub) {
            this.name = hub.name;
        } else {
            this.name = "undefined";
        }
    }

    public addPort(port: string) {
        this._ports.add(port);
    }

    public removePort(port: string) {
        this._ports.delete(port);
    }

    public get ports(): Set<string> {
        return this._ports;
    }

    public get connected(): boolean {
        return this._connected;
    }

    public set connected(connected) {
        this._connected = connected;
    }

    public getUuid(): string {
        return this.hub ? this.hub.uuid : this.name;
    }

    public getPrimaryMACAddress(): string {
        return this.hub ? this.hub.primaryMACAddress : "unknown";
    }

    public getHubType(): string {
        return this.hub ? HubHolder.hubType(this.hub.getHubType()) : "undefined";
    }
}
