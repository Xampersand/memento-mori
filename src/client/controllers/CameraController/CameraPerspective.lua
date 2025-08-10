local CameraPerspective = {};

local partsToMakeVisible = {"Left Arm", "Right Arm", "Left Leg", "Right Leg", "Torso"};

local function makeVisibleLocally(part: BasePart)
	if table.find(partsToMakeVisible, part.Name) then
		part.LocalTransparencyModifier = part.Transparency
		part.Changed:Connect(function(property)
			part.LocalTransparencyModifier = part.Transparency
		end)
	end
end

local function makeEquipmentVisibleLocally(equipment: Model)
	for _, part in equipment:GetChildren() do
		if (part:IsA("BasePart")) then
			part.LocalTransparencyModifier = part.Transparency
			part.Changed:Connect(function(property)
				part.LocalTransparencyModifier = part.Transparency
			end)
		end
	end
end

local function onCharacterAdded(character: Model)
	local humanoid = character:WaitForChild("Humanoid")
	for _,v in pairs(character:GetChildren()) do
		makeVisibleLocally(v)
	end
	
	for _, possibleEquipment in character:GetChildren() do
		if (possibleEquipment:HasTag("Equipment")) then
			makeEquipmentVisibleLocally(possibleEquipment)
		end
	end

	character.ChildAdded:Connect(function(child)
		if (child:HasTag("Equipment")) then
			makeEquipmentVisibleLocally(child)
		end
	end)
	
	humanoid.CameraOffset = Vector3.new(0, 0.1, -0.9);
	workspace.CurrentCamera.FieldOfView = 80
end

function CameraPerspective:init()
	local player = game:GetService("Players").LocalPlayer;
	
	if (player.Character) then
		onCharacterAdded(player.Character)
	end
	
	player.CharacterAdded:Connect(onCharacterAdded);
end

return CameraPerspective;