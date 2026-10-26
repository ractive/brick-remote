import { createContext } from "react";
import type { HubHolder } from "./HubHolder";

export const HubsContext = createContext<HubHolder[]>([]);

export const findHub = (
  hubs: HubHolder[],
  uuid: string,
): HubHolder | undefined => hubs.find((h) => h.getUuid() === uuid);
