import * as BABYLON from "babylonjs";

function handleBallCollisions(
  ball: BABYLON.Mesh,
  paddle1: BABYLON.Mesh,
  paddle2: BABYLON.Mesh,
  ballVelocity: BABYLON.Vector3
): void {
  const halfFieldZ = 9.5;
  const paddleHalfHeight = 1.5; // paddle depth / 2
  const paddleWidth = 0.5;
  const ballRadius = 0.5;

  // Rebond haut/bas (Z)
  if (ball.position.z >= halfFieldZ || ball.position.z <= -halfFieldZ) {
    ballVelocity.z *= -1;
    ball.position.z = BABYLON.Scalar.Clamp(ball.position.z, -halfFieldZ, halfFieldZ);
  }

  // Rebond paddle1 (gauche)
  if (
    ball.position.x - ballRadius <= paddle1.position.x + paddleWidth / 2 &&
    ball.position.x - ballRadius >= paddle1.position.x - paddleWidth / 2 &&
    ball.position.z >= paddle1.position.z - paddleHalfHeight &&
    ball.position.z <= paddle1.position.z + paddleHalfHeight &&
    ballVelocity.x < 0
  ) {
    ballVelocity.x *= -1;
    const dz = ball.position.z - paddle1.position.z;
    ballVelocity.z += dz * 0.03;
    ball.position.x = paddle1.position.x + paddleWidth / 2 + ballRadius;
  }

  // Rebond paddle2 (droite)
  if (
    ball.position.x + ballRadius >= paddle2.position.x - paddleWidth / 2 &&
    ball.position.x + ballRadius <= paddle2.position.x + paddleWidth / 2 &&
    ball.position.z >= paddle2.position.z - paddleHalfHeight &&
    ball.position.z <= paddle2.position.z + paddleHalfHeight &&
    ballVelocity.x > 0
  ) {
    ballVelocity.x *= -1;
    const dz = ball.position.z - paddle2.position.z;
    ballVelocity.z += dz * 0.03;
    ball.position.x = paddle2.position.x - paddleWidth / 2 - ballRadius;
  }
}

export function main(engine: BABYLON.Engine, canvas: HTMLCanvasElement): void
{
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0, 0, 0, 1); // fond noir

  // Camera
  /*const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 20, -30), scene);
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.attachControl(canvas, true);*/


  const camera = new BABYLON.ArcRotateCamera("cam", Math.PI, Math.PI / 3, 35, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, false);

  camera.lowerRadiusLimit = camera.upperRadiusLimit = camera.radius;
  camera.lowerBetaLimit = camera.upperBetaLimit = camera.beta;
  camera.lowerAlphaLimit = camera.upperAlphaLimit = camera.alpha;

  // Lumière
  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.8;

  // Terrain
  BABYLON.MeshBuilder.CreateGround("ground", { width: 30, height: 20 }, scene);

  // Raquettes
  const paddleSize = { width: 0.5, height: 0.5, depth: 3 };
  const paddle1 = BABYLON.MeshBuilder.CreateBox("paddle1", paddleSize, scene);
  const paddle2 = BABYLON.MeshBuilder.CreateBox("paddle2", paddleSize, scene);
  paddle1.position.y = paddleSize.height;
  paddle2.position.y = paddleSize.height;
  paddle1.position.x = -14;
  paddle2.position.x = 14;

  // Balle
  const ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 1 }, scene);
  ball.position.y = 0.5;
  ball.position.z = 0;

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

    // Gestion des collisions
    handleBallCollisions(ball, paddle1, paddle2, ballVelocity);

    // Reset si la balle sort
    if (Math.abs(ball.position.x) > 16) {
      ball.position = new BABYLON.Vector3(0, 0.5, 0);
      ballVelocity = new BABYLON.Vector3(
        0.15 * (Math.random() < 0.5 ? 1 : -1),
        0,
        0.12 * (Math.random() < 0.5 ? 1 : -1)
      );
    }
  });

  engine.runRenderLoop(() => {
    scene.render();
  });
}