local StarterPlayerScripts = script.Parent;
local Controllers = StarterPlayerScripts:WaitForChild("Controllers");

local _controllerList = {}

for _, controller in Controllers:GetChildren() do
	_controllerList[controller.name] = require(controller);
	_controllerList[controller.name]:init(script:GetAttribute("DebugMode"));
end

for _, controller in Controllers:GetChildren() do
	if (typeof(_controllerList[controller.name].ready) == "function") then
		task.spawn(function()
			_controllerList[controller.name]:ready();
		end)
	end
	
	if (typeof(_controllerList[controller.name].update) == "function") then
		game:GetService("RunService"):BindToRenderStep("UpdateController_"..controller.Name, 100, function(dt)
			_controllerList[controller.name]:update(dt);
		end)
	end
end

