import { navigate } from "../../nav";
import * as BABYLON from "@babylonjs/core";
//import * as GUI from "@babylonjs/gui";
import "@babylonjs/loaders";
import * as ROOM from "../room";
import * as Map from "./map";
import * as Utils from "./utils";
import * as Spawn from "./spawn";
import * as Entities from "./entities";
import * as Engine from "../engine";
import { drawUI } from "./draw_ui";


function endGame(room: ROOM.Room): void {
  room.saveToLocalStorage();
  setTimeout(() => navigate(room.nextPage), 0);
}


// === Main game function ===
export function main(engine: Engine.GameEngine, room: ROOM.Room): void {
  void room;
  const scene = engine.scene;
  let characters: Entities.Character[] = [];


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
  // Créer la caméra (vue 3D simple)
  const camera = new BABYLON.ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene);
  camera.inputs.clear();
  camera.attachControl(engine.canvas, true);

  camera.lowerBetaLimit = camera.upperBetaLimit = camera.beta = Math.PI / 2;
  camera.lowerAlphaLimit = camera.upperAlphaLimit = camera.alpha = -Math.PI / 2;
  camera.radius = 60;

  let player1 = new Entities.Player(0, Spawn.spawn_pacman(scene), new BABYLON.Color3(1, 1, 0), Map.pacman_map, 0.1, ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
  player1.set_coordinates(Map.get_coord(Map.pacman_map,Map.CellType.PLAYER, 0));
  player1.direction = Utils.getDirection(Math.PI / 2); // Orientation initiale vers le haut
  characters.push(player1);

  let player2 = new Entities.Player(1, Spawn.spawn_pacman(scene), new BABYLON.Color3(0, 1, 0), Map.pacman_map, 0.1, ['w', 's', 'a', 'd']);
  player2.set_coordinates(Map.get_coord(Map.pacman_map,Map.CellType.PLAYER, 1));
  player2.direction = Utils.getDirection(Math.PI / 2); // Orientation initiale vers le haut
  characters.push(player2);

  Spawn.spawn_ghosts(scene, Map.pacman_map, characters);

  drawUI(engine, player1, player2);

  // Créer un éclairage de base
  new BABYLON.HemisphericLight("light1", BABYLON.Vector3.Backward(), scene);


  let balls = Spawn.spawn_terrain(scene, Map.pacman_map);
  void balls;
  // Déplacement de Pac-Man avec les touches fléchées
  scene.onBeforeRenderObservable.add(() => {
    if (engine.paused)
      return; // Ne pas mettre à jour si le jeu est en pause
    //const delta = engine.getDeltaTime() / 16.666;
    characters.forEach(character => {
      character.Update(engine);
      //check if character is Player
      if (character instanceof Entities.Player) {
        // Vérifier les collisions avec les billes
        let toRemoveBalls: number[] = [];
        balls.miniBalls.forEach((ball, index) => {
          if (Utils.distance(character.obj.position, ball.position) < 1)
          {
            character.score += 1; // Ajouter 1 point pour une petite bille
            toRemoveBalls.push(index);
          }
        });
        toRemoveBalls.reverse().forEach(index =>{balls.miniBalls[index].dispose(); balls.miniBalls.splice(index, 1);});
        toRemoveBalls = [];
        balls.bigBalls.forEach((bigBall, index) => {
          if (Utils.distance(character.obj.position, bigBall.position) < 1)
          {
            character.score += 10; // Ajouter 10 points pour une petite bille
            character.SetInvulnerable(); // Activer l'invulnérabilité
            toRemoveBalls.push(index);
          }
        });
        toRemoveBalls.reverse().forEach(index =>{balls.bigBalls[index].dispose(); balls.bigBalls.splice(index, 1);});
      }
      // Vérifier la fin du jeu
      if (balls.miniBalls.length === 0 && balls.bigBalls.length === 0) {
        if (player1.score > player2.score)
          room.playerWinner = player1.id;
        else 
          room.playerWinner = player2.id;
        console.log("Game Over! All balls collected.");
        endGame(room);
      }
    });

    

  });

  // Démarrer le moteur
  engine.runRenderLoop(() => {
      scene.render();
  });
}