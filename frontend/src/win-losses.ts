document.addEventListener('DOMContentLoaded', () => {
  const username = localStorage.getItem('username') || 'Utilisateur';

  const winNameEl = document.getElementById('display-username-win') as HTMLInputElement;;
  const loseNameEl = document.getElementById('display-username-lose');


  if (winNameEl instanceof HTMLElement) {
    winNameEl.textContent = username;
  }

  if (loseNameEl instanceof HTMLElement) {
    loseNameEl.textContent = username;
  }

});
