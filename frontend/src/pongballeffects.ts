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

  const pong = document.getElementById('pong-card') as HTMLElement | null;
  const other = document.getElementById('other-card') as HTMLElement | null;

  if (!pong || !other) return;

  // Reset all tilt classes
  pong.classList.remove('card-centered', 'card-tilt-left', 'card-tilt-right');
  other.classList.remove('card-centered', 'card-tilt-left', 'card-tilt-right');

  if (game === 'pong') {
    pong.style.zIndex = '10';
    other.style.zIndex = '5';

    pong.classList.add('card-centered');
    other.classList.add('card-tilt-right');

    pong.classList.add('top-card');
    other.classList.remove('top-card');
  } else {
    other.style.zIndex = '10';
    pong.style.zIndex = '5';

    other.classList.add('card-centered');
    pong.classList.add('card-tilt-left');

    other.classList.add('top-card');
    pong.classList.remove('top-card');
  }

  current = game;
}

(window as any).selectGame = selectGame;
