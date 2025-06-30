interface PlayerStats {
  wins: number;
  losses: number;
  win_rate: number;
}

async function getToken(): Promise<string | null> {
  return localStorage.getItem('token');
}

export async function loadPlayerStats(): Promise<void> {
  const username = localStorage.getItem('username');
  const token = await getToken();

  if (!username || !token) {
    console.error('Aucun username ou token trouvé en localStorage');
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8098/api/user-management/games_data/${encodeURIComponent(username)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur ${response.status} lors de la récupération des stats`);
    }

    const data: PlayerStats = await response.json();
    localStorage.setItem('playerStats', JSON.stringify(data));

  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
  }
}

export function renderPlayerStatsFromLocalStorage() {
  const statsStr = localStorage.getItem('playerStats');
  if (!statsStr) return;

  const stats = JSON.parse(statsStr);
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
  const token = await getToken();

  if (!token) {
    console.error("Token d'authentification manquant");
    return;
  }

  try {
    const response = await fetch("http://localhost:8098/api/user-management/games_data", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
