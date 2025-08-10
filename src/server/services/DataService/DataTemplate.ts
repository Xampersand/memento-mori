import { PlayerData } from "shared/types";

const DATA_TEMPLATE: PlayerData = {
    level: 1,
    xp: 0,
    xpMax: 2,
    stats: {
        str: 0,
        agi: 0,
        int: 0,
        con: 0
    },
    cards: [],
    skills: [],
    inventory: [],
    equipped: {
        attack: [],
        weapon: [],
        armor: [],
        spell: []
    }
}

export default DATA_TEMPLATE;