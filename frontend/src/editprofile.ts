function getElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element with ID "${id}" not found`);
  return el as T;
}

// Fonction pour injecter la modale
async function loadModal() {
  const response = await fetch("edit-modal.html");
  const html = await response.text();
  getElement("modal-container").innerHTML = html;

  bindModalEvents();
}

async function editUser(edit: string) : Promise<void> {
  const username = localStorage.getItem("username");
  
  try {
      const response = await fetch(`http://localhost:8085/api/user-management/change-user`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, edit })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
      } else {
        alert(data.message || `Failed to edit username.`);
      }

  } catch (err) {
      console.error('Erreur fetch:', err);
      alert('Erreur serveur');
	}
}

async function editPass(edit: string) : Promise<void> {
  const username = localStorage.getItem("username");
  
  try {
      const response = await fetch(`http://localhost:8084/api/user-management/change-pass`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, edit })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
      } else {
        alert(data.message || `Failed to edit password.`);
      }

  } catch (err) {
      console.error('Erreur fetch:', err);
      alert('Erreur serveur');
	}
}

async function editEmail(edit: string) : Promise<void> {
  const username = localStorage.getItem("username");
  
  try {
      const response = await fetch(`http://localhost:8083/api/user-management/change-email`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, edit })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
      } else {
        alert(data.message || `Failed to edit email.`);
      }

  } catch (err) {
      console.error('Erreur fetch:', err);
      alert('Erreur serveur');
	}
}

function bindModalEvents() {
  const modal = getElement<HTMLDivElement>("editModal");
  const closeBtn = getElement<HTMLButtonElement>("closeModalBtn");
  const form = getElement<HTMLFormElement>("editProfileForm");

  const inputUsername = getElement<HTMLInputElement>("edit-username");
  const inputEmail = getElement<HTMLInputElement>("edit-email");
  const inputPassword = getElement<HTMLInputElement>("edit-password");

  const displayUsername = getElement<HTMLSpanElement>("display-username");
  const displayEmail = getElement<HTMLSpanElement>("display-email");
  const displayPassword = getElement<HTMLSpanElement>("display-password");

  // Pré-remplissage
  inputUsername.value = displayUsername.textContent || "";
  inputEmail.value = displayEmail.textContent || "";
  inputPassword.value = "";

  modal.classList.remove("hidden");

  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  form.addEventListener("submit", (e: SubmitEvent) => {
    e.preventDefault();

    if (inputUsername.value.trim()) {
      displayUsername.textContent = inputUsername.value.trim();
    }

    if (inputEmail.value.trim()) {
      displayEmail.textContent = inputEmail.value.trim();
    }

    if (inputPassword.value.trim()) {
      displayPassword.textContent = "*".repeat(inputPassword.value.length);
    }

    modal.classList.add("hidden");
  });
}

// Écoute du clic sur le bouton
getElement("edit-profile-btn").addEventListener("click", loadModal);
