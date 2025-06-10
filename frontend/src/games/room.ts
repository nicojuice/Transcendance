import { navigate } from "../nav";

export class MatchStats {
  loserName: string;
  maxBallSpeed: number;
  bounceCount: number;
  duration: number;

  constructor() {
    this.loserName = "";
    this.maxBallSpeed = 0;
    this.bounceCount = 0;
    this.duration = 0;
  }

  updateMaxSpeed(currentSpeed: number) {
    if (currentSpeed > this.maxBallSpeed) {
      this.maxBallSpeed = currentSpeed;
    }
  }

  incrementBounces() {
    this.bounceCount++;
  }

  setLoser(name: string) {
    this.loserName = name;
  }
};

export class Room {
  gameName: string;
  nextPage: string;
  players: any;
  withIA: any;
  withCustom: any;
  stats: MatchStats;

  constructor() {
    this.gameName = "pong";
    this.nextPage = "profile";
    this.players = [];
    this.withIA = false;
    this.withCustom = false;
    this.stats = new MatchStats();
  }

  addPlayer(playerName: string) {
    this.players.push(playerName);
  }

  loadFromLocalStorage() {
    const storedRoom = localStorage.getItem("currentRoom");
    if (storedRoom) {
      const parsedRoom = JSON.parse(storedRoom);
      this.withIA = parsedRoom.withIA;
      this.withCustom = parsedRoom.withCustom;
      this.players = parsedRoom.players || [];
      this.stats = new MatchStats();
    } else {
      console.warn("Aucune room trouvée dans localStorage, création d'une par défaut.");
    }
  }

  saveToLocalStorage() {
    localStorage.setItem("currentRoom", JSON.stringify(this));
  }
};


export function startGameAndNavigate() {
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
  room.withCustom = isCustom;
  localStorage.setItem("currentRoom", JSON.stringify(room));

  // Navigation
  navigate("pong");
}

(window as any).startGameAndNavigate = startGameAndNavigate;


