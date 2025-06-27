
interface PlayerStats {
  wins: number;
  losses: number;
  win_rate: number;
}

export async function loadPlayerStats(): Promise<void> {
  // Récupère le username depuis le localStorage
  const username = localStorage.getItem('username');
  if (!username) {
    console.error('Aucun username trouvé en localStorage');
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8098/api/user-management/games_data/${encodeURIComponent(username)}`
    );
    if (!response.ok) {
      throw new Error(`Erreur ${response.status} lors de la récupération des stats`);
    }

    const data: PlayerStats = await response.json();

    // Stocke les stats dans le localStorage
    localStorage.setItem('playerStats', JSON.stringify(data));

  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
  }
}

// Appel automatique une fois le DOM chargé
document.addEventListener('DOMContentLoaded', () => {
  loadPlayerStats();
});

export function renderPlayerStatsFromLocalStorage() {
  const statsStr = localStorage.getItem('playerStats');
  if (!statsStr) return; // Rien à afficher

  const stats = JSON.parse(statsStr);

  // Supposons stats a { wins: number, losses: number }
  const winsCount = document.getElementById('wins-count');
  const lossesCount = document.getElementById('losses-count');
  const winRate = document.getElementById('win-rate');

  if (winsCount) winsCount.textContent = stats.wins.toString();
  if (lossesCount) lossesCount.textContent = stats.losses.toString();

  if (winRate) {
    const totalGames = stats.wins + stats.losses;
    const rate = totalGames === 0 ? 0 : Math.round((stats.wins / totalGames) * 100);
    winRate.textContent = rate + "%";
  }
}


document.addEventListener('DOMContentLoaded', async () => {
  await loadPlayerStats();
  renderPlayerStatsFromLocalStorage();
});

export async function updateGameStats(username: string, isWin: boolean) {
  console.log('helllo sdsdsd\n');
  try {
    const response = await fetch("http://localhost:8098/api/user-management/games_data", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, isWin }),
    });

    if (!response.ok) {
      console.error("Erreur lors de la mise à jour des stats");
      return;
    }

    const data = await response.json();
    console.log("Statistiques mises à jour :", data);
  } catch (err) {
    console.error("Erreur réseau stats:", err);
  }
}