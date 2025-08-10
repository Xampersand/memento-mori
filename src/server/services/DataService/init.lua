local DataService = {};

local StoreKey = "DebugStore_01";

local Network = game:GetService("ReplicatedStorage"):FindFirstChild("Network")

local ReplicatedStorage = game:GetService("ReplicatedStorage");

local ProfileStore = require(script.ProfileStore);
local DataTemplate = require(script.DataTemplate);

local Players = game:GetService("Players")

local PlayerStore = ProfileStore.New(StoreKey, DataTemplate)
local Profiles: {[player]: typeof(PlayerStore:StartSessionAsync())} = {}

local RunService = game:GetService("RunService")
if RunService:IsStudio() == true then
	PlayerStore = PlayerStore.Mock
end


local function init(player)
	local profile = PlayerStore:StartSessionAsync(`{player.UserId}`, {
		Cancel = function()
			return player.Parent ~= Players
		end,
	})

	if profile ~= nil then
		profile:AddUserId(player.UserId) -- GDPR compliance
		profile:Reconcile() -- Fill in missing variables from DataTemplate

		profile.OnSessionEnd:Connect(function()
			Profiles[player] = nil
			player:Kick(`Profile session end - Please rejoin`)
		end)

		if player.Parent == Players then
			Profiles[player] = profile
			print(`Profile loaded for {player.DisplayName}!`)
			Network.Data:FireClient(player, profile.Data);			
			--for i = 1, 10 do
			--	task.wait(1);
			--	local randomTable = {"AGI", "STR", "CON", "INT"};
			--	DataService:update(player, function(data)
			--		data.CombatStats[randomTable[math.random(#randomTable)]] += 1;
			--	end)
			--end
		else
			profile:EndSession()
		end

	else
		player:Kick(`Profile load fail - Please rejoin`)
	end
end

local function deinit(player)
	local profile = Profiles[player]
	if profile ~= nil then
		profile:EndSession()
	end
end

DataService.Profiles = Profiles;
function DataService:get(player: Player)
	local profile = Profiles[player];
	if (not profile) then return nil end;
	return profile.Data;
end

function DataService:set(player: Player, key: string, value: any)
	Profiles[player].Data[key] = value;
	Network.Data:FireClient(player, Profiles[player].Data);
end

function DataService:update(player: Player, updateFunc: (data) -> data)
	updateFunc(Profiles[player].Data);
	Network.Data:FireClient(player, Profiles[player].Data);
end

function DataService:init(debugMode)
	for _, player in Players:GetPlayers() do
		task.spawn(function()
			init(player);
		end)
	end

	Players.PlayerAdded:Connect(function(player)
		init(player)
	end)
	
	Players.PlayerRemoving:Connect(function(player)
		deinit(player)
	end)
	
	if (debugMode) then
		print("<DataService> initialized successfully!")
	end
end

function DataService:ready()
	
end

return DataService