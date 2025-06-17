import * as Map from "./map";
import * as BABYLON from "@babylonjs/core";

export function distance(a: BABYLON.Vector3, b: BABYLON.Vector3): number {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2));
}

export function positionToCoord(position: BABYLON.Vector3, map: Map.GameMap): {x: number, y: number} {
  const x = Math.floor((position.x + 0.5 + ((map[0].length*Map.tileSize)/2) - (Map.tileSize/2)) / Map.tileSize);
  let y = Math.floor((position.y + 0.5 - Map.get_offsetY(map)) / Map.tileSize);
  y = map.length - 1 - y; // Inverser l'axe Y pour correspondre à la carte
  return {x: x, y: y};
}

export function coordToPosition(coord: {x: number, y: number}, map: Map.GameMap): BABYLON.Vector3 {
  const x = coord.x * Map.tileSize - ((map[0].length*Map.tileSize)/2) + (Map.tileSize/2); // Décalage de 20 pour centrer la carte
  const y = Map.get_offsetY(map) + ((map.length - 1 - coord.y) * Map.tileSize); // Inverser l'axe Y pour correspondre à la carte
  return new BABYLON.Vector3(x, y, Map.tileSize / 2); // Z est fixé à la moitié de la taille du carreau
}

export function getDirection(rotation: number): {x: number, y: number} {
  // Convertir la rotation en radians
  const radians = rotation % (2 * Math.PI);
  // Calculer la direction en fonction de la rotation
  return {
    x: Math.round(Math.cos(radians)),
    y: Math.round(Math.sin(radians))
  };
}

export function getRotation(direction: {x: number, y: number}): number {
  // Calculer la rotation en fonction de la direction
  if (direction.x === 1 && direction.y === 0) return 0; // Droite
  if (direction.x === -1 && direction.y === 0) return Math.PI; // Gauche
  if (direction.x === 0 && direction.y === 1) return Math.PI / 2; // Haut
  if (direction.x === 0 && direction.y === -1) return -Math.PI / 2; // Bas
  return 0; // Par défaut, retourner zéro si la direction n'est pas reconnue
}