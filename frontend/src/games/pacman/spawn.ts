import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import * as Map from "./map";
import * as Entities from "./entities";
import * as Utils from "./utils";

export function spawn_terrain(scene: BABYLON.Scene, map: Map.GameMap): {miniBalls: BABYLON.Mesh[], bigBalls: BABYLON.Mesh[]} {

  const miniBalls: BABYLON.Mesh[] = [];
  const bigBalls: BABYLON.Mesh[] = [];
  // Parcourir chaque ligne et chaque caractère de la carte
  let offsetY = Map.get_offsetY(map); // Ajuster l'offset Y pour centrer la carte
  const wallMaterial = new BABYLON.StandardMaterial("wallMat", scene);
  wallMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.6); // Gris pour les murs
  //wallMaterial.disableDepthWrite = true;
  wallMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.6); // Légère lueur pour les murs
  //wallMaterial.disableLighting = true; // Désactiver l'éclairage pour un rendu uniforme

  const ballMaterial = new BABYLON.StandardMaterial("ballMat", scene);
  ballMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0);  // Jaune pour les boules
  ballMaterial.emissiveColor = new BABYLON.Color3(1, 1, 0); // Légère lueur jaune pour les boules
  const bigBallMaterial = new BABYLON.StandardMaterial("bigBallMat", scene);
  bigBallMaterial.diffuseColor = new BABYLON.Color3(0, 0, 1);  // Bleu pour les grosses boules
  bigBallMaterial.emissiveColor = new BABYLON.Color3(1, 0, 1); // Légère lueur bleue pour les grosses boules
  for (let y = 0; y < map.length; y++) {
      const line = map[y];
      for (let x = 0; x < line.length; x++) {
          const char = line[x];
          let position = new BABYLON.Vector3(x * Map.tileSize - ((line.length*Map.tileSize)/2) + (Map.tileSize/2), offsetY + (map.length - y - 1) * Map.tileSize, Map.tileSize / 2); 
          // Murs
          if (char === Map.CellType.WALL) {
              // Face de devant
              const wallFront = BABYLON.MeshBuilder.CreatePlane("wallFront", {size: Map.tileSize}, scene);
              wallFront.position = new BABYLON.Vector3(position.x, position.y, 0);  // Positionner les murs
              wallFront.material = wallMaterial;
              // Face de Haut
              if (Map.get_c(x, y - 1, map) !== Map.CellType.WALL)
              {
                  const wallTop = BABYLON.MeshBuilder.CreatePlane("wallTop", {size: Map.tileSize}, scene);
                  wallTop.position = new BABYLON.Vector3(position.x, position.y + (Map.tileSize/2), Map.tileSize / 2);  // Positionner les murs
                  wallTop.rotation.x = Math.PI / 2; // Rotation pour la face du haut
                  wallTop.material = wallMaterial;
              }
              // Face de Bas
              if (Map.get_c(x, y + 1, map) !== Map.CellType.WALL)
              {
                  const wallBottom = BABYLON.MeshBuilder.CreatePlane("wallBottom", {size: Map.tileSize, sideOrientation: BABYLON.Mesh.BACKSIDE}, scene);
                  wallBottom.position = new BABYLON.Vector3(position.x, position.y - (Map.tileSize/2), Map.tileSize / 2);  // Positionner les murs
                  wallBottom.rotation.x = Math.PI / 2; // Rotation pour la face du bas
                  wallBottom.material = wallMaterial;
              }
              // Face de Gauche
              if (Map.get_c(x - 1, y, map) !== Map.CellType.WALL)
              {
                  const wallLeft = BABYLON.MeshBuilder.CreatePlane("wallLeft", {size: Map.tileSize}, scene);
                  wallLeft.position = new BABYLON.Vector3(position.x - (Map.tileSize/2), position.y, Map.tileSize / 2);  // Positionner les murs
                  wallLeft.rotation.y = Math.PI / 2; // Rotation pour la face de gauche
                  wallLeft.material = wallMaterial;
              }
              // Face de Droite
              if (Map.get_c(x + 1, y, map) !== Map.CellType.WALL)
              {
                  const wallRight = BABYLON.MeshBuilder.CreatePlane("wallRight", {size: Map.tileSize}, scene);
                  wallRight.position = new BABYLON.Vector3(position.x + (Map.tileSize/2), position.y, Map.tileSize / 2);  // Positionner les murs
                  wallRight.rotation.y = -Math.PI / 2; // Rotation pour la face de droite
                  wallRight.material = wallMaterial;
              }

          }
          // Petites boules
          else if (char === Map.CellType.SMALL_BALL) {
              const ball = BABYLON.MeshBuilder.CreateSphere("ball", {diameter: 0.5}, scene);
              ball.position = new BABYLON.Vector3(position.x, position.y, Map.tileSize / 2);  // Positionner les boules
              ball.material = ballMaterial;
              miniBalls.push(ball);  // Ajouter la boule à la liste des petites boules
          }
          // Grosses boules
          else if (char === Map.CellType.BIG_BALL) {
              const bigBall = BABYLON.MeshBuilder.CreateSphere("bigBall", {diameter: 1}, scene);
              bigBall.position = new BABYLON.Vector3(position.x, position.y, Map.tileSize / 2);  // Positionner les grosses boules
              bigBall.material = bigBallMaterial;
              bigBalls.push(bigBall);  // Ajouter la grosse boule à la liste des grosses boules
          }
          // Espaces vides ou autres éléments
      }
  }
  return {miniBalls, bigBalls};
}

export function spawn_pacman(scene: BABYLON.Scene): BABYLON.Mesh {
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
  const pacManMouthMaterial = new BABYLON.StandardMaterial("pacManMat", scene);
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

export async function spawn_ghosts(scene: BABYLON.Scene, map: Map.GameMap, characters: Entities.Character[]): Promise<void> {
  try {
    // Charger le modèle STL dans un AssetContainer
    const container = await BABYLON.LoadAssetContainerAsync(
      "./assets/games/pacman/ghost.glb",  // Dossier où se trouve le modèle
      scene                      // La scène où charger l'asset
    );

    // Une fois le modèle chargé, on récupère les meshes dans le container
    const meshes = container.meshes;

    // Vérifier si des meshes ont été chargés
    if (meshes.length > 0) {
      const ghost = meshes[0] as BABYLON.Mesh; // Prendre le premier mesh du container
      //add other meshes to ghost (has children)
      for (let i = 1; i < meshes.length; i++) {
        const childMesh = meshes[i] as BABYLON.Mesh;
        ghost.addChild(childMesh); // Ajouter le mesh enfant au fantôme
      }
      //ghost.position = new BABYLON.Vector3(1, 2, -1); // Positionner le fantôme

      // Ajouter le container à la scène, pour que les meshes soient rendus
      container.addAllToScene();
      for (let i = 0; i < 4; i++) {
        const coord = Map.get_coord(map, Map.CellType.GHOST, i);
        const ghostClone = ghost.clone("ghost" + i);
        ghostClone.position = Utils.coordToPosition(coord, map);
        characters.push(new Entities.Ghost(i, ghostClone, map, 0.08));
      }
      //delete the original ghost mesh
      ghost.dispose();
    } else {
      console.warn("Aucun mesh trouvé dans le fichier ghost.stl");
    }
  } catch (error) {
    console.error("Erreur de chargement du modèle : ", error);
  }
}

