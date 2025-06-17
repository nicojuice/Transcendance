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


export function floodfill(map: Map.GameMap, start_coord:{x: number, y: number}): number[][] {
  const width = map[0].length;
  const height = map.length;
  const visited: boolean[][] = Array.from({ length: height }, () => Array(width).fill(false));
  const queue: {x: number, y: number}[] = [start_coord];
  const distances: number[][] = Array.from({ length: height }, () => Array(width).fill(-1));
  
  distances[start_coord.y][start_coord.x] = 0; // Distance de départ est 0
  visited[start_coord.y][start_coord.x] = true;

  while (queue.length > 0) {
    const { x, y } = queue.shift()!;
    
    // Vérifier les directions (haut, bas, gauche, droite)
    const directions = [
      { dx: 0, dy: -1 }, // Haut
      { dx: 0, dy: 1 }, // Bas
      { dx: -1, dy: 0 }, // Gauche
      { dx: 1, dy: 0 } // Droite
    ];

    for (const { dx, dy } of directions) {
      const newX = x + dx;
      const newY = y + dy;

      if (newX >= 0 && newX < width && newY >= 0 && newY < height &&
          !visited[newY][newX] && map[newY][newX] !== Map.CellType.WALL) {
        visited[newY][newX] = true;
        distances[newY][newX] = distances[y][x] + 1; // Mettre à jour la distance
        queue.push({ x: newX, y: newY });
      }
    }
  }

  return distances;
}

export function emptyfloodfill(map: Map.GameMap): number[][] {
  const width = map[0].length;
  const height = map.length;
  //return a 2D array filled with -1 if the cell is a wall, and 0 otherwise
  const distances: number[][] = Array.from({ length: height }, () => Array(width).fill(-1));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (map[y][x] !== Map.CellType.WALL) {
        distances[y][x] = 0; // Initialiser la distance à 0 pour les cellules non murées
      }
    }
  }
  return distances;
}

export function addfloodfill(floodfill_1: number[][], floodfill_2: number[][]): number[][] {
  const height = floodfill_1.length;
  const width = floodfill_1[0].length;
  //if case is not -1, add the two values
  const result: number[][] = Array.from({ length: height }, () => Array(width).fill(-1));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (floodfill_1[y][x] !== -1 && floodfill_2[y][x] !== -1) {
        result[y][x] = floodfill_1[y][x] + floodfill_2[y][x];
      } else {
        result[y][x] = -1; // Si l'une des cases est -1, on met -1
      }
    }
  }
  return result;
}