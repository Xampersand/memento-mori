import { Controller, Flamework, OnInit } from "@flamework/core";
import { UserInputService, Players } from "@rbxts/services";
import CameraPerspective = require("./CameraPerspective");

// Define interfaces for expected camera module APIs
interface ICameraUtils {
    setRotationTypeOverride(type: Enum.RotationType): void;
    setMouseBehaviorOverride(behavior: Enum.MouseBehavior): void;
    restoreRotationType(): void;
    restoreMouseBehavior(): void;
}

interface IBaseCamera {
    UpdateMouseBehavior(this: IBaseCamera): void;
    isCameraToggle: boolean;
    inFirstPerson: boolean;
    inMouseLockedMode: boolean;
}

interface ICameraUI {
    setCameraModeToastEnabled(enabled: boolean): void;
}

interface ICameraInput {
    enableCameraToggleInput(): void;
    disableCameraToggleInput(): void;
}

type CameraToggleStateControllerType = (inFirstPerson: boolean) => void;

@Controller()
export class CameraController implements OnInit {
    onInit() {
        CameraPerspective.init();
        const playerModule = Players.LocalPlayer.WaitForChild("PlayerScripts").WaitForChild("PlayerModule");
        const cameraModule = playerModule?.WaitForChild("CameraModule");
        if (!cameraModule) return;
        const CameraUtils = require(cameraModule.WaitForChild("CameraUtils") as ModuleScript) as ICameraUtils;
        const BaseCamera = require(cameraModule.WaitForChild("BaseCamera") as ModuleScript) as IBaseCamera;
        const CameraUI = require(cameraModule.WaitForChild("CameraUI") as ModuleScript) as ICameraUI;
        const CameraInput = require(cameraModule.WaitForChild("CameraInput") as ModuleScript) as ICameraInput;
        const CameraToggleStateController = require(cameraModule.WaitForChild("CameraToggleStateController") as ModuleScript) as CameraToggleStateControllerType;
        const UserGameSettings = UserSettings().GetService("UserGameSettings");

        let MouseLocked = true;
        UserInputService.MouseBehavior = Enum.MouseBehavior.LockCenter;
        let mouseBehavior: Enum.MouseBehavior = Enum.MouseBehavior.LockCenter;

        print(UserInputService.MouseBehavior);
        UserInputService.InputBegan.Connect((input, gameProcessed) => {
            if (gameProcessed) return;
            if (input.KeyCode === Enum.KeyCode.T) {
                MouseLocked = !MouseLocked;
                if (MouseLocked) {
                    mouseBehavior = Enum.MouseBehavior.LockCenter;
                    UserInputService.MouseBehavior = Enum.MouseBehavior.LockCenter;
                } else {
                    mouseBehavior = Enum.MouseBehavior.Default;
                    UserInputService.MouseBehavior = Enum.MouseBehavior.Default;
                }
            }
        });

        let debounce = false;

        // Patch BaseCamera's UpdateMouseBehavior
        BaseCamera.UpdateMouseBehavior = function(this: IBaseCamera) {
            const blockToggleDueToClickToMove = UserGameSettings.ComputerMovementMode === Enum.ComputerMovementMode.ClickToMove;
            if (this.isCameraToggle && !blockToggleDueToClickToMove) {
                CameraUI.setCameraModeToastEnabled(true);
                CameraInput.enableCameraToggleInput();
                CameraToggleStateController(this.inFirstPerson);
            } else {
                CameraUI.setCameraModeToastEnabled(false);
                CameraInput.disableCameraToggleInput();

                if (this.inFirstPerson || this.inMouseLockedMode) {
                    CameraUtils.setRotationTypeOverride(Enum.RotationType.CameraRelative);
                    if (!debounce) {
                        debounce = true;
                        CameraUtils.setMouseBehaviorOverride(mouseBehavior);
                    }
                } else {
                    debounce = false;
                    CameraUtils.restoreRotationType();
                    CameraUtils.restoreMouseBehavior();
                }
            }
        };

        print("<CameraController> initialized successfully!");
    }
}