import { Players } from "@rbxts/services";
import { Service, OnInit } from "@flamework/core";
import ProfileStore from "@rbxts/profile-store";

import DataTemplate from "./DataTemplate";
import { Events } from "server/networking";

const DataStoreKey = "Debug_Key_001"
	
const playerStore = ProfileStore.New(DataStoreKey, DataTemplate).Mock;

@Service({})
export class DataService implements OnInit {
	profiles: Map<Player, ReturnType<typeof playerStore.StartSessionAsync>> = new Map();

	playerAdded(player: Player) {
		const profile = playerStore.StartSessionAsync(`DebugData_${player.UserId}`, {
			Cancel: () => {
				return player.Parent !== Players;
			}
		});

		if (profile) {
			profile.AddUserId(player.UserId);
			profile.Reconcile();

			profile.OnSessionEnd.Connect(() => {
				this.profiles.delete(player);
				player.Kick(`Profile session end - Please rejoin`);
			})

			if (player.Parent === Players) {
				this.profiles.set(player, profile);
				print(`Profile loaded for ${player.Name}`);
				Events.dataUpdate(player, profile.Data);
				task.delay(2, () => {
					Events.dataUpdate(player, profile.Data);
				})
			} else profile.EndSession();
		} else player.Kick(`Profile load fail - Please rejoin`);
	}

	onInit() {
		for (const player of Players.GetPlayers()) {
			this.playerAdded(player);
		}
		Players.PlayerAdded.Connect((player) => this.playerAdded(player));

		Players.PlayerRemoving.Connect((player) => {
			const profile = this.profiles.get(player);
			if (profile) {
				profile.EndSession();
				this.profiles.delete(player);
			}
		});
	}

	get(player: Player): typeof DataTemplate | undefined {
		const profile = this.profiles.get(player);
		return profile ? profile.Data : undefined;
	}

	set<K extends keyof typeof DataTemplate>(player: Player, key: K, data: (typeof DataTemplate)[K]) {
		const profile = this.profiles.get(player);
		if (profile) {
			profile.Data[key] = data;
		}
	}

	update(player: Player, updateFunc: (data: typeof DataTemplate) => void) {
		const profile = this.profiles.get(player);
		if (profile) {
			updateFunc(profile.Data);
		}
	}
}
