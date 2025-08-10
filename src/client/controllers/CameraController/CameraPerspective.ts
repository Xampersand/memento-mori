// CameraPerspective.ts

import { Workspace } from "@rbxts/services";

const partsToMakeVisible = ["Left Arm", "Right Arm", "Left Leg", "Right Leg", "Torso"];

function makeVisibleLocally(part: BasePart) {
	if (partsToMakeVisible.includes(part.Name)) {
		part.LocalTransparencyModifier = part.Transparency;
		(part.Changed as RBXScriptSignal<(property: string) => void>).Connect(() => {
            part.LocalTransparencyModifier = part.Transparency;
        });
	}
}

function makeEquipmentVisibleLocally(equipment: Model) {
	for (const part of equipment.GetChildren()) {
		if (part.IsA("BasePart")) {
			const basePart = part as BasePart;
			basePart.LocalTransparencyModifier = basePart.Transparency;
			(basePart.Changed as RBXScriptSignal<(property: string) => void>).Connect(() => {
				basePart.LocalTransparencyModifier = basePart.Transparency;
			});
		}
	}
}

function onCharacterAdded(character: Model) {
	const humanoid = character.WaitForChild("Humanoid") as Humanoid;
	for (const v of character.GetChildren()) {
		if (v.IsA("BasePart")) {
			makeVisibleLocally(v as BasePart);
		}
	}

	for (const possibleEquipment of character.GetChildren()) {
		if ((possibleEquipment as Instance & { HasTag?: (tag: string) => boolean }).HasTag?.("Equipment")) {
			makeEquipmentVisibleLocally(possibleEquipment as Model);
		}
	}

	character.ChildAdded.Connect((child) => {
		if ((child as Instance & { HasTag?: (tag: string) => boolean }).HasTag?.("Equipment")) {
			makeEquipmentVisibleLocally(child as Model);
		}
	});

	humanoid.CameraOffset = new Vector3(0, 0.1, -0.9);
	(Workspace.CurrentCamera as Camera).FieldOfView = 80;
}

const CameraPerspective = {
	init() {
		const player = game.GetService("Players").LocalPlayer;
		if (player.Character) {
			onCharacterAdded(player.Character);
		}
		player.CharacterAdded.Connect(onCharacterAdded);
	}
};

export = CameraPerspective;