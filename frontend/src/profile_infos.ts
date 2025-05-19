function getUsername() {
  console.log("getUsername called");
  const username = localStorage.getItem("username");
  if (username)
    (document.getElementById("display-username") as HTMLInputElement).value = username;

}

function getEmail() {
  const savedEmail = localStorage.getItem("email");
  if (savedEmail) {
    const emailInput = document.getElementById("email") as HTMLInputElement;
    if (emailInput) emailInput.value = savedEmail;
  }
}

function getPassword() {
  const savedPassword = localStorage.getItem("password");
  if (savedPassword) {
    const passwordInput = document.getElementById("password") as HTMLInputElement;
    if (passwordInput) passwordInput.value = savedPassword; // ou masqué si tu veux
  }
}

function toggleEdit(field: "username" | "email" | "password") {
  let input: HTMLInputElement | null = null;

  switch (field) {
    case "username":
      input = document.getElementById("display-username") as HTMLInputElement;
      break;
    case "email":
      input = document.getElementById("email") as HTMLInputElement;
      break;
    case "password":
      input = document.getElementById("password") as HTMLInputElement;
      break;
  }

  if (!input) {
    console.warn(`Champ introuvable pour le field "${field}"`);
    return;
  }

  if (input.hasAttribute("readonly")) {
    input.removeAttribute("readonly");
    input.focus();
  } else {
    input.setAttribute("readonly", "true");
    console.log(`New ${field}:`, input.value);
    localStorage.setItem(field, input.value);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  getUsername();
  getEmail();
  getPassword();
});
