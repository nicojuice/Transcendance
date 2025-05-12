const form = document.getElementById("signupForm") as HTMLFormElement;
const messageBox = document.getElementById(
  "signupMessage"
) as HTMLParagraphElement;

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = (document.getElementById("username") as HTMLInputElement)
    .value;
  const email = (document.getElementById("email") as HTMLInputElement).value;
  const password = (document.getElementById("password") as HTMLInputElement)
    .value;
  const confirmPassword = (
    document.getElementById("confirmPassword") as HTMLInputElement
  ).value;

  // Vérifie que les mots de passe concordent
  if (password !== confirmPassword) {
    messageBox.textContent = "❌ Les mots de passe ne correspondent pas.";
    messageBox.className = "text-red-400 mt-2";
    return;
  }

  try {
    const res = await fetch("/api/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      messageBox.textContent =
        "✅ Inscription réussie ! Vous pouvez maintenant vous connecter.";
      messageBox.className = "text-green-400 mt-2";
      // Optionnel : rediriger vers la page de login après 2 sec
      setTimeout(() => (window.location.href = "/log.html"), 2000);
    } else {
      messageBox.textContent = `❌ ${data.message}`;
      messageBox.className = "text-red-400 mt-2";
    }
  } catch (err) {
    console.error("Erreur réseau :", err);
    messageBox.textContent = "❌ Erreur de communication avec le serveur.";
    messageBox.className = "text-red-400 mt-2";
  }
});
