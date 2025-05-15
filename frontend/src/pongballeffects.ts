const ball = document.getElementById("pongBall") as HTMLElement;

let x: number = 100;
let y: number = 100;
let dx: number = 2;
let dy: number = 2;

function moveBall(): void {
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

moveBall();
