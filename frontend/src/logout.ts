import { navigate } from './nav';

export function logout(): void {
    localStorage.removeItem('username');
    localStorage.removeItem('isConnected');
    navigate('log');
}

(window as any).logout = logout;

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.querySelector('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
});