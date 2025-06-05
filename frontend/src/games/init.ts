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
  const storedRoom = localStorage.getItem("currentRoom");
  let room: ROOM.Room;

  if (storedRoom) {
    const parsedRoom = JSON.parse(storedRoom);
    console.log(parsedRoom, " <--- la room parse")
    room = new ROOM.Room();
    room.withIA = parsedRoom.withIA;
    room.withCustom = parsedRoom.withCustom;
    room.players = parsedRoom.players;
    
    if (Array.isArray(parsedRoom.players)) {
      parsedRoom.players.forEach((playerName: string) => {
        room.addPlayer(playerName);
      });
    }
  } else {
    // fallback si rien n'a été trouvé
    console.warn("Aucune room trouvée dans localStorage, création d'une par défaut.");
    room = new ROOM.Room();
    room.addPlayer("Player1");
    room.addPlayer("Player2");
  }
  console.log(room.withCustom, " <-- avec ou sans custom")
  console.log(room.withIA, " <-- avec ou sans ia")
  console.log(room.players, " <-- le player")
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
