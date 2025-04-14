function navigate(path) {
    history.pushState({}, '', path);
    updateContent(path);
  }
  
  function updateContent(path) {
    const content = document.getElementById('content');
    if (path === '/about') {
      content.innerHTML = '<h2>À propos</h2><p>Bienvenue sur la page à propos !</p>';
    } else {
      content.innerHTML = '<h2>Accueil</h2><p>Bienvenue sur l\'accueil !</p>';
    }
  }
  
  window.addEventListener('popstate', () => updateContent(location.pathname));
  window.addEventListener('DOMContentLoaded', () => {
    updateContent(location.pathname);
  });