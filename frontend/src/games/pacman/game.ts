//import { navigate } from "../../nav";
import * as BABYLON from "@babylonjs/core";
//import * as GUI from "@babylonjs/gui";
import "@babylonjs/loaders";
import * as ROOM from "../room";
import * as Map from "./map";


/*function endGame(room: ROOM.Room): void {
  room.saveToLocalStorage();
  setTimeout(() => navigate(room.nextPage), 0);
}*/


function spawn_terrain(scene: BABYLON.Scene, map: Map.GameMap): {miniBalls: BABYLON.Mesh[], bigBalls: BABYLON.Mesh[]} {

  function get_c(x: number, y: number, map: Map.GameMap): Map.CellType
  {
    if (y < 0 || y >= map.length)
      return Map.CellType.EMPTY;  // Hors des limites sur l'axe y
    const line = map[map.length - y - 1];  // Pour inverser l'ordre des lignes (selon la carte)
    // Vérifier si x est hors des limites de la ligne
    if (x < 0 || x >= line.length)
      return Map.CellType.EMPTY;  // Hors des limites sur l'axe x
    // Retourner le caractère à la position (x, y)
    return line[x];
  }

  const miniBalls: BABYLON.Mesh[] = [];
  const bigBalls: BABYLON.Mesh[] = [];
  // Parcourir chaque ligne et chaque caractère de la carte
  let offsetY = Map.get_offsetY(map); // Ajuster l'offset Y pour centrer la carte
  const wallMaterial = new BABYLON.StandardMaterial("wallMat", scene);
  wallMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.6); // Gris pour les murs
  //wallMaterial.disableDepthWrite = true;
  wallMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.6); // Légère lueur pour les murs
  //wallMaterial.disableLighting = true; // Désactiver l'éclairage pour un rendu uniforme
  for (let y = 0; y < map.length; y++) {
      const line = map[map.length - y - 1];
      for (let x = 0; x < line.length; x++) {
          const char = line[x];
          // Murs
          if (char === '#') {
              // Face de devant
              const wallFront = BABYLON.MeshBuilder.CreatePlane("wallFront", {size: Map.tileSize}, scene);
              wallFront.position = new BABYLON.Vector3(x * Map.tileSize - 20, offsetY + y * Map.tileSize, 0);  // Positionner les murs
              wallFront.material = wallMaterial;
              // Face de Haut
              if (get_c(x, y + 1, map) !== '#')
              {
                  const wallTop = BABYLON.MeshBuilder.CreatePlane("wallTop", {size: Map.tileSize}, scene);
                  wallTop.position = new BABYLON.Vector3(x * Map.tileSize - 20, offsetY + y * Map.tileSize + (Map.tileSize/2), Map.tileSize / 2);  // Positionner les murs
                  wallTop.rotation.x = Math.PI / 2; // Rotation pour la face du haut
                  wallTop.material = wallMaterial;
              }
              // Face de Bas
              if (get_c(x, y - 1, map) !== '#')
              {
                  const wallBottom = BABYLON.MeshBuilder.CreatePlane("wallBottom", {size: Map.tileSize, sideOrientation: BABYLON.Mesh.BACKSIDE}, scene);
                  wallBottom.position = new BABYLON.Vector3(x * Map.tileSize - 20, offsetY + y * Map.tileSize - (Map.tileSize/2), Map.tileSize / 2);  // Positionner les murs
                  wallBottom.rotation.x = Math.PI / 2; // Rotation pour la face du bas
                  wallBottom.material = wallMaterial;
              }
              // Face de Gauche
              if (get_c(x - 1, y, map) !== '#')
              {
                  const wallLeft = BABYLON.MeshBuilder.CreatePlane("wallLeft", {size: Map.tileSize}, scene);
                  wallLeft.position = new BABYLON.Vector3(x * Map.tileSize - 20 - (Map.tileSize/2), offsetY + y * Map.tileSize, Map.tileSize / 2);  // Positionner les murs
                  wallLeft.rotation.y = Math.PI / 2; // Rotation pour la face de gauche
                  wallLeft.material = wallMaterial;
              }
              // Face de Droite
              if (get_c(x + 1, y, map) !== '#')
              {
                  const wallRight = BABYLON.MeshBuilder.CreatePlane("wallRight", {size: Map.tileSize}, scene);
                  wallRight.position = new BABYLON.Vector3(x * Map.tileSize - 20 + (Map.tileSize/2), offsetY + y * Map.tileSize, Map.tileSize / 2);  // Positionner les murs
                  wallRight.rotation.y = -Math.PI / 2; // Rotation pour la face de droite
                  wallRight.material = wallMaterial;
              }

          }
          // Petites boules
          else if (char === '*') {
              const ball = BABYLON.MeshBuilder.CreateSphere("ball", {diameter: 0.5}, scene);
              ball.position = new BABYLON.Vector3(x * Map.tileSize - 20, offsetY + y * Map.tileSize, Map.tileSize / 2);  // Positionner les boules
              const ballMaterial = new BABYLON.StandardMaterial("ballMat", scene);
              ballMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0);  // Jaune pour les boules
              ball.material = ballMaterial;
              miniBalls.push(ball);  // Ajouter la boule à la liste des petites boules
          }
          // Grosses boules
          else if (char === '@') {
              const bigBall = BABYLON.MeshBuilder.CreateSphere("bigBall", {diameter: 1}, scene);
              bigBall.position = new BABYLON.Vector3(x * Map.tileSize - 20, offsetY + y * Map.tileSize, Map.tileSize / 2);  // Positionner les grosses boules
              const bigBallMaterial = new BABYLON.StandardMaterial("bigBallMat", scene);
              bigBallMaterial.diffuseColor = new BABYLON.Color3(0, 0, 1);  // Bleu pour les grosses boules
              bigBall.material = bigBallMaterial;
              bigBalls.push(bigBall);  // Ajouter la grosse boule à la liste des grosses boules
          }
          // Espaces vides ou autres éléments
          else if (char === ' ') {
              // Aucun élément à générer pour les espaces vides
          }
      }
  }
  return {miniBalls, bigBalls};
}

function spawn_pacman(scene: BABYLON.Scene): BABYLON.Mesh {
  let pacMan = BABYLON.MeshBuilder.CreateSphere("pacMan", {diameter: 2, segments: 16}, scene);
  pacMan.isVisible = false;  // Rendre la sphère invisible
  //pacMan.checkCollisions = true;  // Permettre les intersections avec cette sphère

  // Créer la demi-sphère du haut (partie supérieure de la bouche)
  const pacManMouthUp = BABYLON.CreateHemisphere("pacManMouthUp", {diameter: 2, segments: 16}, scene);
  pacManMouthUp.parent = pacMan;  // Définir "pacMan" comme parent

  // Créer la demi-sphère du bas (partie inférieure de la bouche)
  const pacManMouthDown = BABYLON.CreateHemisphere("pacManMouthDown", {diameter: 2, segments: 16}, scene);
  pacManMouthDown.parent = pacMan;  // Définir "pacMan" comme parent
  pacManMouthDown.rotation.x = Math.PI;  // Inverser la demi-sphère du bas pour qu'elle soit orientée vers le bas

  // Définir le matériau pour les deux demi-sphères de la bouche
  const pacManMouthMaterial = new BABYLON.StandardMaterial("mouth", scene);
  pacManMouthMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0); // Noir pour la bouche
  //pacManMouthMaterial.emissiveColor = new BABYLON.Color3(1, 0, 0); // Noir pour l'émissivité
  //pacManMouthMaterial.disableLighting = true; // Désactive l'influence des lumières
  pacManMouthUp.material = pacManMouthMaterial;
  pacManMouthDown.material = pacManMouthMaterial;

  const rotationAnimation = new BABYLON.Animation(
      "rotation", 
      "rotation.z", 
      30, // Vitesse de l'animation
      BABYLON.Animation.ANIMATIONTYPE_FLOAT, 
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
  );

  // Définir les clés pour ouvrir et fermer la bouche (en jouant sur la rotation)
  const keys = [
      { frame: 0, value: 0 },  // Bouche fermée
      { frame: 15, value: Math.PI / 3 }, // Bouche ouverte (rotation)
      { frame: 30, value: 0 },  // Bouche fermée à nouveau
  ];
  rotationAnimation.setKeys(keys);

  // Ajouter l'animation de rotation aux deux demi-sphères
  pacManMouthUp.animations.push(rotationAnimation);
  pacManMouthDown.animations.push(rotationAnimation);
  // Démarrer l'animation
  scene.beginAnimation(pacManMouthUp, 0, 30, true);
  scene.beginAnimation(pacManMouthDown, 0, 30, true);
  return pacMan;
}

function spawnGhosts(scene: BABYLON.Scene): BABYLON.AbstractMesh[] {
  let ghosts: BABYLON.AbstractMesh[] = [];
  BABYLON.SceneLoader.ImportMesh(
      "", 
      "./assets/games/pacman/", 
      "ghost.stl", 
      scene, 
      (meshes) => {
        //merge les meshes importés
        // Vérifier si des meshes ont été chargés
        if (meshes.length > 0) {
          const ghostMaterial = new BABYLON.StandardMaterial("ghostMat", scene);
            ghostMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);  // Rouge pour le fantôme
            //ghostMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);  // Légère lueur rouge

            // Appliquer le matériau à tous les meshes avant la fusion
            meshes.forEach(mesh => {
                mesh.material = ghostMaterial; // Appliquer le même matériau
                mesh.scaling = new BABYLON.Vector3(0.065, 0.065, 0.065); // Redimensionner
                mesh.position = new BABYLON.Vector3(0, -1.5, 1); // Positionner le fantôme
            });
          //Supprimer les meshes importés
        } else {
          console.warn("Aucun mesh trouvé dans le fichier ghost.stl");
        }
      },
      (progress) => {
        void progress;
        //console.log("Progression du chargement : ", progress);
      },
      (scene, message) => {
        void scene;
        console.error("Erreur de chargement du modèle : ", message);
      }
  );
  return ghosts;
}

function distance(a: BABYLON.Vector3, b: BABYLON.Vector3): number {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2));
}

// === Main game function ===
export function main(engine: BABYLON.Engine, canvas: HTMLCanvasElement, room: ROOM.Room): () => void {
  void room;
  void canvas;
  const scene = new BABYLON.Scene(engine);
  
  spawnGhosts(scene);


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

  const pacMan = spawn_pacman(scene);
  const pos = Map.get_coord(Map.pacman_map,Map.CellType.PLAYER, 0);
  pacMan.position = new BABYLON.Vector3(pos.x * Map.tileSize - 20, Map.get_offsetY(Map.pacman_map) + ((Map.pacman_map.length - pos.y - 1) * Map.tileSize), 1);

  // Créer un éclairage de base
  new BABYLON.HemisphericLight("light1", BABYLON.Vector3.Backward(), scene);


  let balls = spawn_terrain(scene, Map.pacman_map);
  void balls;
  // Déplacement de Pac-Man avec les touches fléchées
  const speed = 0.1;
  scene.onBeforeRenderObservable.add(() => {
      /*//change material of children of pacMan
      const pacManMaterial = new BABYLON.StandardMaterial("pacManMat", scene);
      pacManMaterial.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random()); // Jaune pour
      pacMan.getChildMeshes().forEach(child => {
          if (child.material) {
              child.material = pacManMaterial; // Appliquer le matériau à chaque enfant
          }
      });*/
      if (inputMap["ArrowUp"])
      {
        pacMan.rotation.z = Math.PI / 2; // Tourner
        pacMan.position.y += speed;
      }
      else if (inputMap["ArrowDown"])
      {
        pacMan.rotation.z = -Math.PI / 2; // Tourner
        pacMan.position.y -= speed;
      }
      else if (inputMap["ArrowLeft"])
      {
        pacMan.rotation.z = Math.PI; // Tourner
        pacMan.position.x -= speed;
      }
      else if (inputMap["ArrowRight"])
      {
        pacMan.rotation.z = 0; // Tourner
        pacMan.position.x += speed;
      }

      // Vérifier les collisions avec les billes
      let toRemoveBalls: number[] = [];
      balls.miniBalls.forEach((ball, index) => {
          if (distance(pacMan.position, ball.position) < 1)
              toRemoveBalls.push(index);
      });
      toRemoveBalls.reverse().forEach(index =>{balls.miniBalls[index].dispose(); balls.miniBalls.splice(index, 1);});
      toRemoveBalls = [];
      balls.bigBalls.forEach((bigBall, index) => {
          if (distance(pacMan.position, bigBall.position) < 1)
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