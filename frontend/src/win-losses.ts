export async function fetchProfileWL(): Promise<void> {
  const token = localStorage.getItem("token");
  const storedUsername = localStorage.getItem("username");

  console.log("fetchProfile - Token:", token ? "présent" : "absent");
  console.log("fetchProfile - Username stocké:", storedUsername);
  console.trace("fetchProfileWL appelé");

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
    console.log("Données récupérées :", data);
    if (!data || typeof data !== "object") {
      throw new Error("Données de profil invalides");
    }

    const displayUsername = document.getElementById("display-username-win");
    const displayUsernameLose = document.getElementById("display-username-lose");

    const usernameToDisplay = storedUsername || "Utilisateur";

    if (displayUsername) {
      displayUsername.textContent = usernameToDisplay;
    }

    console.log("Contenu modifié :", {
        displayUsername: displayUsername?.textContent,
        usernameLose: displayUsernameLose?.textContent,
    });

    if (displayUsernameLose) {
      displayUsernameLose.textContent = usernameToDisplay;
    }

  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
  }
}

function waitForElements() {
  const displayUsername = document.getElementById("display-username-win");
  const displayUsernameLose = document.getElementById("display-username-lose");
  
  if (displayUsername || displayUsernameLose) {
    fetchProfileWL();
  } else {
    setTimeout(waitForElements, 100);
  }
}

window.addEventListener("DOMContentLoaded", waitForElements);