import { navigate } from "./nav";
import { showToast } from "./showToast";
import "./i18n";

async function addFriend(add: string): Promise<void> {
  const username = localStorage.getItem("username");

  if (!add || add.trim() === "") {
    showToast("Veuillez entrer un nom d'utilisateur", "error");
    return;
  }

  add = add.trim();

  if (add === username) {
    showToast("Impossible de s'ajouter soi-même en ami", "error");
    return;
  }

  try {
    const response = await fetch("http://localhost:8088/api/add-friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, friend: add }),
    });

    const data = await response.json();

    if (response.ok) {
      const inputElement = document.getElementById(
        "addfriend"
      ) as HTMLInputElement;
      if (inputElement) inputElement.value = "";
      showToast(data.message || "Ami ajouté avec succès !", "success");
      await getFriends();
    } else {
      showToast(data.message || "Échec de l'ajout de l'ami", "error");
    }
  } catch (err) {
    console.error("Erreur fetch:", err);
    showToast("Erreur serveur", "error");
  }
}

export async function getFriends(): Promise<void> {
  const username = localStorage.getItem("username");
  if (!username) {
    await navigate("log");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8088/api/get-friends?username=${encodeURIComponent(username)}`
    );
    if (!response.ok) throw new Error(`Erreur API : ${response.status}`);

    const data = await response.json();
    const friendsList: string[] = data.friends || [];

    const ul = document.getElementById("friends-list");
    const emptyText = document.getElementById("empty-friends-text");

    if (!ul) return;
    ul.innerHTML = "";

    if (friendsList.length === 0 && emptyText) {
      emptyText.style.display = "block";
    } else if (emptyText) {
      emptyText.style.display = "none";
    }

    for (const friend of friendsList) {
      if (!friend || typeof friend !== "string") continue;

      const friendStatus = await getFriendStatus(friend);

      const li = document.createElement("li");
      li.className = `
        p-3 rounded-3xl bg-zinc-900/60 border border-white/20
        hover:border-white hover:bg-zinc-800/70
        flex items-center justify-between gap-4 transition-all
      `;

      // Avatar + statut
      const avatarDiv = document.createElement("div");
      avatarDiv.textContent = friend.charAt(0).toUpperCase();
      avatarDiv.className =
        "w-9 h-9 rounded-full flex items-center justify-center font-bold";

      if (friendStatus === 1) {
        avatarDiv.classList.add(
          "text-neon",
          "border",
          "border-neon",
          "bg-zinc-800"
        );
      } else if (friendStatus === 0) {
        avatarDiv.classList.add(
          "text-gray-400",
          "border",
          "border-gray-500",
          "bg-zinc-700"
        );
      } else {
        avatarDiv.classList.add(
          "text-white/40",
          "border",
          "border-white/10",
          "bg-zinc-700"
        );
      }

      const statusDot = document.createElement("span");
      statusDot.className =
        "w-3 h-3 rounded-full flex-shrink-0 absolute bottom-0 right-0 border-2";
      if (friendStatus === 1) {
        statusDot.classList.add("bg-neon", "border-white/80");
      } else if (friendStatus === 0) {
        statusDot.classList.add("bg-gray-400", "border-white/60");
      } else {
        statusDot.classList.add("bg-transparent", "border-transparent");
      }

      const avatarWrapper = document.createElement("div");
      avatarWrapper.className = "relative flex items-center justify-center";
      avatarWrapper.appendChild(avatarDiv);
      avatarWrapper.appendChild(statusDot);

      const nameSpan = document.createElement("span");
      nameSpan.className = "text-sm font-semibold";
      if (friendStatus === 1) {
        nameSpan.classList.add("text-white");
      } else if (friendStatus === 0) {
        nameSpan.classList.add("text-gray-400");
      } else {
        nameSpan.classList.add("text-white/40");
      }
      nameSpan.textContent = friend;

      const left = document.createElement("div");
      left.className = "flex items-center gap-3";
      left.appendChild(avatarWrapper);
      left.appendChild(nameSpan);

      const removeBtn = document.createElement("button");
      removeBtn.className = "hover:text-neon text-white transition-colors";
      removeBtn.title = "Remove friend";
      removeBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      `;
      removeBtn.onclick = async () => {
        const confirmRemove = confirm(`Supprimer ${friend} de ta liste ?`);
        if (!confirmRemove) return;

        try {
          const res = await fetch(
            `http://localhost:8088/api/remove-friend/${username}/${friend}`,
            { method: "DELETE" }
          );

          if (res.ok) {
            showToast("Ami supprimé", "success");
            await getFriends();
          } else {
            const errData = await res.json();
            showToast(errData.message || "Échec de la suppression", "error");
          }
        } catch (err) {
          console.error(err);
          showToast("Erreur serveur", "error");
        }
      };

      li.appendChild(left);
      li.appendChild(removeBtn);
      ul.appendChild(li);
    }
  } catch (err) {
    console.error("Erreur lors du chargement des amis :", err);
    showToast("Erreur lors du chargement des amis", "error");
  }
}

async function getFriendStatus(friendUsername: string): Promise<number | null> {
  try {
    const response = await fetch(
      `http://localhost:8094/api/status?username=${encodeURIComponent(friendUsername)}`
    );
    if (!response.ok) {
      console.warn(
        `Statut non trouvé pour ${friendUsername} (code ${response.status})`
      );
      return null;
    }
    const data = await response.json();
    return data.status;
  } catch (err) {
    console.error(`Erreur en récupérant le statut de ${friendUsername}:`, err);
    return null;
  }
}

async function openFriendsModal() {
  const modal = document.getElementById("friends-modal");
  if (modal) modal.classList.remove("hidden");
  await getFriends();

  const popup = document.getElementById("popup");
  if (!popup) return;

  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  popup.style.cursor = "move";

  popup.onmousedown = (e) => {
    // Empêche le drag quand on clique sur un bouton (ex: bouton "fermer")
    if ((e.target as HTMLElement).closest("button")) return;

    isDragging = true;
    offsetX = e.clientX - popup.offsetLeft;
    offsetY = e.clientY - popup.offsetTop;

    document.onmousemove = (e) => {
      if (!isDragging) return;

      let newLeft = e.clientX - offsetX;
      let newTop = e.clientY - offsetY;

      // Rester dans l’écran
      const maxLeft = window.innerWidth - popup.offsetWidth;
      const maxTop = window.innerHeight - popup.offsetHeight;

      newLeft = Math.max(0, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));

      popup.style.left = `${newLeft}px`;
      popup.style.top = `${newTop}px`;
      popup.style.transform = "none";
    };

    document.onmouseup = () => {
      isDragging = false;
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };
}

function closeFriendsModal() {
  const modal = document.getElementById("friends-modal");
  if (modal) modal.classList.add("hidden");
}

(window as any).addFriend = addFriend;
(window as any).getFriendStatus = getFriendStatus;
(window as any).openFriendsModal = openFriendsModal;
(window as any).closeFriendsModal = closeFriendsModal;
