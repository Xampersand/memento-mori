local CardService = {}

CardService.totalWeight = 0;

local function setupWeights()
	local weights = CardService._cards.Weights;
	local totalWeight = 0;

	for _, rarityData in weights do
		totalWeight += rarityData.weight;
	end

	CardService.totalWeight = totalWeight;
end

function CardService:init(debugMode)
	CardService._cards = require(script.Cards);
	setupWeights();
	
	if (debugMode) then
		print("<CardService> initialized successfully!")
	end
end

local function sanitizeDataKey(dataKey, data)
	local sanitizedPath = string.split(dataKey, "/");
	local listenedValue;
	for _, pathBreakpoint in sanitizedPath do
		if (not listenedValue) then
			listenedValue = data[pathBreakpoint];
		else
			listenedValue = listenedValue[pathBreakpoint];
		end
	end
	return listenedValue;
end

function CardService:ready()
	CardService.dataService = require(script.Parent.DataService);
	game:GetService("ReplicatedStorage").Network.Claim.OnServerEvent:Connect(function(player, id, name)
		local card;
		for rarity, subList in CardService._cards.List do
			for _, cardInfo in subList do
				if (cardInfo.title == name) then
					card = cardInfo;
				end
			end
		end
		
		CardService.dataService:update(player, function(data)
			local card_dataKey = card.data.key;
			local card_dataValue = card.data.value;
			
			local key = card_dataKey:split("/")[2];
			
			data.stats[key] += card_dataValue;
		end)
		
		workspace.Cards:ClearAllChildren();
	end)
end

function CardService:pullRandomCard()
	local list = CardService._cards.List;
	local chance = math.random(1, CardService.totalWeight);
	
	local runningWeight = 0;
	for _, rarityData in CardService._cards.Weights do
		runningWeight += rarityData.weight;
		if (runningWeight >= chance) then
			local rarity = rarityData.rarity;
			local list = CardService._cards.List[rarity];
			return rarity, list[math.random(#list)]
		end
	end
end;

function CardService:showCard(player: Player, cardAmount: number?)
	cardAmount = cardAmount or 3;
	
	local pulls = {};
	for i = 1, cardAmount do
		local rarity, card = CardService:pullRandomCard();
		for _, pull in pulls do
			while pull.card.title == card.title do
				rarity, card = CardService:pullRandomCard();
				task.wait();
			end
		end
		
		table.insert(pulls, {rarity = rarity, card = card});
	end
	
	local assets = game:GetService("ReplicatedStorage").Assets;
	local cardTemplate = assets.Card;
	local cardGuiTemplate = assets.Card_SurfaceGui
	
	local cardOffset = 1.5;
	
	local cframe = player.Character.HumanoidRootPart.CFrame;
	
	for i = 1, cardAmount do
		local cardClone = cardTemplate:Clone();
		local cardGui = cardGuiTemplate:Clone();
		
		local cardInfo = pulls[i];
		
		cardGui.Title.Text = cardInfo.card.title;
		
		cardGui.Rarity.Text = cardInfo.rarity;
		cardGui.Rarity.TextColor3 = CardService._cards.Colors[cardInfo.rarity];
		
		cardGui.Description.Text = cardInfo.card.description;
		cardGui.Effect.Text = cardInfo.card.effect;
		
		cardGui.Parent = player:FindFirstChild("PlayerGui").CardUI;
		cardGui.Adornee = cardClone;
		
		cardClone.Parent = workspace.Cards;
		
		local particles = assets[cardInfo.rarity.."Particles"]:Clone();
		particles.Parent = cardClone;
		
		local offset = cardOffset * (i - 1);
		
		local finalCFramePos = cframe * CFrame.new(-cardOffset + offset, 2, -5)
		
		cardClone.CFrame = CFrame.lookAt(finalCFramePos.Position, cframe.Position)
		cardClone.CanCollide = false;
		cardClone.Anchored = true;
		
		cardClone:SetAttribute("name", cardInfo.card.title);
		cardClone:SetAttribute("id", game:GetService("HttpService"):GenerateGUID(false))
		
		game:GetService("Debris"):AddItem(cardClone, 30);
		game:GetService("Debris"):AddItem(cardGui, 30);
		task.wait(0.5);
	end
end


return CardService