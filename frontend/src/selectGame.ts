type GameType = 'pong' | 'other';
let current: GameType = 'pong';

function selectGame(game: GameType): void {
  if (current === game) return;

  const pong = document.getElementById('pong-card') as HTMLElement;
  const pacman = document.getElementById('pacman-card') as HTMLElement;

  if (!pong || !pacman) return;

  // Réinitialise les classes d’état visuel
  pong.classList.remove('card-selected', 'card-deselected');
  pacman.classList.remove('card-selected', 'card-deselected');

  // Réinitialise les couches (z-index)
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

function flipCard(cardId: string): void {
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

(window as any).closeTournamentForm = closeTournamentForm;
(window as any).selectGame = selectGame;
(window as any).closeCard = closeCard; 
(window as any).flipCard = flipCard; 

