// import { setCookie } from 'typescript-cookie';
import { navigate } from "./nav";
import { is2FA, send2FACode } from "./2FA";
import { showToast } from "./showToast";
//import { initProfilePage } from './profile';

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
      if ((await is2FA(e)) === false) await navigate("2FA");
      else await send2FACode(username, e);
    } else {
      showToast(data.message || "Erreur lors de la connexion.", "error");
    }
  } catch (err) {
    console.error("Erreur fetch:", err);
    showToast("Erreur serveur", "error");
  }
}

// Expose function to global scope
(window as any).connect = connect;

window.addEventListener("DOMContentLoaded", () => {
  // Connexion
  //const connectBtn = document.getElementById('connect-button');
  //if (connectBtn) {
  //	connectBtn.addEventListener('click', connect);
  //}

  // Affichage du username
  const storedUsername = localStorage.getItem("username");
  if (storedUsername) {
    const displayUsername = document.getElementById("display-username");
    if (displayUsername) {
      displayUsername.textContent = storedUsername;
    }
  }
});

// window.addEventListener('DOMContentLoaded', () => {
//   const connectBtn = document.getElementById('connect-button');
//   if (connectBtn) {
//     connectBtn.addEventListener('click', connect);
//   }
// });

// window.addEventListener('DOMContentLoaded', () => {
// 	const storedUsername = localStorage.getItem('username');
// 	if (storedUsername) {
// 		const displayUsername = document.getElementById('display-username');
// 		if (displayUsername) {
// 			displayUsername.textContent = storedUsername;
// 		}
// 	}
// });
