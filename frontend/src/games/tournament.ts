import { GameManager, GameMode } from "./gamesys";
import { navigate } from "../nav";
import * as ROOM from "./room";
import { showToast } from "../showToast";

function updateTournamentWinnersUI(currentMatchId: number) {
  const winnersStr = localStorage.getItem("tournamentWinners");
  if (!winnersStr) return;

  const winners: Partial<Record<"match1" | "match2" | "match3", string>> = JSON.parse(winnersStr);

  ["match1-winner", "match2-winner", "final-winner"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  const idToShow =
    currentMatchId === 1
      ? "match1-winner"
      : currentMatchId === 2
      ? "match2-winner"
      : currentMatchId === 3
      ? "final-winner"
      : "";

  const el = document.getElementById(idToShow);
  if (el) {
    const key = `match${currentMatchId}` as "match1" | "match2" | "match3";
    el.textContent = winners[key] || "-";
    el.style.display = "block";
  }
}

function createMatchLauncher(gameName: string, matchPlayers: string[]) {
  const room = new ROOM.Room();
  room.isTournament = true;
  room.gameName = gameName;

  if (gameName === "pong" || gameName === "pacman") {
    new GameManager(GameMode.Versus, room, matchPlayers).Start();
  } else {
    showToast("Jeu non supporté : " + gameName, "error");
  }
}

export async function initTournamentPage() {
  const rawId = localStorage.getItem("tournamentId");
  if (!rawId) {
    showToast("Aucun tournoi en cours.", "error");
    navigate("profile");
    return;
  }

  const tournamentId = parseInt(rawId, 10);
  const gameName = localStorage.getItem("tournamentGame") || "pong";

  let tournament;
  try {
    const res = await fetch(`http://localhost:8001/api/backend/games/tournament/${tournamentId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    tournament = await res.json();
  } catch (err) {
    console.error("Erreur fetch tournoi:", err);
    showToast("Impossible de charger le tournoi.", "error");
    return;
  }

  const { match1, match2, match3, matchid } = tournament;

  const el1 = document.getElementById("match1");
  const el2 = document.getElementById("match2");
  const finalEl = document.getElementById("final-match");

  if (el1) el1.textContent = `${match1[0]}  VS  ${match1[1]}`;
  if (el2) el2.textContent = `${match2[0]}  VS  ${match2[1]}`;
  if (finalEl) {
    finalEl.textContent =
      match3 && match3[0] && match3[1] ? `${match3[0]} vs ${match3[1]}` : "En attente...";
  }

  const btn = document.getElementById("launch-final-btn") as HTMLButtonElement;

  if (btn) {
    switch (matchid) {
      case 1:
        btn.disabled = false;
        btn.textContent = "Lancer Match 1";
        btn.onclick = () => createMatchLauncher(gameName, match1);
        break;

      case 2:
        btn.disabled = false;
        btn.textContent = "Lancer Match 2";
        btn.onclick = () => createMatchLauncher(gameName, match2);
        break;

      case 3:
        if (match3 && match3[0] && match3[1]) {
          btn.disabled = false;
          btn.textContent = "Lancer Finale";
          btn.onclick = () => createMatchLauncher(gameName, match3);
        } else {
          btn.disabled = true;
          btn.textContent = "En attente des résultats";
        }
        break;

      default:
        btn.disabled = true;
        btn.textContent = "Tournoi terminé";
        break;
    }
  }

  const currentMatchId = parseInt(localStorage.getItem("lastMatchPlayed") || "1", 10);
  updateTournamentWinnersUI(currentMatchId);
}
