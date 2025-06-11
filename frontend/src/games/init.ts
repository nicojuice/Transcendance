import * as BABYLON from "@babylonjs/core";
//import * as PONG from "./pong/game";
import * as PACMAN from "./pacman/game";
import * as ROOM from "./room";
import * as NAV from "../nav";

let engine: BABYLON.Engine | null = null;

function resizeCanvasAndEngine(canvas: HTMLCanvasElement) {
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  if (engine) {
    const maxWidth = 1280;
    const widthRatio = window.innerWidth / maxWidth;
    const scaling = widthRatio;
    engine.setHardwareScalingLevel(scaling);
    engine.resize();
  }
}

let cleanup: (() => void) | null = null;

function startGame(canvas: HTMLCanvasElement) {

  //focus
  canvas.setAttribute("tabindex", "1");
  canvas.focus();

  engine = new BABYLON.Engine(canvas, true, {antialias: true});
  engine.renderEvenInBackground = false;
  resizeCanvasAndEngine(canvas);
  let room = new ROOM.Room();
  room.loadFromLocalStorage();
  /*if (room.gameName === "pong")
    cleanup = PONG.main(engine, canvas, room);
  else if (room.gameName === "pacman")*/
    cleanup = PACMAN.main(engine, canvas, room);
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
  if (!canvas) return;
  resizeCanvasAndEngine(canvas);
});

waitForCanvasAndStart();

NAV.onNavigate.addEventListener(() => {
  if (cleanup) {
    console.log("Navigation detected, cleaning up game resources.");
    cleanup();
    cleanup = null;
    waitForCanvasAndStart();
  }
}
);
