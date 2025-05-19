function getUsername() {
  const savedUsername = localStorage.getItem("username");
  if (savedUsername) {
    // document.getElementById("username").textContent = savedUsername;
  }
}

function getEmail() {
  const savedEmail = localStorage.getItem("email");
  if (savedEmail) {
    // document.getElementById("username").textContent = savedUsername;
  }
}

function getPassword() {
  const savedPassword = localStorage.getItem("password");
  if (savedPassword) {
    // document.getElementById("username").textContent = savedUsername;
  }
}

function toggleEdit(field: string) {
  const input = document.getElementById(field) as HTMLInputElement;

  if (input.readOnly) {
    input.readOnly = false;
    input.focus();
  } else {
    input.readOnly = true;
    let value = input.value;

    // Sauvegarder dans le localStorage
    if (field === "password") {
      const starsOnly = /^\*+$/;
      if (!starsOnly.test(value)) {
        localStorage.setItem("password", value);
        input.value = "*".repeat(value.length);
      }
    } else {
      localStorage.setItem(field, value);
    }

    // Met à jour aussi le nom affiché en haut
    if (field === "username") {
      const displayUsername = document.getElementById("display-username");
      if (displayUsername) displayUsername.textContent = value;
    }
  }
}
