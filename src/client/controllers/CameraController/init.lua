local CameraController = {}

function CameraController:init(debugMode)
	for _, child in script:GetChildren() do
		local module = require(child);
		task.spawn(function()
			module:init();
		end);
	end
	
	local UIS = game:GetService("UserInputService")

	local cameraModule = script.Parent.Parent:WaitForChild("PlayerModule"):WaitForChild("CameraModule")

	local CameraUtils = require(cameraModule:WaitForChild("CameraUtils"))
	local BaseCamera = require(cameraModule:WaitForChild("BaseCamera"))
	local CameraUI = require(cameraModule:WaitForChild("CameraUI"))
	local CameraInput = require(cameraModule:WaitForChild("CameraInput"))
	local CameraToggleStateController = require(cameraModule:WaitForChild("CameraToggleStateController"))

	local UserGameSettings = UserSettings():GetService("UserGameSettings")

	local MouseLocked = true

	UIS.MouseBehavior = Enum.MouseBehavior.LockCenter

	local mouseBehavior = Enum.MouseBehavior.LockCenter
	UIS.InputBegan:Connect(function(input, gameProcessed)
		if gameProcessed then return end --exit function if they are typing

		if input.KeyCode == Enum.KeyCode.T then
			MouseLocked = not MouseLocked --turn mouselocked to true if false, false if true

			if MouseLocked then --if true then lock mouse
				mouseBehavior = Enum.MouseBehavior.LockCenter
				UIS.MouseBehavior = Enum.MouseBehavior.LockCenter

			else
				mouseBehavior = Enum.MouseBehavior.Default
				UIS.MouseBehavior = Enum.MouseBehavior.Default
			end
		end
	end)

	local debounce = false

	BaseCamera.UpdateMouseBehavior = function(self)
		local blockToggleDueToClickToMove = UserGameSettings.ComputerMovementMode == Enum.ComputerMovementMode.ClickToMove

		if self.isCameraToggle and blockToggleDueToClickToMove == false then
			CameraUI.setCameraModeToastEnabled(true)
			CameraInput.enableCameraToggleInput()
			CameraToggleStateController(self.inFirstPerson)
		else
			CameraUI.setCameraModeToastEnabled(false)
			CameraInput.disableCameraToggleInput()

			-- first time transition to first person mode or mouse-locked third person
			if self.inFirstPerson or self.inMouseLockedMode then
				CameraUtils.setRotationTypeOverride(Enum.RotationType.CameraRelative)
				if not debounce then
					debounce = true
					CameraUtils.setMouseBehaviorOverride(mouseBehavior)
				end
			else
				debounce = false
				CameraUtils.restoreRotationType()
				CameraUtils.restoreMouseBehavior()
			end
		end
	end
	
	if (debugMode) then
		print("<CameraController> initialized successfully!")
	end
end

return CameraController;