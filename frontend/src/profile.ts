import { fetchProfile } from "./editprofile";
import { editUser } from "./editprofile";
import { editEmail } from "./editprofile";
import { editPass } from "./editprofile";
import "./i18n";
import { showToast } from "./showToast";

// export function initProfilePage(): void {
// 	const storedUsername = localStorage.getItem('username');
// 	if (storedUsername) {
// 		const displayUsername = document.getElementById('display-username');
// 		if (displayUsername) {
// 			displayUsername.textContent = storedUsername;
// 		}
// 	}
// }

async function displayAvatar(username: string): Promise<void> {
  try {
    //console.log("display avatar");
    const res = await fetch(
      `http://localhost:8086/api/backend/get-avatar/${encodeURIComponent(username)}`
    );
    if (!res.ok) throw new Error("Avatar not found");

    const blob = await res.blob();
    const imageUrl = URL.createObjectURL(blob);

    // Exemple d’utilisation : afficher l’image dans une balise <img id="avatar">
    const img = document.getElementById("avatar-preview") as HTMLImageElement;
    if (img) {
      //console.log("image set");
      img.src = imageUrl;
    }
  } catch (err) {
    console.error("Error fetching avatar:", err);
  }
}

export async function initProfilePage(): Promise<void> {
  await fetchProfile();

  const storedUsername = localStorage.getItem("username");
  if (storedUsername) {
    const displayUsername = document.getElementById("display-username");
    if (displayUsername) {
      displayUsername.textContent = storedUsername;
    }
    await displayAvatar(storedUsername);
  }
}

async function openModalWithUserData(): Promise<void> {
  await fetchProfile();
  const username =
    (document.getElementById("username") as HTMLInputElement)?.value || "";
  const email =
    (document.getElementById("email") as HTMLInputElement)?.value || "";

  (document.getElementById("modal-username") as HTMLInputElement).value =
    username;
  (document.getElementById("modal-email") as HTMLInputElement).value = email;
  (document.getElementById("modal-password") as HTMLInputElement).value = "";
  (
    document.getElementById("modal-confirm-password") as HTMLInputElement
  ).value = "";

  const modal = document.getElementById("editModal") as HTMLElement | null;
  const popup = modal?.querySelector("#popup-profile") as HTMLElement | null;
  const handle = document.getElementById(
    "drag-handle-profile"
  ) as HTMLElement | null;

  if (!modal || !popup || !handle) return;

  modal.classList.remove("hidden");

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  const onMouseDown = (e: MouseEvent) => {
    isDragging = true;
    const rect = popup.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    popup.style.left = `${e.clientX - offsetX}px`;
    popup.style.top = `${e.clientY - offsetY}px`;
  };

  const onMouseUp = () => {
    isDragging = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  handle.addEventListener("mousedown", onMouseDown);
}

function closeModal() {
  document.getElementById("editModal")?.classList.add("hidden");
}

async function saveProfileChanges() {
  const username = (
    document.getElementById("modal-username") as HTMLInputElement
  ).value.trim();
  const email = (
    document.getElementById("modal-email") as HTMLInputElement
  ).value.trim();
  const password = (
    document.getElementById("modal-password") as HTMLInputElement
  ).value;
  const confirmPassword = (
    document.getElementById("modal-confirm-password") as HTMLInputElement
  ).value;

  if (password !== "" && password !== confirmPassword) {
    showToast("Les mots de passe ne correspondent pas.", "error");
    return;
  }

  // Pour mettre à jour le username dans l'input principal (visible sur la page)
  (document.getElementById("username") as HTMLInputElement).value = username;
  (document.getElementById("email") as HTMLInputElement).value = email;

  try {
    // Appel à editUser() qui utilise l'input principal "username"
    await editUser();

    // Appel à editEmail avec le nouvel email
    await editEmail(email);

    // Si mot de passe renseigné, changement de mot de passe
    if (password !== "") {
      await editPass(password);
    }

    closeModal();
  } catch (err) {
    console.error("Erreur lors de la sauvegarde des modifications :", err);
  }
}

(window as any).openModalWithUserData = openModalWithUserData;
(window as any).saveProfileChanges = saveProfileChanges;
(window as any).closeModal = closeModal;

function showPasswordEdit(): void {
  const passwordView = document.getElementById("password-view");
  const passwordEdit = document.getElementById("password-edit");
  if (passwordView && passwordEdit) {
    passwordView.classList.add("hidden");
    passwordEdit.classList.remove("hidden");
  }
}

function cancelPasswordEdit(): void {
  const passwordView = document.getElementById("password-view");
  const passwordEdit = document.getElementById("password-edit");
  const oldPassword = document.getElementById(
    "old-password"
  ) as HTMLInputElement | null;
  const newPassword = document.getElementById(
    "new-password"
  ) as HTMLInputElement | null;
  const confirmPassword = document.getElementById(
    "confirm-password"
  ) as HTMLInputElement | null;

  if (passwordEdit && passwordView) {
    passwordEdit.classList.add("hidden");
    passwordView.classList.remove("hidden");
  }

  if (oldPassword) oldPassword.value = "";
  if (newPassword) newPassword.value = "";
  if (confirmPassword) confirmPassword.value = "";
}

(window as any).showPasswordEdit = showPasswordEdit;
(window as any).cancelPasswordEdit = cancelPasswordEdit;
