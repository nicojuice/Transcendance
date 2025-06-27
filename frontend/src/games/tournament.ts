// import { GameManager, GameMode } from "./gamesys";
// import { navigate } from "../nav";
// import * as ROOM from "./room";
// import { showToast } from "../showToast";

// console.log("✅ tournament.ts chargé");

// document.addEventListener("DOMContentLoaded", () => {
//   const dataRaw = localStorage.getItem("tournamentData");
//   if (!dataRaw) {
//     showToast("Aucune donnée de tournoi trouvée.", "error");
//     navigate("profile");
//     return;
//   }

//   const data = JSON.parse(dataRaw);
//   const { demi1, demi2, winner1, winner2 } = data;

//   const match1 = document.getElementById("match1-result");
//   const match2 = document.getElementById("match2-result");
//   const finalMatch = document.getElementById("final-match");

//   if (match1)
//     match1.textContent = `${demi1[0]} vs ${demi1[1]} → 🏅 ${winner1}`;
//   if (match2)
//     match2.textContent = `${demi2[0]} vs ${demi2[1]} → 🏅 ${winner2}`;
//   if (finalMatch)
//     finalMatch.textContent = `${winner1} vs ${winner2}`;

//   const btn = document.getElementById("launch-final-btn");
//   if (btn) {
//     btn.addEventListener("click", () => {
//       const room = new ROOM.Room();
//       room.gameName = "pong"; // adapte si tu passes un autre jeu
//       const manager = new GameManager(GameMode.Versus, room, [winner1, winner2]);
//       manager.Start();
//     });
//   }
// });

// import { GameManager, GameMode } from "./gamesys";
// import { navigate, onNavigate } from "../nav";
// import * as ROOM from "./room";
// import { showToast } from "../showToast";

// console.log("✅ tournament.ts chargé");

// async function initTournamentPage() {
//   // 1) Récupérer l'ID du tournoi
//   const rawId = localStorage.getItem("tournamentId");
//   if (!rawId) {
//     showToast("Aucun tournoi en cours.", "error");
//     navigate("profile");
//     return;
//   }
//   const tournamentId = parseInt(rawId, 10);

//   // 2) Appeler le back pour récupérer les matches
//   let tournament;
//   try {
//     const res = await fetch(`/api/backend/games/tournament/${tournamentId}`);
//     if (!res.ok) throw new Error(`HTTP ${res.status}`);
//     tournament = await res.json();
//     // { id, match1: [p1,p2], match2: [p3,p4], match3: [w1,w2] | null }
//   } catch (err) {
//     console.error("Erreur fetch tournoi:", err);
//     showToast("Impossible de charger le tournoi.", "error");
//     return;
//   }

//   const { match1, match2, match3 } = tournament;

//   // 3) Mettre à jour le DOM
//   const el1 = document.getElementById("match1");
//   const el2 = document.getElementById("match2");
//   const finalEl = document.getElementById("final-match");
//   if (el1) el1.textContent = `${match1[0]} vs ${match1[1]}`;
//   if (el2) el2.textContent = `${match2[0]} vs ${match2[1]}`;
//   if (finalEl) {
//     finalEl.textContent = match3
//       ? `${match3[0]} vs ${match3[1]}`
//       : "En attente des résultats des demi-finales";
//   }

//   // 4) Bouton Finale
//   const btn = document.getElementById("launch-final-btn") as HTMLButtonElement;
//   if (btn) {
//     if (match3) {
//       btn.disabled = false;
//       btn.onclick = () => {
//         const room = new ROOM.Room();
//         room.gameName = "pong";
//         new GameManager(GameMode.Versus, room, match3).Start();
//       };
//     } else {
//       btn.disabled = true;
//     }
//   }
// }

// // Au premier chargement si on arrive directement sur /tournament
// if (window.location.pathname.endsWith("tournament")) {
//   initTournamentPage();
// }

// // À chaque navigation interne
// onNavigate.addEventListener(() => {
//   if (window.location.pathname.endsWith("tournament")) {
//     initTournamentPage();
//   }
// });


import { GameManager, GameMode } from "./gamesys";
import { navigate, onNavigate } from "../nav";
import * as ROOM from "./room";
import { showToast } from "../showToast";

console.log("✅ tournament.ts chargéee");

async function initTournamentPage() {
  // 1) Récupérer l'ID du tournoi
  const rawId = localStorage.getItem("tournamentId");
  if (!rawId) {
    showToast("Aucun tournoi en cours.", "error");
    navigate("profile");
    return;
  }
  const tournamentId = parseInt(rawId, 10);

  // 2) Appeler le back pour récupérer les matches
  let tournament;
  try {
    const res = await fetch(`http://localhost:8001/api/backend/games/tournament/${tournamentId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    tournament = await res.json();
    console.log("la sql tournoi --->", res);
  } catch (err) {
    console.error("Erreur fetch tournoi:", err);
    showToast("Impossible de charger le tournoi.", "error");
    return;
  }

  console.log(
  "Match 1 players:",
  tournament.match1[0],
  "vs",
  tournament.match1[1]
  );
  const { match1, match2, match3, matchid} = tournament;

  // 3) Mettre à jour le DOM
  const el1 = document.getElementById("match1");
  const el2 = document.getElementById("match2");
  const finalEl = document.getElementById("final-match");
  if (el1) el1.textContent = `${match1[0]} vs ${match1[1]}`;
  if (el2) el2.textContent = `${match2[0]} vs ${match2[1]}`;
  if (finalEl) {
    finalEl.textContent = match3
      ? `${match3[0]} vs ${match3[1]}`
      : "En attente des résultats des demi-finales";
  }

  // 4) Bouton Finale
  const btn = document.getElementById("launch-final-btn") as HTMLButtonElement;
  if (btn) {
    if (match1) {
      btn.disabled = false;
      btn.onclick = () => {
        const room = new ROOM.Room();
        room.isTournament = true;
        room.gameName = "pong";
        if (matchid === 1)
        {
          console.log("hello match 1")
          new GameManager(GameMode.Versus, room, match1).Start();
        }
        if (matchid === 2)
          new GameManager(GameMode.Versus, room, match2).Start();
        if (matchid === 3)
          new GameManager(GameMode.Versus, room, match3).Start();


      };
    } else {
      btn.disabled = true;
    }
  }
}

// Si on recharge directement sur /tournament
if (window.location.pathname.endsWith("tournament")) {
  // On met un petit délai pour laisser Vite injecter le HTML
  setTimeout(initTournamentPage, 50);
}

// À chaque navigation interne via navigate()
onNavigate.addEventListener(() => {
  if (window.location.pathname.endsWith("tournament")) {
    // On décale légèrement pour que innerHTML soit déjà là
    setTimeout(initTournamentPage, 50);
  }
});


