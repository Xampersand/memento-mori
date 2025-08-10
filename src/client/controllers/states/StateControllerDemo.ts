/**
 * Complete demonstration of StateController implementation
 * This shows how to integrate the StateController in a real roblox-ts/Flamework application
 */

import { Controller, OnInit, OnStart } from "@flamework/core";
import { StateController } from "../StateController";

/**
 * Example controller that demonstrates StateController integration
 * In a real game, this might be a PlayerController or GameController
 */
@Controller()
export class StateControllerDemo implements OnInit, OnStart {
	constructor(private stateController: StateController) {}

	onInit(): void {
		print("StateControllerDemo: Initializing...");
	}

	onStart(): void {
		print("StateControllerDemo: Starting demonstration...");
		this.runDemo();
	}

	private runDemo(): void {
		print("\n=== StateController Demonstration ===");
		
		// 1. Show initial state
		print(`Starting state: ${this.stateController.getCurrentStateName()}`);
		
		// 2. Demonstrate type-safe transitions
		print("\n--- Demonstrating Type-Safe State Transitions ---");
		
		// Idle to Walk (no arguments)
		print("Transitioning to Walk state...");
		this.stateController.toWalk();
		this.logCurrentState();
		
		// Walk to Combat (requires animation id)
		print("Entering combat with sword animation...");
		this.stateController.toCombat("sword_slash_heavy");
		this.logCurrentState();
		
		// Combat back to Idle
		print("Exiting combat, returning to idle...");
		this.stateController.toIdle();
		this.logCurrentState();
		
		// 3. Show alternative syntax
		print("\n--- Alternative State Transition Syntax ---");
		this.stateController.changeState("combat", "bow_attack_quick");
		this.logCurrentState();
		
		// 4. Demonstrate state querying
		print("\n--- State Querying ---");
		this.demonstrateStateQuerying();
		
		// 5. Show error handling
		print("\n--- Error Handling ---");
		this.demonstrateErrorHandling();
		
		print("\n✅ StateController demonstration completed!");
	}

	private logCurrentState(): void {
		const state = this.stateController.getCurrentState();
		print(`Current state: ${this.stateController.getCurrentStateName()}`);
		
		// If it's combat state, show additional info
		if (this.stateController.isInState("combat") && state) {
			// Type assertion is safe here since we checked the state
			const combatState = state as any; // In real code, you might have proper typing
			if (combatState.getCombatTimer) {
				print(`  Combat timer: ${combatState.getCombatTimer()}s`);
			}
		}
	}

	private demonstrateStateQuerying(): void {
		// Get all available states
		const states = this.stateController.getAvailableStates();
		print(`Available states: ${states.join(", ")}`);
		
		// Check specific states
		print(`Is in idle? ${this.stateController.isInState("idle")}`);
		print(`Is in combat? ${this.stateController.isInState("combat")}`);
		print(`Is in walk? ${this.stateController.isInState("walk")}`);
	}

	private demonstrateErrorHandling(): void {
		print("Attempting invalid state transition...");
		const success = this.stateController.changeState("nonexistent_state");
		print(`Transition successful? ${success}`);
		print(`Current state after failed transition: ${this.stateController.getCurrentStateName()}`);
	}

	/**
	 * Example of how you might integrate with Roblox input system
	 */
	private setupInputHandling(): void {
		// This is pseudo-code showing how you would integrate with UserInputService
		/*
		import { UserInputService } from "@rbxts/services";
		
		UserInputService.InputBegan.Connect((inputObject: InputObject) => {
			this.stateController.handleInput(inputObject);
			
			// Example: Handle state-specific transitions based on input
			if (inputObject.UserInputType === Enum.UserInputType.Keyboard) {
				if (inputObject.KeyCode === Enum.KeyCode.Space) {
					// Space key - enter combat if not already in combat
					if (!this.stateController.isInState("combat")) {
						this.stateController.toCombat("default_attack");
					}
				} else if (inputObject.KeyCode === Enum.KeyCode.W ||
						   inputObject.KeyCode === Enum.KeyCode.A ||
						   inputObject.KeyCode === Enum.KeyCode.S ||
						   inputObject.KeyCode === Enum.KeyCode.D) {
					// Movement keys - enter walk state if idle
					if (this.stateController.isInState("idle")) {
						this.stateController.toWalk();
					}
				}
			}
		});
		*/
	}

	/**
	 * Example of how you might integrate with Roblox update loop
	 */
	private setupUpdateLoop(): void {
		// This is pseudo-code showing how you would integrate with RunService
		/*
		import { RunService } from "@rbxts/services";
		
		RunService.Heartbeat.Connect((deltaTime: number) => {
			// Update the current state
			this.stateController.update(deltaTime);
			
			// Example: Auto-transition from combat to idle after timeout
			if (this.stateController.isInState("combat")) {
				const combatState = this.stateController.getCurrentState() as any;
				if (combatState?.isInCombat && !combatState.isInCombat()) {
					this.stateController.toIdle();
				}
			}
		});
		*/
	}
}

/**
 * Type Safety Demonstration
 * 
 * The following examples show how TypeScript enforces type safety at compile time:
 */

// ✅ Valid state transitions (these will compile successfully):
function validTransitions(controller: StateController) {
	controller.toIdle();                           // No arguments required
	controller.toWalk();                           // No arguments required
	controller.toCombat("animation_id");           // String argument required
	controller.changeState("idle");                // No arguments
	controller.changeState("walk");                // No arguments
	controller.changeState("combat", "anim_id");   // String argument
}

// ❌ Invalid state transitions (these would cause TypeScript compilation errors):
/*
function invalidTransitions(controller: StateController) {
	controller.changeState("combat");              // Error: Missing animation id argument
	controller.changeState("idle", "extra");       // Error: Idle state takes no arguments
	controller.changeState("walk", "extra");       // Error: Walk state takes no arguments
	controller.changeState("combat", 123);         // Error: Animation id must be string, not number
	controller.toCombat();                          // Error: Missing required animation id
	controller.toCombat(123);                       // Error: Animation id must be string
}
*/

export { StateControllerDemo };