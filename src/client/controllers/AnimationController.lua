--!strict

local AnimationController = {}

local ContentProvider = game:GetService("ContentProvider");
local ReplicatedStorage = game:GetService("ReplicatedStorage");
local Players = game:GetService("Players");

type AnimationTree = {[string]: {[string]: Animation}};
type AnimationCache = {[string]: AnimationTrack};

type AnimationMarkerCallbacks = {[string]: () -> nil};

type AnimationLayerCache = {[string]: AnimationTrack};
AnimationController.layeredCache = {} :: AnimationLayerCache;

AnimationController.tree = {} :: AnimationTree;
AnimationController.cache = {} :: AnimationCache;

local function getFromTree(animationName: string): Animation?
	for kind, animations in AnimationController.tree do
		for name, animation in animations do
			if name == animationName then
				return animation;
			end
		end
	end
	return nil;
end

function AnimationController:init(debugMode)
	local animationFolder = ReplicatedStorage.Assets.Animations;
	for _, kind in animationFolder:GetChildren() do
		AnimationController.tree[kind.Name] = {};
		for _, animation in kind:GetChildren() do
			AnimationController.tree[kind.Name][animation.Name] = animation;
		end
	end
	
	local preloadList = {}
	
	for kind, animations in AnimationController.tree do
		for name, animation in animations do
			table.insert(preloadList, animation);
		end
	end
	
	ContentProvider:PreloadAsync(preloadList);
	
	if (debugMode) then
		print("<AnimationController> initialized successfully!")
	end
end

function AnimationController:play(animationName: string, callbacks: AnimationMarkerCallbacks?): AnimationTrack?
	if (AnimationController.cache[animationName]) then return end;
	
	local animation = getFromTree(animationName);
	if (animation == nil) then return end;
	
	local player: Player? = Players.LocalPlayer;
	if (player == nil) then return end;
	
	local character: Model? = player.Character;
	if (character == nil) then return end;
	
	local humanoid = character:FindFirstChild("Humanoid");
	if (humanoid == nil or not humanoid:IsA("Humanoid")) then return end;
	
	local animator = humanoid:FindFirstChild("Animator");
	if (animator == nil or not animator:IsA("Animator")) then return end;
	
	local animationTrack = animator:LoadAnimation(animation);

	AnimationController.cache[animationName] = animationTrack;
	
	if (callbacks) then
		for markerName, callback in callbacks do
			animationTrack:GetMarkerReachedSignal(markerName):Once(callback);
		end
	end
	
	animationTrack:Play(0.1, 1, 1);
	
	return animationTrack;
end

function AnimationController:playLayer(animationName: string, layer: string): AnimationTrack?
	local sanitizedName = animationName .. "_" .. layer;
	local animation = getFromTree(sanitizedName)
	
	if animation == nil then return nil end
	local player = Players.LocalPlayer
	if not player or not player.Character then return nil end

	local humanoid = player.Character:FindFirstChildOfClass("Humanoid")
	if not humanoid then return nil end

	local animator = humanoid:FindFirstChildOfClass("Animator")
	if not animator then return nil end

	-- Stop any existing animation in this layer
	if AnimationController.layeredCache[layer] then
		AnimationController.layeredCache[layer]:Stop()
	end

	-- Load and play new animation
	local animationTrack = animator:LoadAnimation(animation)
	animationTrack:Play(0.1, 1, 1)

	-- Save this animation to the layer cache
	AnimationController.layeredCache[layer] = animationTrack

	return animationTrack
end


function AnimationController:stop(animationName: string): boolean
	local animationTrack = AnimationController.cache[animationName];
	
	if (animationTrack == nil) then return false end;
	
	animationTrack:Stop();
	
	AnimationController.cache[animationName] = nil;
	return true;
end

function AnimationController:stopLayer(layer: string): boolean
	local animationTrack = AnimationController.layeredCache[layer];

	if (animationTrack == nil) then return false end;

	animationTrack:Stop();

	AnimationController.layeredCache[layer] = nil;
	return true;
end

function AnimationController:stopAll()
	for animationName, animationTrack in AnimationController.cache do
		animationTrack:Stop()
	end
	AnimationController.cache = {};
end

function AnimationController:stopAllLayers()
	for layer, animationTrack in AnimationController.layeredCache do
		animationTrack:Stop()
	end
	AnimationController.layeredCache = {};
end

return AnimationController;