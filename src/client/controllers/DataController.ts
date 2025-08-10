import { Controller, OnInit } from "@flamework/core";
import { PlayerData } from "shared/types";
import { Events } from "client/networking";

@Controller()
export class DataController implements OnInit {
	dataCache?: PlayerData;
	
	onInit() {
		Events.dataUpdate.connect((data) => {
			this.dataCache = data;
		})
	}

	get(): PlayerData | undefined {
		return this.dataCache;
	}
}