export async function fetchProfileWL() {
  const token = localStorage.getItem("token");
  const storedUsername = localStorage.getItem("username");
  
  try {
    const response = await fetch(
      "http://localhost:8090/api/user-management/profile-info",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    if (!response.ok) {
      if (response.status === 401) {
        console.error("Token invalide ou expiré");
        return;
      }
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    if (!data || typeof data !== "object") {
      throw new Error("Données de profil invalides");
    }
    
    // Utilise les données du serveur en priorité, sinon fallback sur localStorage
    const usernameToDisplay = data.username || storedUsername || "Utilisateur";
    
    // Assure-toi que les éléments existent avant de les modifier
    const displayUsername = document.getElementById("display-username-win");
    const displayUsernameLose = document.getElementById("display-username-lose");
    
    if (displayUsername) {
      displayUsername.textContent = usernameToDisplay;
    } else {
      console.warn("Élément display-username-win non trouvé");
    }
    
    if (displayUsernameLose) {
      displayUsernameLose.textContent = usernameToDisplay;
    } else {
      console.warn("Élément display-username-lose non trouvé");
    }
    
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    
    // En cas d'erreur, utilise au moins le username du localStorage
    const fallbackUsername = storedUsername || "Utilisateur";
    const displayUsername = document.getElementById("display-username-win");
    const displayUsernameLose = document.getElementById("display-username-lose");
    
    if (displayUsername) {
      displayUsername.textContent = fallbackUsername;
    }
    if (displayUsernameLose) {
      displayUsernameLose.textContent = fallbackUsername;
    }
  }
}

export function waitForElements() {
  const displayUsername = document.getElementById("display-username-win");
  const displayUsernameLose = document.getElementById("display-username-lose");
  
  // Attendre que TOUS les éléments nécessaires soient présents
  if (displayUsername && displayUsernameLose) {
    fetchProfileWL();
  } else {
    // console.log("Éléments non trouvés, nouvelle tentative dans 100ms");
    setTimeout(waitForElements, 100);
  }
}

// Alternative plus robuste avec MutationObserver
function initProfileDisplay() {
  // Tentative immédiate
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForElements);
  } else {
    waitForElements();
  }
  
  // Observer pour détecter les changements du DOM (si les éléments sont ajoutés dynamiquement)
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        const displayUsername = document.getElementById("display-username-win");
        const displayUsernameLose = document.getElementById("display-username-lose");
        
        if (displayUsername && displayUsernameLose) {
          observer.disconnect(); // Arrête l'observation
          fetchProfileWL();
        }
      }
    });
  });
  
  // Observe les changements dans le document
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Timeout de sécurité pour arrêter l'observer après 5 secondes
  setTimeout(() => {
    observer.disconnect();
  }, 5000);
}

// Démarrage
initProfileDisplay();