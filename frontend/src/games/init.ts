import * as PONG from "./pong/game";
import * as PACMAN from "./pacman/game";
import * as ROOM from "./room";
import * as NAV from "../nav";
import * as Engine from "./engine";

let engine: Engine.GameEngine | null = null;

function startGame(canvas: HTMLCanvasElement) {

  //focus
  canvas.setAttribute("tabindex", "1");
  canvas.focus();

  let room = new ROOM.Room();
  room.loadFromLocalStorage();
  engine = new Engine.GameEngine(canvas, room);
  engine.Resize();
  if (room.gameName === "pong")
    PONG.main(engine);
  else if (room.gameName === "pacman")
    PACMAN.main(engine);
}

function waitForCanvasAndStart() {
  const interval = setInterval(() => {
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement | null;
    if (!canvas) return;

    clearInterval(interval);
    startGame(canvas);
  }, 100);
}

window.addEventListener("resize", () => {
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement | null;
  if (!canvas || !engine) return;
  engine.Resize();
});

waitForCanvasAndStart();

NAV.onNavigate.addEventListener(() => {
  if (engine) {
    // console.log("Navigation detected, cleaning up game resources.");
    engine.dispose();
    engine = null;
    waitForCanvasAndStart();
  }
}
);
