import * as ROOM from "./games/room";
import * as GameSys from "./games/gamesys";

function launchTournamentGame(gameId: string): void {
  const inputs = document.querySelectorAll<HTMLInputElement>(`#${gameId}-tournament-form input`);
  const playerNames: string[] = Array.from(inputs).map(input => input.value.trim());

  if (playerNames.some(name => name === "")) {
    alert("Merci de renseigner tous les pseudos !");
    return;
  }

  const card = document.getElementById(`${gameId}-card`);
  if (!card) return;

  const room = new ROOM.Room();
  room.gameName = gameId;
  const bonus = card.querySelector<HTMLInputElement>('#'+gameId+'-bonus')?.checked || false;
  room.withCustom = bonus;
  const gamesys = new GameSys.GameManager(GameSys.GameMode.Tournament, room, playerNames);
  gamesys.Start();
}

async function handleStartClick(gameId: string): Promise<void> {
  const card = document.getElementById(`${gameId}-card`);
  if (!card) return;

  const modeSelector = card.querySelector<HTMLSelectElement>(`#${gameId}-mode-selector`);
  if (!modeSelector) return;

  const selectedMode = modeSelector.value;

  const cardBack = card.querySelector<HTMLElement>('.card-back');
  const tournamentForm = document.getElementById(`${gameId}-tournament-form`);
  if (selectedMode === 'tournament') {
    cardBack?.classList.add('hidden');
    tournamentForm?.classList.remove('hidden');
  } else {
    const room = new ROOM.Room();
    room.gameName = gameId;
    const card = document.getElementById(`${gameId}-card`);
    if (!card) {
      console.error(`Impossible de trouver le game-card : ${gameId}-card`);
      return;
    }
    const selectedMode = card.querySelector<HTMLSelectElement>('#'+gameId+'-mode-selector')?.value || '';
    room.withIA = (selectedMode === 'ia');
    const bonus = card.querySelector<HTMLInputElement>('#'+gameId+'-bonus')?.checked || false;
    room.withCustom = bonus;
    let players: string[] = [];
    players.push(localStorage.getItem("username") || "Invité");
    const gamesys = new GameSys.GameManager(GameSys.GameMode.Versus, room, players);
    gamesys.Start();
  }
}


(window as any).launchTournamentGame = launchTournamentGame;
(window as any).handleStartClick = handleStartClick;