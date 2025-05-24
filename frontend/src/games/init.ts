import * as BABYLON from "@babylonjs/core";
import { main } from "./pong/game";

let engine: BABYLON.Engine | null = null;

function startGame(canvas: HTMLCanvasElement) {
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  //focus
  canvas.setAttribute("tabindex", "1");
  canvas.focus();

  engine = new BABYLON.Engine(canvas, true);
  engine.resize();
  main(engine, canvas); 
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

  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  if (engine) engine.resize();
});

waitForCanvasAndStart();
