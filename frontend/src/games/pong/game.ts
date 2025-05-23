import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";


function handleBallCollisions(
  ball: BABYLON.Mesh,
  paddle1: BABYLON.Mesh,
  paddle2: BABYLON.Mesh,
  ballVelocity: BABYLON.Vector3
): void {
  const halfFieldZ = 9.5;
  const ballRadius = 0.5;

  // Capsule info (alignée sur Z)
  const paddleRadius = 0.25;
  const paddleLength = 3 + (paddleRadius * 2);
  const paddleHalfLength = paddleLength / 2;

  // Rebond haut/bas
  if (ball.position.z >= halfFieldZ || ball.position.z <= -halfFieldZ) {
    ballVelocity.z *= -1;
    ball.position.z = BABYLON.Scalar.Clamp(ball.position.z, -halfFieldZ, halfFieldZ);
  }

  // Rebond paddle1 (gauche)
  if (
    ball.position.x - ballRadius <= paddle1.position.x + paddleRadius &&
    ball.position.x - ballRadius >= paddle1.position.x - paddleRadius &&
    ball.position.z >= paddle1.position.z - paddleHalfLength &&
    ball.position.z <= paddle1.position.z + paddleHalfLength &&
    ballVelocity.x < 0
  ) {
    ballVelocity.x *= -1;
    const dz = ball.position.z - paddle1.position.z;
    ballVelocity.z += dz * 0.03;
    ball.position.x = paddle1.position.x + paddleRadius + ballRadius;
  }

  // Rebond paddle2 (droite)
  if (
    ball.position.x + ballRadius >= paddle2.position.x - paddleRadius &&
    ball.position.x + ballRadius <= paddle2.position.x + paddleRadius &&
    ball.position.z >= paddle2.position.z - paddleHalfLength &&
    ball.position.z <= paddle2.position.z + paddleHalfLength &&
    ballVelocity.x > 0
  ) {
    ballVelocity.x *= -1;
    const dz = ball.position.z - paddle2.position.z;
    ballVelocity.z += dz * 0.03;
    ball.position.x = paddle2.position.x - paddleRadius - ballRadius;
  }
}




export function main(engine: BABYLON.Engine, canvas: HTMLCanvasElement): void
{
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0, 0, 0, 1); // fond noir










  const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

  const pingText = new GUI.TextBlock();
  pingText.text = "Ping: ...";
  pingText.color = "white";
  pingText.fontSize = 24;
  pingText.top = "-45%";
  pingText.left = "-45%";
  pingText.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  pingText.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  advancedTexture.addControl(pingText);


  let lastPingSent = 0;
  //let currentPing = 0;

  // WebSocket
  const socket = new WebSocket("ws://localhost:8180");
  socket.binaryType = "arraybuffer"; // et décodes à la main

  socket.addEventListener("open", () => {
    setInterval(() => {
      lastPingSent = performance.now();
      socket.send(JSON.stringify({ type: "ping", timestamp: lastPingSent }));
    }, 1000); // toutes les secondes
  });



  socket.addEventListener("message", async (event) => {
    let data: any;

    if (event.data instanceof Blob) {
      const text = await event.data.text();
      data = JSON.parse(text);
    } else {
      data = JSON.parse(event.data);
    }

    //console.log("Message from server:", data);

    if (data.type === "pong") {
      const now = performance.now();
      const ping = Math.round(now - data.timestamp);
      pingText.text = `Ping: ${ping} ms`;
      //console.log(`Ping: ${ping} ms`);
    }
  });




















  // === Caméra fixe ===
  const camera = new BABYLON.ArcRotateCamera("cam", Math.PI, Math.PI / 3, 35, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, false);
  function updateCameraRadius() {
    const fieldWidth = 35;
    const canvasAspect = canvas.width / canvas.height;
    const fov = camera.fov; // en radians, vertical FOV (par défaut π/3)

    // Convertir FOV vertical en FOV horizontal selon l’aspect
    const fovH = 2 * Math.atan(Math.tan(fov / 2) * canvasAspect);

    // Calcul du rayon minimal pour voir toute la largeur
    const requiredRadius = (fieldWidth / 2) / Math.sin(fovH / 2);

    camera.radius = requiredRadius;
    camera.lowerRadiusLimit = camera.upperRadiusLimit = requiredRadius;
  }
  camera.alpha = Math.PI / 2; // vue de côté
  camera.lowerAlphaLimit = camera.upperAlphaLimit = camera.alpha;
  camera.lowerBetaLimit = camera.upperBetaLimit = camera.beta;
  updateCameraRadius();

  

  // === Lumière ===
  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.5;

  // === GlowLayer pour effet néon ===
  const glow = new BABYLON.GlowLayer("glow", scene);
  glow.intensity = 0.5;

  // === Matériaux néon avec diffusion visible ===
  const paddleMat = new BABYLON.StandardMaterial("paddleMat", scene);
  paddleMat.emissiveColor = new BABYLON.Color3(0.0, 1.0, 0.3); // vert néon
  paddleMat.diffuseColor = paddleMat.emissiveColor;

  const ballMat = new BABYLON.StandardMaterial("ballMat", scene);
  ballMat.emissiveColor = new BABYLON.Color3(1.0, 0.0, 0.6); // rose néon
  ballMat.diffuseColor = ballMat.emissiveColor;

  const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
  groundMat.emissiveColor = new BABYLON.Color3(0.1, 0.2, 1.0); // bleu néon
  groundMat.diffuseColor = groundMat.emissiveColor;
  groundMat.alpha = 0.4;

  // === Terrain ===
  const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 30, height: 20 }, scene);
  ground.material = groundMat;

  // === Raquettes ===
  const paddleRadius = 0.25;
  const paddleLength = 3;

  const paddle1 = BABYLON.MeshBuilder.CreateCapsule("paddle1", {
    radius: paddleRadius,
    height: paddleLength,
    subdivisions: 6,
    tessellation: 12
  }, scene);

  const paddle2 = paddle1.clone("paddle2");

  // Appliquer la rotation pour les rendre horizontales
  const rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);
  paddle1.rotation = rotation.clone();
  paddle2.rotation = rotation.clone();

  const yOffset = paddleRadius + 0.01;
  paddle1.position.set(-14, yOffset, 0);
  paddle2.position.set(14, yOffset, 0);
  paddle1.material = paddleMat;
  paddle2.material = paddleMat;

  // === Balle ===
  const ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 1 }, scene);
  ball.position.y = 0.5;
  ball.position.z = 0;
  ball.material = ballMat;

  // === Mouvement de la balle ===
  let ballVelocity = new BABYLON.Vector3(0.15, 0, 0.12);

  // === Contrôles clavier ===
  const inputMap: Record<string, boolean> = {};
  scene.actionManager = new BABYLON.ActionManager(scene);
  scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
    inputMap[evt.sourceEvent.key] = true;
  }));
  scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
    inputMap[evt.sourceEvent.key] = false;
  }));

  // === Animation ===
  scene.onBeforeRenderObservable.add(() => {
    const delta = engine.getDeltaTime() / 16.666;

    const speed = 0.3;
    // Déplacement raquettes
    if (inputMap["w"] && paddle1.position.z > -8) paddle1.position.z -= speed * delta;
    if (inputMap["s"] && paddle1.position.z < 8) paddle1.position.z += speed * delta;
    if (inputMap["ArrowUp"] && paddle2.position.z > -8) paddle2.position.z -= speed * delta;
    if (inputMap["ArrowDown"] && paddle2.position.z < 8) paddle2.position.z += speed * delta;

    // Déplacement balle
    ball.position.addInPlace(ballVelocity);

    // Collisions (à implémenter ou déjà faite ailleurs)
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

  window.addEventListener("resize", () => {
    updateCameraRadius();
  });
}