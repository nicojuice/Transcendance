import { filenameToFileObject } from "./signup";
import { showToast } from "./showToast";
import './i18n';

const avatars: string[] = [
  "/assets/avatars/avatar1.png",
  "/assets/avatars/avatar2.png",
  "/assets/avatars/avatar3.png",
  "/assets/avatars/avatar4.png",
  "/assets/avatars/avatar5.png",
  "/assets/avatars/avatar6.png",
  "/assets/avatars/avatar7.png",
  "/assets/avatars/avatar8.png",
  "/assets/avatars/avatar9.png",
  "/assets/avatars/avatar10.png",
  "/assets/avatars/avatar11.png",
  "/assets/avatars/avatar12.png",
  "/assets/avatars/avatar13.png",
  "/assets/avatars/avatar14.png",
  "/assets/avatars/avatar15.png",
];

let currentIndex: number = 0;

function changeAvatar(direction: number): void {
  currentIndex = (currentIndex + direction + avatars.length) % avatars.length;

  const avatarElement = document.getElementById(
    "avatar-preview"
  ) as HTMLImageElement | null;

  if (avatarElement) {
    avatarElement.src = avatars[currentIndex];
  }
}

export async function sendImgToDB(file: File, u: string | null): Promise<void> {
  const username = localStorage.getItem("username") || u;
  const formData = new FormData();

  if (!username) return;
  formData.append("username", username);
  formData.append("avatar", file);
  try {
    const response = await fetch(
      `http://localhost:8086/api/backend/add-avatar`,
      {
        method: "PATCH",
        body: formData,
      }
    );

    const data = await response.json();
    if (response.ok) {
    } else {
      showToast(data.message || "Failed to upload image", "error");
    }
  } catch (err) {
    console.error("Erreur fetch:", err);
    showToast("Error server", "error");
  }
}

function uploadCustomAvatar(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function () {
    const avatarPreview = document.getElementById("avatar-preview") as HTMLImageElement | null;
    if (avatarPreview && typeof reader.result === "string") {
      avatarPreview.src = reader.result;
      sendImgToDB(file, null);
    }
  };
  reader.readAsDataURL(file);
}

let selectedAvatar: string = "";

function toggleAvatarDropdown(): void {
  const dropdown = document.getElementById("avatar-dropdown");
  dropdown?.classList.toggle("hidden");
}

function chooseAvatar(path: string): void {
  selectedAvatar = path;

  const avatars = document.querySelectorAll(".avatar-option");
  avatars.forEach((el) => el.classList.remove("ring-4", "ring-blue-500"));
  const selected = document.querySelector(`img[data-src="${path}"]`);
  selected?.classList.add("ring-4", "ring-blue-500");
}

function selectAvatar(path: string, btn: HTMLButtonElement): void {
  selectedAvatar = path;

  const allButtons = document.querySelectorAll(".avatar-btn");
  allButtons.forEach((b) => b.classList.remove("border-white"));

  btn.classList.add("border-white");
}

async function confirmAvatarSelection(): Promise<void> {
  if (!selectedAvatar) return;

  const preview = document.getElementById(
    "avatar-preview"
  ) as HTMLImageElement | null;
  if (preview) {
    preview.src = selectedAvatar;
  }

  const dropdown = document.getElementById("avatar-dropdown");
  dropdown?.classList.add("hidden");

  sendImgToDB(await filenameToFileObject(selectedAvatar as string), null);
}

async function fetchUserAvatar(username: string): Promise<string> {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      `http://localhost:8086/api/backend/get-avatar/${encodeURIComponent(username)}`,
      {
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
      }
    );
    if (!response.ok) {
      return "/assets/avatars/avatar3.png";
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error("Erreur fetch avatar:", err);
    return "/assets/avatars/avatar3.png";
  }
}

async function updateAvatarForCurrentUser() {
  const username = localStorage.getItem("username");
  if (!username) return;

  const avatarUrl = await fetchUserAvatar(username);

  const avatarImg = document.getElementById("user-avatar") as HTMLImageElement | null;
  if (avatarImg) {
    avatarImg.src = avatarUrl;
  }

  const previewImg = document.getElementById("avatar-preview") as HTMLImageElement | null;
  if (previewImg) {
    previewImg.src = avatarUrl;
  }
}

updateAvatarForCurrentUser();

function safeUpdateAvatar() {
  const avatarImg = document.getElementById("user-avatar") as HTMLImageElement | null;

  if (avatarImg) {
    updateAvatarForCurrentUser();
  } else {
    setTimeout(safeUpdateAvatar, 100);
  }
}

safeUpdateAvatar();

(window as any).fetchUserAvatar = fetchUserAvatar;
(window as any).selectAvatar = selectAvatar;
(window as any).confirmAvatarSelection = confirmAvatarSelection;
(window as any).toggleAvatarDropdown = toggleAvatarDropdown;
(window as any).chooseAvatar = chooseAvatar;
(window as any).changeAvatar = changeAvatar;
(window as any).uploadCustomAvatar = uploadCustomAvatar;
