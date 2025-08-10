import { Controller, OnInit, OnStart } from "@flamework/core";
import { StateController } from "./StateController";
import { Players } from "@rbxts/services";

@Controller()
export class DebugController implements OnInit, OnStart {
	constructor(private stateController: StateController) {}

	private debugUI: ScreenGui | undefined;
	private stateText: TextLabel | undefined;

	onInit() {
		const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui") as PlayerGui;
		this.debugUI = playerGui.WaitForChild("DebugUI") as ScreenGui;
		this.stateText = this.debugUI.FindFirstChild("State") as TextLabel;
	}

	onStart() {
		task.spawn(() => {
			while (true) {
				task.wait();
				if (this.stateText) this.stateText.Text = this.stateController.getCurrentStateName();
			}
		})
	}
}
