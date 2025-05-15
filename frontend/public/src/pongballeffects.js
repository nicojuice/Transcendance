const ball = document.getElementById("pongBall");
let x = 100;
let y = 100;
let dx = 2;
let dy = 2;
function moveBall() {
    const ballSize = 20;
    const w = window.innerWidth - ballSize;
    const h = window.innerHeight - ballSize;
    x += dx;
    y += dy;
    if (x <= 0 || x >= w)
        dx *= -1;
    if (y <= 0 || y >= h)
        dy *= -1;
    ball.style.left = `${x}px`;
    ball.style.top = `${y}px`;
    requestAnimationFrame(moveBall);
}
moveBall();
export {};
