import { Controller, OnInit } from "@flamework/core";

@Controller({})
export class TestController implements OnInit {
    onInit() {
        print("TestController initialized");
    }
}
