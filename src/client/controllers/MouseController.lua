local MouseController = {};

local UIS = game:GetService("UserInputService")
local player = game:GetService("Players").LocalPlayer;

local cursors = {
	Normal = "rbxassetid://109797705071552",
	Select = "rbxassetid://80092144949645"
}

local function changeMouse(mouseIcon: ImageLabel, inputObject: InputObject, gameProcessedEvent: boolean)
	local playerGui: PlayerGui = player:FindFirstChild("PlayerGui");
	
	local guiObjects = playerGui:GetGuiObjectsAtPosition(inputObject.Position.X - 40, inputObject.Position.Y - 40);
	
	for _, object in guiObjects do
		if (object:IsDescendantOf(playerGui.MainUI) and object:HasTag("InteractableAsset")) then
			print(object.Name);
		end
	end
	
	mouseIcon.Position = UDim2.new(0, inputObject.Position.X - 40, 0, inputObject.Position.Y - 40)
	if (gameProcessedEvent) then
		mouseIcon.Image = cursors.Select
		return;
	end

	if (inputObject.UserInputType == Enum.UserInputType.MouseMovement) then
		mouseIcon.Image = cursors.Normal;
	end
end

function MouseController:init(debugMode)
	local playerGui = player:WaitForChild("PlayerGui");
	local mouseUI = playerGui:WaitForChild("MouseUI");
	local mouseIcon: ImageLabel = mouseUI:WaitForChild("Mouse");
	
	UIS.MouseIconEnabled = false
	MouseController.mouseIcon = mouseIcon;
	
	mouseIcon.Image = cursors.Normal;
	
	if (debugMode) then
		print("<MouseController> initialized successfully!")
	end
end

function MouseController:changeMouseIcon(icon: string)
	MouseController.mouseIcon.Image = cursors[icon];
end

function MouseController:moveMouseIcon(position: UDim2)
	MouseController.mouseIcon.Position = position;
end

return MouseController;