export async function fetchProfileWL() {
  const token = localStorage.getItem("token");
  const storedUsername = localStorage.getItem("username") || "Utilisateur";

  const displayUsernameWin = document.getElementById("display-username-win");
  // const displayUsernameLose = document.getElementById("display-username-lose");
  const avatarImg = document.getElementById("user-avatar") as HTMLImageElement | null;

  try {
    const profileRes = await fetch("http://localhost:8090/api/user-management/profile-info", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!profileRes.ok) {
      console.warn("Impossible de récupérer le profil, statut :", profileRes.status);
      updateUI(storedUsername, null);
      return;
    }

    const data = await profileRes.json();
    const usernameToDisplay = data.username || storedUsername;

    let avatarUrl: string | null = null;

    if (avatarImg) {
      try {
        const res = await fetch(
          `http://localhost:8086/api/backend/get-avatar/${encodeURIComponent(usernameToDisplay)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token || ""}`,
            },
          }
        );

        if (res.ok) {
          const blob = await res.blob();
          avatarUrl = URL.createObjectURL(blob);
        } else {
          console.warn("Avatar non trouvé pour", usernameToDisplay);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération de l'avatar :", err);
      }
    }

    updateUI(usernameToDisplay, avatarUrl);
  } catch (error) {
    console.error("Erreur lors de la récupération du profil :", error);
    updateUI(storedUsername, null);
  }

  function updateUI(username: string, avatarUrl: string | null) {
    if (displayUsernameWin) displayUsernameWin.textContent = username;
    // if (displayUsernameLose) displayUsernameLose.textContent = username;
    if (avatarImg) {
      avatarImg.src = avatarUrl || "assets/avatars/default.png";
    }
  }
}

export function waitForElements() {
  const displayUsername = document.getElementById("display-username-win");
  // const displayUsernameLose = document.getElementById("display-username-lose");

  if (displayUsername) {
    fetchProfileWL();
  } else {
    setTimeout(waitForElements, 100);
  }
}

function initProfileDisplay() {
  // Tentative immédiate
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForElements);
  } else {
    waitForElements();
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        const displayUsername = document.getElementById("display-username-win");
        // const displayUsernameLose = document.getElementById("display-username-lose");

        if (displayUsername) {
          observer.disconnect();
          fetchProfileWL();
        }
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  setTimeout(() => {
    observer.disconnect();
  }, 5000);
}

// Démarrage
initProfileDisplay();
