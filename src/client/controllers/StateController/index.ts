import { Controller, OnInit, OnTick } from "@flamework/core";
import { IState } from "./IState";
import { IdleState } from "./IdleState"; 
import { WalkState } from "./WalkState";
import { CombatState } from "./CombatState";
import Object from "@rbxts/object-utils";
import { DataController } from "../DataController";
import { RunService, UserInputService } from "@rbxts/services";
import { AnimationController } from "../AnimationController";

/**
 * StateController manages game state transitions and handles input/updates
 * Uses Flamework as the framework for dependency injection and lifecycle management
 */
@Controller()
export class StateController implements OnInit, OnTick{
	private currentState: IState<any> | undefined;
	private readonly states: Record<string, IState<any>> = {};

	constructor(private dataController: DataController, private animationController: AnimationController) {}

	onInit(): void {
		// Initialize all available states
		this.initializeStates();

		// Start in idle state
		this.changeState("IdleState");

		UserInputService.InputBegan.Connect((inputObject) => this.handleInput(inputObject));
	}

	onTick(deltaTime: number): void {
		if (this.currentState) {
			this.currentState.update(deltaTime);
		}
	}

	/**
	 * Initialize all available state instances
	 */
	private initializeStates(): void {
		const idleState = new IdleState(this, this.dataController, this.animationController);
		const walkState = new WalkState(this, this.animationController);
		const combatState = new CombatState(this, this.animationController);

		this.states[idleState.getName().lower()] = idleState;
		this.states[walkState.getName().lower()] = walkState;
		this.states[combatState.getName().lower()] = combatState;

		const stateCount = Object.keys(this.states).size();
	}

	/**
	 * Change to a new state with type-safe arguments
	 * @param stateName Name of the state to transition to
	 * @param args Arguments required by the target state
	 */
	changeState<T extends readonly unknown[]>(stateName: string, ...args: T): boolean {
		const newState = this.states[stateName.lower()];
		
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
			return true;
		} catch (error) {
			warn(`StateController: Error entering state ${newState.getName()}: ${error}`);
			// Fallback to idle state
			this.currentState = this.states["IdleState"];
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
		return this.getCurrentStateName().lower() === stateName.lower();
	}

	/**
	 * Get all available state names
	 * @returns Array of available state names
	 */
	getAvailableStates(): string[] {
		const stateNames: string[] = [];
		for (const key of Object.keys(this.states)) {
			stateNames.push(this.states[key].getName());
		}
		return stateNames;
	}

	// Convenience methods for common state transitions

	/**
	 * Transition to idle state
	 */
	toIdle(): boolean {
		return this.changeState("IdleState");
	}

	/**
	 * Transition to walk state
	 */
	toWalk(): boolean {
		return this.changeState("WalkState");
	}

	/**
	 * Transition to combat state with animation id
	 * @param animationId The animation id string for combat
	 */
	toCombat(animationId: string): boolean {
		return this.changeState("CombatState", animationId);
	}
}