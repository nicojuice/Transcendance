import { Room} from './games/room';

export async function fetchProfileWL() {
  const token = localStorage.getItem("token");
  const storedUsername = localStorage.getItem("username") || "Utilisateur";
  
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
    
    updateUI(usernameToDisplay, avatarUrl);
  } catch (error) {
    console.error("Erreur lors de la récupération du profil :", error);
    updateUI(storedUsername, null);
  }
}

function updateUI(username: string, avatarUrl: string | null) {
  const displayUsernameWin = document.getElementById("display-username-win");
  const avatarImg = document.getElementById("user-avatar") as HTMLImageElement | null;
  
  const displayOpponentName = document.getElementById("display-opponent-name");
  const opponentAvatarImg = document.getElementById("opponent-avatar") as HTMLImageElement | null;

  const match1WinnerEl = document.getElementById("match1-winner");

  if (displayUsernameWin) displayUsernameWin.textContent = username;
  if (avatarImg) {
    avatarImg.src = avatarUrl || "assets/avatars/avatar2.png";
  }

  const room = new Room();
  room.loadFromLocalStorage();
  
  const isAI = room.withIA;

  if (displayOpponentName) {
    displayOpponentName.textContent = isAI ? "IA" : "JOUEUR 2";
  }
  
  if (opponentAvatarImg) {
    if (isAI) {
      opponentAvatarImg.src = "assets/avatars/IA.png";
    } else {
      const player2 = room.players.find(p => p.name !== username);
      opponentAvatarImg.src = player2?.avatar || "assets/avatars/avatar2.png";
    }
  }

  const winnersStr = localStorage.getItem("tournamentWinners");
  if (winnersStr) {
    const winners = JSON.parse(winnersStr);
    if (match1WinnerEl && winners.match1) {
      match1WinnerEl.textContent = winners.match1;
    }
  }
}

export function waitForElements() {
  const displayUsername = document.getElementById("display-username-win");
  if (displayUsername) {
    fetchProfileWL();
  } else {
    setTimeout(waitForElements, 100);
  }
}

function initProfileDisplay() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForElements);
  } else {
    waitForElements();
  }
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        const displayUsername = document.getElementById("display-username-win");
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

initProfileDisplay();