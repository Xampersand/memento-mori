# StateController Implementation

This implementation provides a type-safe StateController for roblox-ts using Flamework framework.

## Features

- **Type-Safe State Transitions**: Each state can specify its required arguments using TypeScript generics
- **Proper Error Handling**: Invalid state transitions are handled gracefully with fallback to idle state
- **Flamework Integration**: Uses Flamework's dependency injection and lifecycle management
- **Input Handling**: Forwards input events to the currently active state
- **Update Loop Integration**: Provides frame-by-frame updates to the active state

## Architecture

### IState Interface

The `IState<TEnterArgs>` interface uses TypeScript generics to enforce type safety for the `enter()` method:

```typescript
interface IState<TEnterArgs extends readonly unknown[] = []> {
    enter(lastState: IState<any> | undefined, ...args: TEnterArgs): void;
    input(inputObject: InputObject): void;
    update(deltaTime: number): void;
    exit(): void;
    getName(): string;
}
```

### State Implementations

#### IdleState
- **Arguments**: None (`IState<[]>`)
- **Purpose**: Default state when player is not performing actions

#### WalkState  
- **Arguments**: None (`IState<[]>`)
- **Purpose**: Active when player is moving

#### CombatState
- **Arguments**: Animation ID string (`IState<[string]>`)
- **Purpose**: Active during combat, requires specific animation

### StateController

The main controller provides:

- `changeState<T>(stateName: string, ...args: T): boolean` - Type-safe state transitions
- `handleInput(inputObject: InputObject): void` - Forward input to current state
- `update(deltaTime: number): void` - Update current state each frame
- `getCurrentState(): IState<any> | undefined` - Get current state instance
- `isInState(stateName: string): boolean` - Check if specific state is active

## Usage Examples

### Basic State Transitions

```typescript
// Type-safe transitions
stateController.toIdle();                    // ✓ Valid
stateController.toWalk();                    // ✓ Valid  
stateController.toCombat("sword_attack_01"); // ✓ Valid

// These cause TypeScript errors:
stateController.changeState("combat");       // ✗ Missing animation ID
stateController.changeState("idle", "arg");  // ✗ Idle takes no arguments
```

### Integration with Roblox Services

```typescript
// Input handling
UserInputService.InputBegan.Connect((inputObject: InputObject) => {
    stateController.handleInput(inputObject);
});

// Update loop
RunService.Heartbeat.Connect((deltaTime: number) => {
    stateController.update(deltaTime);
});
```

### State Querying

```typescript
if (stateController.isInState("combat")) {
    // Player is in combat
}

const currentState = stateController.getCurrentStateName();
const availableStates = stateController.getAvailableStates();
```

## File Structure

```
src/client/controllers/
├── StateController.ts                    # Main controller
└── states/
    ├── IState.ts                        # Generic state interface
    ├── IdleState.ts                     # Idle state implementation
    ├── WalkState.ts                     # Walk state implementation
    ├── CombatState.ts                   # Combat state implementation
    ├── StateControllerUsageExample.ts   # Usage examples
    └── index.ts                         # Exports
```

## Adding New States

1. Create a new state class implementing `IState<[...args]>`
2. Define the required arguments in the generic type
3. Register the state in `StateController.initializeStates()`
4. Add convenience methods if needed

Example:

```typescript
export class JumpState implements IState<[number]> {
    enter(lastState: IState<any> | undefined, jumpHeight: number): void {
        // Jump with specified height
    }
    // ... other methods
}
```

## Dependencies

- **@flamework/core**: Dependency injection and lifecycle
- **@rbxts/services**: Roblox services (UserInputService, RunService, etc.)
- **@rbxts/types**: TypeScript definitions for Roblox API

## Notes

- The StateController automatically initializes with idle state
- State transitions include proper cleanup (exit previous, enter new)
- Error handling provides fallback to idle state on transition failures
- All state transitions are logged for debugging