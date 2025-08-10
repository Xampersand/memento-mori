import { Controller, OnInit } from "@flamework/core";
import { Players } from "@rbxts/services";

@Controller()
export class MouseController implements OnInit{
	_cursorIcons = {
		default: "rbxassetid://109797705071552",
		select: "rbxassetid://80092144949645"
	}

	_cursorIconObject: ImageLabel | undefined;

	public changeMouseIcon(icon: string) {
		if (this._cursorIconObject) {
			this._cursorIconObject.Image = icon;
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
		const mouseIcon = mouseUI?.WaitForChild("Mouse") as ImageLabel | undefined;

		this._cursorIconObject = mouseIcon;
	}
}
