import { updateConnectionStatus } from './status';
import { navigate } from './nav';
import './i18n';

export function logout(): void {
    updateConnectionStatus(0);
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