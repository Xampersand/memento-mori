local AttackState = {};

function AttackState:init(stateMachine: typeof(script.Parent))
	AttackState.stateMachine = stateMachine;
end

function AttackState:enter(lastState, animation)
	AttackState.stateMachine.animationController:stopAll()
	
	local hitboxId;
	
	local attackTrack = AttackState.stateMachine.animationController:play(animation, {
		HitStart = 	function()
			hitboxId = AttackState.stateMachine.combatController:startHitbox();
		end,
		HitEnd = function()
			AttackState.stateMachine.combatController:stopHitbox(hitboxId);
		end,
	});
	attackTrack.Stopped:Once(function()
		AttackState.stateMachine:changeState(lastState)
	end)
end

function AttackState:input(inputObject: InputObject)
	
end

function AttackState:exit()

end

return AttackState;