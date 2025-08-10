# StateController Integration Guide

This guide shows how to integrate the StateController into your existing roblox-ts/Flamework project.

## Quick Start

The StateController is automatically discovered and initialized by Flamework since it's decorated with `@Controller()` and placed in the `src/client/controllers/` directory.

### 1. Automatic Initialization

No additional setup required! The controller will be initialized when Flamework starts:

```typescript
// In main.client.ts (already configured)
import { Flamework } from "@flamework/core";

Flamework.addPaths("src/client/controllers"); // StateController is included
Flamework.ignite(); // StateController will be initialized automatically
```

### 2. Using the StateController in Other Controllers

```typescript
import { Controller, OnStart } from "@flamework/core";
import { StateController } from "./StateController";

@Controller()
export class PlayerController implements OnStart {
    constructor(private stateController: StateController) {}

    onStart(): void {
        // StateController is automatically injected by Flamework
        this.setupPlayerStateMachine();
    }

    private setupPlayerStateMachine(): void {
        // Start in idle state (already done automatically)
        print(`Player started in: ${this.stateController.getCurrentStateName()}`);
        
        // Set up input handling and update loops
        this.setupInputHandling();
        this.setupUpdateLoop();
    }
}
```

### 3. Input Integration

```typescript
import { UserInputService } from "@rbxts/services";

private setupInputHandling(): void {
    UserInputService.InputBegan.Connect((inputObject: InputObject) => {
        // Forward all input to the state controller
        this.stateController.handleInput(inputObject);
        
        // Handle state transitions based on input
        this.handleStateTransitions(inputObject);
    });
}

private handleStateTransitions(inputObject: InputObject): void {
    if (inputObject.UserInputType === Enum.UserInputType.Keyboard) {
        switch (inputObject.KeyCode) {
            case Enum.KeyCode.Space:
                if (!this.stateController.isInState("combat")) {
                    this.stateController.toCombat("default_attack");
                }
                break;
                
            case Enum.KeyCode.W:
            case Enum.KeyCode.A:
            case Enum.KeyCode.S:
            case Enum.KeyCode.D:
                if (this.stateController.isInState("idle")) {
                    this.stateController.toWalk();
                }
                break;
        }
    }
}
```

### 4. Update Loop Integration

```typescript
import { RunService } from "@rbxts/services";

private setupUpdateLoop(): void {
    RunService.Heartbeat.Connect((deltaTime: number) => {
        // Update the current state every frame
        this.stateController.update(deltaTime);
        
        // Handle automatic state transitions
        this.handleAutomaticTransitions();
    });
}

private handleAutomaticTransitions(): void {
    // Example: Auto-exit combat after timeout
    if (this.stateController.isInState("combat")) {
        const combatState = this.stateController.getCurrentState() as any;
        if (combatState?.isInCombat && !combatState.isInCombat()) {
            this.stateController.toIdle();
        }
    }
    
    // Example: Auto-exit walk when no movement keys are pressed
    if (this.stateController.isInState("walk")) {
        // Check if movement keys are still pressed
        // If not, transition to idle
    }
}
```

### 5. Working with Game Services

The StateController integrates with your existing DataService and other services:

```typescript
import { Players } from "@rbxts/services";
import { DataService } from "../server/services/DataService";

@Controller()
export class GameController implements OnStart {
    constructor(
        private stateController: StateController,
        private dataService: DataService // Your existing service
    ) {}

    onStart(): void {
        // Use state information to update player data
        Players.LocalPlayer.CharacterAdded.Connect(() => {
            this.stateController.toIdle();
            // Update player data based on state
        });
    }
}
```

## Advanced Usage

### Custom State Transitions

```typescript
// Type-safe state transitions with validation
class AdvancedPlayerController {
    constructor(private stateController: StateController) {}

    enterCombat(animationId: string): boolean {
        // Validate animation exists
        if (!this.isValidAnimation(animationId)) {
            warn(`Invalid animation: ${animationId}`);
            return false;
        }

        // Only enter combat from certain states
        const currentState = this.stateController.getCurrentStateName();
        if (currentState === "IdleState" || currentState === "WalkState") {
            return this.stateController.toCombat(animationId);
        }

        return false;
    }

    private isValidAnimation(animationId: string): boolean {
        // Your animation validation logic
        return animationId.length > 0 && animationId !== "invalid";
    }
}
```

### State-Specific Data

```typescript
// Access state-specific information
if (this.stateController.isInState("combat")) {
    const combatState = this.stateController.getCurrentState() as CombatState;
    const combatTimer = combatState.getCombatTimer();
    const isInCombat = combatState.isInCombat();
    
    // Use this information for UI updates, animations, etc.
}
```

### Adding New States

1. Create your state class:

```typescript
export class SpellCastState implements IState<[string, number]> {
    enter(lastState: IState<any> | undefined, spellId: string, castTime: number): void {
        // Spell casting logic
    }
    
    // Implement other required methods...
}
```

2. Register in StateController:

```typescript
// In StateController.initializeStates()
const spellCastState = new SpellCastState();
this.states[spellCastState.getName().toLowerCase()] = spellCastState;
```

3. Add convenience method:

```typescript
// In StateController
toSpellCast(spellId: string, castTime: number): boolean {
    return this.changeState("spellcast", spellId, castTime);
}
```

## Testing

Use the provided test classes for validation:

```typescript
import { StateControllerTest } from "./states/StateControllerTest";

// Run tests in development
const tester = new StateControllerTest();
tester.runAllTests();
```

## Performance Considerations

- State updates run every frame - keep `update()` methods lightweight
- State transitions are infrequent - logging and validation are acceptable
- Input handling should be fast - delegate heavy work to update loops
- Consider state pooling for frequently created/destroyed states if needed

## Debugging

- All state transitions are logged automatically
- Use `getCurrentStateName()` for debugging displays
- Check `getAvailableStates()` to verify all states are registered
- Use the demo controller to test state behavior

## Migration from Existing Code

If you have existing state management:

1. Identify current states and their data requirements
2. Create new state classes implementing `IState<[...args]>`
3. Move state logic from old system to new state classes
4. Replace old state calls with `stateController.changeState()`
5. Test thoroughly with the provided test suite

The type-safe nature of this implementation will catch most migration issues at compile time.