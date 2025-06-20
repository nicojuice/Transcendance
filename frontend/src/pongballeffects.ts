// import { IsWindowObjectExist } from "@babylonjs/core";

let x: number = window.innerWidth / 2.;
let y: number = window.innerHeight / 2.;
let dx: number = 1.5;
let dy: number = 2;

export async function moveBall(): Promise<void> {
  const ball =(document.getElementById("pongBall") as HTMLElement);

  if (ball)
  {
    const ballSize = 20;
    const w = window.innerWidth - ballSize;
    const h = window.innerHeight - ballSize;

    x += dx;
    y += dy;

    if (x <= 0 || x >= w) dx *= -1;
    if (y <= 0 || y >= h) dy *= -1;

    ball.style.left = `${x}px`;
    ball.style.top = `${y}px`;

    requestAnimationFrame(moveBall);
  }
}

type GameType = 'pong' | 'other';
let current: GameType = 'pong';

function selectGame(game: GameType): void {
  if (current === game) return;

  const pong = document.getElementById('pong-card') as HTMLElement;
  const other = document.getElementById('pacman-card') as HTMLElement;

  if (!pong || !other) return;

  // Toujours même inclinaison
  pong.classList.add('card-tilt-left');
  other.classList.add('card-tilt-right');

  // Réinitialise les couches
  pong.classList.remove('top-card', 'bottom-card');
  other.classList.remove('top-card', 'bottom-card');

  if (game === 'pong') {
    pong.classList.add('top-card');
    other.classList.add('bottom-card');
  } else {
    other.classList.add('top-card');
    pong.classList.add('bottom-card');
  }

  current = game;
}
(window as any).selectGame = selectGame;
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


function selectGame2(gameName: string): void {
  console.log("Selected game:", gameName);
}

(window as any).selectGame2 = selectGame2; 
(window as any).closeCard = closeCard; 
(window as any).flipCard = flipCard; 
