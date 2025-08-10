local Attacks = {};

Attacks.conflicts = {
	left = {
		counters = {"right"},
		parriedBy = {"up"},       -- up parries left
		counteredBy = {"downRight"}
	},
	right = {
		counters = {"up"},
		parriedBy = {"down"},     -- down parries right
		counteredBy = {"left"}
	},
	up = {
		counters = {"down"},
		parriedBy = {"left"},     -- left parries up
		counteredBy = {"right"}
	},
	down = {
		counters = {"upLeft"},
		parriedBy = {"right"},    -- right parries down
		counteredBy = {"up"}
	},
	upLeft = {
		counters = {"upRight"},
		parriedBy = {"downRight"}, -- downRight parries upLeft
		counteredBy = {"down"}
	},
	upRight = {
		counters = {"downLeft"},
		parriedBy = {"downLeft"},  -- downLeft parries upRight
		counteredBy = {"upLeft"}
	},
	downLeft = {
		counters = {"downRight"},
		parriedBy = {"upRight"},   -- upRight parries downLeft
		counteredBy = {"upRight"}
	},
	downRight = {
		counters = {"left"},
		parriedBy = {"upLeft"},    -- upLeft parries downRight
		counteredBy = {"downLeft"}
	}
}

-- -1 = No Interaction, 0 = Identical, 1 = A is countered, 2 = A counters, 3 = Parry
function Attacks.getConflictResult(A: string, B: string): number
	if (A == B) then
		print(A, "is identical to", B);
		return 0
	end;
	
	local conflicts = Attacks.conflicts[A];
	if not conflicts then return end
	
	local counters = conflicts.counters;
	local parriedBy = conflicts.parriedBy;
	local counteredBy = conflicts.counteredBy;
	
	local exists = table.find;
	
	if (exists(counteredBy, B)) then
		print(A, "gets countered by", B)
		return 1;
	elseif (exists(counters, B)) then
		print(B, "gets countered by", A)
		return 2;
	elseif (exists(parriedBy, B)) then
		print(A, "gets parried by", B)
		return 3;
	end
	
	print(A, "and", B, "go through")
	return -1;
end

return Attacks;