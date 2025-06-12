export enum CellType {
    WALL = '#',     // Mur
    SMALL_BALL = '*', // Petite boule
    BIG_BALL = '@',   // Grosse boule
    PLAYER = 'C',  // Joueur (Pacman)
    EMPTY = ' '      // Espace vide
}

export type GameMap = CellType[][];

function convertMapToEnum(map: string): GameMap {
    // Diviser la carte en lignes
    const lines = map.split('\n');
    
    // Créer un tableau 2D pour stocker les cellules de type enum
    const mapArray: CellType[][] = [];

    // Parcourir chaque ligne
    for (let y = 0; y < lines.length; y++) {
        const line = lines[y];
        const row: CellType[] = [];
        
        // Parcourir chaque caractère de la ligne
        for (let x = 0; x < line.length; x++) {
            const char = line.charAt(x);
            
            // Convertir le caractère en type d'enum
            switch (char) {
                case '#':
                    row.push(CellType.WALL);
                    break;
                case '*':
                    row.push(CellType.SMALL_BALL);
                    break;
                case '@':
                    row.push(CellType.BIG_BALL);
                    break;
                case 'C':
                    row.push(CellType.PLAYER);
                    break;
                case ' ':
                    row.push(CellType.EMPTY);
                    break;
                default:
                    row.push(CellType.EMPTY); // Valeur par défaut pour un caractère inconnu
                    break;
            }
        }
        mapArray.push(row); // Ajouter la ligne au tableau 2D
    }

    return mapArray;
}

export const tileSize = 2;// Taille d'un carreau

export function get_offsetY(map: GameMap): number {
  const height = map.length;
  return -((height / 2.0) * tileSize) + (tileSize/2); // Ajuster l'offset Y pour centrer la carte
}

export function get_coord(map: GameMap, c: CellType, index: number): {x: number, y: number} {
  let count = 0;
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === c) {
        if (count === index)
          return {x: x, y: y};
        count++;
      }
    }
  }
  return {x: -1, y: -1}; // Retourne -1 si le caractère n'est pas trouvé
}

export function get_c(x: number, y: number, map: GameMap): CellType
{
  if (y < 0 || y >= map.length)
    return CellType.EMPTY;  // Hors des limites sur l'axe y
  const line = map[y];  // Pour inverser l'ordre des lignes (selon la carte)
  // Vérifier si x est hors des limites de la ligne
  if (x < 0 || x >= line.length)
    return CellType.EMPTY;  // Hors des limites sur l'axe x
  // Retourner le caractère à la position (x, y)
  return line[x];
}



let pacman_map_string = `\
#######################
#**********#**********#
#@###*####*#*####*###@#
#*###*####*#*####*###*#
#*********************#
#*###*#*#######*#*###*#
#*****#*#######*#*****#
#*###*#****#****#*#####
#*###*####*#*####*#####
#*###*#         #*#####
#*###*# ### ### #*#####
#    *  #MM MM#  *    #
#####*# ####### #*###*#
#####*#         #*###*#
#####*# ####### #*###*#
#####*# ####### #*###*#
#**********#**********#
#*###*####*#*####*###*#
#@**#******C******#**@#
###*#*#*#######*#*#*###
#*****#****#****#*****#
#*########*#*########*#
#*########*#*########*#
#*********************#
#######################`;

export const pacman_map: GameMap = convertMapToEnum(pacman_map_string);