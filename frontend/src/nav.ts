import { initProfilePage } from './profile'
import { getFriends } from "./friends"
import { moveBall } from "./pongballeffects"
import { updateConnectionStatus } from './status'
import { showToast } from './showToast'
import { EventManager } from './eventManager';
import { initializeLanguageSwitcher } from './i18n';
import { initTournamentPage } from './games/tournament';
import { onProfilePageShow } from './loadPlayerData';
import './i18n';
import { updateTexts } from './i18n'
import * as ROOM from "./games/room";
import { initTournamentResultPage } from './games/tournament-result';
import { loadMatchHistory } from './matchhistory'

export const onNavigate = new EventManager();

export async function advanceTournamentMatchId(): Promise<number> {
  const rawId = localStorage.getItem("tournamentId");
  if (!rawId) {
    throw new Error("Aucun tournoi en cours.");
  }
  const id = parseInt(rawId, 10);
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Utilisateur non authentifié.");
  }

  const room = new ROOM.Room();
  room.loadFromLocalStorage();

  const winner = room.winner;
  if (!winner) {
    throw new Error("Le gagnant n'est pas défini.");
  }

  const response = await fetch(
    `http://localhost:8001/api/backend/games/tournament/${id}/next`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ winner }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.matchid;
}

export async function navigateOrTournament(): Promise<void> {
  const room = new ROOM.Room();
  room.loadFromLocalStorage();

  if (!room.isTournament) {
    return navigate("profile");
  }

  try {
    const nextMatchId = await advanceTournamentMatchId();

    if (nextMatchId > 3) {
      localStorage.setItem("tournament", room.winner || "Inconnu");
      navigate("tournament-result");
    } else {
      navigate("tournament");

      setTimeout(() => {
        if (window.location.pathname.endsWith("tournament")) {
          initTournamentPage();
        }
      }, 50);
    }
  } catch (err) {
    console.error("Erreur advanceTournamentMatchId :", err);
    showToast("Impossible de passer au match suivant.", "error");
  }
}

export async function navigate(page: string) {
  try {
    window.history.replaceState(null, document.title, page);

    const response = await fetch(`../pages/${page}.html`);
    if (!response.ok) throw new Error("Page not found");
    const html = await response.text();
    const elem = document.getElementById('screen-content');
    if (elem) elem.innerHTML = html;

    onNavigate.dispatch_all();

    setTimeout(() => {
      updateTexts();
      onProfilePageShow();
      initializeLanguageSwitcher();

      if (page === 'match-history') {
        const username = localStorage.getItem('username');
        if (username) {
          const container = document.getElementById('match-history');
          if (container) {
            container.setAttribute('data-username', username);
            loadMatchHistory(username);
          }
        } else {
          console.error('Username non trouvé dans localStorage');
        }
      }
    }, 50);

    moveBall();
  } catch (error) {
    //console.error("Erreur de chargement :", error);
    const elem = document.getElementById('screen-content');
    if (elem) elem.innerHTML = "<p>404 - QUITTE LA PAGE VITE!</p>";
  }
}

export async function user_exist(username: string): Promise<boolean> {
  if (!username) return false;
  try {
    const response = await fetch(
      `http://localhost:8081/api/backend/user_exist?username=${encodeURIComponent(username)}`,
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

  if (isConnected === "true" && username && await user_exist(username)) {
    await navigate("profile");
  } else if (isGoogleConnected === "true" && username && await user_exist(username)) {
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

window.addEventListener("DOMContentLoaded", async () => {

  if (await handleAuthSuccess()) return;
  await default_navigate();
});

onNavigate.addEventListener("loadAll" ,() => {
  const path = window.location.pathname;

  if (path.endsWith("profile")) {
    updateConnectionStatus(1).then(initProfilePage);
  } else if (path.endsWith("friends")) {
    getFriends();
  } else if (path.endsWith("tournament")) {
    initTournamentPage();
  } else if (path.endsWith("tournament-result")) {
    setTimeout(initTournamentResultPage, 100);
  }
});

(window as any).navigateOrTournament = navigateOrTournament;
(window as any).navigate = navigate;
(window as any).default_navigate = default_navigate;