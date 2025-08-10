local WalkState = {};

function WalkState:init(stateMachine: typeof(script.Parent))
	WalkState.stateMachine = stateMachine;
end

function WalkState:enter(lastState: string)
	WalkState.lastState = lastState;
	WalkState.character = game:GetService("Players").LocalPlayer.Character :: Model;
	WalkState.humanoid = WalkState.character:FindFirstChild("Humanoid") :: Humanoid;

	--if (lastState == "IdleState") then
	--	WalkState.stateMachine.animationController:playLayer("walk", "Lower");
	--	WalkState.stateMachine.animationController:playLayer("idleSword", "Upper");
	--else
		WalkState.stateMachine.animationController:play("walk");
	--end
end

function WalkState:update(dt: number)
	if (WalkState.humanoid.MoveDirection.Magnitude < 0.01) then
		WalkState.stateMachine:changeState("IdleState");
	end
end

function WalkState:input()
	
end

function WalkState:exit()
	--if (WalkState.lastState == "IdleState") then
	--	WalkState.stateMachine.animationController:stopAllLayers();
	--else
		WalkState.stateMachine.animationController:stop("walk");
	--end
end

return WalkState;