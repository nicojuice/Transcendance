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
  withCustom: boolean;
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

// --- UI: Gestion des switches / tournoi ---
function onTournamentToggle(card: HTMLElement, isChecked: boolean) {
  const tournamentSettings = card.querySelector('#tournament-settings') as HTMLElement;
  const togglesContainer = card.querySelector('.toggle-switch-container') as HTMLElement;

  if (isChecked) {
    tournamentSettings.classList.remove('hidden');
    togglesContainer.classList.add('hidden');
    card.classList.add('show-tournament-settings');
  } else {
    tournamentSettings.classList.add('hidden');
    togglesContainer.classList.remove('hidden');
    card.classList.remove('show-tournament-settings');
  }
}

function disableOther(card: HTMLElement, except: string) {
  const toggles = card.querySelectorAll<HTMLDivElement>('.toggle-switch');
  toggles.forEach((toggle) => {
    const option = toggle.dataset.option;
    const input = toggle.previousElementSibling as HTMLInputElement | null;
    if (!input || !option) return;

    if (option !== except) {
      input.checked = false;
      toggle.classList.remove('active');
    }
  });
}

function setupToggleSwitches() {
  const cards = document.querySelectorAll<HTMLElement>('.game-card');

  cards.forEach((card) => {
    const toggles = card.querySelectorAll<HTMLDivElement>('.toggle-switch');
    toggles.forEach((toggleDiv) => {
      const input = toggleDiv.previousElementSibling as HTMLInputElement | null;
      const option = toggleDiv.dataset.option;

      if (!input || !option) return;

      toggleDiv.addEventListener('click', () => {
        input.checked = !input.checked;

        if (option === 'local' && input.checked) {
          disableOther(card, 'local');
          onTournamentToggle(card, false);
        } else if (option === 'tournament' && input.checked) {
          disableOther(card, 'tournament');
          onTournamentToggle(card, true);
        } else if (option === 'tournament' && !input.checked) {
          onTournamentToggle(card, false);
        }

        if (input.checked) {
          toggleDiv.classList.add('active');
        } else {
          toggleDiv.classList.remove('active');
        }
      });
    });

    if (card.id === 'pong-card') {
      const startBtn = card.querySelector<HTMLButtonElement>('#start-tournament-btn');
      startBtn?.addEventListener('click', () => {
        const player1Input = card.querySelector<HTMLInputElement>('#player1-nickname');
        const player1Name = player1Input?.value.trim() || "Invité";
        const players = [player1Name, "Invité1", "Invité2", "Invité3"];
        createRoomAndNavigate('pong', 'tournament', players, false);
      });
    }
  });
}

// --- Création de Room (mode tournoi uniquement) ---
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

// --- Start classique (local ou tournoi simple) ---
export async function startGameAndNavigate(game: string) {
  const card = document.getElementById(`${game}-card`);
  if (!card) {
    console.error(`Impossible de trouver le game-card : ${game}-card`);
    return;
  }

  const toggles = card.querySelectorAll<HTMLDivElement>('.toggle-switch');

  let mode: "local" | "tournament" | null = null;
  let custom = false;

  toggles.forEach((toggle) => {
    const input = toggle.previousElementSibling as HTMLInputElement | null;
    const option = toggle.dataset.option;

    if (!input || !option) return;

    if (option === "local" && input.checked) mode = "local";
    else if (option === "tournament" && input.checked) mode = "tournament";
    else if (option === "bonus") custom = input.checked;
  });

  if (game === "pong" && !mode) {
    showToast("Veuillez sélectionner un mode : Local ou Tournoi.", "error");
    return;
  }

  if (game === "pacman") mode = "local"; // Force local for pacman

  const playersElement = document.getElementById("players") as HTMLSelectElement | null;
  const numPlayers = playersElement ? Number(playersElement.value) : 2;

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

  if (numPlayers === 1) {
    room.withIA = true;
    room.addPlayer("IA");
  } else {
    room.withIA = false;
    room.addPlayer("Ghest");
  }

  room.gameName = game;
  room.withCustom = custom;
  room.saveToLocalStorage();

  navigate("game");
}

// --- Initialisation ---
window.addEventListener('load', () => {
  setupToggleSwitches();
});

(window as any).startGameAndNavigate = startGameAndNavigate;



(window as any).startGameAndNavigate = startGameAndNavigate;
