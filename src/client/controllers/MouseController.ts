import { Controller, OnInit } from "@flamework/core";
import { Players, UserInputService } from "@rbxts/services";

export namespace Mouse {
	export enum Icon {
		Default,
		Select
	}
}

@Controller()
export class MouseController implements OnInit{
	_cursorIcons = {
		[Mouse.Icon.Default]: "rbxassetid://109797705071552",
		[Mouse.Icon.Select]: "rbxassetid://80092144949645"
	}

	_cursorIconObject: ImageLabel | undefined;

	public changeMouseIcon(icon: Mouse.Icon) {
		if (this._cursorIconObject && this._cursorIconObject.Image !== this._cursorIcons[icon]) {
			this._cursorIconObject.Image = this._cursorIcons[icon];
		}
	}

	public moveMouseIcon(position: UDim2) {
		if (this._cursorIconObject) {
			this._cursorIconObject.Position = position;
		}
	}

	onInit() {
		const playerGui: PlayerGui = Players.LocalPlayer.WaitForChild("PlayerGui") as PlayerGui;
		const mouseUI = playerGui.WaitForChild("MouseUI") as ScreenGui | undefined;
		const mouseIcon = mouseUI?.WaitForChild("Mouse")! as ImageLabel;

		UserInputService.MouseIconEnabled = false;

		this._cursorIconObject = mouseIcon;

		print(this._cursorIconObject)

		this.changeMouseIcon(Mouse.Icon.Default);
	}
}
