import './i18n';

import { navigate, user_exist } from "./nav";
import { sendImgToDB } from "./avatarSelector";
import { showToast } from "./showToast";

export async function filenameToFileObject(filename: string): Promise<File> {
  const res = await fetch(filename);
  const blob = await res.blob();
  const file = new File([blob], filename, { type: blob.type });
  return file;
}

async function register(e: Event): Promise<void> {
  e.preventDefault();

  const usernameInput = document.getElementById("username") as HTMLInputElement;
  const emailInput = document.getElementById("email") as HTMLInputElement;
  const passwordInput = document.getElementById("password") as HTMLInputElement;
  const confirmPasswordInput = document.getElementById(
    "confirm-password"
  ) as HTMLInputElement;

  const username = usernameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if ((await user_exist(username)) === true) {
    showToast("An user already uses this username", "error");
    return;
  } else if (password !== confirmPassword) {
    showToast("Les mots de passe ne correspondent pas.", "error");
    return;
  }

  try {
    const response = await fetch("http://localhost:8082/api/backend/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      //alert(data.message);
      sendImgToDB(await filenameToFileObject("/assets/avatar1.png"), username);
      await navigate("log");
    } else {
      showToast(data.message || "Erreur lors de l’inscription.", "error");
    }
  } catch (err) {
    console.error("Erreur fetch:", err);
    showToast("Erreur serveur", "error");
  }
}

// Expose function to global scope
(window as any).register = register;

window.addEventListener("DOMContentLoaded", () => {
  const registerBtn = document.getElementById("register-button");
  if (registerBtn) {
    registerBtn.addEventListener("click", register);
  }
});
