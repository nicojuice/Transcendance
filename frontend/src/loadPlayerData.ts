
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

export function renderPlayerStatsFromLocalStorage(): void {
  const rawStats = localStorage.getItem('playerStats');
  if (!rawStats) {
    console.warn("Aucune stats trouvée en localStorage");
    return;
  }

  const stats: PlayerStats = JSON.parse(rawStats);

  const winsEl  = document.getElementById('wins-count');
  const totalEl = document.getElementById('losses-count');
  const rateEl  = document.getElementById('win-rate');

  if (winsEl)  winsEl.textContent  = stats.wins.toString();
  if (totalEl) totalEl.textContent = stats.losses.toString();
  if (rateEl)  rateEl.textContent  = `${stats.win_rate}%`;
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadPlayerStats();
  renderPlayerStatsFromLocalStorage();
});

