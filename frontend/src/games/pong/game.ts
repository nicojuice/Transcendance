import * as BABYLON from "babylonjs";

export function main(engine: BABYLON.Engine, canvas: HTMLCanvasElement): void
{
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0, 0, 0, 1); // fond noir

  // Camera
  const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 20, -30), scene);
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.attachControl(canvas, true);

  // Lumière
  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.8;

  // Terrain
  const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 30, height: 20 }, scene);

  // Raquettes
  const paddleSize = { width: 0.5, height: 3, depth: 1 };
  const paddle1 = BABYLON.MeshBuilder.CreateBox("paddle1", paddleSize, scene);
  const paddle2 = BABYLON.MeshBuilder.CreateBox("paddle2", paddleSize, scene);
  paddle1.position.x = -14;
  paddle2.position.x = 14;

  // Balle
  const ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 1 }, scene);
  ball.position.z = 0;

  // Murs invisibles (haut et bas)
  const topWall = BABYLON.MeshBuilder.CreateBox("topWall", { width: 30, height: 1, depth: 1 }, scene);
  const bottomWall = BABYLON.MeshBuilder.CreateBox("bottomWall", { width: 30, height: 1, depth: 1 }, scene);
  topWall.position.z = -9.5;
  bottomWall.position.z = 9.5;
  topWall.isVisible = false;
  bottomWall.isVisible = false;

  // Mouvement de la balle
  let ballVelocity = new BABYLON.Vector3(0.15, 0, 0.12);

  // Contrôles clavier
  const inputMap: Record<string, boolean> = {};
  scene.actionManager = new BABYLON.ActionManager(scene);
  scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
    inputMap[evt.sourceEvent.key] = true;
  }));
  scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
    inputMap[evt.sourceEvent.key] = false;
  }));

  // Animation
  scene.onBeforeRenderObservable.add(() => {
    const delta = engine.getDeltaTime() / 16.666; // normalisé à ~60fps

    // Déplacement raquettes
    if (inputMap["w"] && paddle1.position.z > -8) paddle1.position.z -= 0.3 * delta;
    if (inputMap["s"] && paddle1.position.z < 8) paddle1.position.z += 0.3 * delta;
    if (inputMap["ArrowUp"] && paddle2.position.z > -8) paddle2.position.z -= 0.3 * delta;
    if (inputMap["ArrowDown"] && paddle2.position.z < 8) paddle2.position.z += 0.3 * delta;

    // Déplacement balle
    ball.position.addInPlace(ballVelocity);

    // Rebonds haut/bas
    if (ball.intersectsMesh(topWall, false) || ball.intersectsMesh(bottomWall, false)) {
      ballVelocity.z *= -1;
    }

    // Collision avec raquettes
    if (ball.intersectsMesh(paddle1, false) || ball.intersectsMesh(paddle2, false)) {
      ballVelocity.x *= -1;
    }

    // Score (balle sort du terrain)
    if (Math.abs(ball.position.x) > 16) {
      ball.position = BABYLON.Vector3.Zero();
      ballVelocity = new BABYLON.Vector3(0.15 * (Math.random() < 0.5 ? 1 : -1), 0, 0.12 * (Math.random() < 0.5 ? 1 : -1));
    }
  });

  engine.runRenderLoop(() => {
    scene.render();
  });
}