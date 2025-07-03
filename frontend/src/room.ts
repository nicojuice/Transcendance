import * as ROOM from "./games/room";
import * as GameSys from "./games/gamesys";
import { showToast } from "./showToast";

function launchTournamentGame(gameId: string): void {
  const inputs = document.querySelectorAll<HTMLInputElement>(`#${gameId}-tournament-form input`);
  const playerNames: string[] = Array.from(inputs).map(input => input.value.trim());

  if (playerNames.some(name => name === "")) {
    showToast("Merci de renseigner tous les pseudos !", "error");
    return;
  }

  const card = document.getElementById(`${gameId}-card`);
  if (!card) return;

  const room = new ROOM.Room();
  room.isTournament = true;
  room.gameName = gameId;
  const bonus = card.querySelector<HTMLInputElement>('#'+gameId+'-bonus')?.checked || false;
  room.withCustom = bonus;
  const gamesys = new GameSys.GameManager(GameSys.GameMode.Tournament, room, playerNames);
  // console.log("before start : ")
  // console.log("room : ", room)
  // console.log("bonus : ", bonus)
  // console.log("gamesys : ", gamesys)
  gamesys.Start();
}

async function handleStartClick(gameId: string): Promise<void> {
  const card = document.getElementById(`${gameId}-card`);
  if (!card) return;

  const modeSelector = card.querySelector<HTMLSelectElement>(`#${gameId}-mode-selector`);
  if (!modeSelector) return;

  const selectedMode = modeSelector.value;

  if (!selectedMode) {
    showToast("Veuillez sélectionner un mode de jeu.", "error");
    return;
  }

  const cardBack = card.querySelector<HTMLElement>('.card-back');
  const tournamentForm = document.getElementById(`${gameId}-tournament-form`);
  
  if (selectedMode === 'tournament') {
    cardBack?.classList.add('hidden');
    tournamentForm?.classList.remove('hidden');
  } else {
    const room = new ROOM.Room();
    room.gameName = gameId;

    const selectedMode = card.querySelector<HTMLSelectElement>('#'+gameId+'-mode-selector')?.value || '';
    room.withIA = (selectedMode === 'ia');

    const bonus = card.querySelector<HTMLInputElement>('#'+gameId+'-bonus')?.checked || false;
    room.withCustom = bonus;

    let players: string[] = [];
    players.push(localStorage.getItem("username") || "Invité");

    const gamesys = new GameSys.GameManager(GameSys.GameMode.Versus, room, players);
    gamesys.Start(); // xxxxx
  }
}

(window as any).launchTournamentGame = launchTournamentGame;
(window as any).handleStartClick = handleStartClick;