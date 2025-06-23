import { navigate } from "../nav";
import { showToast } from "../showToast";

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

// export async function startGameAndNavigate(GameName: string) {
//   const playersElement = document.getElementById("players") as HTMLSelectElement | null;
//   const customElement = document.getElementById("custom") as HTMLSelectElement | null;
//   console.log(customElement, "  avec ou pas custom");

//   if (!playersElement || !customElement) {
//     throw new Error("Impossible de trouver les éléments 'players' ou 'custom'");
//   }
  
//   const numPlayers = Number(playersElement.value);
//   const isCustom = customElement.value === "yes";
//   const Username = localStorage.getItem("username");
//   console.log(Username, " <-- le nom de l user");

//   const room = new Room();

//   try {
//     const res = await fetch(
//       `http://localhost:8086/api/backend/get-avatar/${encodeURIComponent(Username || "")}`
//     );
//     if (!res.ok) throw new Error("Avatar not found");

//     const blob = await res.blob();
//     const imageUrl = URL.createObjectURL(blob);

//     room.addPlayer(Username || "Joueur 1", imageUrl);
//   } catch (err) {
//     console.error("Error fetching avatar:", err);
//     room.addPlayer(Username || "Joueur 1"); // Ajouter un joueur sans avatar
//   }
  
//   if (numPlayers === 1) {
//     room.withIA = true;
//     room.addPlayer("IA");
//   } else {
//     room.withIA = false;
//     room.addPlayer("Ghest");
//   }

//   room.gameName = GameName;
//   room.withCustom = isCustom;
//   room.saveToLocalStorage();

//   navigate("game");
// }



function setupModeSelectors() {
  const cards = document.querySelectorAll<HTMLElement>('.game-card');

  cards.forEach((card) => {
    const modeSelect = card.querySelector<HTMLSelectElement>('#pong-mode-selector');
    const modeSelect2 = card.querySelector<HTMLSelectElement>('#pacman-mode-selector');
    const tournamentSettings = card.querySelector<HTMLElement>('#tournament-settings');

    if (!modeSelect) return;
    if (!modeSelect2) return;

    modeSelect.addEventListener('change', () => {
      const selectedMode = modeSelect.value;

      if (selectedMode === 'tournament') {
        tournamentSettings?.classList.remove('hidden');
      } else {
        tournamentSettings?.classList.add('hidden');
      }
    });

    modeSelect2.addEventListener('change', () => {
      const selectedMode = modeSelect.value;

      if (selectedMode === 'tournament') {
        tournamentSettings?.classList.remove('hidden');
      } else {
        tournamentSettings?.classList.add('hidden');
      }
    });

    // Bouton de lancement de tournoi
    const tournamentBtn = card.querySelector<HTMLButtonElement>('#start-tournament-btn');
    tournamentBtn?.addEventListener('click', () => {
      const player1Input = card.querySelector<HTMLInputElement>('#player1-nickname');
      const player1Name = player1Input?.value.trim() || "Invité";
      const players = [player1Name, "Invité1", "Invité2", "Invité3"];
      createRoomAndNavigate('pong', 'tournament', players, false);
    });
  });
}


// ------------------------- ROOM CREATION -------------------------

async function createRoomAndNavigate(game: string, mode: "local" | "tournament", players: string[], custom: boolean) {
  try {
    const res = await fetch(`http://localhost:8096/api/rooms/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ players: players.length, custom }),
    });

    if (!res.ok) throw new Error("Erreur serveur: " + res.statusText);
    const data = await res.json();
    console.log("✅ Room créée :", data);

    const room = new Room();
    room.gameName = game;
    room.withCustom = custom;
    players.forEach(name => room.addPlayer(name));
    room.nextPage = "game";
    room.saveToLocalStorage();

    navigate("game");
  } catch (err) {
    console.error("Erreur lors de la création de la partie:", err);
    showToast("Erreur lors de la création de la partie", "error");
  }
}

// ------------------------- GAME START (LOCAL UNIQUEMENT) -------------------------
export async function startGameAndNavigate(game: string) {
  const card = document.getElementById(`${game}-card`);
  if (!card) {
    console.error(`Impossible de trouver le game-card : ${game}-card`);
    return;
  }

  const modeSelector = card.querySelector<HTMLSelectElement>('#pong-mode-selector');
  const modeSelector2 = card.querySelector<HTMLSelectElement>('#pacman-mode-selector');
  const selectedMode = modeSelector?.value || '';
  const selectedMode2 = modeSelector2?.value || '';

  if (selectedMode === 'ia') {
    showToast("IA is coming", "error");
    return;
  }
  if (selectedMode === 'tournament') {
    showToast("Tournament is coming", "error");
    return;
  }

  if (selectedMode2 === 'ia') {
    showToast("IA is coming", "error");
    return;
  }
  if (selectedMode2 === 'tournament') {
    showToast("Tournament is coming", "error");
    return;
  }

  const username = localStorage.getItem("username") || "Invité";
  const room = new Room();

  try {
    const res = await fetch(`http://localhost:8086/api/backend/get-avatar/${encodeURIComponent(username)}`);
    if (!res.ok) throw new Error("Avatar not found");

    const blob = await res.blob();
    const imageUrl = URL.createObjectURL(blob);
    room.addPlayer(username, imageUrl);
  } catch (err) {
    console.error("Erreur avatar:", err);
    room.addPlayer(username);
  }

  room.withIA = false;
  room.addPlayer("Ghest");

  room.gameName = game;
  room.saveToLocalStorage();
  navigate("game");
}

(window as any).startGameAndNavigate = startGameAndNavigate;
