// src/log.ts

const form = document.getElementById("loginForm") as HTMLFormElement;

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = (document.getElementById("username") as HTMLInputElement)
    .value;
  const password = (document.getElementById("password") as HTMLInputElement)
    .value;

  try {
    const res = await fetch("/api/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("Échec de la connexion");

    const data = await res.json();
    console.log("Connexion réussie :", data);

    // Optionnel : stocker un token ou rediriger
    // localStorage.setItem('token', data.token);
    // window.location.href = '/home.html';
  } catch (err) {
    console.error("Erreur lors du login :", err);
  }
});
