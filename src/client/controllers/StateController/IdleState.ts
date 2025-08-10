import { Players } from "@rbxts/services";
import { StateController } from ".";
import { DataController } from "../DataController";
import { IState } from "./IState";
import { Item } from "shared/types";

/**
 * IdleState - Player is standing still and not performing any actions
 * Takes no arguments when entering
 */
export class IdleState implements IState<[]> {
	constructor(private stateController: StateController, private dataController: DataController) {}

	private humanoid: Humanoid | undefined;

	getName(): string {
		return "IdleState";
	}

	enter(lastState: IState<any> | undefined): void {
		// print(`Entering ${this.getName()} from ${lastState?.getName() ?? "initial state"}`);
		// TODO: Set idle animation
		// TODO: Reset movement variables
		this.humanoid = Players.LocalPlayer.Character?.FindFirstChild("Humanoid") as Humanoid;
	}

	input(inputObject: InputObject): void {
		const attackArray: Enum.KeyCode[] = [Enum.KeyCode.One, Enum.KeyCode.Two, Enum.KeyCode.Three, Enum.KeyCode.Four];
		const movementArray: Enum.KeyCode[] = [Enum.KeyCode.W, Enum.KeyCode.A, Enum.KeyCode.S, Enum.KeyCode.D];

		// Handle input that might transition to other states
		if (inputObject.UserInputType === Enum.UserInputType.Keyboard) {

			// Movement input would trigger transition to WalkState
			if (movementArray.includes(inputObject.KeyCode) && inputObject.UserInputState === Enum.UserInputState.Begin) {
				// Transition to WalkState
				this.stateController.toWalk();
			} else if (attackArray.includes(inputObject.KeyCode) && inputObject.UserInputState === Enum.UserInputState.Begin) {
				// Transition to CombatState
				const data = this.dataController.get();
				if (!data) return;

				const index = attackArray.indexOf(inputObject.KeyCode);
				if (index === -1) return;

				this.stateController.toCombat((data.equipped.attack[index] as Item.AttackData).animationId);
			}
		}
	}

	update(deltaTime: number): void {
		// Idle state typically doesn't need much updating
		// Could handle idle animations or timers here
		this.humanoid = Players.LocalPlayer.Character?.FindFirstChild("Humanoid") as Humanoid;
		if (this.humanoid) {
			if (this.humanoid.MoveDirection.Magnitude > 0) {
				// Transition to WalkState
				this.stateController.toWalk();
			}
		}
	}

	exit(): void {
		print(`Exiting ${this.getName()}`);
		// Clean up idle state
	}
}