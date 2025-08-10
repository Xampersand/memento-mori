local UIController = {};

local Network = game:GetService("ReplicatedStorage"):WaitForChild("Network");
local Data = Network:FindFirstChild("Data");

local CollectionService = game:GetService("CollectionService");
local ReplicatedStorage = game:GetService("ReplicatedStorage");
local UserInputService = game:GetService("UserInputService");
local Assets = ReplicatedStorage:FindFirstChild("Assets");

local COLORS = {
	Interacting = Color3.fromRGB(255, 0, 0),
	NoInteraction = Color3.fromRGB(255, 255, 255);
}

local function get(tag)
	local allTagged = CollectionService:GetTagged(tag);
	local filtered = {};
	for _, tagged in allTagged do
		if (tagged:IsDescendantOf(UIController.playerGui)) then
			table.insert(filtered, tagged);
		end
	end
	
	return filtered;
end

local function sanitizeDataKey(dataKey, clientData)
	local sanitizedPath = string.split(dataKey, "/");
	local listenedValue;
	for _, pathBreakpoint in sanitizedPath do
		if (not listenedValue) then
			listenedValue = clientData[pathBreakpoint];
		else
			listenedValue = listenedValue[pathBreakpoint];
		end
	end
	return listenedValue;
end

local function updateDataDependency(listener, data)
	local updateMethods = {
		RequiresText = function()
			local dataKey = listener:GetAttribute("DataKey");
			local textFormat = listener:GetAttribute("TextFormat");

			local values = {};
			local keys = string.split(dataKey, ",");
			for _, key in keys do
				table.insert(values, sanitizeDataKey(key, data))
			end

			listener.Text = string.format(textFormat, table.unpack(values))
		end,
	}
	
	for tag, method in updateMethods do
		if (listener:HasTag(tag)) then
			method();
		end
	end
end

local function updateItemDependency(listener, data, localCache)
	local updateMethods = {
		RequiresImage = function(item)
			local asset: ImageLabel? = listener:FindFirstChild("Asset");
			assert(asset:IsA("ImageLabel"));
			asset.Image = item.assetId;
		end,
		RequiresInventory = function()
			local inventory = data.inventory;
			local container = listener:FindFirstChild("Container");
			for _, child in container:GetChildren() do
				if (not child:IsA("ImageButton")) then continue end;
				child:Destroy();
			end
			for _, item in inventory do
				local itemFrame = Assets.UI.ItemTemplate:Clone();
				itemFrame.Name = "Item";
				itemFrame:SetAttribute("itemId", item.id);
				
				local itemLabel = itemFrame:FindFirstChild("ItemLabel");
				itemLabel.Text = item.name;

				itemFrame.Parent = container;
			end
		end,
	}
	
	local dataKey = listener:GetAttribute("DataKey");
	
	if (not dataKey) then
		for tag, method in updateMethods do
			if (listener:HasTag(tag)) then
				method();
			end
		end
		return;
	end
	
	local args = string.split(dataKey, "&");
	local item;

	local filters = string.split(args[2], "=");
	if (filters[1] == "index") then
		item = data[args[1]][tonumber(filters[2])];
	end

	if (item == nil) then return end;

	for tag, method in updateMethods do
		if (listener:HasTag(tag)) then
			method(item);
		end
	end
end

local function interactAsset(asset: GuiBase2d, inputObject: InputObject, context)
	if (context.clicked and context.ended) then
		if (asset:HasTag("InteractableItem")) then
			local itemId = asset:GetAttribute("itemId");
			local image = asset :: ImageLabel;
			image:AddTag("UserInteracted");
			image.ImageColor3 = COLORS.Interacting;
		end
	end
end

local function clearPreviousInteraction(asset: GuiBase2d, inputObject: InputObject, context)
	if (context.clicked and context.ended) then
		if (asset:HasTag("UserInteracted")) then
			local image = asset :: ImageLabel;
			image.ImageColor3 = COLORS.NoInteraction;
		end
	end
end

local function handleInputUI(inputObject: InputObject, gameProcessedEvent: boolean)
	local click = inputObject.UserInputType == Enum.UserInputType.MouseButton1;
	local inputBegan = inputObject.UserInputState == Enum.UserInputState.Begin;
	local inputEnded = inputObject.UserInputState == Enum.UserInputState.End;
	
	local playerGui: PlayerGui = UIController.playerGui;
	local mousePosition = Vector2.new(inputObject.Position.X, inputObject.Position.Y);

	local guiObjects = playerGui:GetGuiObjectsAtPosition(mousePosition.X, mousePosition.Y);
	local mouseIcon = "Normal";

	local context = {
		["clicked"] = click,
		["began"] = inputBegan,
		["ended"] = inputEnded
	}
	for _, object in guiObjects do
		if (not object:IsDescendantOf(playerGui.MainUI)) then continue end;
		if (object:HasTag("InteractableAsset")) then
			mouseIcon = "Select";
			clearPreviousInteraction(object, inputObject, context);
			interactAsset(object, inputObject, context);
		end
	end

	if (inputObject.UserInputType == Enum.UserInputType.MouseMovement) then
		UIController.mouseController:moveMouseIcon(UDim2.new(0, mousePosition.X, 0, mousePosition.Y));
		UIController.mouseController:changeMouseIcon(mouseIcon)
	end
end 

function UIController:init(debugMode)
	local itemCache = {};
	
	Data.OnClientEvent:Connect(function(clientData)
		local itemsChanged = true;
		local newItems = {inventory = clientData.inventory, equipped = clientData.equipped}
		if (itemCache == newItems) then
			itemsChanged = false;
		else
			itemCache = newItems;
		end
		
		for _, listener in get("DataDependent") do
			updateDataDependency(listener, clientData)
		end
		if (itemsChanged) then
			for _, listener in get("ItemDependent") do
				updateItemDependency(listener, clientData, itemCache)
			end
		end
	end)
	
	UIController.playerGui = game:GetService("Players").LocalPlayer:WaitForChild("PlayerGui")
	
	if (debugMode) then
		print("<UIController> initialized successfully!")
	end
end

function UIController:ready()
	UIController.mouseController = require(script.Parent.MouseController);
	

	UserInputService.InputBegan:Connect(handleInputUI)
	UserInputService.InputChanged:Connect(handleInputUI)
	UserInputService.InputEnded:Connect(handleInputUI)
end

return UIController;