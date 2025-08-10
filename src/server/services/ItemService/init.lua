local ItemService = {};

local function deepClone(table)
	local clone = {};
	for key, value in table do
		if (type(value) == "table") then
			clone[key] = deepClone(value);
		else
			clone[key] = value;
		end
	end
	return clone;
end

local function getItem(itemId, list)
	for _, item in list do
		if itemId == item.id then
			return item;
		end
	end
end

local function getItemIndex(itemId, list)
	for index, item in list do
		if itemId == item.id then
			return index;
		end
	end
	return -1;
end

local function getAndCloneItem(itemId, list)
	local item = getItem(itemId, list);
	if (item) then
		return deepClone(item);
	end
end

function ItemService:init(debugMode)
	ItemService._items = require(script.Items);
	
	if (debugMode) then
		print("<ItemService> initialized successfully!")
	end
end

function ItemService:ready()
	ItemService.dataService = require(script.Parent.DataService)
	
	
	task.wait(4)
	for _, player in game:GetService("Players"):GetPlayers() do
		ItemService:giveItem(player, "tarnishedRight");
		ItemService:giveItem(player, "tarnishedLeft");
		ItemService:giveItem(player, "tarnishedUp");
		ItemService:giveItem(player, "tarnishedDown");
	end
end

-- Adds an item to the player's inventory
-- Returns TRUE for successful addition, FALSE for error
function ItemService:giveItem(player: Player, itemId: string): boolean
	local item = getAndCloneItem(itemId, ItemService._items);
	item.uniqueId = game:GetService("HttpService"):GenerateGUID(false);
	
	if (not item) then return end;
	
	local success = false;
	
	ItemService.dataService:update(player, function(data)
		table.insert(data.inventory, item);
		success = true;
	end)
	
	return success;
end


-- Equips an item in the player's inventory
-- Returns TRUE for successful equipping, FALSE for error
function ItemService:equipItem(player: Player, itemId: string, equippedLocation: string): boolean
	local data = ItemService.dataService:get(player);
	local itemIndex = getItemIndex(itemId, data.inventory);
	local success = false;
	
	if (not itemIndex) then return success end;
	
	ItemService.dataService:update(player, function(data)
		table.insert(data.equipped[equippedLocation], deepClone(data.inventory[itemIndex]));
		table.remove(data.inventory, itemIndex);
	end)
end

-- Unequips an item in the player's inventory
-- Returns TRUE for successful unequipping, FALSE for error
function ItemService:unequipItem(player: Player, itemId: string): boolean
	local data = ItemService.dataService:get(player);
	local itemIndex = -1;
	local equippedLocation = "";
	
	for kind, equippedList in data.equipped do
		itemIndex = getItemIndex(itemId, equippedList);
		equippedLocation = kind;
		if (itemIndex > 0) then break; end;
	end
	
	local success = false;

	if (itemIndex == -1) then return success end;

	ItemService.dataService:update(player, function(data)
		table.insert(data.inventory, deepClone(data.equipped[equippedLocation][itemIndex]));
		table.remove(data.equipped[equippedLocation], itemIndex);
	end)
end



return ItemService;