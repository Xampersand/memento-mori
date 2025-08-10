local ProgressionService = {};

local function getMaxXP(level: number)
	return level * 2;
end

function ProgressionService:init(debugMode)
	if (debugMode) then
		print("<ProgressionService> initialized successfully!")
	end
end

function ProgressionService:ready()
	ProgressionService.cardService = require(script.Parent.CardService);
	ProgressionService.dataService = require(script.Parent.DataService);
end

function ProgressionService:addXP(player, xp)
	local data = ProgressionService.dataService:get(player);
	if (not data) then return end;

	local level = data.level;
	local currentXP = data.xp;
	
	local levelsGained = 0;
	
	local newXP = currentXP + xp;
	local currentMaxXP = getMaxXP(level);
	
	while (newXP >= currentMaxXP) do
		levelsGained += 1;
		newXP -= currentMaxXP;
		currentMaxXP = getMaxXP(level + levelsGained);
	end
	
	ProgressionService.dataService:update(player, function(data)
		data.level = level + levelsGained;
		data.xp = newXP;
		data.xpMax = getMaxXP(data.level);
	end);
	
	if (levelsGained > 0) then
		ProgressionService:TriggerLevelUp(player, levelsGained);
	end
end

function ProgressionService:TriggerLevelUp(player, times)
	for i = 1, times do
		ProgressionService.cardService:showCard(player);
	end
end

return ProgressionService;