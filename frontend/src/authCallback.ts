import { navigate } from "./nav";
// Récupère le code dans l'URL
const params = new URLSearchParams(window.location.search);
const code = params.get('code');

if (code) {
  fetch(`/api/auth/google/callback?code=${code}`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // Stocker token ou user
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Naviguer vers profile

        window.location.href = '/pages/profile.html';
      } else {
        // Erreur
        window.location.href = '/pages/log.html';
      }
    })
    .catch(() => {
      window.location.href = '/pages/log.html';
    });
} else {
  // Pas de code, renvoyer vers login
  window.location.href = '/pages/log.html';
}
