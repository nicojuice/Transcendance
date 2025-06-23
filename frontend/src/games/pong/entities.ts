import * as BABYLON from "@babylonjs/core";
import * as Engine from "../engine";

export class Ball {
  public mesh: BABYLON.Mesh;
  public velocity: BABYLON.Vector3;

  constructor(scene: BABYLON.Scene) {
    const ballMat = new BABYLON.StandardMaterial("ballMat", scene);
    ballMat.emissiveColor = new BABYLON.Color3(1.0, 0.0, 0.6);
    ballMat.diffuseColor = ballMat.emissiveColor;
    this.mesh = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 1 }, scene);
    this.mesh.position.y = 0.5;
    this.mesh.material = ballMat;
    this.velocity = new BABYLON.Vector3(0, 0, 0);
    this.randomizeVelocity();
  }

  public reset(): void {
    this.mesh.position.set(0, 0.5, 0);
    this.randomizeVelocity();
  }

  public randomizeVelocity(): void {
    this.velocity.set(0.15 * (Math.random() < 0.5 ? 1 : -1), 0, 0.12 * (Math.random() < 0.5 ? 1 : -1));
  }

  public updatePosition(deltaTime: number): void {
    this.mesh.position.addInPlace(this.velocity.scale(deltaTime / 16.666));
  }

  public handleBallCollisions(player1: Paddle, player2: Paddle): void {
    const halfFieldZ = 9.5;
    const ballRadius = 0.5;
    const paddleRadius = 0.25;
    const paddleLength = 3 + (paddleRadius * 2);
    const paddleHalfLength = paddleLength / 2;
  
    if (this.mesh.position.z >= halfFieldZ || this.mesh.position.z <= -halfFieldZ) {
      this.velocity.z *= -1;
      this.mesh.position.z = BABYLON.Scalar.Clamp(this.mesh.position.z, -halfFieldZ, halfFieldZ);
    }
  
    const checkCollision = (ballEdgeX: number, paddle: BABYLON.Mesh, isLeft: boolean) => {
      const sign = isLeft ? 1 : -1;
      return (
        ballEdgeX * sign <= paddle.position.x * sign + paddleRadius &&
        ballEdgeX * sign >= paddle.position.x * sign - paddleRadius &&
        this.mesh.position.z >= paddle.position.z - paddleHalfLength &&
        this.mesh.position.z <= paddle.position.z + paddleHalfLength
      );
    };
  
    if (checkCollision(this.mesh.position.x - ballRadius, player1.mesh, true) && this.velocity.x < 0) {
      this.velocity.x *= -1;
      this.velocity.z += (this.mesh.position.z - player1.mesh.position.z) * 0.03;
      this.mesh.position.x = player1.mesh.position.x + paddleRadius + ballRadius;
    }
  
    if (checkCollision(this.mesh.position.x + ballRadius, player2.mesh, false) && this.velocity.x > 0) {
      this.velocity.x *= -1;
      this.velocity.z += (this.mesh.position.z - player2.mesh.position.z) * 0.03;
      this.mesh.position.x = player2.mesh.position.x - paddleRadius - ballRadius;
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

  constructor(scene: BABYLON.Scene, side: Side) {
    this.side = side;
    
    const paddleMat = new BABYLON.StandardMaterial("paddleMat", scene);
    paddleMat.emissiveColor = new BABYLON.Color3(0.0, 1.0, 0.3);
    paddleMat.diffuseColor = paddleMat.emissiveColor;
    const paddle1 = BABYLON.MeshBuilder.CreateCapsule("paddle1", { radius: 0.25, height: 3 }, scene);
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

