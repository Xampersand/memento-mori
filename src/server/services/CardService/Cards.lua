local Cards = {}

Cards.Colors = {
	Common = Color3.fromRGB(255, 255, 255),
	Uncommon = Color3.fromRGB(0, 255, 0),
	Rare = Color3.fromRGB(0, 0, 255),
	Epic = Color3.fromRGB(120, 0, 255),
	Legendary = Color3.fromRGB(255, 200, 0),
	Mythical = Color3.fromRGB(255, 0, 0),
}

Cards.Weights = {
	{rarity = "Common", weight = 4},
	{rarity ="Uncommon", weight = 3},
	{rarity = "Rare", weight = 3},
	--{"Epic", 5},
	--{"Legendary", 4},
	--{"Mythical", 1}
}

Cards.List = {
	Common = {
		{
			title = "Strength+",
			description = "You get a little stronger",
			effect = "+0.1 STR",
			action = "add_data",
			data = {key = "stats/str", value = 0.1}
		},
		{
			title = "Agility+",
			description = "You get a little faster",
			effect = "+0.1 AGI",
			action = "add_data",
			data = {key = "stats/agi", value = 0.1}
		},
		{
			title = "Intelligence+",
			description = "You get a little smarter",
			effect = "+0.1 INT",
			action = "add_data",
			data = {key = "stats/int", value = 0.1}
		},
		{
			title = "Constitution+",
			description = "You get a little tougher",
			effect = "+0.1 CON",
			action = "add_data",
			data = {key = "stats/con", value = 0.1}
		},
	},
	Uncommon = {
		{
			title = "Strength++",
			description = "You get a little stronger-er",
			effect = "+0.2 STR",
			action = "add_data",
			data = {key = "stats/str", value = 0.2}
		},
		{
			title = "Agility++",
			description = "You get a little faster-er",
			effect = "+0.2 AGI",
			action = "add_data",
			data = {key = "stats/agi", value = 0.2}
		},
		{
			title = "Intelligence++",
			description = "You get a little smarter-er",
			effect = "+0.2 INT",
			action = "add_data",
			data = {key = "stats/int", value = 0.2}
		},
		{
			title = "Constitution++",
			description = "You get a little tougher-er",
			effect = "+0.2 CON",
			action = "add_data",
			data = {key = "stats/con", value = 0.2}
		},
	},
	Rare = {
		{
			title = "Mega Strength",
			description = "Well damn, you're pretty strong.",
			effect = "+1 STR",
			action = "add_data",
			data = {key = "stats/str", value = 1}
		},
		{
			title = "Sneak Maxxing",
			description = "...where'd you go?",
			effect = "+1 AGI",
			action = "add_data",
			data = {key = "stats/agi", value = 1}
		},
		{
			title = "Uhmm.. Ackshually",
			description = "Whatever you say bro",
			effect = "+1 INT",
			action = "add_data",
			data = {key = "stats/int", value = 1}
		},
		{
			title = "Mountain-like Man",
			description = "You've... got your back?",
			effect = "+1 CON",
			action = "add_data",
			data = {key = "stats/con", value = 1}
		},
	}
}

return Cards;