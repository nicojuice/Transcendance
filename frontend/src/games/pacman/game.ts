//import { navigate } from "../../nav";
import * as BABYLON from "@babylonjs/core";
//import * as GUI from "@babylonjs/gui";
import "@babylonjs/loaders";
import * as ROOM from "../room";
import * as Map from "./map";
import * as Utils from "./utils";
import * as Spawn from "./spawn";


/*function endGame(room: ROOM.Room): void {
  room.saveToLocalStorage();
  setTimeout(() => navigate(room.nextPage), 0);
}*/





// === Main game function ===
export function main(engine: BABYLON.Engine, canvas: HTMLCanvasElement, room: ROOM.Room): () => void {
  void room;
  void canvas;
  const scene = new BABYLON.Scene(engine);
  
  Spawn.spawnGhosts(scene);


  //spawn ghost
  const ghost = BABYLON.MeshBuilder.CreateBox("ghost", {size: 2}, scene);
  ghost.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1); // Taille du fantôme
  ghost.position = new BABYLON.Vector3(0, 0, 1); // Positionner le fantôme
  const ghostMaterial = new BABYLON.StandardMaterial("ghostMat", scene);
  ghostMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0); // Rouge pour le fantôme
  ghostMaterial.emissiveColor = new BABYLON.Color3(1, 0, 0); // Légère lueur rouge
  ghost.material = ghostMaterial;

  scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

  new BABYLON.GlowLayer("glow", scene).intensity = 0.5;

  const inputMap: Record<string, boolean> = {};
  scene.actionManager = new BABYLON.ActionManager(scene);
  scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => inputMap[evt.sourceEvent.key] = true));
  scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => inputMap[evt.sourceEvent.key] = false));
  
  // Créer la caméra (vue 3D simple)
  const camera = new BABYLON.ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene);
  camera.inputs.clear();
  camera.attachControl(canvas, true);

  camera.lowerBetaLimit = camera.upperBetaLimit = camera.beta = Math.PI / 2;
  camera.lowerAlphaLimit = camera.upperAlphaLimit = camera.alpha = -Math.PI / 2;
  camera.radius = 60;

  const pacMan = Spawn.spawn_pacman(scene);
  pacMan.position = Utils.coordToPosition(Map.get_coord(Map.pacman_map,Map.CellType.PLAYER, 0),Map.pacman_map);

  // Créer un éclairage de base
  new BABYLON.HemisphericLight("light1", BABYLON.Vector3.Backward(), scene);


  let balls = Spawn.spawn_terrain(scene, Map.pacman_map);
  void balls;
  // Déplacement de Pac-Man avec les touches fléchées
  const speed = 0.1;
  scene.onBeforeRenderObservable.add(() => {
    const delta = engine.getDeltaTime() / 16.666;
    /*//change material of children of pacMan
    const pacManMaterial = new BABYLON.StandardMaterial("pacManMat", scene);
    pacManMaterial.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random()); // Jaune pour
    pacMan.getChildMeshes().forEach(child => {
        if (child.material) {
            child.material = pacManMaterial; // Appliquer le matériau à chaque enfant
        }
    });*/

    let direction = Utils.getDirection(pacMan.rotation.z);
    const player_coord = Utils.positionToCoord(pacMan.position, Map.pacman_map);
    const ajustPosition = Utils.coordToPosition(player_coord, Map.pacman_map);
    let next_coord = {x: player_coord.x + direction.x, y: player_coord.y - direction.y};

    let isCentered = Utils.distance(pacMan.position, ajustPosition) <= (speed*delta)*1.1;

    let old_data = {rotation: pacMan.rotation.z, direction: direction, next_coord: next_coord};
    if (isCentered) {
      if (inputMap["ArrowUp"] && direction.y == 0) pacMan.rotation.z = Math.PI / 2;
      else if (inputMap["ArrowDown"] && direction.y == 0) pacMan.rotation.z = -Math.PI / 2;
      else if (inputMap["ArrowLeft"] && direction.x == 0) pacMan.rotation.z = Math.PI;
      else if (inputMap["ArrowRight"] && direction.x == 0) pacMan.rotation.z = 0;
      direction = Utils.getDirection(pacMan.rotation.z);
      next_coord = {x: player_coord.x + direction.x, y: player_coord.y - direction.y};
      if (Map.get_c(next_coord.x, next_coord.y, Map.pacman_map) == Map.CellType.WALL)
      {
        pacMan.rotation.z = old_data.rotation; // Revenir à l'ancienne rotation si un mur est rencontré
        direction = old_data.direction; // Revenir à l'ancienne direction
        next_coord = old_data.next_coord; // Revenir à l'ancienne coordonnée
      }
    }

    
    if (Map.get_c(next_coord.x, next_coord.y, Map.pacman_map) != Map.CellType.WALL || !isCentered)
    {
      pacMan.position = pacMan.position.add(new BABYLON.Vector3(direction.x * (speed*delta), direction.y * (speed*delta), 0));
      // Ajuster la position de Pac
      if (direction.x != 0)
        pacMan.position.y = ajustPosition.y;
      else
        pacMan.position.x = ajustPosition.x;
    }
    else
      pacMan.position = ajustPosition;

    // Vérifier les collisions avec les billes
    let toRemoveBalls: number[] = [];
    balls.miniBalls.forEach((ball, index) => {
        if (Utils.distance(pacMan.position, ball.position) < 1)
            toRemoveBalls.push(index);
    });
    toRemoveBalls.reverse().forEach(index =>{balls.miniBalls[index].dispose(); balls.miniBalls.splice(index, 1);});
    toRemoveBalls = [];
    balls.bigBalls.forEach((bigBall, index) => {
        if (Utils.distance(pacMan.position, bigBall.position) < 1)
            toRemoveBalls.push(index);
    });
    toRemoveBalls.reverse().forEach(index =>{balls.bigBalls[index].dispose(); balls.bigBalls.splice(index, 1);});

  });

  // Démarrer le moteur
  engine.runRenderLoop(() => {
      scene.render();
  });

  return () => {
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