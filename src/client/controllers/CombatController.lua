local CombatController = {};

local hitboxes = {};

local Network = game:GetService("ReplicatedStorage"):FindFirstChild("Network");
local Assets = game:GetService("ReplicatedStorage"):FindFirstChild("Assets");
local Debris = game:GetService("Debris");

local DEBUG = true;

local function spawnDebug(fragment, nextFragment, length, distance)
	local part = Instance.new("Part");
	part.Name = fragment.Name;
	part.Size = Vector3.new(0.2, 0.2, length);
	part.TopSurface = Enum.SurfaceType.Smooth;
	part.Material = Enum.Material.Neon;
	part.CFrame = CFrame.lookAt(fragment.WorldPosition + distance / 2, nextFragment.WorldPosition);
	part.Anchored = true;
	part.CanCollide = false;
	part.Color = Color3.fromRGB(math.random(50, 255), math.random(20, 255), math.random(30, 255))
	part.Parent = workspace;
	game.Debris:AddItem(part, 2)
end

local function getWeapon()
	local player = game:GetService("Players").LocalPlayer;
	local weapon;
	for _, child in player.Character:GetChildren() do
		if (child:HasTag("Weapon")) then
			weapon = child;
		end
	end
	return weapon;
end

local function getFragments(weapon): {Attachment}
	local hitbox = weapon:FindFirstChild("Hitbox");
	local fragments: {Attachment} = {};
	for _, attachment in hitbox:GetChildren() do
		if (attachment:IsA("Attachment") and attachment:HasTag("HitboxFragment")) then
			table.insert(fragments, attachment);
		end
	end
	return fragments
end

local function getNextFragment(fragment, fragments): Attachment
	for index, nextFragment in fragments do
		if (nextFragment.Name == fragment:GetAttribute("NextFragment")) then
			return nextFragment;
		end
	end
end

local function sanitizeRaycastResult(raycastResult: RaycastResult) 
	local instance = raycastResult.Instance;
	local modelParent = instance.Parent;
	if (not modelParent:IsA("Model")) then return nil end;
	
	if (not modelParent:FindFirstChildWhichIsA("Humanoid")) then return nil end;
	
	return modelParent;
end

function CombatController:init(debugMode)
	if (debugMode) then
		print("<CombatController> initialized successfully!")
	end
end

function CombatController:startHitbox()
	local weapon = getWeapon();
	local fragments = getFragments(weapon);
	
	local raycastParams = RaycastParams.new();
	raycastParams.FilterDescendantsInstances = {game:GetService("Players").LocalPlayer.Character};
	raycastParams.FilterType = Enum.RaycastFilterType.Exclude;
	
	local hitlist = {};
	
	local connection;
	
	local hitboxId = game:GetService("HttpService"):GenerateGUID(false);
	
	local lastEndPos = fragments[#fragments].WorldPosition;
	
	connection = game:GetService("RunService").RenderStepped:Connect(function()
		local weaponEndFragment = fragments[#fragments]
		local currentEndPos = weaponEndFragment.WorldPosition
		local swingDirection = (currentEndPos - lastEndPos).Unit
		
		if (swingDirection.Magnitude == 0) then
			swingDirection = Vector3.new(0, 0, -1);
		end
		
		for index, fragment in fragments do
			if (fragment:GetAttribute("NextFragment") == nil) then continue end;

			local nextFragment = getNextFragment(fragment, fragments);

			local distance = (nextFragment.WorldPosition - fragment.WorldPosition);
			local length = distance.Magnitude;

			if (DEBUG) then
				spawnDebug(fragment, nextFragment, length, distance);
			end
			
			local raycastResult = workspace:Raycast(fragment.WorldPosition, distance, raycastParams);
			if (not raycastResult) then continue end;
			
			local sanitizedResult = sanitizeRaycastResult(raycastResult);
			
			if (not sanitizedResult) then continue end;
			
			local hitNormal = raycastResult.Normal
			local hitPosition = raycastResult.Position;
			local hitSource = Instance.new("Attachment");
			hitSource.Parent = workspace.Terrain;
			hitSource.WorldCFrame =
				CFrame.lookAt(
					hitPosition, 
					hitPosition + swingDirection
				);
			local alignedCFrame = CFrame.lookAt(hitPosition, hitPosition + hitNormal)
			local tangent = (swingDirection - hitNormal * swingDirection:Dot(hitNormal)).Unit
			if tangent.Magnitude == 0 then
				tangent = alignedCFrame.RightVector -- fallback direction
			end
			local surfaceCFrame = CFrame.fromMatrix(
				hitPosition,
				tangent, -- X (Right)
				hitNormal:Cross(tangent).Unit, -- Y (Up)
				hitNormal -- Z (LookVector)
			)
			
			Debris:AddItem(hitSource, 2);
			if hitlist[sanitizedResult] and hitlist[sanitizedResult].Model == sanitizedResult then
				for _, asset in Assets.Particles.BloodTrail:GetChildren() do
					local clone = asset:Clone();
					clone.Parent = hitSource;
					clone:Emit(6);
				end
				local slashVFX = Assets.Parts.Slash:Clone()
				slashVFX.CFrame = surfaceCFrame
				slashVFX.Size = Vector3.new(1, 0.1, 0.1);
				slashVFX.Parent = workspace
				Debris:AddItem(slashVFX, 0.4)
				continue
			else
				for _, asset in Assets.Particles.BloodSplatter:GetChildren() do
					local clone = asset:Clone();
					clone.Parent = hitSource;
					clone:Emit(10);
				end
				local slashVFX = Assets.Parts.Slash:Clone()
				slashVFX.CFrame = surfaceCFrame
				slashVFX.Size = Vector3.new(1, 0.1, 0.1);
				slashVFX.Parent = workspace
				Debris:AddItem(slashVFX, 0.4)
			end;
			
			Network.Hit:FireServer(sanitizedResult);
			
			hitboxes[hitboxId] = {Connection = connection, Hitlist = hitlist};
			hitlist[sanitizedResult] = {Model = sanitizedResult, Result = raycastResult};
		end
		
		lastEndPos = currentEndPos;
	end)
	
	hitboxes[hitboxId] = {Connection = connection, Hitlist = hitlist};
	return hitboxId;
end

function CombatController:stopHitbox(hitboxId)
	hitboxes[hitboxId].Connection:Disconnect();
	hitboxes[hitboxId] = nil;
end

return CombatController;