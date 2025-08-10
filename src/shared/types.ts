export type PlayerData = {
	level: number;
	xp: number;
	xpMax: number;
	stats: {
		str: number;
		agi: number;
		int: number;
		con: number;
	};
	cards: Array<string>;
	skills: Array<string>;
	inventory: Array<Item.Data>;
	equipped: {
		attack: Array<Item.Data>;
		weapon: Array<Item.Data>;
		armor: Array<Item.Data>;
		spell: Array<Item.Data>;
	}
}

export namespace Attack {
	export enum Direction {
		Left,
		Right,
		Up,
		Down,
		Forward,
		Backward,
		DownLeft,
		DownRight,
		UpLeft,
		UpRight,
	}
}

export namespace Item {
    export enum Type {
        Weapon,
        Armor,
        Attack,
        Spell,
        Consumable
    }

    export type AttackData = {
        type: Type.Attack;
        id: string;
        animationId: string;
        name: string;
        direction: Attack.Direction;
        description: string;
    };

    export type WeaponData = {
        type: Type.Weapon;
        id: string;
        assetName: string;
        name: string;
        description: string;
    };

    // Add other item types as needed...
    export type ArmorData = {
        type: Type.Armor;
        id: string;
        assetName: string;
        name: string;
        description: string;
    };

    export type SpellData = {
        type: Type.Spell;
        id: string;
        spellPower: number;
        name: string;
        description: string;
    };

    export type ConsumableData = {
        type: Type.Consumable;
        id: string;
        effect: string;
        name: string;
        description: string;
    };

    // The union type for all item data
    export type Data = AttackData | WeaponData | ArmorData | SpellData | ConsumableData;
}
