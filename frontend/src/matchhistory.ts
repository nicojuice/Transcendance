interface Match {
  game: string;
  mode: number | string;
  winlose: number;
  date: string;
}

interface MatchHistoryResponse {
  username: string;
  matches: Match[];
}

export async function loadMatchHistory(username: string): Promise<void> {
  const container = document.getElementById('match-history');
  if (!container) return;

  const ul = container.querySelector('ul.space-y-3') as HTMLUListElement;
  const noMatchMsg = ul?.nextElementSibling as HTMLElement;

  const token = localStorage.getItem('token');
  if (!token) {
    ul.innerHTML = `<li class="text-red-500">Token non trouvé</li>`;
    return;
  }

  try {
    const res = await fetch(`http://localhost:8091/api/user-management/match-history/${username}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('Erreur lors de la récupération des données');

    const data: MatchHistoryResponse = await res.json();

    if (!data.matches.length) {
      ul.innerHTML = '';
      noMatchMsg.style.display = 'block';
      return;
    }

    noMatchMsg.style.display = 'none';

    ul.innerHTML = data.matches.map((match) => {
      const date = new Date(match.date).toLocaleString();
      const result = match.winlose ? 'Victoire' : 'Défaite';
      return `
        <li class="font-pixelify flex justify-between border-b border-white/20 py-2">
          <span class="w-1/4">${match.game}</span>
          <span class="w-1/4 text-center ${match.winlose ? 'text-neon' : 'text-red-400'} font-semibold">${result}</span>
          <span class="w-1/4 text-right text-xs text-white/60">${date}</span>
        </li>
      `;
    }).join('');
  } catch (err: any) {
    ul.innerHTML = `<li class="text-red-500">Erreur : ${err.message}</li>`;
  }
}
