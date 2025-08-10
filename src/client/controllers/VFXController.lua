local VFXController = {};

function VFXController:init(debugMode)
	if (debugMode) then
		print("<VFXController> initialized successfully!")
	end
end

return VFXController;