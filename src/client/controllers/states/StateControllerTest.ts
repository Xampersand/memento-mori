/**
 * Simple test to validate StateController type safety and functionality
 * This file demonstrates the key features and type safety of the implementation
 */

import { StateController } from "../StateController";
import { IState } from "./IState";
import { IdleState } from "./IdleState";
import { WalkState } from "./WalkState";
import { CombatState } from "./CombatState";

/**
 * Mock DataService for testing
 */
class MockDataService {
	// Simple mock implementation
}

/**
 * Test class that demonstrates StateController functionality
 */
export class StateControllerTest {
	private stateController: StateController;

	constructor() {
		this.stateController = new StateController(new MockDataService() as any);
	}

	/**
	 * Test basic state initialization and transitions
	 */
	testBasicFunctionality(): boolean {
		print("=== Testing StateController Basic Functionality ===");
		
		try {
			// Initialize the controller
			this.stateController.onInit();
			
			// Test initial state
			const initialState = this.stateController.getCurrentStateName();
			print(`Initial state: ${initialState}`);
			
			if (initialState !== "IdleState") {
				print("❌ Initial state should be IdleState");
				return false;
			}
			
			// Test state transitions
			print("Testing state transitions...");
			
			// Test idle -> walk
			const walkSuccess = this.stateController.toWalk();
			if (!walkSuccess || !this.stateController.isInState("walkstate")) {
				print("❌ Failed to transition to WalkState");
				return false;
			}
			print("✅ Successfully transitioned to WalkState");
			
			// Test walk -> combat (with animation id)
			const combatSuccess = this.stateController.toCombat("sword_attack_01");
			if (!combatSuccess || !this.stateController.isInState("combatstate")) {
				print("❌ Failed to transition to CombatState");
				return false;
			}
			print("✅ Successfully transitioned to CombatState with animation id");
			
			// Test combat -> idle
			const idleSuccess = this.stateController.toIdle();
			if (!idleSuccess || !this.stateController.isInState("idlestate")) {
				print("❌ Failed to transition back to IdleState");
				return false;
			}
			print("✅ Successfully transitioned back to IdleState");
			
			print("✅ All basic functionality tests passed!");
			return true;
			
		} catch (error) {
			print(`❌ Test failed with error: ${error}`);
			return false;
		}
	}

	/**
	 * Test type safety compilation (this demonstrates compile-time safety)
	 */
	testTypeSafety(): void {
		print("=== Testing Type Safety (Compile-time validation) ===");
		
		// These calls demonstrate type safety - they will be validated at compile time
		
		// ✅ Valid calls
		this.stateController.changeState("idle");                    // Valid: no args needed
		this.stateController.changeState("walk");                    // Valid: no args needed  
		this.stateController.changeState("combat", "attack_anim");   // Valid: string arg provided
		
		// The following would cause TypeScript compilation errors if uncommented:
		
		// ❌ These would be TypeScript errors:
		// this.stateController.changeState("combat");              // Error: missing animation id
		// this.stateController.changeState("idle", "extra");       // Error: idle takes no args
		// this.stateController.changeState("combat", 123);         // Error: animation id must be string
		// this.stateController.changeState("walk", "extra");       // Error: walk takes no args
		
		print("✅ Type safety is enforced at compile time");
	}

	/**
	 * Test state querying functionality
	 */
	testStateQuerying(): boolean {
		print("=== Testing State Querying ===");
		
		try {
			// Test getting available states
			const availableStates = this.stateController.getAvailableStates();
			print(`Available states: ${availableStates.join(", ")}`);
			
			if (availableStates.length !== 3) {
				print("❌ Should have exactly 3 states");
				return false;
			}
			
			// Test state checking
			this.stateController.toIdle();
			if (!this.stateController.isInState("idle")) {
				print("❌ isInState check failed for idle");
				return false;
			}
			
			this.stateController.toCombat("test_anim");
			if (!this.stateController.isInState("combat")) {
				print("❌ isInState check failed for combat");
				return false;
			}
			
			// Test current state instance
			const currentState = this.stateController.getCurrentState();
			if (!currentState || currentState.getName() !== "CombatState") {
				print("❌ getCurrentState failed");
				return false;
			}
			
			print("✅ All state querying tests passed!");
			return true;
			
		} catch (error) {
			print(`❌ State querying test failed: ${error}`);
			return false;
		}
	}

	/**
	 * Test error handling
	 */
	testErrorHandling(): boolean {
		print("=== Testing Error Handling ===");
		
		try {
			// Test invalid state name
			const invalidResult = this.stateController.changeState("invalid_state");
			if (invalidResult) {
				print("❌ Should return false for invalid state");
				return false;
			}
			
			// Should fallback to idle state after error
			if (!this.stateController.isInState("idle")) {
				print("❌ Should fallback to idle state after invalid transition");
				return false;
			}
			
			print("✅ Error handling works correctly");
			return true;
			
		} catch (error) {
			print(`❌ Error handling test failed: ${error}`);
			return false;
		}
	}

	/**
	 * Run all tests
	 */
	runAllTests(): boolean {
		print("🚀 Starting StateController Tests...\n");
		
		const tests = [
			() => this.testBasicFunctionality(),
			() => { this.testTypeSafety(); return true; }, // Type safety is compile-time
			() => this.testStateQuerying(),
			() => this.testErrorHandling()
		];
		
		let allPassed = true;
		for (let i = 0; i < tests.length; i++) {
			const testPassed = tests[i]();
			if (!testPassed) {
				allPassed = false;
			}
			print(""); // Empty line between tests
		}
		
		if (allPassed) {
			print("🎉 All StateController tests passed!");
		} else {
			print("❌ Some StateController tests failed!");
		}
		
		return allPassed;
	}
}

// Example of how to run the tests:
// const tester = new StateControllerTest();
// tester.runAllTests();