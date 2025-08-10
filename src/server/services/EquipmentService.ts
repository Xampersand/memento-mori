import { Service, OnStart } from "@flamework/core";
import { DataService } from "./DataService.ts";
import type { Item } from "shared/types.ts";
import { Players, ServerStorage } from "@rbxts/services";

const toRotationCFrame = (eulerRotation: Vector3) => {
	return CFrame.Angles(
		math.rad(eulerRotation.X),
		math.rad(eulerRotation.Y),
		math.rad(eulerRotation.Z)
	)
}

@Service() export class EquipmentService implements OnStart {
	constructor(private dataService: DataService) {}

	weldItem(player: Player, itemData: Item.Data) {
		const character = player.Character;
		if (!character) return;
		const itemModel = ServerStorage.FindFirstChild("Weapons")?.FindFirstChild(itemData.id)?.Clone() as Model | undefined;
		if (!itemModel) return;
		const rightArm = character.FindFirstChild("Right Arm") as MeshPart | undefined;
		if (!rightArm) return;

		const gripPos = itemModel.GetAttribute("GripPosition") as Vector3 | undefined;
		const gripRot = itemModel.GetAttribute("GripRotation") as Vector3 | undefined;

		let offsetCFrame = CFrame.identity;

		if (gripPos && gripRot) offsetCFrame = new CFrame(gripPos).mul(toRotationCFrame(gripRot));

		const motor = new Instance("Motor6D");
		motor.Name = "Handle";
		motor.Part0 = rightArm
		motor.Part1 = itemModel.PrimaryPart;
		motor.C0 = CFrame.identity;
		motor.C1 = offsetCFrame.Inverse();

		motor.Parent = rightArm;
		itemModel.Parent = character;
	}

	weldAll(player: Player) {
		const data = this.dataService.get(player);
		if (!data) return;

		for (const equipment of data.equipped.weapon) {
			this.weldItem(player, equipment);
		}
	}

	clearAll(player: Player) {
		for (const item of player.Character?.GetChildren() ?? []) {
			if (item.HasTag("Equipment")) item.Destroy();
		}
	}

	initializePlayer(player: Player) {
		const character = player.Character;

		if (character) this.weldAll(player);
		player.CharacterAdded.Connect(() => this.weldAll(player));
	}

	onStart() {
		for (const player of Players.GetPlayers()) {
			this.weldAll(player);
		}
		Players.PlayerAdded.Connect((player) => this.initializePlayer(player));
		Players.PlayerRemoving.Connect((player) => this.clearAll(player));
	}
}