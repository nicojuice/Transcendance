type GameType = 'pong' | 'other';
export let current: GameType = 'pong';

import * as NAV from "./nav";

function selectGame(game: GameType): void {

  const pong = document.getElementById('pong-card') as HTMLElement;
  const pacman = document.getElementById('pacman-card') as HTMLElement;

  if (!pong || !pacman) return;

  pong.classList.remove('card-selected', 'card-deselected');
  pacman.classList.remove('card-selected', 'card-deselected');

  pong.classList.remove('top-card', 'bottom-card');
  pacman.classList.remove('top-card', 'bottom-card');

  if (game === 'pong') {
    pong.classList.add('card-selected', 'top-card');
    pacman.classList.add('card-deselected', 'bottom-card');
  } else {
    pacman.classList.add('card-selected', 'top-card');
    pong.classList.add('card-deselected', 'bottom-card');
  }
  current = game;
}

function flipCard(game: string): void {
  var cardId = `${game}-card`;
  selectGame(game as GameType);
  const pongCard = document.getElementById('pong-card');
  const otherCard = document.getElementById('pacman-card');
  const selectedCard = document.getElementById(cardId);

  if (!pongCard || !otherCard || !selectedCard) {
    console.error('One or more elements not found');
    return;
  }

  selectedCard.classList.add('flipped', 'focused');

  if (cardId === 'pong-card') {
    otherCard.classList.add('hidden');
  } else {
    pongCard.classList.add('hidden');
  }
}

function closeCard(cardId: string): void {
  const pongCard = document.getElementById('pong-card');
  const otherCard = document.getElementById('pacman-card');
  const selectedCard = document.getElementById(cardId);

  if (!pongCard || !otherCard || !selectedCard) {
    console.error('One or more elements not found');
    return;
  }
  selectedCard.classList.remove('flipped', 'focused');
  pongCard.classList.remove('hidden');
  otherCard.classList.remove('hidden');
}

function closeTournamentForm(gameId: string) {
  const form = document.getElementById(`${gameId}-tournament-form`);
  const back = document.querySelector(`#${gameId}-card .card-back`);
  if (form && back) {
    form.classList.add("hidden");
    back.classList.remove("hidden");
  }
}

function checkAndInitPongMode()
{
  const modeSelector = document.getElementById("pong-mode-selector") as HTMLSelectElement | null;
  const difficultyDiv = document.getElementById("pong-difficulty") as HTMLDivElement | null;

  if (!modeSelector || !difficultyDiv) {
    return;
  }

  const toggleDifficultyVisibility = () => {
    difficultyDiv.style.display = modeSelector.value === "ia" ? "block" : "none";
  };

  toggleDifficultyVisibility();
  modeSelector.removeEventListener("change", toggleDifficultyVisibility);
  modeSelector.addEventListener("change", toggleDifficultyVisibility);
};

NAV.onNavigate.addEventListener("waitOptionsGame",checkAndInitPongMode);

(window as any).closeTournamentForm = closeTournamentForm;
(window as any).selectGame = selectGame;
(window as any).closeCard = closeCard; 
(window as any).flipCard = flipCard; 