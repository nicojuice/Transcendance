import { GameManager, GameMode } from "./gamesys";
import { navigate } from "../nav";
import * as ROOM from "./room";
import { showToast } from "../showToast";

console.log("✅ tournament.ts chargé");

document.addEventListener("DOMContentLoaded", () => {
  const dataRaw = localStorage.getItem("tournamentData");
  if (!dataRaw) {
    showToast("Aucune donnée de tournoi trouvée.", "error");
    navigate("profile");
    return;
  }

  const data = JSON.parse(dataRaw);
  const { demi1, demi2, winner1, winner2 } = data;

  const match1 = document.getElementById("match1-result");
  const match2 = document.getElementById("match2-result");
  const finalMatch = document.getElementById("final-match");

  if (match1)
    match1.textContent = `${demi1[0]} vs ${demi1[1]} → 🏅 ${winner1}`;
  if (match2)
    match2.textContent = `${demi2[0]} vs ${demi2[1]} → 🏅 ${winner2}`;
  if (finalMatch)
    finalMatch.textContent = `${winner1} vs ${winner2}`;

  const btn = document.getElementById("launch-final-btn");
  if (btn) {
    btn.addEventListener("click", () => {
      const room = new ROOM.Room();
      room.gameName = "pong"; // adapte si tu passes un autre jeu
      const manager = new GameManager(GameMode.Versus, room, [winner1, winner2]);
      manager.Start();
    });
  }
});
