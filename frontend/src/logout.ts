import { updateConnectionStatus } from './status';
import { navigate } from './nav';

export function logout(): void {
    updateConnectionStatus(0);
    localStorage.removeItem("token");
    navigate('log');
}

(window as any).logout = logout;

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.querySelector('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
});