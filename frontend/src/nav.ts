import { initProfilePage } from './profile'
import { getFriends } from "./friends"
import { moveBall } from "./pongballeffects"
import { updateConnectionStatus } from './status'
import { showToast } from './showToast'
import { EventManager } from './eventManager';
import { initializeLanguageSwitcher } from './i18n';
import { updateTexts } from './i18n'
import './i18n';


export const onNavigate = new EventManager();

export async function navigate(page : string) {
    try {
		onNavigate.dispatch();
		window.history.replaceState(null, document.title, page);
		const response = await fetch(`../pages/${page}.html`);
        if (!response.ok) throw new Error("Page not found");
        const html = await response.text();
        const elem = document.getElementById('screen-content');
        if (elem)
            elem.innerHTML = html;
        
        // Initialiser i18n après le chargement du nouveau contenu
        setTimeout(() => {
            updateTexts();
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
    const response = await fetch(`http://localhost:8081/api/backend/user_exist?username=${encodeURIComponent(username)}`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.exists === true;
  } catch (err) {
    console.error('Erreur fetch:', err);
    showToast('Erreur serveur', 'error');
    return false;
  }
}

// async function default_navigate() {
//   const username = localStorage.getItem("username");
//   const isConnected = localStorage.getItem("isConnected");

//   if (isConnected === "true" && username && await user_exist(username)) {
//     await navigate("profile");
//   } else {
//     localStorage.removeItem("isConnected");
//     localStorage.removeItem("username");
//     localStorage.removeItem("email");
//     localStorage.removeItem("token");
//     await navigate("log");
//   }
// }

async function default_navigate() {
  const username = localStorage.getItem("username");
  const isConnected = localStorage.getItem("isConnected");
  const isGoogleConnected = localStorage.getItem("isGoogleConnected");

  if (isConnected === "true" && username && await user_exist(username)) {
    // Si c'est une connexion Google valide, on va direct à profile (même logique pour classique)
    await navigate("profile");
  } else if (isGoogleConnected === "true" && username && await user_exist(username)) {
    // Exception pour Google : on va aussi direct à profile
    await navigate("profile");
  } else {
    // Sinon on nettoie et on va à la page log classique
    localStorage.removeItem("isConnected");
    localStorage.removeItem("isGoogleConnected");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("token");
    await navigate("log");
  }
}

async function handleGoogleAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  
  console.log("🔍 URL params:", window.location.search);
  console.log("🔍 token received:", token);

  if (!token) {
    console.log("❌ No token found in URL");
    return;
  }

  try {
    console.log("📤 Sending token request...");
    const response = await fetch("http://localhost:8095/api/auth/google/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    console.log("📥 Response status:", response.status);
    const data = await response.json();
    console.log("📥 Response data:", data);

    if (data.success) {
      console.log("✅ Auth successful");
      // ... rest of your token
    } else {
      console.error("❌ Auth failed:", data.error);
    }
  } catch (err) {
    console.error("❌ Network error:", err);
  }
}

window.addEventListener("load", async () => {
  await handleGoogleAuthCallback();
  await default_navigate();
});

(window as any).navigate = navigate;
(window as any).default_navigate = default_navigate;
