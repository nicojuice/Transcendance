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
