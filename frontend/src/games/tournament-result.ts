export function initTournamentResultPage() {
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

  const winnersStr = localStorage.getItem("tournamentWinners");
  let winners: Record<string, string> = {};

  if (winnersStr) {
    try {
      winners = JSON.parse(winnersStr);
    } catch (e) {
      console.error("Erreur parsing tournamentWinners:", e);
    }
  }

  const m1 = document.getElementById("match1-winner");
  const m2 = document.getElementById("match2-winner");

  if (m1) m1.textContent = winners.match1 || "En attente…";
  if (m2) m2.textContent = winners.match2 || "En attente…";
}

(window as any).initTournamentResultPage = initTournamentResultPage;
(window as any).initTournamentResultPage = initTournamentResultPage;