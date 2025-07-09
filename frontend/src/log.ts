import { navigate } from "./nav";
import { is2FA, send2FACode } from "./2FA";
import { showToast } from "./showToast";
import "./i18n";

async function connect(e: Event): Promise<void> {
  e.preventDefault();

  const username = (document.getElementById("username") as HTMLInputElement)
    .value;
  const password = (document.getElementById("password") as HTMLInputElement)
    .value;

  try {
    const response = await fetch("http://localhost:8081/api/backend/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("username", username);
      localStorage.setItem("token", data.token);
      localStorage.setItem("authMethod", "standard");
      localStorage.setItem("isConnected", "true");

      if ((await is2FA(e)) === false) {
        await navigate("2FA");
      } else {
        await send2FACode(username, e);
      }
    } else {
      showToast(data.message || "Erreur lors de la connexion.", "error");
    }
  } catch (err) {
    console.error("Erreur fetch:", err);
    showToast("Erreur serveur", "error");
  }
}

(window as any).connect = connect;

window.addEventListener("DOMContentLoaded", () => {
  const storedUsername = localStorage.getItem("username");
  if (storedUsername) {
    const displayUsername = document.getElementById("display-username");
    if (displayUsername) {
      displayUsername.textContent = storedUsername;
    }
  }
});

function loginWithGoogle() {
  localStorage.setItem("authMethod", "google");
  window.location.href = "/api/google-auth";
}

(window as any).loginWithGoogle = loginWithGoogle;

window.addEventListener("load", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const state = urlParams.get("state");

  if (code) {
    const token = localStorage.getItem("token");

    fetch("http://localhost:8095/api/google-auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        code: code,
        state: state,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("token", data.token);
          window.history.replaceState({}, document.title, window.location.pathname);
          window.location.href = "profile";
        } else {
          console.error("Erreur auth:", data.error);
          showToast("Erreur lors de l'authentification", "error");
        }
      })
      .catch((error) => {
        console.error("Erreur:", error);
        showToast("Erreur de communication avec le serveur", "error");
      });
  }
});
