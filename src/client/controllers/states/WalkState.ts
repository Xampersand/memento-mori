import { IState } from "./IState";

/**
 * WalkState - Player is walking/moving
 * Takes no arguments when entering
 */
export class WalkState implements IState<[]> {
	private isMoving = false;

	getName(): string {
		return "WalkState";
	}

	enter(lastState: IState<any> | undefined): void {
		print(`Entering ${this.getName()} from ${lastState?.getName() ?? "initial state"}`);
		this.isMoving = true;
		// TODO: Start walking animation
		// TODO: Initialize movement variables
	}

	input(inputObject: InputObject): void {
		// Handle movement input
		if (inputObject.UserInputType === Enum.UserInputType.Keyboard) {
			// Check for movement keys
			if (inputObject.KeyCode === Enum.KeyCode.W || 
				inputObject.KeyCode === Enum.KeyCode.A || 
				inputObject.KeyCode === Enum.KeyCode.S || 
				inputObject.KeyCode === Enum.KeyCode.D) {
				
				if (inputObject.UserInputState === Enum.UserInputState.End) {
					// Key released - might transition back to idle
					this.checkForMovementEnd();
				}
			}
		}
	}

	update(deltaTime: number): void {
		if (this.isMoving) {
			// Update movement logic
			// TODO: Handle actual character movement
		}
	}

	exit(): void {
		print(`Exiting ${this.getName()}`);
		this.isMoving = false;
		// TODO: Stop walking animation
	}

	private checkForMovementEnd(): void {
		// Logic to determine if movement should end
		// This would typically check if any movement keys are still pressed
		// For now, simplified logic
	}
}