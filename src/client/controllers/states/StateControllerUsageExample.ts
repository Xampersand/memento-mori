import { StateController } from "../StateController";

/**
 * Example usage of the StateController
 * This demonstrates how to properly use the type-safe state transitions
 */
export class StateControllerUsageExample {
	constructor(private stateController: StateController) {}

	/**
	 * Example of type-safe state transitions
	 */
	demonstrateStateTransitions(): void {
		// These transitions are type-safe and will be validated at compile time

		// Transition to idle state (no arguments required)
		this.stateController.toIdle();

		// Alternative way to transition to idle
		this.stateController.changeState("idle");

		// Transition to walk state (no arguments required)
		this.stateController.toWalk();

		// Transition to combat state (requires animation id string)
		this.stateController.toCombat("sword_attack_01");

		// Alternative way to transition to combat
		this.stateController.changeState("combat", "bow_attack_02");

		// These would cause TypeScript compilation errors:
		// this.stateController.changeState("combat"); // Error: Missing required animation id
		// this.stateController.changeState("idle", "extra_arg"); // Error: Idle doesn't take arguments
		// this.stateController.changeState("combat", 123); // Error: Animation id must be string
	}

	/**
	 * Example of state querying
	 */
	demonstrateStateQuerying(): void {
		// Check current state
		const currentStateName = this.stateController.getCurrentStateName();
		print(`Current state: ${currentStateName}`);

		// Check if in specific state
		if (this.stateController.isInState("combat")) {
			print("Player is in combat!");
		}

		// Get all available states
		const availableStates = this.stateController.getAvailableStates();
		print(`Available states: ${availableStates.join(", ")}`);

		// Get current state instance for advanced operations
		const currentState = this.stateController.getCurrentState();
		if (currentState) {
			print(`Current state object: ${currentState.getName()}`);
		}
	}

	/**
	 * Example of input handling integration
	 */
	setupInputHandling(): void {
		// In a real implementation, you would connect this to Roblox's input service
		// Example pseudo-code:
		/*
		UserInputService.InputBegan.Connect((inputObject: InputObject) => {
			this.stateController.handleInput(inputObject);
		});
		*/
	}

	/**
	 * Example of update loop integration
	 */
	setupUpdateLoop(): void {
		// In a real implementation, you would connect this to RunService
		// Example pseudo-code:
		/*
		RunService.Heartbeat.Connect((deltaTime: number) => {
			this.stateController.update(deltaTime);
		});
		*/
	}
}