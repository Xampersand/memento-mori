local ServerScriptService = script.Parent;
local Services = ServerScriptService:WaitForChild("Services");

local _serviceList = {}

for _, service in Services:GetChildren() do
	_serviceList[service.name] = require(service);
	_serviceList[service.name]:init(script:GetAttribute("DebugMode"));
end

for _, service in Services:GetChildren() do
	if (typeof(_serviceList[service.name].ready) == "function") then
		task.spawn(function()
			_serviceList[service.name]:ready();
		end)
	end
end