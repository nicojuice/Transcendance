import { GameManager, GameMode } from "./gamesys";
import { navigate } from "../nav";
import * as ROOM from "./room";
import { showToast } from "../showToast";

export async function initTournamentPage() {
  console.log("initTournamentPage");
  const rawId = localStorage.getItem("tournamentId");
  if (!rawId) {
    showToast("Aucun tournoi en cours.", "error");
    navigate("profile");
    return;
  }

  const tournamentId = parseInt(rawId, 10);
  let tournament;

  try {
    const res = await fetch(`http://localhost:8001/api/backend/games/tournament/${tournamentId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    tournament = await res.json();
    console.log("Tournoi reçu:", tournament);
  } catch (err) {
    console.error("Erreur fetch tournoi:", err);
    showToast("Impossible de charger le tournoi.", "error");
    return;
  }

  const { match1, match2, match3, matchid } = tournament;

  // Mise à jour de l'affichage
  const el1 = document.getElementById("match1");
  const el2 = document.getElementById("match2");
  const finalEl = document.getElementById("final-match");

  if (el1) el1.textContent = `${match1[0]} vs ${match1[1]}`;
  if (el2) el2.textContent = `${match2[0]} vs ${match2[1]}`;
  if (finalEl) {
    finalEl.textContent = match3 && match3[0] && match3[1]
      ? `${match3[0]} vs ${match3[1]}`
      : "En attente des résultats des demi-finales";
  }

  const btn = document.getElementById("launch-final-btn") as HTMLButtonElement;

  if (btn) {
    console.log("Configuration du bouton pour matchid:", matchid);

    switch (matchid) {
      case 1:
        btn.disabled = false;
        btn.textContent = "Lancer Match 1";
        btn.onclick = () => {
          console.log("Lancement du match 1:", match1);
          const room = new ROOM.Room();
          room.isTournament = true;
          room.gameName = "pong";
          new GameManager(GameMode.Versus, room, match1).Start();
        };
        break;

      case 2:
        btn.disabled = false;
        btn.textContent = "Lancer Match 2";
        btn.onclick = () => {
          console.log("Lancement du match 2:", match2);
          const room = new ROOM.Room();
          room.isTournament = true;
          room.gameName = "pong";
          new GameManager(GameMode.Versus, room, match2).Start();
        };
        break;

      case 3:
        if (match3 && match3[0] && match3[1]) {
          btn.disabled = false;
          btn.textContent = "Lancer Finale";
          btn.onclick = () => {
            console.log("Lancement de la finale:", match3);
            const room = new ROOM.Room();
            room.isTournament = true;
            room.gameName = "pong";
            new GameManager(GameMode.Versus, room, match3).Start();
          };
        } else {
          btn.disabled = true;
          btn.textContent = "En attente des résultats";
        }
        break;

      default:
        btn.disabled = true;
        btn.textContent = "Tournoi terminé";
        localStorage.setItem("fin du tournoi", "true");
        break;
    }

    console.log("Bouton configuré - disabled:", btn.disabled, "text:", btn.textContent);
  }
}
