import { fetchProfile } from "./editprofile";
import "./i18n";

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function displayAvatar(username: string): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(
      `http://localhost:8086/api/backend/get-avatar/${encodeURIComponent(username)}`,
      { headers }
    );
    if (!res.ok) {
      const text = await res.text();
      console.error("Erreur avatar:", res.status, text);
      throw new Error("Avatar not found");
    }

    const blob = await res.blob();
    const imageUrl = URL.createObjectURL(blob);

    const img = document.getElementById("avatar-preview") as HTMLImageElement;
    if (img) {
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
