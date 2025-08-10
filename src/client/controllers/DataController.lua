local Network = game:GetService("ReplicatedStorage"):WaitForChild("Network");
local Data = Network:FindFirstChild("Data");

local DataController = {};

DataController._data = {};


function DataController:init(debugMode)
	Data.OnClientEvent:Connect(function(clientData)
		DataController._data = clientData;
	end)
	
	if (debugMode) then
		print("<DataController> initialized successfully!")
	end
end

function DataController:get()
	return DataController._data;
end

return DataController;