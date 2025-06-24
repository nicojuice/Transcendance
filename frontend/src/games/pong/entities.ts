import * as BABYLON from "@babylonjs/core";
import * as Engine from "../engine";

export class Ball {
  public mesh: BABYLON.Mesh;
  public direction: BABYLON.Vector3;
  public speed: number;

  constructor(scene: BABYLON.Scene) {
    const ballMat = new BABYLON.StandardMaterial("ballMat", scene);
    ballMat.emissiveColor = new BABYLON.Color3(1.0, 0.0, 0.6);
    ballMat.diffuseColor = ballMat.emissiveColor;

    this.mesh = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 1 }, scene);
    this.mesh.position.y = 0.5;
    this.mesh.material = ballMat;

    this.direction = BABYLON.Vector3.Zero();
    this.speed = 0;

    this.randomizeVelocity();
  }

  public reset(): void {
    this.mesh.position.set(0, 0.5, 0);
    this.randomizeVelocity();
  }

  public randomizeVelocity(): void {
    const dir = new BABYLON.Vector3(
      Math.random() < 0.5 ? 1 : -1,
      0,
      Math.random() < 0.5 ? 1 : -1
    );
    dir.normalize();

    this.direction = dir;
    this.speed = 0.19; // ancienne norme approximative de (0.15, 0.12)
  }

  public get velocity(): BABYLON.Vector3 {
    return this.direction.scale(this.speed);
  }

  public updatePosition(deltaTime: number): void {
    this.mesh.position.addInPlace(this.velocity.scale(deltaTime / 16.666));
  }

  public handleBallCollisions(player1: Paddle, player2: Paddle): void {
    const halfFieldZ = 9.5;
    const ballRadius = 0.5;
    const paddleRadius = 0.25;

    if (this.mesh.position.z >= halfFieldZ || this.mesh.position.z <= -halfFieldZ) {
      this.direction.z *= -1;
      this.mesh.position.z = BABYLON.Scalar.Clamp(this.mesh.position.z, -halfFieldZ, halfFieldZ);
    }

    const checkCollision = (ballEdgeX: number, paddle: BABYLON.Mesh, isLeft: boolean) => {
      const sign = isLeft ? 1 : -1;
      const paddleHalfLength = ((paddle.scaling.z*Paddle.LENGTH) + (paddleRadius * 2)) / 2;
      return (
        ballEdgeX * sign <= paddle.position.x * sign + paddleRadius &&
        ballEdgeX * sign >= paddle.position.x * sign - paddleRadius &&
        this.mesh.position.z >= paddle.position.z - paddleHalfLength &&
        this.mesh.position.z <= paddle.position.z + paddleHalfLength
      );
    };

    if (checkCollision(this.mesh.position.x - ballRadius, player1.mesh, true) && this.direction.x < 0) {
      this.direction.x *= -1;
      this.direction.z += (this.mesh.position.z - player1.mesh.position.z) * 0.03;
      this.direction.normalize();
      this.mesh.position.x = player1.mesh.position.x + paddleRadius + ballRadius;
      this.speed += 0.01;
    }

    if (checkCollision(this.mesh.position.x + ballRadius, player2.mesh, false) && this.direction.x > 0) {
      this.direction.x *= -1;
      this.direction.z += (this.mesh.position.z - player2.mesh.position.z) * 0.03;
      this.direction.normalize();
      this.mesh.position.x = player2.mesh.position.x - paddleRadius - ballRadius;
      this.speed += 0.01;
    }
  }
}

export enum Side {
  LEFT = "left",
  RIGHT = "right"
}

export abstract class Paddle {
  public mesh: BABYLON.Mesh;
  public side: Side;
  public static readonly SPEED: number = 0.3;
  public static readonly LENGTH: number = 3; // Longueur de la raquette

  constructor(scene: BABYLON.Scene, side: Side) {
    this.side = side;
    
    const paddleMat = new BABYLON.StandardMaterial("paddleMat", scene);
    paddleMat.emissiveColor = new BABYLON.Color3(0.0, 1.0, 0.3);
    paddleMat.diffuseColor = paddleMat.emissiveColor;
    const paddle1 = BABYLON.MeshBuilder.CreateCapsule("paddle1", { radius: 0.25, height: Paddle.LENGTH }, scene);
    const subpaddleMat = new BABYLON.StandardMaterial("subpaddleMat", scene);
    subpaddleMat.diffuseColor = new BABYLON.Color3(0, 55.3/255.0, 38.4/255.0);
    subpaddleMat.emissiveColor = subpaddleMat.diffuseColor;
    const subpaddle = paddle1.clone("subpaddle");
    subpaddle.scaling = new BABYLON.Vector3(0.98, 0.99, 1.25);
    subpaddle.material = subpaddleMat;
    subpaddle.parent = paddle1;
    paddle1.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);
    paddle1.material = paddleMat;
    this.mesh = paddle1;
    this.mesh.position.y = 0.26;
    this.mesh.position.x = side === Side.LEFT ? -14 : 14;
    this.mesh.position.z = 0;
  }

  abstract updatePosition(engine: Engine.GameEngine, ball: Ball): void;
}

export class Player extends Paddle {
  public up_key: string;
  public down_key: string;
  constructor(scene: BABYLON.Scene, side: Side, up_key: string, down_key: string) {
    super(scene, side);
    this.up_key = up_key;
    this.down_key = down_key;
  }

  public updatePosition(engine: Engine.GameEngine, _ball: Ball): void {
    const deltaTime = engine.getDeltaTime();
    if (engine.inputMap[this.up_key] && this.mesh.position.z < 8) {
      this.mesh.position.z += Paddle.SPEED * (deltaTime / 16.666);
    }
    if (engine.inputMap[this.down_key] && this.mesh.position.z > -8) {
      this.mesh.position.z -= Paddle.SPEED * (deltaTime / 16.666);
    }
    // Clamp position to field limits
    this.mesh.position.z = BABYLON.Scalar.Clamp(this.mesh.position.z, -8, 8);
  }
}


export function predictTrajectoryPoints(
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


export function predictIATrajectoryPoints(ball: Ball):BABYLON.Vector3[]
{
  //const bounds = { x1: -14, x2: 14, z1: -8, z2: 8 };
  const bounds = { x1: -14+0.5, x2: 14-0.5, z1: -9.5, z2: 9.5 };
  const ret = predictTrajectoryPoints(ball.mesh.position, ball.velocity, bounds);
  let points = ret.points;
  if (ball.velocity.x < 0)
  {
    ret.velocity.x *= -1;
    const ret2 = predictTrajectoryPoints(ret.position, ret.velocity, bounds);
    points = points.concat(ret2.points);
  }
  return points;
}

let debugLine: BABYLON.LinesMesh | null = null;

export function drawDebugTrajectory(
  scene: BABYLON.Scene,
  points: BABYLON.Vector3[]
): void
{
  setTimeout(() => 
  {
    // Supprimer l'ancienne ligne si elle existe
    if (debugLine) {
      debugLine.dispose();
    }
    debugLine = BABYLON.MeshBuilder.CreateLines("trajectory", {
      points: points
    }, scene);
    debugLine.color = new BABYLON.Color3(1, 1, 0); // jaune
  }, 0);
}

export class IA extends Paddle {
  public predictPaddlePosition: number;
  private elapsedTime: number;
  constructor(scene: BABYLON.Scene, side: Side) {
    super(scene, side); // IA does not use keys
    this.predictPaddlePosition = 0;
    this.elapsedTime = 0;
  }

  public updatePosition(engine: Engine.GameEngine, ball: Ball): void {
    void engine;
    const deltaTime = engine.getDeltaTime();
    this.elapsedTime += deltaTime;
    // Update IA paddle position based on predicted ball trajectory
    if (this.elapsedTime > 1000) {
      this.elapsedTime = 0;
      const AI_points = predictIATrajectoryPoints(ball);
      //drawDebugTrajectory(engine.scene, AI_points);
      this.predictPaddlePosition = AI_points[AI_points.length - 1].z;
    }
    if (this.mesh.position.z < this.predictPaddlePosition - 0.25)
        this.mesh.position.z += Paddle.SPEED * (deltaTime / 16.666);
      else if (this.mesh.position.z > this.predictPaddlePosition + 0.25)
        this.mesh.position.z -= Paddle.SPEED * (deltaTime / 16.666);
    this.mesh.position.z = BABYLON.Scalar.Clamp(this.mesh.position.z, -8, 8);
  }
}

export enum PowerUpType {
  PaddleEnlarge = 1,       // Bonus : Agrandit la raquette
  PaddleShrink = 2,        // Malus : Réduit la raquette
  InvertedControls = 3,    // Malus : Contrôles inversés
  BallSpeedUp = 4,         // Bonus : Accélère la balle
  //MultiBall = 5            // Bonus : Ajoute plusieurs balles
}

export function getRandomPowerUpType(): PowerUpType
{
  const types = Object.values(PowerUpType).filter(value => typeof value === "number");
  const randomIndex = Math.floor(Math.random() * types.length);
  return types[randomIndex] as PowerUpType;
}


export class PowerUpBox
{
  public mesh: BABYLON.Mesh;
  public type: PowerUpType;

  constructor(scene: BABYLON.Scene, type: PowerUpType) {
    this.type = type;
    const boxMat = new BABYLON.StandardMaterial("boxMat", scene);
    boxMat.emissiveColor = new BABYLON.Color3(0.6, 0.6, 0.6);
    boxMat.disableLighting = true;
    //boxMat.alpha = 0.75;
    boxMat.diffuseTexture = new BABYLON.Texture(`/assets/games/pong/b${Number(type)}.png`, scene);
    //glow effect
    this.mesh = BABYLON.MeshBuilder.CreateBox("powerUpBox", { size: 3, faceUV: [
      new BABYLON.Vector4(1, 0, 1, 1), // face 0 (arrière)
      new BABYLON.Vector4(1, 0, 1, 1), // face 1 (avant)
      new BABYLON.Vector4(1, 0, 1, 1), // face 2 (droite)
      new BABYLON.Vector4(1, 0, 1, 1), // face 3 (gauche)

      // face 4 (haut) avec UV tournés de 90° (swap U et V)
      new BABYLON.Vector4(0, 0, 1, 1), // correspond à une rotation 90°

      new BABYLON.Vector4(0, 0, 1, 1), // face 5 (bas)
    ]}, scene);
    this.mesh.scaling.y = 0.25; // Réduire la taille en X pour que la box soit plus plate
    this.mesh.position.y = 0.5;
    this.mesh.position.x = Math.random() * 24 - 12; // Position aléatoire sur l'axe X
    this.mesh.position.z = Math.random() * 14 - 7; // Position al
    this.mesh.rotation.y = Math.PI/2;
    //this.mesh.rotation.z = -Math.PI/6;
    this.mesh.material = boxMat;
  }

  public HandleCollision(ball: Ball): boolean {
    const ballRadius = 0.5;
    const boxSize = 3; // Taille de la box
    const boxHalfSize = boxSize / 2;

    // Vérifier si la balle entre en collision avec la box
    if (
      Math.abs(ball.mesh.position.x - this.mesh.position.x) < (ballRadius + boxHalfSize) &&
      Math.abs(ball.mesh.position.z - this.mesh.position.z) < (ballRadius + boxHalfSize)
    ) {
      return true; // Indiquer que la collision a été gérée
    }
    return false; // Pas de collision
  }

  public remove(): void {
    this.mesh.dispose(); // Supprimer la box de la scène
  }
}

export class PowerUp
{
  public type: PowerUpType;
  public timeout: number; // Durée de l'effet en secondes
  public player: Paddle;
  public ball: Ball;

  constructor(type: PowerUpType, player: Paddle,ball: Ball, timeout: number = 10) {
    this.type = type;
    this.player = player;
    this.ball = ball;
    this.timeout = timeout * 1000; // Convertir en millisecondes
  }

  public applyEffect(): void {
    switch (this.type) {
      case PowerUpType.PaddleEnlarge:
        this.player.mesh.scaling.y *= 1.5; // Agrandir la raquette
        break;
      case PowerUpType.PaddleShrink:
        this.player.mesh.scaling.y *= 0.5; // Réduire la raquette
        break;
      case PowerUpType.InvertedControls:
        //Check si c'est un joueur
        if (this.player instanceof Player) {
          // Inverser les contrôles
          const player = this.player as Player;
          const tempUpKey = player.up_key;
          player.up_key = player.down_key;
          player.down_key = tempUpKey;
        }
        break;
      case PowerUpType.BallSpeedUp:
        this.ball.speed *= 1.5; // Augmenter la vitesse de la balle
        break;
      // case PowerUpType.MultiBall:
      //   // Ajouter plusieurs balles (à implémenter)
      //   break;
    }
  }

  public removeEffect(): void {
    switch (this.type) {
      case PowerUpType.PaddleEnlarge:
        this.player.mesh.scaling.y /= 1.5; // Rétablir la taille de la raquette
        break;
      case PowerUpType.PaddleShrink:
        this.player.mesh.scaling.y /= 0.5; // Rétablir la taille de la raquette
        break;
      case PowerUpType.InvertedControls:
        // Rétablir les contrôles normaux
        if (this.player instanceof Player) {
          const player = this.player as Player;
          const tempUpKey = player.up_key;
          player.up_key = player.down_key;
          player.down_key = tempUpKey;
        }
        break;
      case PowerUpType.BallSpeedUp:
        this.ball.speed /= 1.5;
        break;
    }
  }

  public isExpired(): boolean {
    return this.timeout <= 0; // Vérifier si le power-up a expiré
  }
  public update(deltaTime: number): void {
    this.timeout -= deltaTime; // Décrémenter le temps restant
    if (this.timeout <= 0) {
      this.removeEffect(); // Supprimer l'effet si le temps est écoulé
    }
  }
}