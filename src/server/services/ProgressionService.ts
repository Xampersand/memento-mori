import { Service, OnStart } from "@flamework/core";
import { DataService } from "./DataService/index.js";

@Service({})
export class ProgressionService {
	constructor(private dataService: DataService) {}
	
	getMaxXP(level: number) {
		return level * 2;
	}

	addXP(player: Player, xp: number) {
		const data = this.dataService.get(player);
		if (!data) return;

		const level = data.level;
		const currentXP = data.xp;

		let levelsGained = 0;
		let newXP = currentXP + xp;
		let currentMaxXP = this.getMaxXP(level);

		while (newXP >= currentMaxXP) {
			levelsGained++;
			newXP -= currentMaxXP;
			currentMaxXP = this.getMaxXP(level + levelsGained);
		}

		this.dataService.update(player, (data) => {
			data.level += levelsGained;
			data.xp = newXP;
			data.xpMax = currentMaxXP;
		})

		if (levelsGained > 0) {
			print("Good job!")
		}
	}
}
