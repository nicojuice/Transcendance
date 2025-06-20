import { navigate } from "../nav";

export class Room {
  gameName: string;
  nextPage: string;
  players: any;
  withIA: any;
  withCustom: any;
  playerWinner: number;

  constructor() {
    this.gameName = "";
    this.nextPage = "profile";
    this.players = [];
    this.withIA = false;
    this.withCustom = false;
    this.playerWinner = 0;
  }

  addPlayer(playerName: string) {
    this.players.push(playerName);
  }

  loadFromLocalStorage() {
    const storedRoom = localStorage.getItem("currentRoom");
    if (storedRoom) {
      const parsedRoom = JSON.parse(storedRoom);
      this.gameName = parsedRoom.gameName || "";
      this.nextPage = parsedRoom.nextPage || "profile";
      this.playerWinner = parsedRoom.playerWinner || 0;
      this.withIA = parsedRoom.withIA || false;
      this.withCustom = parsedRoom.withCustom || false;
      this.players = parsedRoom.players || [];
    } else {
      console.warn("Aucune room trouvée dans localStorage, création d'une par défaut.");
    }
  }

  saveToLocalStorage() {
    localStorage.setItem("currentRoom", JSON.stringify(this));
  }
};


export function startGameAndNavigate(GameName: string) {
  const playersElement = document.getElementById("players") as HTMLSelectElement | null;
  const customElement = document.getElementById("custom") as HTMLSelectElement | null;
  console.log(customElement, "  avec ou pas custom")
  // const Username = document.getElementById("display-username") as HTMLSelectElement;
  if (!playersElement || !customElement) {
    throw new Error("Impossible de trouver les éléments 'players' ou 'custom'");
  }
  
  const numPlayers = Number(playersElement.value);
  const isCustom = customElement.value === "yes";
  const Username = localStorage.getItem("username")
  console.log(Username, " <-- le nom de l user");
  const room = new Room();
  room.withIA = numPlayers;
  room.players = Username;
  room.gameName = GameName
  room.withCustom = isCustom;
  room.saveToLocalStorage();

  // Navigation
  navigate("game");
}

(window as any).startGameAndNavigate = startGameAndNavigate;


