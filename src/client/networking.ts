// Assumes your GlobalEvents/GlobalFunctions object is in shared/networking.ts
import { GlobalEvents } from "shared/networking";

// client/networking.ts
export const Events = GlobalEvents.createClient({});