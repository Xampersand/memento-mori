local StateController = {};

local UserInputService = game:GetService("UserInputService");
local Player = game:GetService("Players").LocalPlayer;

StateController.animationController = nil :: typeof(script.Parent.AnimationController);
StateController._lastState = "IdleState";
StateController._currentState = "IdleState";
StateController._states = {};

function StateController:changeState(newState, ...)
	-- Get CURRENT state
	local currentState = StateController._states[StateController._currentState];
	
	-- Call exit on CURRENT state
	currentState:exit();
	
	-- Set LAST state to CURRENT state
	StateController._lastState = StateController._currentState
	
	-- Set CURRENT state to NEW STATE
	StateController._currentState = newState;
	
	-- Call enter on NEW state with LAST state
	StateController._states[newState]:enter(StateController._lastState, ...);
end

function StateController:init(debugMode)
	for _, stateModule in script:GetChildren() do
		StateController._states[stateModule.Name] = require(stateModule);
		StateController._states[stateModule.Name]:init(StateController);
	end
	
	if (debugMode) then
		print("<StateController> initialized successfully!")
	end
end

function StateController:ready()
	StateController.animationController = require(script.Parent.AnimationController);
	StateController.combatController = require(script.Parent.CombatController);
	StateController.dataController = require(script.Parent.DataController);
	UserInputService.InputBegan:Connect(function(input, processed)
		if (processed) then return end;
		StateController._states[StateController._currentState]:input(input);
	end)
end

function StateController:update(dt: number)
	local state = StateController._states[StateController._currentState];
	
	if (typeof(state.update) == "function") then
		state:update(dt);
	end
end

return StateController;