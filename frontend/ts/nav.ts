// Fonction de navigation pour changer de contenu
function navigate(path: string): void {
    history.pushState({}, '', path);  // Change l'URL sans recharger la page
    updateContent(path);              // Met à jour le contenu de la page en fonction du chemin
  }
  
  // Fonction pour mettre à jour le contenu en fonction de l'URL
  function updateContent(path: string): void {
    // On cache toutes les pages
    const pages: NodeListOf<HTMLElement> = document.querySelectorAll('.page');
    pages.forEach(page => {
      page.style.display = 'none';
    });
  
    // On affiche la page correspondant à l'URL
    if (path === '/') {
      const homePage = document.getElementById('home') as HTMLElement;
      if (homePage) homePage.style.display = 'block';
    } else if (path === '/about') {
      const aboutPage = document.getElementById('about') as HTMLElement;
      if (aboutPage) aboutPage.style.display = 'block';
    } else if (path === '/contact') {
      const contactPage = document.getElementById('contact') as HTMLElement;
      if (contactPage) contactPage.style.display = 'block';
    } else {
      // Si l'URL ne correspond à aucune page, afficher la page 404
      const errorPage = document.getElementById('error-page') as HTMLElement;
      if (errorPage) errorPage.style.display = 'block';
    }
  }
  
  // Lors du changement d'URL (navigation avec le bouton retour ou les liens)
  window.addEventListener('popstate', () => updateContent(location.pathname));
  
  // Mettre à jour le contenu lors du premier chargement de la page
  window.addEventListener('DOMContentLoaded', () => {
    updateContent(location.pathname);  // Met à jour en fonction du chemin actuel
  });
  