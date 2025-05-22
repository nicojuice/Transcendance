import * as BABYLON from "babylonjs";

let engine: BABYLON.Engine | null = null;

function startPongGame(canvas: HTMLCanvasElement) {
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  engine = new BABYLON.Engine(canvas, true);
  engine.resize();

  const scene = new BABYLON.Scene(engine);

  const camera = new BABYLON.FreeCamera("cam", new BABYLON.Vector3(0, 5, -10), scene);
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.attachControl(canvas, true);

  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);

  engine.runRenderLoop(() => {
    scene.render();
  });
}

function waitForCanvasAndStart() {
  const interval = setInterval(() => {
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement | null;
    if (!canvas) return;

    clearInterval(interval);
    startPongGame(canvas);
  }, 100);
}

window.addEventListener("resize", () => {
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement | null;
  if (!canvas) return;

  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  if (engine) engine.resize();
});

waitForCanvasAndStart();
