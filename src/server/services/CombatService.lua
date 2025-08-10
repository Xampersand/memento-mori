local CombatService = {};

local Network = game:GetService("ReplicatedStorage"):FindFirstChild("Network")

local function getWeapon(character: Model)
	local weapon;
	
	for _, child in character:GetChildren() do
		if (child:HasTag("Weapon")) then
			weapon = child;
		end
	end
	
	return weapon;
end

function CombatService:damage(target, damageAmount)
	local hpMax = target:GetAttribute("hpMax");
	local hp = target:GetAttribute("hp");
	if (hp == nil or hpMax == nil) then return end;
	
	if (hp - damageAmount <= 0) then
		target:SetAttribute("hp", 0);
		target.Head.EnemyUI.Enabled = false;
		
		local faceDeathTween = game:GetService("TweenService"):Create(target.Head.Decal, TweenInfo.new(2), {
			Transparency = 1
		}):Play();
		
		local finalTween
		for _, child in target:GetChildren() do
			if (not child:IsA("BasePart")) then continue end;
			local deathTween = game:GetService("TweenService"):Create(child, TweenInfo.new(2), {
				Color = Color3.fromRGB(0, 255, 255);
				Transparency = 1
			});
			finalTween = deathTween;
			deathTween:Play();
		end
		
		finalTween.Completed:Once(function()
			local particles = game:GetService("ReplicatedStorage").Assets:FindFirstChild("DeathParticles"):Clone();
			particles.Parent = target.Torso;
			particles:Emit(100);
			target.Clothing:Destroy();
			task.wait(2);
			target:Destroy();
		end)
		return true;
	else
		target:SetAttribute("hp", hp - damageAmount);
	end
	return false
end

function CombatService:init(debugMode)
	CombatService.Attacks = require(script.Parent.Parent.Containers.Attacks);
	
	if (debugMode) then
		print("<CombatService> initialized successfully!")
	end
end

function CombatService:ready()
	CombatService.dataService = require(script.Parent.DataService);
	CombatService.progressionService = require(script.Parent.ProgressionService);
	
	Network.Hit.OnServerEvent:Connect(function(player: Player, target: Model)
		local weapon = getWeapon(player.Character);
		if (not weapon) then return end;

		local damageAmount = weapon:GetAttribute("BaseDamage");
		local damageModifier = weapon:GetAttribute("DamageModifier");
		
		local data = CombatService.dataService:get(player);
		
		local finalDamage = damageAmount * (1 + data.stats[damageModifier]);

		local killed = CombatService:damage(target, finalDamage);
		if (killed) then
			CombatService.progressionService:addXP(player, target:GetAttribute("xp"))
		end
	end)
end

return CombatService;