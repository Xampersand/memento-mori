import { Item, Attack, PlayerData } from "shared/types"

type ItemMap = Map<Item.Type, Array<Item.Data>>;

const Items: ItemMap = new Map<Item.Type, Array<Item.Data>>();

Items.set(Item.Type.Attack, [
    {
        id: "rightSlash",
        animationId: "rightSlash",
        name: "Slash (Right)",
        type: Item.Type.Attack,
        direction: Attack.Direction.Right,
        description: "A simple horizontal slash, from left to right.",
    },
    {
        id: "leftSlash",
        animationId: "leftSlash",
        name: "Slash (Left)",
        type: Item.Type.Attack,
        direction: Attack.Direction.Left,
        description: "A simple horizontal slash, from right to left.",
    },
    {
        id: "upSlash",
        animationId: "upSlash",
        name: "Slash (Up)",
        type: Item.Type.Attack,
        direction: Attack.Direction.Up,
        description: "A simple vertical slash, from down to up.",
    },
    {
        id: "downSlash",
        animationId: "downSlash",
        name: "Slash (Down)",
        type: Item.Type.Attack,
        direction: Attack.Direction.Down,
        description: "A simple vertical slash, from up to down.",
    },
    {
        id: "upRightSlash",
        animationId: "upRightSlash",
        name: "Slash (Up Right)",
        type: Item.Type.Attack,
        direction: Attack.Direction.UpRight,
        description: "A simple diagonal slash, from down left to up right.",
    },
    {
        id: "upLeftSlash",
        animationId: "upLeftSlash",
        name: "Slash (Up Left)",
        type: Item.Type.Attack,
        direction: Attack.Direction.UpLeft,
        description: "A simple diagonal slash, from down right to up left.",
    },
    {
        id: "downLeftSlash",
        animationId: "downLeftSlash",
        name: "Slash (Down Left)",
        type: Item.Type.Attack,
        direction: Attack.Direction.DownLeft,
        description: "A simple diagonal slash, from up right to down left.",
    },
    {
        id: "downRightSlash",
        animationId: "downRightSlash",
        name: "Slash (Down Right)",
        type: Item.Type.Attack,
        direction: Attack.Direction.DownRight,
        description: "A simple diagonal slash, from up left to down right.",
    },
    // Tarnished
    {
        id: "tarnishedRight",
        animationId: "tarnishedRight",
        name: "Tarnished's Slash (Right)",
        type: Item.Type.Attack,
        direction: Attack.Direction.Right,
        description: "A simple horizontal slash, from left to right.",
    },
    {
        id: "tarnishedLeft",
        animationId: "tarnishedLeft",
        name: "Tarnished's Slash (Left)",
        type: Item.Type.Attack,
        direction: Attack.Direction.Left,
        description: "A simple horizontal slash, from right to left.",
    },
    {
        id: "tarnishedUp",
        animationId: "tarnishedUp",
        name: "Tarnished's Slash (Up)",
        type: Item.Type.Attack,
        direction: Attack.Direction.Up,
        description: "A simple vertical slash, from down to up.",
    },
    {
        id: "tarnishedDown",
        animationId: "tarnishedDown",
        name: "Tarnished's Slash (Down)",
        type: Item.Type.Attack,
        direction: Attack.Direction.Down,
        description: "A simple vertical slash, from up to down.",
    },
]);

Items.set(Item.Type.Weapon, [
	{
		id: "ironSword",
		assetName: "Iron Sword",
		name: "Iron Sword",
		type: Item.Type.Weapon,
		description: "Trusty ol' sword.",
	},
	{
		id: "ironSpear",
		assetName: "Iron Spear",
		name: "Iron Spear",
		type: Item.Type.Weapon,
		description: "A trusty iron spear.",
	},
	{
		id: "tarnishedBlade",
		assetName: "Tarnished Blade",
		name: "Tarnished Blade",
		type: Item.Type.Weapon,
		description: "The forgotten blade.",
	},
]);

export { Items };