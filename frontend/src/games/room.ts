import { navigate } from "../nav";
import { showToast } from "../showToast";

export enum Winner {
  PLAYER1 = "PLAYER1",
  PLAYER2 = "PLAYER2",
  IA = "IA",
  DRAW = "DRAW",
  NONE = "NONE"
}

export class Room {
  gameName: string;
  nextPage: string;
<<<<<<< HEAD
  players: string[];
  withIA: boolean;
  withCustom: boolean;
  playerWinner: number;
=======
  players: any;
  withIA: any;
  withCustom: any;
  score: { p1: number; p2: number };
  winner: Winner;
  manualQuit: boolean;
>>>>>>> lfarhi

  constructor() {
    this.gameName = "";
    this.nextPage = "profile";
    this.players = [];
    this.withIA = false;
    this.withCustom = false;
    this.score = { p1: 0, p2: 0 };
    this.winner = Winner.NONE;
    this.manualQuit = false;
  }
  // if (mode === "tournament" && game === "pong") {  // if (mode === "tournament" && game === "pong") {
  //   showToast("Veuillez utiliser le formulaire tournoi.", "info");
  //   return;
  // }
  loadFromLocalStorage() {
    const storedRoom = localStorage.getItem("currentRoom");
    if (storedRoom) {
      const parsedRoom = JSON.parse(storedRoom);
<<<<<<< HEAD
      Object.assign(this, parsedRoom);
=======
      this.gameName = parsedRoom.gameName || "";
      this.nextPage = parsedRoom.nextPage || "profile";
      this.score = parsedRoom.score || { p1: 0, p2: 0 };
      this.winner = parsedRoom.winner || Winner.NONE;
      this.manualQuit = parsedRoom.manualQuit || false;
      this.withIA = parsedRoom.withIA || false;
      this.withCustom = parsedRoom.withCustom || false;
      this.players = parsedRoom.players || [];
    } else {
      console.warn("Aucune room trouvée dans localStorage, création d'une par défaut.");
>>>>>>> lfarhi
    }
  }

  saveToLocalStorage() {
    localStorage.setItem("currentRoom", JSON.stringify(this));
  }
}

// Gestion des toggles + tournoi
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
      toggle.classList.remove('active'); // suppose que tu as une classe pour visuel toggle actif
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

        // Ici, tu peux ajouter une classe CSS "active" pour l’état visuel
        if (input.checked) {
          toggleDiv.classList.add('active');
        } else {
          toggleDiv.classList.remove('active');
        }
      });
    });

    // Setup bouton lancer tournoi si présent (uniquement sur pong)
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
    room.players = players;
    room.nextPage = "game";
    room.saveToLocalStorage();

    navigate("game");
  } catch (err) {
    console.error("Erreur lors de la création de la partie:", err);
    showToast("Erreur lors de la création de la partie", "error");
  }
}

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

    if (option === "local" && input.checked) {
      mode = "local";
    } else if (option === "tournament" && input.checked) {
      mode = "tournament";
    } else if (option === "bonus") {
      custom = input.checked;
    }
  });

  if (game === "pong" && !mode) {
    showToast("Veuillez sélectionner un mode : Local ou Tournoi.", "error");
    return;
  }

  if (game === "pacman" && !mode) {
    mode = "local"; // Forcer local pour pacman
  }

  const players = 2; // Par défaut
  const username = localStorage.getItem("username") || "Invité";

  // Si tournoi, on ne lance pas cette fonction, c’est géré par le bouton "Lancer le tournoi"
  // if (mode === "tournament" && game === "pong") {
  //   showToast("Veuillez utiliser le formulaire tournoi.", "info");
  //   return;
  // }

  try {
    const res = await fetch(`http://localhost:8096/api/rooms/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ players, custom }),
    });

    if (!res.ok) throw new Error("Erreur serveur: " + res.statusText);

    const data = await res.json();
    console.log("✅ Room créée :", data);

    const room = new Room();
    room.gameName = game;
    room.withCustom = custom;
    room.players = [username];
    room.nextPage = "game";
    room.saveToLocalStorage();

    navigate("game");
  } catch (err) {
    console.error("Erreur lors de la création de la partie:", err);
  }
}

// Initialisation à appeler au chargement
window.addEventListener('load', () => {
  setupToggleSwitches();
});

(window as any).startGameAndNavigate = startGameAndNavigate;
