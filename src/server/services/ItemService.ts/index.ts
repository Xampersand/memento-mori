import { OnStart, Service } from "@flamework/core";
import { Items } from "./Items";
import { Item, PlayerData } from "shared/types";
import { DataService } from "../DataService.ts";
import Object from "@rbxts/object-utils";
import { Players } from "@rbxts/services";

@Service()
export class ItemService implements OnStart {
	private items = Items;

	constructor(private dataService: DataService) {}

	// Fetches an item from the database, returns either the item or undefined
	private getItemFromDB(itemId: string): Item.Data | undefined {
		for (const [type, itemArray] of this.items) {
			const item = itemArray.find((i) => i.id === itemId);
			if (item) {
				return item;
			}
		}
		return;
	}

	// Fetches an item's index from the database, returns an index (-1 for not found)
	private getItemIndex(itemId: string, itemList: Array<Item.Data>): number {
		const index = itemList.findIndex((i) => i.id === itemId);
		if (index !== -1) {
			return index;
		}
		return -1;
	}

	// Fetches a deep copy of an item from the database, returns either the copy or undefined
	private getItemCopy(itemId: string): Item.Data | undefined {
		const item = this.getItemFromDB(itemId);
		if (!item) return;
		return Object.deepCopy(item);
	}

	// Attempts to give a player a copy of an item, returns success
	public giveItem(player: Player, itemId: string): boolean {
		const copy = this.getItemCopy(itemId);
		if (!copy) return false;
		// Give the item to the player

		this.dataService.update(player, (data) => {
			data.inventory.push(copy);
		});
		return true;
	}

	// Attempts to equip an item, returns success
	public equipItem(player: Player, itemId: string, equippedLocation: keyof PlayerData["equipped"]): boolean {
		const data = this.dataService.get(player);
		if (!data) return false;

		const itemIndex = this.getItemIndex(itemId, data.inventory);
		if (itemIndex === -1) return false;

		this.dataService.update(player, (data) => {
			data.equipped[equippedLocation].push(data.inventory[itemIndex]);
			data.inventory.remove(itemIndex);
		});

		// Equip the item
		return true;
	}

	// Attempts to unequip an item, returns success
	public unequipItem(player: Player, itemId: string): boolean {
		const data = this.dataService.get(player);
		if (!data) return false;

		let itemIndex = -1;
		let equippedTo: keyof PlayerData["equipped"] = "attack";

		for (const equippedLocation of Object.keys(data.equipped)) {
			itemIndex = this.getItemIndex(itemId, data.equipped[equippedLocation]);
			if (itemIndex !== -1) {
				equippedTo = equippedLocation;
				break;
			}
		}

		if (itemIndex === -1) return false;

		this.dataService.update(player, (data) => {
			data.inventory.push(data.equipped[equippedTo][itemIndex]);
			data.equipped[equippedTo].remove(itemIndex);
		});

		return true;
	}

	onStart() {
		task.delay(3, () => {
			for (const player of Players.GetPlayers()) {
				// Give weapon
				this.giveItem(player, "tarnishedBlade");

				// Give attacks
				this.giveItem(player, "tarnishedRight");
				this.giveItem(player, "tarnishedLeft");
				this.giveItem(player, "tarnishedUp");
				this.giveItem(player, "tarnishedDown");

				print(`Gave items to ${player.Name}`);
				print(this.dataService.get(player));
			}
		});
	}
}