import { Networking } from "@flamework/networking";
import { PlayerData } from "./types";

interface ClientToServerEvents {
	hit(target: Model): void;
}

interface ServerToClientEvents {
	dataUpdate(data: PlayerData): void;
}

// Returns an object containing a `server` and `client` field.
export const GlobalEvents = Networking.createEvent<ClientToServerEvents, ServerToClientEvents>();