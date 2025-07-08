import * as BABYLON from "@babylonjs/core";
import * as Engine from "../engine";
import * as Entities from "./entities";
import { buildTerrain } from "./spawn";
import * as GUI from "@babylonjs/gui";

// === Main game function ===
export function main(engine: Engine.GameEngine): void {
  const scene = engine.scene;
  scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

  const popupContainer = engine.ui.getControlByName("popupContainer") as GUI.Rectangle;
  popupContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;

  // Create camera
  const camera = new BABYLON.ArcRotateCamera("cam", Math.PI, Math.PI / 3, 35, BABYLON.Vector3.Zero(), scene);
  camera.inputs.clear();
  camera.attachControl(engine.canvas, false);
  camera.alpha = -Math.PI / 2;
  camera.lowerAlphaLimit = camera.upperAlphaLimit = camera.alpha;
  camera.lowerBetaLimit = camera.upperBetaLimit = camera.beta;

  const bgPlane = BABYLON.MeshBuilder.CreatePlane("bg", { width: 100, height: 50 }, scene);
  bgPlane.parent = camera;
  bgPlane.position = new BABYLON.Vector3(0, 0, 75);
  bgPlane.rotation = new BABYLON.Vector3(0, Math.PI, 0);

  const bgMat = new BABYLON.StandardMaterial("bgMat", scene);
  bgMat.diffuseTexture = new BABYLON.Texture("/assets/pink.png", scene);
  bgMat.emissiveTexture = bgMat.diffuseTexture;
  bgMat.backFaceCulling = false;
  bgPlane.material = bgMat;

  const updateCameraRadius = () => {
    const fieldWidth = 35;
    const canvasAspect = engine.canvas.width / engine.canvas.height;
    const fov = camera.fov;
    const fovH = 2 * Math.atan(Math.tan(fov / 2) * canvasAspect);
    const requiredRadius = (fieldWidth / 2) / Math.sin(fovH / 2);
    camera.radius = requiredRadius;
    camera.lowerRadiusLimit = camera.upperRadiusLimit = requiredRadius;
    bgPlane.position = new BABYLON.Vector3(0, 0, requiredRadius + 20);
  };
  updateCameraRadius();

  // Lights and glow
  new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene).intensity = 0.5;
  new BABYLON.GlowLayer("glow", scene).intensity = 0.5;

  // Terrain
  buildTerrain(scene);

  const player1 = new Entities.Player(scene, Entities.Side.LEFT, "w", "s");
  const player2 = engine.room.withIA ? new Entities.IA(scene,Entities.Side.RIGHT) : new Entities.Player(scene, Entities.Side.RIGHT, "ArrowUp", "ArrowDown");

  const ball = new Entities.Ball(scene);


  let powerUpBox: Entities.PowerUpBox | null = null;
  let powerUps: Entities.PowerUp[] = [];
  engine.mainLoop = () => {
    if (engine.paused) return;
    const delta = engine.getDeltaTime();
    player1.updatePosition(engine, ball);
    player2.updatePosition(engine, ball);
    ball.updatePosition(delta);
    ball.handleBallCollisions(player1, player2);
    if (powerUpBox && powerUpBox.HandleCollision(ball)) {
      let powerUp= new Entities.PowerUp(powerUpBox.type, ball.direction.x > 0? player1:player2, ball, 10);
      powerUp.applyEffect();
      engine.ShowPopup(powerUp.msg(), 2000);
      powerUps.push(powerUp);
      powerUpBox.remove();
      powerUpBox = null;
    }
    if (powerUps.length > 0) {
      powerUps.forEach((pu) => pu.update(delta));
      powerUps = powerUps.filter((pu) => !pu.isExpired());
    } else if (!powerUpBox && engine.room.withCustom) {
      powerUpBox = new Entities.PowerUpBox(scene, Entities.getRandomPowerUpType());
    }
    if (Math.abs(ball.mesh.position.x) > 16) {
      if (ball.mesh.position.x < 0) engine.room.players[1].score++;
      else engine.room.players[0].score++;
      //reset power-ups
      powerUps.forEach((pu) => {pu.removeEffect();});
      powerUps = [];
      ball.reset();
      if (Math.abs(engine.room.players[0].score - engine.room.players[1].score) >= 2)
        engine.EndGame();
    } 
  };
  engine.runRenderLoop(() => scene.render());

  engine.OnResize.addEventListener(updateCameraRadius);
}