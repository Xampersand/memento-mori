import { Controller, OnInit } from "@flamework/core";
import Object from "@rbxts/object-utils";
import { ContentProvider, Players, ReplicatedStorage } from "@rbxts/services";

const AnimationFolder = ReplicatedStorage.FindFirstChild("Assets")!.WaitForChild("Animations")! as Folder;

type AnimationTree = {[key: string]: Animation};
type AnimationCache = {[key: string]: AnimationTrack};
type AnimationCallbackList = {[key: string]: () => void};

@Controller()
export class AnimationController implements OnInit {
	private tree: AnimationTree = {};
	private cache: AnimationCache = {};

	onInit() {
		for (const child of AnimationFolder.GetChildren()) {
			if (!child.IsA("Folder")) continue;
			for (const animation of child.GetChildren()) {
				if (!animation.IsA("Animation")) continue;
				this.tree[animation.Name] = animation;
			}
		}

		const preloadList = [];

		for (const [name, animation] of Object.entries(this.tree)) {
			preloadList.push(animation);
		}

		ContentProvider.PreloadAsync(preloadList);
	}

	public play(animationName: string, animationCallbackList: AnimationCallbackList): AnimationTrack | undefined {
		const animation = this.tree[animationName];
		if (!animation) return;

		const character = Players.LocalPlayer.Character;
		if (!character) return;

		const animator = character.FindFirstChild("Humanoid")?.FindFirstChild("Animator") as Animator | undefined;
		if (!animator) return;

		const track = animator.LoadAnimation(animation);
		track.Play(0.1, 1, 1);

		this.cache[animationName] = track;

		for (const [name, callback] of Object.entries(animationCallbackList)) {
			track.GetMarkerReachedSignal(name as string).Connect(() => {
				callback();
			});
			track.Stopped.Connect(() => {
				delete this.cache[animationName];
			});
		}

		return track;
	}

	public stop(animationName: string) {
		const animation = this.cache[animationName];
		if (animation) {
			animation.Stop();
			delete this.cache[animationName];
		} else {
			warn(`Animation not found: ${animationName}`);
		}
	}

	public stopAll() {
		for (const name of Object.keys(this.cache)) {
			this.stop(name as string);
		}
	}
}