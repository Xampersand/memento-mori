local IdleState = {};

function IdleState:init(stateMachine: typeof(script.Parent))
	IdleState.stateMachine = stateMachine;
	IdleState.slotEvent = game:GetService("ReplicatedStorage").Network.Slot;
end

function IdleState:enter()
	IdleState.stateMachine.animationController:play("tarnishedIdle");
end

function IdleState:input(inputObject: InputObject)
	
	local slotMap = {Enum.KeyCode.One, Enum.KeyCode.Two, Enum.KeyCode.Three, Enum.KeyCode.Four};
	local movementMap = {Enum.KeyCode.W, Enum.KeyCode.A, Enum.KeyCode.S, Enum.KeyCode.D};
	
	if (table.find(movementMap, inputObject.KeyCode)) then
		IdleState.stateMachine:changeState("WalkState");
	elseif table.find(slotMap, inputObject.KeyCode) then
		local index = table.find(slotMap, inputObject.KeyCode);
		IdleState.slotEvent:FireServer(index);
		local data = IdleState.stateMachine.dataController:get();
		IdleState.stateMachine:changeState("AttackState", data.equipped[index].animationId)
	end
end

function IdleState:exit()
	IdleState.stateMachine.animationController:stop("tarnishedIdle");
end

return IdleState;