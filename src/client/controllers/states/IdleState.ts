import { IState } from "./IState";

/**
 * IdleState - Player is standing still and not performing any actions
 * Takes no arguments when entering
 */
export class IdleState implements IState<[]> {
	getName(): string {
		return "IdleState";
	}

	enter(lastState: IState<any> | undefined): void {
		print(`Entering ${this.getName()} from ${lastState?.getName() ?? "initial state"}`);
		// TODO: Set idle animation
		// TODO: Reset movement variables
	}

	input(inputObject: InputObject): void {
		// Handle input that might transition to other states
		if (inputObject.UserInputType === Enum.UserInputType.Keyboard) {
			// Movement input would trigger transition to WalkState
			// Combat input would trigger transition to CombatState
		}
	}

	update(deltaTime: number): void {
		// Idle state typically doesn't need much updating
		// Could handle idle animations or timers here
	}

	exit(): void {
		print(`Exiting ${this.getName()}`);
		// Clean up idle state
	}
}