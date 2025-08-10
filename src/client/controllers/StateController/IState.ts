/**
 * Generic interface for game states with type-safe enter() method arguments
 */
export interface IState<TEnterArgs extends readonly unknown[] = []> {
	/**
	 * Called when entering this state
	 * @param lastState The previous state that was active
	 * @param args Type-safe arguments specific to this state
	 */
	enter(lastState: IState<any> | undefined, ...args: TEnterArgs): void;

	/**
	 * Handle input events while this state is active
	 * @param inputObject The input object from Roblox
	 */
	input(inputObject: InputObject): void;

	/**
	 * Update the state logic each frame
	 * @param deltaTime Time since last frame in seconds
	 */
	update(deltaTime: number): void;

	/**
	 * Called when exiting this state
	 */
	exit(): void;

	/**
	 * Get the name of this state for debugging and logging
	 */
	getName(): string;
}