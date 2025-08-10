import { Controller, OnInit } from "@flamework/core";
import { DataService } from "../../server/services/DataService";
import { IState } from "./states/IState";
import { IdleState } from "./states/IdleState"; 
import { WalkState } from "./states/WalkState";
import { CombatState } from "./states/CombatState";

/**
 * StateController manages game state transitions and handles input/updates
 * Uses Flamework as the framework for dependency injection and lifecycle management
 */
@Controller()
export class StateController implements OnInit {
	private currentState: IState<any> | undefined;
	private readonly states: Record<string, IState<any>> = {};

	constructor(private dataService: DataService) {}

	onInit(): void {
		print("StateController initialized");
		
		// Initialize all available states
		this.initializeStates();
		
		// Start in idle state
		this.changeState("idle");
	}

	/**
	 * Initialize all available state instances
	 */
	private initializeStates(): void {
		const idleState = new IdleState();
		const walkState = new WalkState();
		const combatState = new CombatState();

		this.states[idleState.getName().toLowerCase()] = idleState;
		this.states[walkState.getName().toLowerCase()] = walkState;
		this.states[combatState.getName().toLowerCase()] = combatState;

		const stateCount = Object.keys(this.states).length;
		print(`Initialized ${stateCount} states`);
	}

	/**
	 * Change to a new state with type-safe arguments
	 * @param stateName Name of the state to transition to
	 * @param args Arguments required by the target state
	 */
	changeState<T extends readonly unknown[]>(stateName: string, ...args: T): boolean {
		const newState = this.states[stateName.toLowerCase()];
		
		if (!newState) {
			warn(`StateController: Unknown state '${stateName}'`);
			return false;
		}

		// Exit current state if exists
		if (this.currentState) {
			this.currentState.exit();
		}

		const lastState = this.currentState;
		this.currentState = newState;

		// Enter new state with proper arguments
		try {
			// TypeScript will enforce correct argument types at compile time
			(newState as IState<T>).enter(lastState, ...args);
			print(`StateController: Successfully changed to ${newState.getName()}`);
			return true;
		} catch (error) {
			warn(`StateController: Error entering state ${newState.getName()}: ${error}`);
			// Fallback to idle state
			this.currentState = this.states["idlestate"];
			if (this.currentState) {
				this.currentState.enter(undefined);
			}
			return false;
		}
	}

	/**
	 * Handle input events and forward to current state
	 * @param inputObject The input object from Roblox
	 */
	handleInput(inputObject: InputObject): void {
		if (this.currentState) {
			this.currentState.input(inputObject);
		}
	}

	/**
	 * Update the current state - should be called every frame
	 * @param deltaTime Time since last frame in seconds
	 */
	update(deltaTime: number): void {
		if (this.currentState) {
			this.currentState.update(deltaTime);
		}
	}

	/**
	 * Get the currently active state
	 * @returns The current state instance or undefined if no state is active
	 */
	getCurrentState(): IState<any> | undefined {
		return this.currentState;
	}

	/**
	 * Get the name of the currently active state
	 * @returns The name of the current state or "none" if no state is active
	 */
	getCurrentStateName(): string {
		return this.currentState?.getName() ?? "none";
	}

	/**
	 * Check if a specific state is currently active
	 * @param stateName Name of the state to check
	 * @returns True if the specified state is currently active
	 */
	isInState(stateName: string): boolean {
		return this.getCurrentStateName().toLowerCase() === stateName.toLowerCase();
	}

	/**
	 * Get all available state names
	 * @returns Array of available state names
	 */
	getAvailableStates(): string[] {
		const stateNames: string[] = [];
		for (const key in this.states) {
			stateNames.push(this.states[key].getName());
		}
		return stateNames;
	}

	// Convenience methods for common state transitions

	/**
	 * Transition to idle state
	 */
	toIdle(): boolean {
		return this.changeState("idle");
	}

	/**
	 * Transition to walk state
	 */
	toWalk(): boolean {
		return this.changeState("walk");
	}

	/**
	 * Transition to combat state with animation id
	 * @param animationId The animation id string for combat
	 */
	toCombat(animationId: string): boolean {
		return this.changeState("combat", animationId);
	}
}