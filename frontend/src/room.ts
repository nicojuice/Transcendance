import { startGameAndNavigate } from "./games/room";
import { createRoomAndNavigate } from "./games/room";

function handleStartClick(gameId: string): void {
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
    startGameAndNavigate(gameId);
  }
}


function launchTournamentGame(gameId: string): void {
  const inputs = document.querySelectorAll<HTMLInputElement>(`#${gameId}-tournament-form input`);
  const playerNames: string[] = Array.from(inputs).map(input => input.value.trim());

  if (playerNames.some(name => name === "")) {
    alert("Merci de renseigner tous les pseudos !");
    return;
  }

  createRoomAndNavigate(gameId, "tournament", playerNames, false);
}


(window as any).launchTournamentGame = launchTournamentGame;
(window as any).handleStartClick = handleStartClick;