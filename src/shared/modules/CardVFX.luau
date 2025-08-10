local CardVFX = {};

local TweenService = game:GetService("TweenService")
local CardTweenInfo = {
	Common = TweenInfo.new(1),
	Rare = TweenInfo.new(1.5),
	Mythical = TweenInfo.new(3, Enum.EasingStyle.Quad, Enum.EasingDirection.In),
}

local Colors = {
	Common = Color3.fromRGB(255, 255, 255);
	Rare = Color3.fromRGB(0, 0, 255);
	Mythical = Color3.fromRGB(255, 0, 0);
}

local function typeWrite(guiObject, text, delayBetweenChars)
	guiObject.Visible = true
	guiObject.AutoLocalize = false
	local displayText = text

	displayText = displayText:gsub("<br%s*/>", "\n")
	displayText = displayText:gsub("<[^<>]->", "")

	guiObject.Text = displayText

	local index = 0
	for first, last in utf8.graphemes(displayText) do
		index += 1
		guiObject.MaxVisibleGraphemes = index
		task.wait(delayBetweenChars)
	end
end

function CardVFX:Claim(card, ui)
	local rarity = card:GetAttribute("Rarity");
	if (not rarity) then return end;
	local cardTween = TweenService:Create(card, CardTweenInfo[rarity], {
		Color = Colors[rarity];
		Transparency = 1
	})
	
	local label = ui.Parent.Parent.Regress.Monologue;
	local effect = ui.Effect.Text;
	cardTween.Completed:Once(function()
		typeWrite(label, effect .. "!", 0.1);
		task.wait(1);
		label.Text = "";
		card:Destroy()
		ui:Destroy()
	end)
	
	for _, child in ui:GetChildren() do
		if (child:IsA("TextLabel")) then
			local childTween = TweenService:Create(child, CardTweenInfo[rarity], {
				BackgroundTransparency = 1;
				TextTransparency = 1;
			})
			childTween.Completed:Once(function()
				child:Destroy()
			end)
			childTween:Play()
		elseif (child:IsA("Frame")) then
			local childTween = TweenService:Create(child, CardTweenInfo[rarity], {
				BackgroundTransparency = 1;
			})
			childTween.Completed:Once(function()
				child:Destroy()
			end)
			childTween:Play()
		end
	end
	
	cardTween:Play();
	local particles = card:FindFirstChildWhichIsA("ParticleEmitter");
	if (particles) then
		particles.SpreadAngle = Vector2.new(-360, 360)
		particles.Enabled = false;
	end
end

function CardVFX:Regress(ui)
	local monologue = {
		"Did you really think you could swim against the river of time?",
		"Foolish mortal.",
		"Your life has ended. Your light cedes to exist. Your tale is over. All that's left is your will...",
		"...but it refuses.",
		"Very well. This is your second... and last chance.",
		"Do not disappoint me.",
		"Farewell."
	}
	
	local label = ui.Monologue;
	
	task.wait(2);
	typeWrite(label, "...", 0.15);
	task.wait(2);
	typeWrite(label, monologue[1], 0.05);
	task.wait(1)
	typeWrite(label, monologue[2], 0.075);
	task.wait(1)
	typeWrite(label, monologue[3], 0.05);
	task.wait(2)
	typeWrite(label, monologue[4], 0.2);
	task.wait(2)
	typeWrite(label, monologue[5], 0.075);
	task.wait(1)
	typeWrite(label, monologue[6], 0.075);
	task.wait(1.5)
	typeWrite(label, monologue[7], 0.15);
	task.wait(0.5);
	label.Text = "";
	
	local CC = Instance.new("ColorCorrectionEffect");
	CC.Parent = game.Lighting;
	
	TweenService:Create(CC, TweenInfo.new(4, Enum.EasingStyle.Sine), {
		Brightness = -0.5,
		Contrast = 1,
		Saturation = -1
	}):Play();
	
	local cameraTween = TweenService:Create(workspace.CurrentCamera, TweenInfo.new(0.5, Enum.EasingStyle.Linear, Enum.EasingDirection.Out, -1, true), {
		FieldOfView = 120
	})
	cameraTween:Play();
	
	local colorTween1 = TweenService:Create(CC, TweenInfo.new(1, Enum.EasingStyle.Linear, Enum.EasingDirection.In), {
		TintColor = Color3.fromRGB(255, 0, 0)
	})
	
	local colorTween2 = TweenService:Create(CC, TweenInfo.new(1, Enum.EasingStyle.Linear, Enum.EasingDirection.In), {
		TintColor = Color3.fromRGB(0, 255, 0)
	})
	
	local colorTween3 = TweenService:Create(CC, TweenInfo.new(1, Enum.EasingStyle.Linear, Enum.EasingDirection.In), {
		TintColor = Color3.fromRGB(0, 0, 255)
	})
	
	local colorTween4 = TweenService:Create(CC, TweenInfo.new(1, Enum.EasingStyle.Linear, Enum.EasingDirection.In), {
		TintColor = Color3.fromRGB(255, 255, 255)
	})
	
	local colorTween5 = TweenService:Create(CC, TweenInfo.new(1, Enum.EasingStyle.Linear, Enum.EasingDirection.In), {
		TintColor = Color3.fromRGB(0, 0, 0)
	})
	
	colorTween1:Play();
	task.wait(1);
	colorTween2:Play();
	task.wait(1);
	colorTween3:Play();
	task.wait(1);
	colorTween4:Play();
	task.wait(1);
	colorTween5:Play();
	task.wait(1);
	CC.Brightness = -1;
	
	cameraTween:Cancel();
	cameraTween:Destroy();
	local humanoid: Humanoid = game.Players.LocalPlayer.Character.Humanoid;
	humanoid.Health = 0;

	task.wait(2)
	workspace.CurrentCamera.FieldOfView = 70;
	CC:Destroy();
end

return CardVFX;