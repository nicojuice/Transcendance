import { navigate } from "../../nav";
import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import * as ROOM from "../room";

// === Ball collision logic ===
function handleBallCollisions(ball: BABYLON.Mesh, paddle1: BABYLON.Mesh, paddle2: BABYLON.Mesh, ballVelocity: BABYLON.Vector3): void {
  const halfFieldZ = 9.5;
  const ballRadius = 0.5;
  const paddleRadius = 0.25;
  const paddleLength = 3 + (paddleRadius * 2);
  const paddleHalfLength = paddleLength / 2;

  if (ball.position.z >= halfFieldZ || ball.position.z <= -halfFieldZ) {
    ballVelocity.z *= -1;
    ball.position.z = BABYLON.Scalar.Clamp(ball.position.z, -halfFieldZ, halfFieldZ);
  }

  const checkCollision = (ballEdgeX: number, paddle: BABYLON.Mesh, isLeft: boolean) => {
    const sign = isLeft ? 1 : -1;
    return (
      ballEdgeX * sign <= paddle.position.x * sign + paddleRadius &&
      ballEdgeX * sign >= paddle.position.x * sign - paddleRadius &&
      ball.position.z >= paddle.position.z - paddleHalfLength &&
      ball.position.z <= paddle.position.z + paddleHalfLength
    );
  };

  if (checkCollision(ball.position.x - ballRadius, paddle1, true) && ballVelocity.x < 0) {
    ballVelocity.x *= -1;
    ballVelocity.z += (ball.position.z - paddle1.position.z) * 0.03;
    ball.position.x = paddle1.position.x + paddleRadius + ballRadius;
  }

  if (checkCollision(ball.position.x + ballRadius, paddle2, false) && ballVelocity.x > 0) {
    ballVelocity.x *= -1;
    ballVelocity.z += (ball.position.z - paddle2.position.z) * 0.03;
    ball.position.x = paddle2.position.x - paddleRadius - ballRadius;
  }
}

function predictTrajectoryPoints(
  position: BABYLON.Vector3,
  velocity: BABYLON.Vector3,
  bounds: { x1: number; x2: number; z1: number; z2: number }
): {points : BABYLON.Vector3[], position: BABYLON.Vector3, velocity: BABYLON.Vector3} {
  const points: BABYLON.Vector3[] = [];
  let pos = position.clone();
  let vel = velocity.clone();

  const { x1, x2, z1, z2 } = bounds;
  const goingRight = vel.x > 0;
  const targetX = goingRight ? x2 : x1;

  points.push(pos.clone());

  let remainingTime = (targetX - pos.x) / vel.x;

  let currentZ = pos.z;
  let vz = vel.z;
  let t = 0;

  while (t < remainingTime) {
    let timeToZBound: number;

    if (vz > 0) {
      timeToZBound = (z2 - currentZ) / vz;
    } else {
      timeToZBound = (z1 - currentZ) / vz;
    }

    if (t + timeToZBound > remainingTime) break;

    t += timeToZBound;
    currentZ += vz * timeToZBound;

    // Rebond vertical
    currentZ = BABYLON.Scalar.Clamp(currentZ, z1, z2);
    vz *= -1;

    const x = pos.x + vel.x * t;
    const reboundPoint = new BABYLON.Vector3(x, pos.y, currentZ);
    points.push(reboundPoint.clone());
  }

  // Fin de la trajectoire jusqu’à la raquette
  const finalX = targetX;
  const finalZ = currentZ + vz * (remainingTime - t);
  const finalZClamped = BABYLON.Scalar.Clamp(finalZ, z1, z2);
  points.push(new BABYLON.Vector3(finalX, pos.y, finalZClamped));
  if (finalZClamped !== finalZ) {
    // Si on a rebondi sur le bord, on inverse la vitesse
    vel.z *= -1;
  } else {
    // Si on n'a pas rebondi, on garde la vitesse
    vel.z = vz;
  }
  vel.x = goingRight ? Math.abs(vel.x) : -Math.abs(vel.x);
  return {points, position: points[points.length - 1], velocity: vel.clone()}
}


function predictIATrajectoryPoints(
  ball: BABYLON.Mesh,
  velocity: BABYLON.Vector3,
):BABYLON.Vector3[]
{
  //const bounds = { x1: -14, x2: 14, z1: -8, z2: 8 };
  const bounds = { x1: -14+0.5, x2: 14-0.5, z1: -9.5, z2: 9.5 };
  const ret = predictTrajectoryPoints(ball.position, velocity, bounds);
  let points = ret.points;
  if (velocity.x < 0)
  {
    ret.velocity.x *= -1;
    const ret2 = predictTrajectoryPoints(ret.position, ret.velocity, bounds);
    points = points.concat(ret2.points);
  }
  return points;
}

let debugLine: BABYLON.LinesMesh | null = null;


// === Terrain and border construction ===
function buildTerrain(scene: BABYLON.Scene): void {
  const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
  groundMat.emissiveColor = new BABYLON.Color3(0, 22.7 / 255.0, 45.0 / 255.0);
  groundMat.diffuseColor = groundMat.emissiveColor;

  const borderMat = new BABYLON.StandardMaterial("borderMat", scene);
  borderMat.emissiveColor = new BABYLON.Color3(57.3 / 255.0, 1.0, 1.0);
  borderMat.diffuseColor = borderMat.emissiveColor;

  const borderMat2 = new BABYLON.StandardMaterial("borderMat2", scene);
  borderMat2.diffuseColor = new BABYLON.Color3(0, 38.4 / 255.0, 55.3 / 255.0);
  borderMat2.emissiveColor = borderMat2.diffuseColor;

  const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 30, height: 20 }, scene);
  ground.material = groundMat;

  const border1 = BABYLON.MeshBuilder.CreateCapsule("border1", {
    radius: 0.25,
    height: 30,
    subdivisions: 2,
    tessellation: 6
  }, scene);

  const subborder = border1.clone("subborder");
  subborder.scaling = new BABYLON.Vector3(0.98, 1, 1.25);
  subborder.material = borderMat2;
  subborder.parent = border1;

  border1.rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, 0);
  border1.position = new BABYLON.Vector3(0, 0, 10);
  border1.material = borderMat;

  const border2 = border1.clone("border2");
  border2.position = new BABYLON.Vector3(0, 0, -10);
}

function endGame(room: ROOM.Room): void {
  room.saveToLocalStorage();
  setTimeout(() => navigate(room.nextPage), 0);
}


// === Main game function ===
export function main(engine: BABYLON.Engine, canvas: HTMLCanvasElement, room: ROOM.Room): () => void {
  const scene = new BABYLON.Scene(engine);
  scene.autoClear = false;
  scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
  void room;
  const ui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);

  // Create camera
  const camera = new BABYLON.ArcRotateCamera("cam", Math.PI, Math.PI / 3, 35, BABYLON.Vector3.Zero(), scene);
  camera.inputs.clear();
  camera.attachControl(canvas, false);
  camera.alpha = Math.PI / 2;
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
    const canvasAspect = canvas.width / canvas.height;
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

  // Score UI
  const scoreText = new GUI.TextBlock();
  scoreText.text = "0 - 0";
  scoreText.color = "white";
  scoreText.fontSize = 48;
  scoreText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  scoreText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  scoreText.top = "20px";
  ui.addControl(scoreText);

  // Pause Menu
  const pauseMenu = new GUI.Rectangle();
  pauseMenu.width = "50%";
  pauseMenu.height = "40%";
  pauseMenu.cornerRadius = 20;
  pauseMenu.color = "white";
  pauseMenu.thickness = 2;
  pauseMenu.background = "rgba(0, 0, 0, 0.6)";
  pauseMenu.isVisible = false;
  ui.addControl(pauseMenu);

  // Nouveau layout vertical
  const pauseLayout = new GUI.StackPanel();
  pauseLayout.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  pauseLayout.top = "20px"; // Marge du haut
  pauseMenu.addControl(pauseLayout);

  // Ajout du texte
  const pauseText = new GUI.TextBlock();
  pauseText.text = "Pause";
  pauseText.color = "white";
  pauseText.fontSize = 48;
  pauseText.height = "100px"; // taille fixe utile dans StackPanel
  pauseLayout.addControl(pauseText);

  // Bouton Reprendre
  const resumeBtn = GUI.Button.CreateSimpleButton("resume", "Reprendre");
  resumeBtn.width = "60%";
  resumeBtn.height = "40px";
  resumeBtn.color = "white";
  resumeBtn.background = "#00cc00";
  resumeBtn.onPointerUpObservable.add(() => {
    paused = false;
    pauseMenu.isVisible = false;
  });
  pauseLayout.addControl(resumeBtn);

  // === BOUTON PAUSE ===
  const pauseBtn = GUI.Button.CreateSimpleButton("pauseBtn", "⏸ Pause");
  pauseBtn.width = "100px";
  pauseBtn.height = "40px";
  pauseBtn.color = "white";
  pauseBtn.background = "#444";
  pauseBtn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  pauseBtn.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  pauseBtn.top = "10px";
  pauseBtn.left = "10px";

  pauseBtn.onPointerUpObservable.add(() => {
    paused = true;
    pauseMenu.isVisible = true;
    pauseBtn.isVisible = false;
  });

  ui.addControl(pauseBtn);

  // === Mettre à jour le bouton dans le resumeBtn existant ===
  resumeBtn.onPointerUpObservable.add(() => {
    paused = false;
    pauseMenu.isVisible = false;
    pauseBtn.isVisible = true;
  });



  let paused = false;
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      paused = !paused;
      pauseMenu.isVisible = paused;
      pauseBtn.isVisible = !paused;
    }
  };
  window.addEventListener("keydown", handleKeyDown);


  // Materials
  const paddleMat = new BABYLON.StandardMaterial("paddleMat", scene);
  paddleMat.emissiveColor = new BABYLON.Color3(0.0, 1.0, 0.3);
  paddleMat.diffuseColor = paddleMat.emissiveColor;

  const ballMat = new BABYLON.StandardMaterial("ballMat", scene);
  ballMat.emissiveColor = new BABYLON.Color3(1.0, 0.0, 0.6);
  ballMat.diffuseColor = ballMat.emissiveColor;

  // Terrain
  buildTerrain(scene);

  // Paddles and ball
  const paddle1 = BABYLON.MeshBuilder.CreateCapsule("paddle1", { radius: 0.25, height: 3 }, scene);
  
  const subpaddleMat = new BABYLON.StandardMaterial("subpaddleMat", scene);
  subpaddleMat.diffuseColor = new BABYLON.Color3(0, 55.3/255.0, 38.4/255.0);
  subpaddleMat.emissiveColor = subpaddleMat.diffuseColor;
  const subpaddle = paddle1.clone("subpaddle");
  subpaddle.scaling = new BABYLON.Vector3(0.98, 0.99, 1.25);
  subpaddle.material = subpaddleMat;
  subpaddle.parent = paddle1;

  const paddle2 = paddle1.clone("paddle2");
  paddle1.rotation = paddle2.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);
  paddle1.position.set(-14, 0.26, 0);
  paddle2.position.set(14, 0.26, 0);
  paddle1.material = paddle2.material = paddleMat;

  const ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 1 }, scene);
  ball.position.y = 0.5;
  ball.material = ballMat;

  let ballVelocity = new BABYLON.Vector3(0.15 * (Math.random() < 0.5 ? 1 : -1), 0, 0.12 * (Math.random() < 0.5 ? 1 : -1));
  const inputMap: Record<string, boolean> = {};
  scene.actionManager = new BABYLON.ActionManager(scene);
  scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => inputMap[evt.sourceEvent.key] = true));
  scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => inputMap[evt.sourceEvent.key] = false));

  let scoreLeft = 0, scoreRight = 0;
  let predictPaddlePosition = 0;
  let elapsedTimeIA = 0;
  scene.onBeforeRenderObservable.add(() => {
    if (paused) return;
    const delta = engine.getDeltaTime() / 16.666;
    elapsedTimeIA += engine.getDeltaTime();
    const speed = 0.3;

    if (inputMap["w"] && paddle2.position.z > -8) paddle2.position.z -= speed * delta;
    if (inputMap["s"] && paddle2.position.z < 8) paddle2.position.z += speed * delta;
    if (inputMap["ArrowUp"] && paddle1.position.z > -8) paddle1.position.z -= speed * delta;
    if (inputMap["ArrowDown"] && paddle1.position.z < 8) paddle1.position.z += speed * delta;




    // IA Paddle Movement
    //actualiser 1 fois par seconde
    //if (elapsedTimeIA > 1000)
    {
      elapsedTimeIA = 0;
      const AI_points = predictIATrajectoryPoints(ball, ballVelocity);
      //Debug trajectory
      /*setTimeout(() => 
      {
        // Supprimer l'ancienne ligne si elle existe
        if (debugLine) {
          debugLine.dispose();
        }
        debugLine = BABYLON.MeshBuilder.CreateLines("trajectory", {
          points: AI_points
        }, scene);
        debugLine.color = new BABYLON.Color3(1, 1, 0); // jaune
      }, 0);*/
      // Fin debug trajectory
      predictPaddlePosition = AI_points[AI_points.length - 1].z;
    }

    if (paddle2.position.z < predictPaddlePosition - 0.25)
      paddle2.position.z += speed * delta;
    else if (paddle2.position.z > predictPaddlePosition + 0.25)
      paddle2.position.z -= speed * delta;
    //////////////////////////////////////////

    paddle1.position.z = BABYLON.Scalar.Clamp(paddle1.position.z, -8, 8);
    paddle2.position.z = BABYLON.Scalar.Clamp(paddle2.position.z, -8, 8);
    ball.position.addInPlace(ballVelocity.scale(delta));
    handleBallCollisions(ball, paddle1, paddle2, ballVelocity);

    if (Math.abs(ball.position.x) > 16) {
      if (ball.position.x > 0) scoreLeft++;
      else scoreRight++;
      scoreText.text = `${scoreLeft} - ${scoreRight}`;
      ball.position.set(0, 0.5, 0);
      ballVelocity = new BABYLON.Vector3(0.15 * (Math.random() < 0.5 ? 1 : -1), 0, 0.12 * (Math.random() < 0.5 ? 1 : -1));
      if (Math.abs(scoreLeft - scoreRight) >= 2)
      {
        if (scoreLeft > scoreRight)
          room.playerWinner = 0;
        else
          room.playerWinner = 1;
        endGame(room);
      }
    }
  });
  engine.runRenderLoop(() => scene.render());

  let resizeListener = () => updateCameraRadius();
  window.addEventListener("resize", resizeListener);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("resize", resizeListener);
    paused = true;
    scene.onDisposeObservable.clear();
    scene.onAfterRenderObservable.clear();
    scene.onBeforeRenderObservable.clear();
    engine.stopRenderLoop();
    scene.actionManager?.dispose();
    scene.dispose();
    engine.dispose();
    return;
  };
}