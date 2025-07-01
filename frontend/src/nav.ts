// import { initProfilePage } from './profile'
// import { getFriends } from "./friends"
// import { moveBall } from "./pongballeffects"
// import { updateConnectionStatus } from './status'
// import { showToast } from './showToast'
// import { EventManager } from './eventManager';
// import { initializeLanguageSwitcher } from './i18n';
// import { updateTexts } from './i18n'
// import './i18n';


// export const onNavigate = new EventManager();

// export async function navigate(page : string) {
//     try {
// 		onNavigate.dispatch();
// 		window.history.replaceState(null, document.title, page);
// 		const response = await fetch(`../pages/${page}.html`);
//         if (!response.ok) throw new Error("Page not found");
//         const html = await response.text();
//         const elem = document.getElementById('screen-content');
//         if (elem)
//             elem.innerHTML = html;
        
//         console.log("navigation by navigate()");
        
//         // Initialiser i18n après le chargement du nouveau contenu
//         setTimeout(() => {
//             updateTexts();
//             initializeLanguageSwitcher();
//         }, 50);
        
//         if (page === "profile") {
//             await updateConnectionStatus(1);
//             await initProfilePage();
//         } else if (page === "friends") {
//             await getFriends();
//         }
        
//         moveBall();
        
//     } catch (error) {
//         console.error("Erreur de chargement :", error);
//         const elem = document.getElementById('screen-content');
//         if (elem)
//             elem.innerHTML = "<p>404 - QUITTE LA PAGE VITE!</p>";
//     }
// }

// export async function user_exist(username: string): Promise<boolean> {
//     // check si le username est valide et correspond a un utilisateur existant
//     if (!username)
//         return (false);
//     try {
//         const response = await fetch(`http://localhost:8081/api/backend/user_exist?username=${encodeURIComponent(username)}`, {
//             method: 'GET'
//         });
//         //const data = await response.json();
//         if (response.ok) {
//             //alert(data.message);
//             return (true);
//         } else {
//             //alert(data.message || 'Erreur lors de l'inscription.');
//             return (false);
//         }
//     } catch (err) {
//         console.error('Erreur fetch:', err);
//         showToast('Erreur serveur', 'error');
//         return (false);
//     }
// }

// async function default_navigate() {
//     const username = localStorage.getItem("username");
//     if (localStorage.getItem('isConnected') === 'true' && (username && await user_exist(username) === true)) {
//         console.log("navigation by default()");
//         await navigate("profile");
//     } else {
//         localStorage.removeItem("isConnected");
//         localStorage.removeItem("username");
//         localStorage.removeItem("email");
//         localStorage.removeItem("token");
//         await navigate("log");
//     }
// }

// default_navigate();
// (window as any).navigate = navigate;
// (window as any).default_navigate = default_navigate;


import { initProfilePage } from './profile'
import { getFriends } from "./friends"
import { moveBall } from "./pongballeffects"
import { updateConnectionStatus } from './status'
import { showToast } from './showToast'
import { EventManager } from './eventManager';
import { initializeLanguageSwitcher } from './i18n';
import { updateTexts } from './i18n'
import * as ROOM from "./games/room";
import { onProfilePageShow } from './loadPlayerData';
import './i18n';

export const onNavigate = new EventManager();

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function advanceTournamentMatchId(): Promise<number> {
  const rawId = localStorage.getItem("tournamentId");
  if (!rawId) {
    throw new Error("Aucun tournoi en cours.");
  }
  const id = parseInt(rawId, 10);

  // Charger la room pour récupérer le gagnant du match
  const room = new ROOM.Room();
  room.loadFromLocalStorage();
  const winner = room.winner;

  const response = await fetch(
    `http://localhost:8001/api/backend/games/tournament/${id}/next`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winner })
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  // Retourne le nouvel ID de match
  return data.matchid;
}

export async function navigateOrTournament(): Promise<void> {
  // Charger la room depuis le localStorage
  const room = new ROOM.Room();
  room.loadFromLocalStorage();

  // Si ce n’est pas un tournoi, on retourne direct au profil
  if (!room.isTournament) {
    return navigate("profile");
  }

  // Sinon, on avance le match sur le serveur et on redirige
  try {
    const nextMatchId = await advanceTournamentMatchId();
    console.log("MatchId avancé à", nextMatchId);

    if (nextMatchId > 3) {
      // Plus de demi-finales ni de finale → tournoi terminé
      const room = new ROOM.Room();
      room.loadFromLocalStorage();
      localStorage.setItem("tournament", room.winner || "Inconnu");
      navigate("tournament-result");
    } else {
      // On recharge la page tournoi pour le prochain match
      navigate("tournament");
    }
  } catch (err) {
    console.error("Erreur advanceTournamentMatchId :", err);
    showToast("Impossible de passer au match suivant.", "error");
  }
}

export async function navigate(page : string) {
    try {
        // Modifier l'historique URL
        window.history.replaceState(null, document.title, page);

        // Charger le HTML de la page
        const response = await fetch(`../pages/${page}.html`);
        if (!response.ok) throw new Error("Page not found");
        const html = await response.text();
        const elem = document.getElementById('screen-content');
        if (elem)
            elem.innerHTML = html;

        // Déclencher les listeners APRES injection du HTML
        onNavigate.dispatch();

        console.log("navigation by navigate()");
        
        // Initialiser i18n après le chargement du nouveau contenu
        setTimeout(() => {
            updateTexts();
            onProfilePageShow();
            initializeLanguageSwitcher();
        }, 50);
        
        if (page === "profile") {
            await updateConnectionStatus(1);
            await initProfilePage();
        } else if (page === "friends") {
            await getFriends();
        }
        
        moveBall();
        
    } catch (error) {
        console.error("Erreur de chargement :", error);
        const elem = document.getElementById('screen-content');
        if (elem)
            elem.innerHTML = "<p>404 - QUITTE LA PAGE VITE!</p>";
    }
}
export async function user_exist(username: string): Promise<boolean> {
  if (!username) return false;
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `http://localhost:8081/api/backend/user_exist?username=${encodeURIComponent(username)}`,
      { headers }
    );
    if (!response.ok) return false;
    const data = await response.json();
    return data.exists === true;
  } catch (err) {
    console.error('Erreur fetch:', err);
    showToast('Erreur serveur', 'error');
    return false;
  }
}

async function default_navigate() {
  const username = localStorage.getItem("username");
  const isConnected = localStorage.getItem("isConnected");
  const isGoogleConnected = localStorage.getItem("isGoogleConnected");

  if (isConnected === "true" && username) {
    await navigate("profile");
  } else if (isGoogleConnected === "true" && username) {
    await navigate("profile");
  } else {
    localStorage.removeItem("isConnected");
    localStorage.removeItem("isGoogleConnected");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("code");
    await navigate("log");
  }
}

async function handleAuthSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const user = urlParams.get("user");
  const token = urlParams.get("token");


  if (user && token) {
    localStorage.setItem("username", decodeURIComponent(user));
    localStorage.setItem("token", token);
    localStorage.setItem("isConnected", "true");
    localStorage.setItem("isGoogleConnected", "true");

    window.history.replaceState({}, document.title, window.location.pathname);
    showToast(`Bienvenue ${decodeURIComponent(user)} !`, 'success');
    await navigate("profile");
    return true;
  }
  return false;
}

export async function handleGoogleAuthCode() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const error = urlParams.get("error");

  if (error) {
    console.error("❌ OAuth error:", error);
    showToast('Erreur d\'authentification', 'error');
    await navigate("log");
    return;
  }

  if (!code) return false;


  try {
    const headers = await getAuthHeaders();
    const response = await fetch("http://localhost:8095/api/auth/google/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    if (data.success && data.token && data.user) {
      localStorage.setItem("username", data.user.name);
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("token", data.token);
      localStorage.setItem("isConnected", "true");
      localStorage.setItem("isGoogleConnected", "true");

      window.history.replaceState({}, document.title, window.location.pathname);
      showToast(`Bienvenue ${data.user.name} !`, 'success');
      setTimeout(() => {
        navigate("profile");
      }, 500);
      return true;
    } else {
      console.error("❌ Auth failed:", data);
      showToast('Échec de l\'authentification', 'error');
      await navigate("log");
    }
  } catch (err) {
    console.error("❌ Network error during token exchange:", err);
    showToast('Erreur de connexion', 'error');
    await navigate("log");
  }

  return false;
}

window.addEventListener("DOMContentLoaded", async () => {

  if (await handleAuthSuccess()) return;
  if (await handleGoogleAuthCode()) return;
  await default_navigate();
});

(window as any).navigateOrTournament = navigateOrTournament;
(window as any).navigate = navigate;
(window as any).default_navigate = default_navigate;
