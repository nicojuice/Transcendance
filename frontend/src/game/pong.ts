// src/main.ts
import * as BABYLON from "babylonjs";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
camera.setTarget(BABYLON.Vector3.Zero());
camera.attachControl(canvas, true);

new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 2, 0), scene);
BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 1 }, scene);

engine.runRenderLoop(() => scene.render());
