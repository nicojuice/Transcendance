import { navigate } from "../nav";
import { showToast } from "../showToast";

export enum Winner {
  PLAYER1 = "PLAYER1",
  PLAYER2 = "PLAYER2",
  IA = "IA",
  DRAW = "DRAW",
  NONE = "NONE",
}

export class PlayerRoom {
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
  withCustom: boolean;
  winner: Winner;
  manualQuit: boolean;
  mode: any;

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
      console.warn(
        "Aucune room trouvée dans localStorage, création d'une par défaut."
      );
    }
  }

  clone(): Room {
    const clone_room = new Room();
    clone_room.gameName = this.gameName;
    clone_room.nextPage = this.nextPage;
    clone_room.players = this.players.slice();
    clone_room.withIA = this.withIA;
    clone_room.withCustom = this.withCustom;
    clone_room.winner = this.winner;
    clone_room.manualQuit = this.manualQuit;
    return clone_room;
  }

  saveToLocalStorage() {
    localStorage.setItem("currentRoom", JSON.stringify(this));
  }
}

function setupModeSelectors() {
  const cards = document.querySelectorAll<HTMLElement>(".game-card");

  cards.forEach((card) => {
    const modeSelect = card.querySelector<HTMLSelectElement>(
      "#pong-mode-selector"
    );
    const modeSelect2 = card.querySelector<HTMLSelectElement>(
      "#pacman-mode-selector"
    );
    const tournamentSettings = card.querySelector<HTMLElement>(
      "#tournament-settings"
    );

    if (!modeSelect) return;
    if (!modeSelect2) return;

    modeSelect.addEventListener("change", () => {
      const selectedMode = modeSelect.value;

      if (selectedMode === "tournament") {
        tournamentSettings?.classList.remove("hidden");
      } else {
        tournamentSettings?.classList.add("hidden");
      }
    });

    modeSelect2.addEventListener("change", () => {
      const selectedMode = modeSelect.value;

      if (selectedMode === "tournament") {
        tournamentSettings?.classList.remove("hidden");
      } else {
        tournamentSettings?.classList.add("hidden");
      }
    });

    const tournamentBtn = card.querySelector<HTMLButtonElement>(
      "#start-tournament-btn"
    );
    tournamentBtn?.addEventListener("click", () => {
      const player1Input =
        card.querySelector<HTMLInputElement>("#player1-nickname");
      const player1Name = player1Input?.value.trim() || "Invité";
      const players = [player1Name, "Invité1", "Invité2", "Invité3"];
      createRoomAndNavigate("pong", players, false, 1);
    });
  });
}

export async function createRoomAndNavigate(
  game: string,
  playerNames: string[],
  custom: boolean,
  mode: any
) {
  console.log(playerNames[0], "player \n");
  console.log(playerNames[1], "player \n");
  console.log(playerNames[2], "player \n");
  console.log(playerNames[3], "player \n");
  console.log(game, " le jeu\n");
  console.log(custom, " custom?");
  console.log(mode, "le mode\n");
  if (mode == 1) {
    //startGameAndNavigate(game);
    mode++;
  }
  if (mode == 2) {
    //startGameAndNavigate(game);
    mode++;
  }
}

export async function startGameAndNavigate(game: string) {
  const card = document.getElementById(`${game}-card`);
  if (!card) {
    console.error(`Impossible de trouver le game-card : ${game}-card`);
    return;
  }

  const selectedMode =
    card.querySelector<HTMLSelectElement>("#" + game + "-mode-selector")
      ?.value || "";

  if (!selectedMode) {
    showToast("Veuillez sélectionner un mode de jeu.", "error");
    return;
  }

  const username = localStorage.getItem("username") || "Invité";
  const room = new Room();
  room.gameName = game;
  try {
    const res = await fetch(
      `http://localhost:8086/api/backend/get-avatar/${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      }
    );
    if (!res.ok) throw new Error("Avatar not found");

    const blob = await res.blob();
    const imageUrl = URL.createObjectURL(blob);
    room.addPlayer(username, imageUrl);
  } catch (err) {
    console.error("Erreur avatar:", err);
    room.addPlayer(username);
  }
  if (selectedMode === "ia") {
    room.withIA = true;
    localStorage.setItem("opponent", "AI");
    room.addPlayer("IA");
  } else {
    room.withIA = false;
    localStorage.setItem("opponent", "player");
    room.addPlayer("Guest");
  }
  room.saveToLocalStorage();
  navigate("game");
}


(window as any).setupModeSelectors = setupModeSelectors;
(window as any).createRoomAndNavigate = createRoomAndNavigate;
(window as any).startGameAndNavigate = startGameAndNavigate;
