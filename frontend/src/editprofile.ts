import { user_exist, navigate } from "./nav";
import { showToast } from "./showToast";
import './i18n';

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

export async function editUser(): Promise<void> {
  const oldUsername = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const newUsernameInput = document.getElementById(
    "username"
  ) as HTMLInputElement;
  const edit = newUsernameInput?.value?.trim();

  if (!edit) {
    showToast("Veuillez saisir un nouveau nom d'utilisateur.", "error");
    return;
  }

  if (!oldUsername) {
    showToast("Deconnexion.", "error");
    await navigate("log");
    return;
  }

  if ((await user_exist(edit)) === true) {
    showToast("Nom d'utilisateur déjà existant.", "error");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8085/api/user-management/change-user`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({ username: oldUsername, edit }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      showToast(
        data.message || "Nom d'utilisateur modifié avec succès",
        "success"
      );
      localStorage.setItem("username", edit);

      const displayText = document.getElementById("display-username");
      if (displayText) displayText.textContent = edit;

      if (newUsernameInput) newUsernameInput.value = "";

      await fetchProfile();
    } else {
      showToast(data.message || "Erreur lors de la modification.", "error");
    }
  } catch (err) {
    console.error("Erreur fetch editUser:", err);
    showToast("Erreur serveur lors du changement de nom", "error");
  }
}

export async function editPass(edit: string): Promise<void> {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const isGoogleConnected = localStorage.getItem("isGoogleConnected");

  if (isGoogleConnected === "true") {
    showToast("Les utilisateurs Google ne peuvent pas modifier leur mot de passe.", "error");
    return;
  }

  if (!edit?.trim() || edit === "••••••••") {
    showToast("Veuillez saisir un nouveau mot de passe.", "error");
    return;
  }

  if (!username) {
    showToast("Erreur: utilisateur non identifié.", "error");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8084/api/user-management/change-password`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({ username, newPassword: edit.trim() }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      showToast(data.message || "Mot de passe modifié avec succès", "success");
      const passwordInput = document.getElementById("password") as HTMLInputElement;
      if (passwordInput) passwordInput.value = "••••••••";
    } else {
      showToast(data.message || "Erreur lors du changement de mot de passe", "error");
    }
  } catch (err) {
    console.error("Erreur fetch editPass:", err);
    showToast("Erreur serveur lors du changement de mot de passe", "error");
  }
}

export async function editEmail(edit: string): Promise<void> {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const isGoogleConnected = localStorage.getItem("isGoogleConnected");

  if (isGoogleConnected === "true") {
    showToast("Les utilisateurs Google ne peuvent pas modifier leur email.", "error");
    return;
  }

  if (!edit?.trim()) {
    showToast("Veuillez saisir un nouvel email.", "error");
    return;
  }

  if (!username) {
    showToast("Erreur: utilisateur non identifié.", "error");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8083/api/user-management/change-email`,
      {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`
        },
        body: JSON.stringify({ username, email: edit.trim() }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      showToast(data.message || "Email modifié avec succès", "success");
      localStorage.setItem("email", edit.trim());

      const emailInput = document.getElementById("email") as HTMLInputElement;
      if (emailInput) emailInput.value = edit.trim();
    } else {
      showToast(data.message || "Erreur lors du changement d'email", "error");
    }
  } catch (err) {
    console.error("Erreur fetch editEmail:", err);
    showToast("Erreur serveur lors du changement d'email", "error");
  }
}


export async function fetchProfile(): Promise<void> {
  const token = localStorage.getItem("token");
  const storedUsername = localStorage.getItem("username");
  const authMethod = localStorage.getItem("authMethod");

  if (!token) {
    console.warn("Utilisateur non authentifié - pas de token");
    clearUserData();
    return;
  }

  try {
    if (authMethod === "google") {
      const verifyResponse = await fetch("http://localhost:8095/api/auth/verify", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!verifyResponse.ok) {
        if (verifyResponse.status === 401) {
          console.error("Token Google invalide ou expiré");
          showToast("Session expirée (Google), veuillez vous reconnecter", "error");
          clearUserData();
          return;
        }
        throw new Error(`Erreur de vérification du token Google: HTTP ${verifyResponse.status}`);
      }

      const tokenData = await verifyResponse.json();
      if (!tokenData.valid) {
        console.error("Token Google invalide");
        showToast("Session expirée (Google), veuillez vous reconnecter", "error");
        clearUserData();
        return;
      }
    }

    const profileResponse = await fetch("http://localhost:8090/api/user-management/profile-info", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!profileResponse.ok) {
      if (profileResponse.status === 401) {
        console.error("Token invalide ou expiré pour le profil / profile info");
        showToast("Session expirée, veuillez vous reconnecter", "error");
        clearUserData();
        return;
      }
      throw new Error(`Erreur profil: HTTP ${profileResponse.status}`);
    }

    const profileData = await profileResponse.json();

    const finalUsername =
      profileData.username ||
      profileData.name ||
      storedUsername ||
      "Utilisateur";

    const finalEmail =
      profileData.email ||
      "";

    updateUserInterface(finalUsername, finalEmail);

    if (finalUsername) {
      localStorage.setItem("username", finalUsername);
    }
    if (finalEmail) {
      localStorage.setItem("email", finalEmail);
    }

  } catch (err) {
    console.error("Erreur lors du chargement du profil:", err);

    const storedUsername = localStorage.getItem("username");
    const storedEmail = localStorage.getItem("email");

    if (storedUsername || storedEmail) {
      updateUserInterface(storedUsername || "Utilisateur", storedEmail || "");
    } else {
      // showToast("Impossible de charger les données du profil", "error");
      clearUserData();
    }
  }
}

function updateUserInterface(username: string, email: string): void {
  const displayUsername = document.getElementById("display-username");
  const usernameInput = document.getElementById("username") as HTMLInputElement;
  const emailInput = document.getElementById("email") as HTMLInputElement;
  const passwordInput = document.getElementById("password") as HTMLInputElement;

  if (displayUsername) {
    displayUsername.textContent = username;
  }

  if (usernameInput) {
    usernameInput.value = username;
    usernameInput.placeholder = "Nouveau nom d'utilisateur";
  }

  if (emailInput) {
    emailInput.value = email;
    emailInput.placeholder = email || "Nouvel email";
  }

  if (passwordInput) {
    passwordInput.value = "••••••••";
    passwordInput.placeholder = "Nouveau mot de passe";

    passwordInput.addEventListener("focus", function () {
      if (this.value === "••••••••") {
        this.value = "";
      }
    });
    
    passwordInput.addEventListener("blur", function () {
      if (this.value === "") {
        this.value = "••••••••";
      }
    });
  }
}

(window as any).editEmail = editEmail;
(window as any).editUser = editUser;
(window as any).editPass = editPass;
(window as any).fetchProfile = fetchProfile;
(window as any).clearUserData = clearUserData;

window.addEventListener("DOMContentLoaded", () => {
  const isProfilePage = window.location.pathname.includes("/profile");

  if (isProfilePage) {
    setTimeout(() => {
      fetchProfile();
    }, 50);
  }
});
