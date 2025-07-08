import * as BABYLON from "@babylonjs/core";
import * as Map from "./map";
import * as Utils from "./utils";
import * as Engine from "../engine";
import { getText } from "../../i18n";

export abstract class Character {
  obj: BABYLON.Mesh; // L'objet du personnage
  map: Map.GameMap; // La carte du jeu
  speed: number; // La vitesse de déplacement du personnage
  direction: {x: number, y: number};
  private last_crossing: {x: number, y: number}; // Dernière fois que la direction a été changée

  constructor(obj: BABYLON.Mesh, map: Map.GameMap, speed: number) {
    this.obj = obj;
    this.map = map;
    this.speed = speed;
    this.direction = {x: 0, y: 0};
    this.last_crossing = {x: -1, y: -1}; // Initialiser le dernier croisement à 0
  }

  // Méthode abstraite : Chaque classe dérivée doit définir cette méthode
  abstract Input(engine: Engine.GameEngine): boolean[];

  abstract Update(engine: Engine.GameEngine): void;

  abstract is_wall(x: number, y: number, map: Map.GameMap): boolean;

  // Méthode pour effectuer le déplacement basé sur les entrées et la carte
  Move(engine: Engine.GameEngine) {
    const delta = engine.getDeltaTime() / 16.666;  // Calcul du temps entre les frames
    const new_speed = Math.min(this.speed * delta, Map.tileSize/4); // Vitesse ajustée pour le delta
    const obj_coord = Utils.positionToCoord(this.obj.position, this.map); // Coordonnées du joueur
    const ajustPosition = Utils.coordToPosition(obj_coord, this.map); // Position ajustée au centre de la case
    let next_coord = { x: obj_coord.x + this.direction.x, y: obj_coord.y - this.direction.y }; // Prochaine coordonnée

    // Vérification si Pac-Man est centré sur la case
    let isCentered = Utils.distance(this.obj.position, ajustPosition) <= new_speed * 1.1;

    let old_data = { rotation: this.obj.rotation.z, direction: this.direction, next_coord: next_coord };

    // Si le joueur est centré sur la case, changer la direction selon les touches
    if (isCentered && (this.last_crossing.x !== ajustPosition.x || this.last_crossing.y !== ajustPosition.y)) {
      const isBlocked = Number(this.is_wall(obj_coord.x + 1, obj_coord.y, this.map)) +
                      Number(this.is_wall(obj_coord.x - 1, obj_coord.y, this.map)) +
                      Number(this.is_wall(obj_coord.x, obj_coord.y + 1, this.map)) +
                      Number(this.is_wall(obj_coord.x, obj_coord.y - 1, this.map)) >= 3;
      const [up, down, left, right] = this.Input(engine); // Récupérer les entrées directionnelles
      if (up && (this.direction.y == 0 || isBlocked)) this.direction = {x: 0, y: 1}; // Haut
      else if (down && (this.direction.y == 0 || isBlocked)) this.direction = {x: 0, y: -1}; // Bas
      else if (left && (this.direction.x == 0 || isBlocked)) this.direction = {x: -1, y: 0}; // Gauche
      else if (right && (this.direction.x == 0 || isBlocked)) this.direction = {x: 1, y: 0}; // Droite
      next_coord = { x: obj_coord.x + this.direction.x, y: obj_coord.y - this.direction.y };

      // Vérifier si la case suivante est un mur
      if (this.is_wall(next_coord.x, next_coord.y, this.map)) {
        this.obj.rotation.z = old_data.rotation; // Revenir à l'ancienne rotation
        this.direction = old_data.direction; // Revenir à l'ancienne direction
        next_coord = old_data.next_coord; // Revenir à l'ancienne coordonnée
      }
      else if (!isBlocked)
        this.last_crossing = {x: ajustPosition.x, y: ajustPosition.y}; // Mettre à jour le dernier croisement
    }

    // Si Pac-Man n'est pas centré ou qu'il n'y a pas de mur, se déplacer
    if (!this.is_wall(next_coord.x, next_coord.y, this.map)|| !isCentered)
    {
      this.obj.position = this.obj.position.add(new BABYLON.Vector3(this.direction.x * new_speed, this.direction.y * new_speed, 0));
      // Ajuster la position de Pac-Man en fonction de la direction
      if (this.direction.x !== 0) this.obj.position.y = ajustPosition.y;
      else this.obj.position.x = ajustPosition.x;
    } else {
      // Si Pac-Man est centré sur la case et n'y a pas de mur, ajuster la position exactement au centre
      this.obj.position = ajustPosition;
    }
  }

  set_coordinates(coord: {x: number, y: number}) {
    // Mettre à jour la position de l'objet en fonction des coordonnées x et y
    this.obj.position = Utils.coordToPosition({ x: coord.x, y: coord.y }, this.map);
    this.last_crossing = {x: -1, y: -1};
  }

  get_coordinates(): {x: number, y: number} {
    // Convertir la position de l'objet en coordonnées x et y
    return Utils.positionToCoord(this.obj.position, this.map);
  }
}

export class Ghost extends Character {
  id: number; // Identifiant du joueur
  public static readonly SPEED: number = 0.08;
  constructor(id: number, obj: BABYLON.Mesh, map: Map.GameMap, speed: number) {
    super(obj, map, speed); // Appel du constructeur parent (Character)
    this.id = id; // Initialiser l'identifiant du joueur
    this.direction = {x: 1, y: 0};
  }

  Input(engine: Engine.GameEngine): boolean[] {
    void engine; // Pas d'entrées pour les fantômes
    //return [false, false, false, false]; // Pas d'entrées pour les fantômes
    //random input for ghost movement
    return [
      Math.random() < 0.3, // Up
      Math.random() < 0.4, // Down
      Math.random() < 0.5, // Left
      Math.random() < 0.6  // Right
    ]; // Retourne un tableau de booléens aléatoires pour simuler le mouvement des fantômes
  }

  Update(engine: Engine.GameEngine): void {
    this.Move(engine); // Appeler la méthode Move pour déplacer le fantôme
  }

  is_wall(x: number, y: number, map: Map.GameMap): boolean {
    // Vérifier si la case est un mur
    const cell = Map.get_c(x, y, map);
    return cell === Map.CellType.WALL;
  }
}


export class Player extends Character {
  id: number; // Identifiant du joueur
  inputKey: string[]; // Clés d'entrée pour le joueur
  score: number; // Score du joueur
  invulnerable: boolean; // Indique si le joueur est invulnérable
  invulnerableTime: number = 0; // Temps d'invulnérabilité
  base_color: BABYLON.Color3; // Couleur du joueur
  public static readonly SPEED: number = 0.12; // Vitesse de déplacement du joueur
  constructor(id: number, obj: BABYLON.Mesh, base_color: BABYLON.Color3, map: Map.GameMap, speed: number, inputKey: string[]) {
    super(obj, map, speed); // Appel du constructeur parent (Character)
    this.id = id; // Initialiser l'identifiant du joueur
    this.inputKey = inputKey;
    this.score = 0; // Initialiser le score à 0
    this.invulnerable = false; // Initialiser l'état d'invulnérabilité à faux
    this.base_color = base_color; // Couleur de base du joueur
    this.SetColor(base_color); // Appliquer la couleur de base
  }

  is_wall(x: number, y: number, map: Map.GameMap): boolean {
    // Vérifier si la case est un mur
    const cell = Map.get_c(x, y, map);
    return cell === Map.CellType.WALL || cell === Map.CellType.INVISIBLE_WALL;
  }

  SetColor(color: BABYLON.Color3) {
    const pacManMaterial = new BABYLON.StandardMaterial("pacManMat", this.obj.getScene()).clone("pacManMat"+this.id);
    pacManMaterial.diffuseColor = color; // Appliquer la couleur spécifiée
    this.obj.getChildMeshes().forEach(child => {
        if (child.material) {
            child.material = pacManMaterial; // Appliquer le matériau à chaque enfant
        }
    });
    this.obj.material = pacManMaterial; // Appliquer le matériau à l'objet principal
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

  SetInvulnerable() {
    this.invulnerable = true; // Activer l'invulnérabilité
    //10 secondes d'invulnérabilité
    this.invulnerableTime = 10 * 1000; // 10 secondes en millisecondes
    this.SetColor(new BABYLON.Color3(1, 0, 1)); // Changer la couleur en rose
  }

  Update(engine: Engine.GameEngine): void {
    // Vérifier si le joueur est invulnérable
    if (this.invulnerable) {
      this.invulnerableTime -= engine.getDeltaTime(); // Décrémenter le temps d'invulnérabilité
      if (this.invulnerableTime <= 0) {
        this.invulnerable = false; // Désactiver l'invulnérabilité
        this.SetColor(this.base_color); // Revenir à la couleur de base
      }
      //clignoter le joueur si il reste 2 secondes d'invulnérabilité
      else if (this.invulnerableTime <= 2000)
      {
        const blinkColor = (Math.floor(this.invulnerableTime / 100) % 2 === 0) ? new BABYLON.Color3(1, 0, 1) : this.base_color;
        this.SetColor(blinkColor);
      }
    }
    // Mettre à jour la position du joueur en fonction des entrées
    this.Move(engine);
    this.obj.rotation.z = Utils.getRotation(this.direction); // Mettre à jour la rotation du joueur en fonction de la direction
  }
}

export enum PowerUpType {
  PlayerSpeed = 1, // Bonus : Augmente la vitesse du joueur
  GhostSpeed = 2, // Bonus : Augmente la vitesse des fantômes
  PlayerInvulnerable = 3, // Bonus : Rend le joueur invulnérable
  InvertedControls = 4, // Malus : Inverse les contrôles du joueur
  GhostsFreeze = 5, // Malus : Gèle les fantômes
  PlayerScore = 6 // Bonus : Ajoute des points au score du joueur,
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

  constructor(scene: BABYLON.Scene, map: Map.GameMap, type: PowerUpType) {
    this.type = type;
    const boxMat = new BABYLON.StandardMaterial("boxMat", scene);
    boxMat.emissiveColor = new BABYLON.Color3(0.6, 0.6, 0.6);
    boxMat.disableLighting = true;
    //boxMat.alpha = 0.75;
    boxMat.diffuseTexture = new BABYLON.Texture(`/assets/games/pacman/bonus.png`, scene);
    //glow effect
    this.mesh = BABYLON.MeshBuilder.CreateBox("powerUpBox", { size: 1.9, faceUV: [
      new BABYLON.Vector4(1, 0, 1, 1), // face 0 (arrière)
      new BABYLON.Vector4(1, 0, 1, 1), // face 1 (avant)
      new BABYLON.Vector4(1, 0, 1, 1), // face 2 (droite)
      new BABYLON.Vector4(1, 0, 1, 1), // face 3 (gauche)

      // face 4 (haut) avec UV tournés de 90° (swap U et V)
      new BABYLON.Vector4(0, 0, 1, 1), // correspond à une rotation 90°

      new BABYLON.Vector4(0, 0, 1, 1), // face 5 (bas)
    ]}, scene);
    this.mesh.scaling.y = 0.5; // Réduire la taille en X pour que la box soit plus plate
    const spawn_count = Map.count_cells(map, Map.CellType.POWER_UP);
    const coord = Map.get_coord(map, Map.CellType.POWER_UP, Math.floor(Math.random() * spawn_count));
    this.mesh.position = Utils.coordToPosition(coord, map);
    this.mesh.rotation.y = Math.PI/2;
    this.mesh.rotation.z = Math.PI/2;
    //this.mesh.rotation.z = -Math.PI/6;
    this.mesh.material = boxMat;
  }
  public HandleCollision(player: Player): boolean
  {
    const boxSize = 3; // Taille de la box
    const boxHalfSize = boxSize / 2;
    const playerPos = player.obj.position;
    return Utils.distance(playerPos, this.mesh.position) < boxHalfSize + 0.5; // Vérifier si le joueur est proche de la box
  }

  public remove(): void {
    this.mesh.dispose(); // Supprimer la box de la scène
  }
}

export class PowerUp
{
  public type: PowerUpType;
  public timeout: number;
  public player: Player;
  public characters: Character[];

  constructor(type: PowerUpType, player: Player, characters: Character[], timeout: number = 10) {
    this.type = type;
    this.player = player;
    this.characters = characters;
    this.timeout = timeout * 1000;
  }

  public applyEffect(): void {
    switch (this.type) {
      case PowerUpType.PlayerSpeed:
        this.player.speed *= 1.5; // Augmenter la vitesse du joueur
        break;
      case PowerUpType.GhostSpeed:
        this.characters.forEach(ghost => {
          if (ghost instanceof Ghost) {
            ghost.speed *= 1.5; // Augmenter la vitesse des fantômes
          }
        });
        break;
      case PowerUpType.PlayerInvulnerable:
        this.player.SetInvulnerable(); // Activer l'invulnérabilité du joueur
        this.player.invulnerableTime = 30 * 1000; // 10 secondes d'invulnérabilité
        break;
      case PowerUpType.InvertedControls:
        // Inverser les contrôles du joueur
        const originalInput = this.player.inputKey.slice(); // Sauvegarder les contrôles originaux
        this.player.inputKey[0] = this.player.inputKey[1]; // Haut devient Bas
        this.player.inputKey[1] = originalInput[0]; // Bas devient Haut
        this.player.inputKey[2] = this.player.inputKey[3]; // Gauche devient Droite
        this.player.inputKey[3] = originalInput[2]; // Droite devient Gauche
        break;
      case PowerUpType.GhostsFreeze:
        this.characters.forEach(ghost => {
          if (ghost instanceof Ghost) {
            ghost.speed = 0; // Geler les fantômes
          }
        });
        break;
      case PowerUpType.PlayerScore:
        this.player.score += 30; // Ajouter des points au score du joueur
        break;
    }
  }

  public removeEffect(): void {
    switch (this.type) {
      case PowerUpType.PlayerSpeed:
        this.player.speed /= 1.5; // Rétablir la vitesse du joueur
        break;
      case PowerUpType.GhostSpeed:
        this.characters.forEach(ghost => {
          if (ghost instanceof Ghost) {
            ghost.speed /= 1.5; // Rétablir la vitesse des fantômes
          }
        });
        break;
      case PowerUpType.PlayerInvulnerable:
        //Pas d'effet à supprimer pour l'invulnérabilité, elle expire automatiquement
        break;
      case PowerUpType.InvertedControls:
        // Rétablir les contrôles du joueur
        const originalInput = this.player.inputKey.slice(); // Sauvegarder les contrôles originaux
        this.player.inputKey[0] = originalInput[1]; // Haut redevient Bas
        this.player.inputKey[1] = originalInput[0]; // Bas redevient Haut
        this.player.inputKey[2] = originalInput[3]; // Gauche redevient Droite
        this.player.inputKey[3] = originalInput[2]; // Droite redevient Gauche
        break;
      case PowerUpType.GhostsFreeze:
        this.characters.forEach(ghost => {
          if (ghost instanceof Ghost) {
            ghost.speed = Ghost.SPEED; // Rétablir la vitesse des fantômes
          }
        });
        break;
      case PowerUpType.PlayerScore:
        // Pas d'effet à supprimer pour le score
        break;
    }
  }

  public msg(): string {
   return getText("game.pacman."+PowerUpType[this.type]);
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