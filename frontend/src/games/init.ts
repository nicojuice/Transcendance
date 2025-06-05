import * as BABYLON from "@babylonjs/core";
import { main } from "./pong/game";
import * as ROOM from "./room";

let engine: BABYLON.Engine | null = null;

function resizeCanvasAndEngine(canvas: HTMLCanvasElement) {
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  //canvas.style.imageRendering = "pixelated";
  //console.log(`Canvas resized to: ${window.innerWidth} x ${window.innerHeight}`);
  if (engine) {
    // Applique un scaling dynamique pour ne pas dépasser 1920x1080
    const maxWidth = 1280;
    //const maxHeight = 1080;
    const widthRatio = window.innerWidth / maxWidth;
    //const heightRatio = window.innerHeight / maxHeight;
    //console.log(`Width ratio: ${widthRatio}, Height ratio: ${heightRatio}`);
    const scaling = widthRatio;//Math.max(widthRatio, heightRatio, 1);
    //console.log(`Scaling factor: ${scaling}`);
    engine.setHardwareScalingLevel(scaling);
    engine.resize();
  }
}


function startGame(canvas: HTMLCanvasElement) {

  //focus
  canvas.setAttribute("tabindex", "1");
  canvas.focus();

  engine = new BABYLON.Engine(canvas, true);
  engine.renderEvenInBackground = false;
  resizeCanvasAndEngine(canvas);
  const room = new ROOM.Room();
  room.addPlayer("Player1");
  room.addPlayer("Player2");
  main(engine, canvas, room); 
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
