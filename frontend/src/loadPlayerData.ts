
interface PlayerStats {
  wins: number;
  total_games: number;
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
    console.log("Stats enregistrées en localStorage:", data);

  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
  }
}

// Appel automatique une fois le DOM chargé
document.addEventListener('DOMContentLoaded', () => {
  loadPlayerStats();
});

export function renderPlayerStatsFromLocalStorage(): void {
  // Récupération des données
  const winsRaw  = localStorage.getItem('playerWins')      || '0';
  const totalRaw = localStorage.getItem('playerTotalGames') || '0';
  const rateRaw  = localStorage.getItem('playerWinRate')    || '0';

  const wins  = Number(winsRaw);
  const total = Number(totalRaw);
  const rate  = Number(rateRaw);

  // Sélecteurs
  const winsEl  = document.getElementById('wins-count');
  const totalEl = document.getElementById('total-games');
  const rateEl  = document.getElementById('win-rate');

  // Injection dans le DOM
  if (winsEl)  winsEl.textContent  = wins.toString();
  if (totalEl) totalEl.textContent = total.toString();
  if (rateEl)  rateEl.textContent  = `${rate}%`;
}

