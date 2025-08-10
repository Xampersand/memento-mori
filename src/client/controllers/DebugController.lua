local DebugController = {};

function DebugController:init(debugMode)
	local playerGui = game:GetService("Players").LocalPlayer:WaitForChild("PlayerGui");

	local DebugUI = playerGui:WaitForChild("DebugUI");

	DebugController.State = DebugUI:WaitForChild("State");
	
	if (debugMode) then
		print("<DebugController> initialized successfully!")
	end
end

function DebugController:ready()
	DebugController.stateController = require(script.Parent.StateController);
	
	task.spawn(function()
		while true do
			task.wait()
			if (DebugController.State and DebugController.stateController) then
				DebugController.State.Text = "State: " .. DebugController.stateController._currentState;
			end
		end
	end)
end

return DebugController;