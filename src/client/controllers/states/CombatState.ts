import { IState } from "./IState";

/**
 * CombatState - Player is in combat
 * Takes an animation id string when entering
 */
export class CombatState implements IState<[string]> {
	private animationId: string = "";
	private combatTimer = 0;
	private readonly COMBAT_DURATION = 2; // seconds

	getName(): string {
		return "CombatState";
	}

	enter(lastState: IState<any> | undefined, animationId: string): void {
		print(`Entering ${this.getName()} from ${lastState?.getName() ?? "initial state"} with animation: ${animationId}`);
		this.animationId = animationId;
		this.combatTimer = 0;
		
		// TODO: Play combat animation using the provided animationId
		// TODO: Initialize combat variables
		// TODO: Set up combat effects
	}

	input(inputObject: InputObject): void {
		// Handle combat input
		if (inputObject.UserInputType === Enum.UserInputType.Keyboard) {
			// Combat keys might chain attacks or cancel combat
			if (inputObject.KeyCode === Enum.KeyCode.Space && 
				inputObject.UserInputState === Enum.UserInputState.Begin) {
				// Space might be attack key
				this.performAttack();
			}
		}

		if (inputObject.UserInputType === Enum.UserInputType.MouseButton1) {
			// Mouse click attack
			if (inputObject.UserInputState === Enum.UserInputState.Begin) {
				this.performAttack();
			}
		}
	}

	update(deltaTime: number): void {
		this.combatTimer += deltaTime;
		
		// Auto-exit combat after duration
		if (this.combatTimer >= this.COMBAT_DURATION) {
			// StateController should handle transition back to idle
			// This would be done through the controller's logic
		}

		// Update combat animations and effects
		// TODO: Handle ongoing combat logic
	}

	exit(): void {
		print(`Exiting ${this.getName()}`);
		// TODO: Stop combat animation
		// TODO: Clean up combat effects
		// TODO: Reset combat variables
	}

	private performAttack(): void {
		print(`Performing attack with animation: ${this.animationId}`);
		// Reset combat timer to extend combat duration
		this.combatTimer = 0;
		// TODO: Execute attack logic
	}

	getCombatTimer(): number {
		return this.combatTimer;
	}

	isInCombat(): boolean {
		return this.combatTimer < this.COMBAT_DURATION;
	}
}