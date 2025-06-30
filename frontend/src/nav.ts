import { initProfilePage } from './profile'
import { getFriends } from "./friends"
import { moveBall } from "./pongballeffects"
import { updateConnectionStatus } from './status'
import { showToast } from './showToast'
import { EventManager } from './eventManager';
import { initializeLanguageSwitcher } from './i18n';
import { updateTexts } from './i18n';
import { onProfilePageShow } from './loadPlayerData';
import './i18n';

export const onNavigate = new EventManager();

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function navigate(page: string) {
  try {
    onNavigate.dispatch();
    window.history.replaceState(null, document.title, page);
    const response = await fetch(`../pages/${page}.html`);
    if (!response.ok) throw new Error("Page not found");
    const html = await response.text();
    const elem = document.getElementById('screen-content');
    if (elem)
      elem.innerHTML = html;

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

  console.log("🔍 Auth success params:", { user, token: token ? "present" : "missing" });

  if (user && token) {
    console.log("✅ Storing Google auth data");
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
  console.log("🚀 handleGoogleAuthCode called");

  if (error) {
    console.error("❌ OAuth error:", error);
    showToast('Erreur d\'authentification', 'error');
    await navigate("log");
    return;
  }

  if (!code) return false;

  console.log("🔍 Processing OAuth code:", code.substring(0, 20) + "...");

  try {
    console.log("📤 Exchanging code for token...");
    const headers = await getAuthHeaders();
    const response = await fetch("http://localhost:8095/api/auth/google/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers
      },
      body: JSON.stringify({ code }),
    });

    console.log("📥 Token exchange response status:", response.status);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    console.log("📥 Token exchange data:", { success: data.success, user: data.user?.name });

    if (data.success && data.token && data.user) {
      console.log("✅ OAuth successful, storing data");
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
  console.log("🚀 App loading...");

  if (await handleAuthSuccess()) return;
  if (await handleGoogleAuthCode()) return;
  await default_navigate();
});

(window as any).navigate = navigate;
(window as any).default_navigate = default_navigate;
