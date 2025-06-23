import { navigate } from "../nav";

export enum Winner {
  PLAYER1 = "PLAYER1",
  PLAYER2 = "PLAYER2",
  IA = "IA",
  DRAW = "DRAW",
  NONE = "NONE"
}

export class PlayerRoom
{
  public name: string;
  public score: number;
  public avatar: string;

  constructor(name: string, avatar: string = "") {
    this.name = name;
    this.score = 0;
    this.avatar = avatar;
  }
}

export class Room {
  gameName: string;
  nextPage: string;
  players: PlayerRoom[];
  withIA: boolean;
  withCustom: any;
  winner: Winner;
  manualQuit: boolean;

  constructor() {
    this.gameName = "";
    this.nextPage = "profile";
    this.players = [];
    this.withIA = false;
    this.withCustom = false;
    this.winner = Winner.NONE;
    this.manualQuit = false;
  }

  addPlayer(playerName: string, avatar: string = "") {
    this.players.push(new PlayerRoom(playerName, avatar));
  }

  loadFromLocalStorage() {
    const storedRoom = localStorage.getItem("currentRoom");
    if (storedRoom) {
      const parsedRoom = JSON.parse(storedRoom);
      this.gameName = parsedRoom.gameName || "";
      this.nextPage = parsedRoom.nextPage || "profile";
      this.winner = parsedRoom.winner || Winner.NONE;
      this.manualQuit = parsedRoom.manualQuit || false;
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

export async function startGameAndNavigate(GameName: string) {
  const playersElement = document.getElementById("players") as HTMLSelectElement | null;
  const customElement = document.getElementById("custom") as HTMLSelectElement | null;
  console.log(customElement, "  avec ou pas custom");

  if (!playersElement || !customElement) {
    throw new Error("Impossible de trouver les éléments 'players' ou 'custom'");
  }
  
  const numPlayers = Number(playersElement.value);
  const isCustom = customElement.value === "yes";
  const Username = localStorage.getItem("username");
  console.log(Username, " <-- le nom de l user");

  const room = new Room();

  try {
    const res = await fetch(
      `http://localhost:8086/api/backend/get-avatar/${encodeURIComponent(Username || "")}`
    );
    if (!res.ok) throw new Error("Avatar not found");

    const blob = await res.blob();
    const imageUrl = URL.createObjectURL(blob);

    room.addPlayer(Username || "Joueur 1", imageUrl);
  } catch (err) {
    console.error("Error fetching avatar:", err);
    room.addPlayer(Username || "Joueur 1"); // Ajouter un joueur sans avatar
  }
  
  if (numPlayers === 1) {
    room.withIA = true;
    room.addPlayer("IA");
  } else {
    room.withIA = false;
    room.addPlayer("Ghest");
  }

  room.gameName = GameName;
  room.withCustom = isCustom;
  room.saveToLocalStorage();

  navigate("game");
}


(window as any).startGameAndNavigate = startGameAndNavigate;
