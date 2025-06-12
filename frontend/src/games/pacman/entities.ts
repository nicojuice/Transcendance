import * as BABYLON from "@babylonjs/core";
import * as Map from "./map";
import * as Utils from "./utils";
import * as Engine from "../engine";

export abstract class Character {
  obj: BABYLON.Mesh; // L'objet du personnage
  map: Map.GameMap; // La carte du jeu
  speed: number; // La vitesse de déplacement du personnage

  constructor(obj: BABYLON.Mesh, map: Map.GameMap, speed: number) {
    this.obj = obj;
    this.map = map;
    this.speed = speed;
  }

  // Méthode abstraite : Chaque classe dérivée doit définir cette méthode
  abstract Input(engine: Engine.GameEngine): boolean[];

  abstract Update(engine: Engine.GameEngine): void;

  // Méthode pour effectuer le déplacement basé sur les entrées et la carte
  Move(engine: Engine.GameEngine) {
    const delta = engine.getDeltaTime() / 16.666;  // Calcul du temps entre les frames
    let direction = Utils.getDirection(this.obj.rotation.z); // Direction du mouvement
    const player_coord = Utils.positionToCoord(this.obj.position, this.map); // Coordonnées du joueur
    const ajustPosition = Utils.coordToPosition(player_coord, this.map); // Position ajustée au centre de la case
    let next_coord = { x: player_coord.x + direction.x, y: player_coord.y - direction.y }; // Prochaine coordonnée

    // Vérification si Pac-Man est centré sur la case
    let isCentered = Utils.distance(this.obj.position, ajustPosition) <= (this.speed * delta) * 1.1;

    let old_data = { rotation: this.obj.rotation.z, direction: direction, next_coord: next_coord };

    // Si le joueur est centré sur la case, changer la direction selon les touches
    if (isCentered) {
      const [up, down, left, right] = this.Input(engine); // Récupérer les entrées directionnelles
      if (up && direction.y == 0) this.obj.rotation.z = Math.PI / 2;
      else if (down && direction.y == 0) this.obj.rotation.z = -Math.PI / 2;
      else if (left && direction.x == 0) this.obj.rotation.z = Math.PI;
      else if (right && direction.x == 0) this.obj.rotation.z = 0;

      direction = Utils.getDirection(this.obj.rotation.z);
      next_coord = { x: player_coord.x + direction.x, y: player_coord.y - direction.y };

      // Vérifier si la case suivante est un mur
      if (Map.get_c(next_coord.x, next_coord.y, this.map) === Map.CellType.WALL) {
        this.obj.rotation.z = old_data.rotation; // Revenir à l'ancienne rotation
        direction = old_data.direction; // Revenir à l'ancienne direction
        next_coord = old_data.next_coord; // Revenir à l'ancienne coordonnée
      }
    }

    // Si Pac-Man n'est pas centré ou qu'il n'y a pas de mur, se déplacer
    if (Map.get_c(next_coord.x, next_coord.y, this.map) !== Map.CellType.WALL || !isCentered)
    {
      this.obj.position = this.obj.position.add(new BABYLON.Vector3(direction.x * (this.speed * delta), direction.y * (this.speed * delta), 0));
      // Ajuster la position de Pac-Man en fonction de la direction
      if (direction.x !== 0) this.obj.position.y = ajustPosition.y;
      else this.obj.position.x = ajustPosition.x;
    } else {
      // Si Pac-Man est centré sur la case et n'y a pas de mur, ajuster la position exactement au centre
      this.obj.position = ajustPosition;
    }
  }

  set_coordinates(coord: {x: number, y: number}) {
    // Mettre à jour la position de l'objet en fonction des coordonnées x et y
    this.obj.position = Utils.coordToPosition({ x: coord.x, y: coord.y }, this.map);
  }
}


export class Player extends Character {
    inputKey: string[]; // Clés d'entrée pour le joueur
  constructor(obj: BABYLON.Mesh, map: Map.GameMap, speed: number, inputKey: string[]) {
    super(obj, map, speed); // Appel du constructeur parent (Character)
    this.inputKey = inputKey;
  }

  // Redéfinir la méthode Input pour gérer les entrées spécifiques au joueur
  Input(engine: Engine.GameEngine): boolean[] {
    return [
        engine.inputMap[this.inputKey[0]],   // Up
        engine.inputMap[this.inputKey[1]], // Down
        engine.inputMap[this.inputKey[2]], // Left
        engine.inputMap[this.inputKey[3]]  // Right
    ];
  }

  Update(engine: Engine.GameEngine): void {
    // Mettre à jour la position du joueur en fonction des entrées
    this.Move(engine);
  }
}
