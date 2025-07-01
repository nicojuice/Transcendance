// src/games/tournament-result.ts

export function initTournamentResultPage() {
  // console.log('initTournamentResultPage called')
  const stored = localStorage.getItem("currentRoom");
  let winner = "__undefined__";
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
(window as any).initTournamentResultPage = initTournamentResultPage;
