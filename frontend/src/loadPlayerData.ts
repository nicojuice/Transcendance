interface PlayerStats {
  wins: number;
  losses: number;
  win_rate: number;
}

async function getToken(): Promise<string | null> {
  return localStorage.getItem('token');
}

export async function loadPlayerStats(): Promise<PlayerStats | null> {
  const username = localStorage.getItem('username');
  const token = await getToken();

  if (!username || !token) {
    console.error('Aucun username ou token trouvé en localStorage');
    return null;
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
    return data;

  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    return null;
  }
}

export function renderPlayerStats(stats: PlayerStats) {
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

export function onProfilePageShow() {
  loadAndRenderStats();
}

async function loadAndRenderStats() {
  const stats = await loadPlayerStats();
  if (stats) {
    renderPlayerStats(stats);
  } else {
    const stored = localStorage.getItem('playerStats');
    if (stored) renderPlayerStats(JSON.parse(stored));
  }
}


document.addEventListener('DOMContentLoaded', async () => {
  const stats = await loadPlayerStats();
  if (stats) {
    renderPlayerStats(stats);
  } else {
    const stored = localStorage.getItem('playerStats');
    if (stored) renderPlayerStats(JSON.parse(stored));
  }
});


let hasUpdatedStats = false;


export function resetHasUpdatedStats() {
  hasUpdatedStats = false;
}

export function getHasUpdatedStats() {
  return hasUpdatedStats;
}

export async function updateGameStats(username: string, isWin: boolean) {
  if (hasUpdatedStats) {
    console.log("updateGameStats ignorée : déjà appelée cette partie");
    return;
  }
  hasUpdatedStats = true;

  console.log('updateGameStats appelée', new Date().toISOString(), { username, isWin });
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
