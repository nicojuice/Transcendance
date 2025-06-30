import { navigate } from "./nav";
import { showToast } from "./showToast";
import './i18n';

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
}

export async function send2FACode(username: string, e: Event): Promise<void> {
  e.preventDefault();

  await navigate("2FAcode");
  const response = await fetch("http://localhost:8100/api/send-2fa-code", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ username }),
  });
  if (!response.ok) {
    showToast("Error while sending the 2FA code.", "error");
    return;
  }
}

async function active2FAlater(e: Event): Promise<void> {
  e.preventDefault();

  localStorage.setItem("isConnected", "true");
  await navigate("profile");
}

async function resend2FACode(e: Event): Promise<void> {
  e.preventDefault();

  const username = localStorage.getItem("username");
  if (!username) {
    navigate("log");
    return;
  }
  send2FACode(username, e);
}

async function check2FACode(e: Event): Promise<void> {
  e.preventDefault();

  const username = localStorage.getItem("username");
  if (!username) {
    navigate("log");
    return;
  }
  const code = (document.getElementById("2FA-code") as HTMLInputElement).value;
  const response = await fetch("http://localhost:8100/api/verify-2fa", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ username, code }),
  });
  if (!response.ok) {
    if (response.status === 401) showToast("Mauvais code", "error");
    else showToast(`Erreur interne - code ${response.status}`, "error");
  } else if ((await response.json()).success === true) navigate("profile");
  else showToast("Mauvais code", "error");
}

export async function is2FA(e: Event): Promise<Boolean | null> {
  e.preventDefault();

  const username = localStorage.getItem("username");
  if (!username) {
    showToast("Connexion perdue", "error");
    navigate("log");
    return null;
  }

  const response = await fetch(
    `http://localhost:8100/api/is-2fa-active/${encodeURIComponent(username)}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );
  if (!response.ok) {
    showToast("Erreur serveur", "error");
    return false;
  }
  const boolean = (await response.json()).enabled;
  return boolean;
}

async function active2FA(e: Event): Promise<void> {
  e.preventDefault();

  const username = localStorage.getItem("username");
  if (!username) {
    showToast("Connexion perdue", "error");
    navigate("log");
    return;
  }

  const response = await fetch("http://localhost:8100/api/active-2fa", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ username }),
  });
  if (!response.ok) {
    showToast("Erreur serveur", "error");
    return;
  }

  const sendCodeResponse = await fetch("http://localhost:8100/api/send-2fa-code", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ username }),
  });

  if (!sendCodeResponse.ok) {
    showToast("Erreur envoi code 2FA", "error");
    return;
  }

  showToast("2FA activé. Code envoyé par email.", "success");
  await navigate("2FAcode");
}

(window as any).is2FA = is2FA;
(window as any).active2FA = active2FA;
(window as any).active2FAlater = active2FAlater;
(window as any).check2FACode = check2FACode;
(window as any).send2FACode = send2FACode;
(window as any).resend2FACode = resend2FACode;
