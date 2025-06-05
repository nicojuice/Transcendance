import { navigate } from "../nav";

export class Room {
  players: any;
  withIA: any;
  withCustom: any;

  constructor() {
    this.players = [];
    this.withIA = false;
    this.withCustom = false;
  }

  addPlayer(playerName: string) {
    this.players.push(playerName);
  }

  // removePlayer(playerName: string) {
  //   this.players = this.players.filter(p => p !== playerName);
  // }
};


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


