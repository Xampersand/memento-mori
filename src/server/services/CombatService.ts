import { Service, OnStart } from "@flamework/core";
import { DataService } from "./DataService/index.js";
import { ProgressionService } from "./ProgressionService";
import { Events } from "server/networking.js";
import DataTemplate from "./DataService/DataTemplate.js";

@Service()
export class CombatService implements OnStart {
	constructor(private dataService: DataService, private progressionService: ProgressionService) {}
	getWeapon(character: Model): Model | undefined {
		let weapon;
		for (const item of character.GetChildren()) {
			if (item.HasTag("Weapon")) weapon = item as Model;
		}
		return weapon;
	}

	// Damages a target model by a damageAmount, returns whether the target was killed
	damage(target: Model, damageAmount: number): boolean {
		const isNPC = target.HasTag("NPC");
		if (!isNPC) return false;
		const hpMax = target.GetAttribute("hpMax") as number | undefined;
		const hp = target.GetAttribute("hp") as number | undefined;
		if (!hp || !hpMax) return false;

		const newHp = hp - damageAmount;

		if (newHp <= 0) {
			target.Destroy();
			return true;
		} else {
			target.SetAttribute("hp", newHp);
		}
		return false;
	}
	
	onStart() {
		Events.hit.connect((player: Player, target: Model) => {
			if (!target || !target.IsA("Model")) return;
			const character = player.Character;
			if (!character) return;

			const weapon = this.getWeapon(character);
			if (!weapon) return;

			const damageAmount = weapon.GetAttribute("BaseDamage") as number | undefined ?? 1;
			const damageModifier = weapon.GetAttribute("DamageModifier") as keyof typeof DataTemplate["stats"] | undefined ?? "str";

			const data = this.dataService.get(player);
			if (!data) return;

			const finalDamage = damageAmount * (1 + data.stats[damageModifier]);

			const killed = this.damage(target, finalDamage);

			if (killed) {
				const xp = target.GetAttribute("xp") as number | undefined ?? 0;
				this.progressionService.addXP(player, xp);
			}
		});
	}
}