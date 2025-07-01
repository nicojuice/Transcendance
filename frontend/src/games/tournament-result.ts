// src/games/tournament-result.ts

export function initTournamentResultPage() {
  const stored = localStorage.getItem("currentRoom");
  let winner = "Inconnu";
  if (stored) {
    try {
      const room = JSON.parse(stored);
      if (room?.winner) winner = room.winner;
    } catch {}
  }
  const el = document.getElementById("winner-name");
  if (el) el.textContent = winner;
}

// On expose la fonction pour qu'on puisse l'appeler depuis nav.ts
;(window as any).initTournamentResultPage = initTournamentResultPage;

// Si on recharge directement sur /tournament-result
if (window.location.pathname.endsWith("tournament-result")) {
  // petit délai pour laisser innerHTML faire effet
  setTimeout(initTournamentResultPage, 50);
}


