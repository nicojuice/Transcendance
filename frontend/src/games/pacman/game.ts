import * as BABYLON from "@babylonjs/core";
//import * as GUI from "@babylonjs/gui";
// import "@babylonjs/loaders";
import * as ROOM from "../room";
import * as Map from "./map";
import * as Utils from "./utils";
import * as Spawn from "./spawn";
import * as Entities from "./entities";
import * as Engine from "../engine";
import * as GUI from "@babylonjs/gui";

function respawnPlayer(player: Entities.Player, map: Map.GameMap, characters: Entities.Character[]): void
{
  let _floodfill = Utils.emptyfloodfill(map);
  characters.forEach(character => {
    if (character instanceof Entities.Ghost)
      _floodfill = Utils.addfloodfill(_floodfill, Utils.floodfill(map, character.get_coordinates()));
  });
  // Trouver la case avec la distance maximale dans le floodfill
  let maxDistance = -1;
  let spawnCoord = Map.get_coord(Map.pacman_map,Map.CellType.PLAYER, player.id);
  for (let y = 0; y < _floodfill.length; y++) {
    for (let x = 0; x < _floodfill[y].length; x++) {
      if (_floodfill[y][x] > maxDistance && Map.get_c(x, y, map) != Map.CellType.WALL) {
        maxDistance = _floodfill[y][x];
        spawnCoord = {x: x, y: y};
      }
    }
  }
  /*console.log("Floodfill distances:");
  _floodfill.forEach(row => {
    console.log(row.map(cell => cell.toString().padStart(3, ' ')).join(' '));
  });*/
  // Mettre à jour la position du joueur
  player.set_coordinates(spawnCoord);
  player.invulnerableTime = 0; // Réinitialiser le temps d'invulnérabilité
  player.invulnerable = false; // Réinitialiser l'état d'invulnérabilité
  player.SetColor(player.base_color); // Réinitialiser la couleur du joueur
}

function respawnGhost(ghost: Entities.Ghost, map: Map.GameMap): void
{
  ghost.set_coordinates(Map.get_coord(map, Map.CellType.GHOST, ghost.id));
  ghost.direction = {x: 1, y: 0}; // Réinitialiser la direction du fantôme
}

// === Main game function ===
export function main(engine: Engine.GameEngine): void {
  const scene = engine.scene;
  //get scoreContainer from engine.ui
  const scoreContainer = engine.ui.getControlByName("scoreContainer") as GUI.Rectangle;
  scoreContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  scoreContainer.left = "-10px";
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

  let player1 = new Entities.Player(0, Spawn.spawn_pacman(scene), new BABYLON.Color3(1, 1, 0), Map.pacman_map, 0.12, ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
  player1.set_coordinates(Map.get_coord(Map.pacman_map,Map.CellType.PLAYER, 0));
  player1.direction = Utils.getDirection(Math.PI / 2); // Orientation initiale vers le haut
  characters.push(player1);

  let player2 = new Entities.Player(1, Spawn.spawn_pacman(scene), new BABYLON.Color3(0, 1, 0), Map.pacman_map, 0.12, ['w', 's', 'a', 'd']);
  player2.set_coordinates(Map.get_coord(Map.pacman_map,Map.CellType.PLAYER, 1));
  player2.direction = Utils.getDirection(Math.PI / 2); // Orientation initiale vers le haut
  characters.push(player2);

  Spawn.spawn_ghosts(scene, Map.pacman_map, characters);

  // Créer un éclairage de base
  new BABYLON.HemisphericLight("light1", BABYLON.Vector3.Backward(), scene);


  let balls = Spawn.spawn_terrain(scene, Map.pacman_map);
  void balls;
  // Déplacement de Pac-Man avec les touches fléchées
  scene.onBeforeRenderObservable.add(() => {
    engine.room.score.p1 = player1.score;
    engine.room.score.p2 = player2.score;
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
            character.score += 5; // Ajouter 10 points pour une petite bille
            character.SetInvulnerable(); // Activer l'invulnérabilité
            toRemoveBalls.push(index);
          }
        });
        toRemoveBalls.reverse().forEach(index =>{balls.bigBalls[index].dispose(); balls.bigBalls.splice(index, 1);});
        //check contact with ghosts
        characters.forEach(otherCharacter => {
          if (otherCharacter instanceof Entities.Ghost && Utils.distance(character.obj.position, otherCharacter.obj.position) < 1) {
            if (character.invulnerable) {
              respawnGhost(otherCharacter, Map.pacman_map); // Réapparaître le fantôme
              character.score = Math.max(0, character.score + 10); // Bonus de score
            } else {
              respawnPlayer(character, Map.pacman_map, characters); // Réapparaître le joueur
              character.score = Math.max(0, character.score - 10); // Pénalité de score
            }
          }
        });
      }
    });

    // Vérifier la fin du jeu
    if (balls.miniBalls.length === 0 && balls.bigBalls.length === 0)
      engine.EndGame();

  });

  // Démarrer le moteur
  engine.runRenderLoop(() => {
      scene.render();
  });
}