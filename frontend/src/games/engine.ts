import * as BABYLON from "@babylonjs/core";
import { EventManager } from '../eventManager';

export class GameEngine extends BABYLON.Engine {
  canvas: HTMLCanvasElement;
  inputMap: Record<string, boolean>;
  scene: BABYLON.Scene;

  OnDispose: EventManager;
  OnResize: EventManager;
  constructor(canvas: HTMLCanvasElement) {
    super(canvas, true, { antialias: true });
    this.canvas = canvas;
    this.enableOfflineSupport = false;
    this.renderEvenInBackground = false;
    this.scene = new BABYLON.Scene(this);
    this.inputMap = {};
    this.scene.actionManager = new BABYLON.ActionManager(this.scene);
    this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => this.inputMap[evt.sourceEvent.key] = true));
    this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => this.inputMap[evt.sourceEvent.key] = false));

    this.OnDispose = new EventManager();
    this.OnResize = new EventManager();
  }

  //Destructor
  dispose() {
    this.OnDispose.dispatch();
    this.scene.actionManager.dispose();
    this.scene.onAfterRenderObservable.clear();
    this.scene.onBeforeRenderObservable.clear();
    this.scene.dispose();
    this.stopRenderLoop();
    super.dispose();
    this.canvas.remove();
    this.canvas = null as any; // Set to null to avoid memory leaks
  }

  Resize() {
    this.canvas.style.width = window.innerWidth + "px";
    this.canvas.style.height = window.innerHeight + "px";
    const maxWidth = 1280;
    const widthRatio = window.innerWidth / maxWidth;
    const scaling = widthRatio;
    this.setHardwareScalingLevel(scaling);
    this.resize();
    this.OnResize.dispatch();
  }
}