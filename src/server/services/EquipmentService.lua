local EquipmentService = {};

local Players = game:GetService("Players");
local ServerStorage = game:GetService("ServerStorage");

local Equipment = ServerStorage.Equipment;
local Weapons = Equipment.Weapons;

local function toRotationCFrame(eulerRotation: Vector3)
	return CFrame.Angles(
		math.rad(eulerRotation.X),
		math.rad(eulerRotation.Y),
		math.rad(eulerRotation.Z)
	)
end

local function weldEquipmentToCharacter(equipmentId: string, character: Model)
	local equipmentModel: Model = Weapons:FindFirstChild(equipmentId):Clone();

	local rightArm: BasePart = character:FindFirstChild("Right Arm");

	local gripPos = equipmentModel:GetAttribute("GripPosition");
	local gripRot = equipmentModel:GetAttribute("GripRotation");
	
	local offsetCFrame = CFrame.new(gripPos) * toRotationCFrame(gripRot);
	
	local motor = Instance.new("Motor6D");
	motor.Name = "Handle";
	motor.Part0 = rightArm;
	motor.Part1 = equipmentModel.PrimaryPart;
	
	motor.C0 = CFrame.identity;
	motor.C1 = offsetCFrame:Inverse();
	
	motor.Parent = rightArm;
	
	equipmentModel.Parent = character
end

local function weldAllEquipment(player)
	local data = EquipmentService.dataService:get(player);
	if (not data) then return end;
	for _, item in data.equipped.weapons do
		weldEquipmentToCharacter(item.assetName, player.Character);
	end
end

local function clearAllEquipment(player)
	for _, child in player.Character:GetChildren() do
		if (child:HasTag("Equipment")) then
			child:Destroy()
		end
	end
end

local function init(player: Player)
	local character = player.Character;
	
	if (character) then
		weldAllEquipment(player)
	end
	player.CharacterAdded:Connect(function(character)
		weldAllEquipment(player)
	end)
end

function EquipmentService:init(debugMode)
	if (debugMode) then
		print("<EquipmentService> initialized successfully!")
	end
end

function EquipmentService:ready()
	EquipmentService.dataService = require(script.Parent.DataService);
	
	for _, player in Players:GetPlayers() do
		task.spawn(function()
			init(player);
		end)
	end

	Players.PlayerAdded:Connect(function(player)
		init(player)
	end)
end

function EquipmentService:updateEquipment(player)
	clearAllEquipment(player);
	weldAllEquipment(player);
end

return EquipmentService;