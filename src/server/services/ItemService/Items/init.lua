local Items = {}

for _, module in ipairs(script:GetChildren()) do
	local category = require(module)
	for _, item in category do
		table.insert(Items, item)
	end
end

return Items;