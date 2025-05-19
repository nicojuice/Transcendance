export function logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('isConnected');
    window.location.href = '/login.html';
}

(window as any).logout = logout;

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.querySelector('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
});