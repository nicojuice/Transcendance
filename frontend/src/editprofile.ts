import { user_exist, navigate } from "./nav";

function clearUserData(): void {
  localStorage.removeItem("username");
  localStorage.removeItem("email");
  localStorage.removeItem("token");
  
  const displayUsername = document.getElementById("display-username");
  const usernameInput = document.getElementById("username") as HTMLInputElement;
  const emailInput = document.getElementById("email") as HTMLInputElement;
  const passwordInput = document.getElementById("password") as HTMLInputElement;
  
  if (displayUsername) displayUsername.textContent = "";
  if (usernameInput) {
    usernameInput.value = "";
    usernameInput.placeholder = "Nouveau nom d'utilisateur";
  }
  if (emailInput) {
    emailInput.value = "";
    emailInput.placeholder = "Nouvel email";
  }
  if (passwordInput) {
    passwordInput.value = "";
    passwordInput.placeholder = "Nouveau mot de passe";
  }
}

async function editUser(): Promise<void> {
  const oldUsername = localStorage.getItem("username");
  const newUsernameInput = document.getElementById("username") as HTMLInputElement;
  const edit = newUsernameInput?.value?.trim();

  //console.log("Ancien username:", oldUsername);
  //console.log("Nouveau username:", edit);

  if (!edit) {
    alert("Veuillez saisir un nouveau nom d'utilisateur.");
    return;
  }

  if (!oldUsername) {
    alert("Deconnexion.");
    await navigate("log");
    return;
  }

  if (await user_exist(edit) === true) {
    alert("Nom d'utilisateur déjà existant.");
    return;
  }
  
  if (!oldUsername) {
    alert("Erreur: ancien nom d'utilisateur non trouvé.");
    return;
  }
  
  if (await user_exist(edit) === true) {
    alert("Nom d'utilisateur déjà existant.");
    return;
  }

  try {
    const response = await fetch(`http://localhost:8085/api/user-management/change-user`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: oldUsername, edit })
    });

    const data = await response.json();
    //console.log("Réponse changement username:", data);

    if (response.ok) {
      alert(data.message || "Nom d'utilisateur modifié avec succès");
      localStorage.setItem("username", edit);
      
      const displayText = document.getElementById("display-username");
      if (displayText) displayText.textContent = edit;
      
      if (newUsernameInput) newUsernameInput.value = "";
      
      await fetchProfile();
    } else {
      alert(data.message || "Erreur lors de la modification.");
    }
  } catch (err) {
    console.error("Erreur fetch editUser:", err);
    alert("Erreur serveur lors du changement de nom");
  }
}



async function editPass(edit: string): Promise<void> {
  const username = localStorage.getItem("username");
  
  //console.log("Changement mot de passe pour:", username);
  
  if (!edit?.trim() || edit === "••••••••") {
    alert("Veuillez saisir un nouveau mot de passe.");
    return;
  }
  
  if (!username) {
    alert("Erreur: utilisateur non identifié.");
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:8084/api/user-management/change-password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, newPassword: edit.trim() })
    });

    const data = await response.json();
    //console.log("Réponse changement password:", data);

    if (response.ok) {
      alert(data.message || "Mot de passe modifié avec succès");
      const passwordInput = document.getElementById("password") as HTMLInputElement;
      if (passwordInput) passwordInput.value = "••••••••";
    } else {
      alert(data.message || "Erreur lors du changement de mot de passe");
    }

  } catch (err) {
    console.error('Erreur fetch editPass:', err);
    alert('Erreur serveur lors du changement de mot de passe');
  }
}



async function editEmail(edit: string): Promise<void> {
  const username = localStorage.getItem("username");
  
  //console.log("Changement email pour:", username);
  //console.log("Nouvel email:", edit);
  
  if (!edit?.trim()) {
    alert("Veuillez saisir un nouvel email.");
    return;
  }
  
  if (!username) {
    alert("Erreur: utilisateur non identifié.");
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:8083/api/user-management/change-email`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email: edit.trim() })
    });

    const data = await response.json();
    //console.log("Réponse changement email:", data);

    if (response.ok) {
      alert(data.message || "Email modifié avec succès");
      localStorage.setItem("email", edit.trim());
      
      const emailInput = document.getElementById("email") as HTMLInputElement;
      if (emailInput) emailInput.value = edit.trim();
    } else {
      alert(data.message || "Erreur lors du changement d'email");
    }
  
  } catch (err) {
    console.error('Erreur fetch editEmail:', err);
    alert('Erreur serveur lors du changement d\'email');
  }
}



export async function fetchProfile(): Promise<void> {
  const token = localStorage.getItem("token");
  const storedUsername = localStorage.getItem("username");

  //console.log("fetchProfile - Token:", token ? "présent" : "absent");
  //console.log("fetchProfile - Username stocké:", storedUsername);

  if (!token) {
    console.warn("Utilisateur non authentifié - pas de token");
    clearUserData();
    return;
  }

  try {
    const response = await fetch("http://localhost:8090/api/user-management/profile-info", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });

    //console.log("fetchProfile - Status:", response.status);

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Token invalide ou expiré");
        alert("Session expirée, veuillez vous reconnecter");
        clearUserData();
        return;
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    //console.log("Profil reçu du serveur:", data);

    // Vérifier que les données sont valides
    if (!data || typeof data !== 'object') {
      throw new Error("Données de profil invalides");
    }

    const displayUsername = document.getElementById("display-username");
    const usernameInput = document.getElementById("username") as HTMLInputElement;
    const emailInput = document.getElementById("email") as HTMLInputElement;

    if (displayUsername) {
      const usernameToDisplay = data.name || data.username || storedUsername || "Utilisateur";
      //console.log("Mise à jour affichage username:", usernameToDisplay);
      displayUsername.textContent = usernameToDisplay;
    }
    
    if (usernameInput) {
      usernameInput.value = data.name || data.username || storedUsername || "";
      usernameInput.placeholder = "Nouveau nom d'utilisateur";
    }
    
    if (emailInput) {
      emailInput.value = data.email || "";
      emailInput.placeholder = data.email || "Nouvel email";
    }

    const passwordInput = document.getElementById("password") as HTMLInputElement;
    if (passwordInput) {
      passwordInput.value = "••••••••";
      passwordInput.placeholder = "Nouveau mot de passe";
      
      passwordInput.addEventListener('focus', function() {
        if (this.value === "••••••••") {
          this.value = "";
        }
      });
      
      passwordInput.addEventListener('blur', function() {
        if (this.value === "") {
          this.value = "••••••••";
        }
      });
    }

    if (data.name || data.username) {
      localStorage.setItem("username", data.name || data.username);
    }
    if (data.email) {
      localStorage.setItem("email", data.email);
    }

  } catch (err) {
    console.error("Erreur lors du chargement du profil:", err);
    
    // Fallback: utiliser les données du localStorage si disponibles
    const storedUsername = localStorage.getItem("username");
    const storedEmail = localStorage.getItem("email");
    
    if (storedUsername || storedEmail) {
      //console.log("Utilisation des données du localStorage comme fallback");
      
      const displayUsername = document.getElementById("display-username");
      const emailInput = document.getElementById("email") as HTMLInputElement;
      
      if (displayUsername && storedUsername) {
        displayUsername.textContent = storedUsername;
      }
      if (emailInput && storedEmail) {
        emailInput.value = storedEmail;
      }
    } else {
      alert("Impossible de charger les données du profil");
    }
  }
}



(window as any).editEmail = editEmail;
(window as any).editUser = editUser;
(window as any).editPass = editPass;
(window as any).fetchProfile = fetchProfile;
(window as any).clearUserData = clearUserData;


window.addEventListener("DOMContentLoaded", () => {
  //console.log("Page chargée, récupération du profil...");
  
  setTimeout(() => {
    //console.log("Lancement fetchProfile après délai...");
    fetchProfile();
  }, 50);
});
