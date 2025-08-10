import { Controller, OnInit, OnStart } from "@flamework/core";
import Object from "@rbxts/object-utils";
import { CollectionService, Players, ReplicatedStorage, UserInputService } from "@rbxts/services";
import { Events } from "client/networking";
import { Item, PlayerData } from "shared/types";
import { Mouse, MouseController } from "./MouseController";

const UI = ReplicatedStorage.FindFirstChild("Assets")!.WaitForChild("UI")! as Folder;

// Type-safe path mapping
type PlayerDataPaths = {
    "level": number;
    "xp": number;
    "xpMax": number;
    "stats": PlayerData["stats"];
    "stats/str": number;
    "stats/agi": number;
    "stats/int": number;
    "stats/con": number;
    "cards": Array<string>;
    "skills": Array<string>;
    "inventory": Array<Item.Data>;
    "equipped": PlayerData["equipped"];
    "equipped/attack": Array<Item.Data>;
    "equipped/weapon": Array<Item.Data>;
    "equipped/armor": Array<Item.Data>;
    "equipped/spell": Array<Item.Data>;
};

type ValidDataPath = keyof PlayerDataPaths;

function getPlayerDataValue<T extends ValidDataPath>(
    dataKey: T, 
    data: PlayerData
): PlayerDataPaths[T] | undefined {
    const sanitizedPath = dataKey.split("/");
    let current: unknown = data;

    for (const segment of sanitizedPath) {
        if (current && typeOf(current) === "table" && segment in (current as object)) {
            current = (current as Record<string, unknown>)[segment];
        } else {
            return undefined;
        }
    }

    return current as PlayerDataPaths[T];
}

// Validation function to check if a string is a valid path
function isValidDataPath(path: string): path is ValidDataPath {
    const validPaths: Set<string> = new Set([
        "level", "xp", "xpMax", "stats", "stats/str", "stats/agi", "stats/int", "stats/con",
        "cards", "skills", "inventory", "equipped", "equipped/attack", 
        "equipped/weapon", "equipped/armor", "equipped/spell"
    ]);
	const isValid = validPaths.has(path);
    return isValid;
}

@Controller()
export class UIController implements OnInit, OnStart {
	constructor(private mouseController: MouseController) {}

	private playerGui: PlayerGui | undefined;

	private itemCache: {
		inventory: PlayerData["inventory"], 
		equipped: PlayerData["equipped"]} = {inventory: [], equipped: {attack: [], weapon: [], armor: [], spell: []}
	};

	getTaggedUI(tag: string): Instance[] {
		if (!this.playerGui) return [];

		const allTagged = CollectionService.GetTagged(tag);
		const filtered = allTagged.filter((tagged) => tagged.IsDescendantOf(this.playerGui as PlayerGui));

		return filtered;
	}

    sanitizeDataKey<T extends ValidDataPath>(dataKey: T, data: PlayerData): PlayerDataPaths[T] | undefined {
        return getPlayerDataValue(dataKey, data);
    }

	sanitizeDataKeyRuntime(dataKey: string, data: PlayerData): unknown {
		if (!isValidDataPath(dataKey)) {
			warn(`Invalid data path: ${dataKey}`);
			return undefined;
		}
		return getPlayerDataValue(dataKey, data);
	}

	handleInputUI(inputObject: InputObject, gameProcessedEvent: boolean) {
		const clicked = inputObject.UserInputType === Enum.UserInputType.MouseButton1;
		const inputBegan = inputObject.UserInputState === Enum.UserInputState.Begin;
		const inputEnded = inputObject.UserInputState === Enum.UserInputState.End;

		const playerGui: PlayerGui = this.playerGui!;
		const mousePosition = new Vector2(inputObject.Position.X, inputObject.Position.Y);

		const guiObjects = playerGui.GetGuiObjectsAtPosition(mousePosition.X, mousePosition.Y);
		let mouseIcon = Mouse.Icon.Default;

		const context = {
			clicked: clicked,
			inputBegan: inputBegan,
			inputEnded: inputEnded,
			mousePosition: mousePosition,
			guiObjects: guiObjects
		}

		for (const object of guiObjects) {
			if (!object.IsDescendantOf(playerGui.FindFirstChild("MainUI")!)) continue;

			if (object.HasTag("InteractableAsset")) {
				mouseIcon = Mouse.Icon.Select;
			}
		}

		if (inputObject.UserInputType === Enum.UserInputType.MouseMovement) {
			this.mouseController.moveMouseIcon(new UDim2(0, mousePosition.X, 0, mousePosition.Y));
			this.mouseController.changeMouseIcon(mouseIcon);
		}
	}

	updateDataDependency(listener: Instance, data: PlayerData) {
		const updateMethods = {
			RequiresText: () => {
				const textLabel = listener as TextLabel;
				const dataKey = textLabel.GetAttribute("DataKey") as string | undefined;
				const textFormat = textLabel.GetAttribute("TextFormat") as string | undefined;

				if (!dataKey || !textFormat) {
					warn("Missing DataKey or TextFormat attribute");
					return;
				}

				const values: Record<string, unknown> = {};
				const keys = dataKey.split(",");

				for (const key of keys) {
					if (isValidDataPath(key)) {
						values[key] = this.sanitizeDataKey(key, data);
					} else {
						warn(`Invalid data key: ${key}`);
						values[key] = undefined;
					}
				}

				
				const stringifiedValues: Record<string, string> = {};
				for (const [key, value] of Object.entries(values)) {
					stringifiedValues[key] = tostring(value);
				}

				textLabel.Text = string.format(textFormat, ...Object.values(stringifiedValues));

				// Now you can use values with the textFormat
				// Example: textLabel.Text = string.format(textFormat, ...Object.values(values));
			}
		};

		for (const [tag, method] of Object.entries(updateMethods)) {
			if (listener.HasTag(tag)) {
				method();
			}
		}
	}

	updateItemDependency(listener: Instance, data: PlayerData) {
		const updateMethods = {
			RequiresImage: () => {},
			RequiresInventory: () => {
				const inventory = data.inventory;
				const inventoryFrame = listener as Frame;
				const container = inventoryFrame.FindFirstChild("Container") as ScrollingFrame;
				for (const child of container.GetChildren()) {
					if (!child.IsA("ImageButton")) continue;
					child.Destroy();
				}

				for (const item of inventory) {
					const itemFrame = UI.FindFirstChild("ItemTemplate")!.Clone() as ImageButton;
					itemFrame.Name = "Item" + item.id;
					itemFrame.SetAttribute("itemId", item.id);
					
					const itemLabel = itemFrame.FindFirstChild("ItemLabel") as TextLabel;
					itemLabel.Text = item.name;
					itemFrame.Parent = container;
				}
			}
		}
		for (const [tag, method] of Object.entries(updateMethods)) {
			if (listener.HasTag(tag)) method();
		}
	}

	onInit(): void | Promise<void> {
		Events.dataUpdate.connect((data) => {
			let itemsChanged = true;

			if (Object.deepEquals(this.itemCache.inventory, data.inventory) && Object.deepEquals(this.itemCache.equipped, data.equipped)) {
				itemsChanged = false;
			}

			for (const listener of this.getTaggedUI("DataDependent")) {
				this.updateDataDependency(listener, data);
			}

			if (itemsChanged) {
				this.itemCache = data;
				for (const listener of this.getTaggedUI("ItemDependent")) {
					this.updateItemDependency(listener, data);
				}
			}
		});
	}

	onStart() {
		this.playerGui = Players.LocalPlayer.WaitForChild("PlayerGui") as PlayerGui;

		UserInputService.InputBegan.Connect((inputObject, gameProcessedEvent) => this.handleInputUI(inputObject, gameProcessedEvent));
		UserInputService.InputChanged.Connect((inputObject, gameProcessedEvent) => this.handleInputUI(inputObject, gameProcessedEvent));
		UserInputService.InputEnded.Connect((inputObject, gameProcessedEvent) => this.handleInputUI(inputObject, gameProcessedEvent));
	}
}