import { navigate } from "./nav";
import { showToast } from "./showToast";
import './i18n';

async function addFriend(add: string) : Promise<void> {
  const username = localStorage.getItem("username");
  
  if (!add || add.trim() === "") {
    alert("Veuillez entrer un nom d'utilisateur");
    return;
  }
  
  add = add.trim();

  if (add === localStorage.getItem("username")) {
    alert("impossible de s'ajouter soi-meme en ami, t'as pas d'ami ou quoi ??? La honte mdrrr");
    return;
  }

  try {
      const response = await fetch(`http://localhost:8088/api/add-friends`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, friend: add })
      });

      const data = await response.json();

      if (response.ok) {
        const inputElement = document.getElementById("addfriend") as HTMLInputElement;
        if (inputElement) {
          inputElement.value = "";
        }
        showToast(data.message || "Ami ajouté avec succès!", "success");
        await getFriends();
      } else {
        alert(data.message || `Failed to add friends.`);
      }

  } catch (err) {
      console.error('Erreur fetch:', err);
      alert('Erreur serveur');
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

    // Fonction pour récupérer le statut d’un ami (0 = hors ligne, 1 = en ligne)
    // async function getFriendStatus(friendUsername: string): Promise<number | null> {
    //   try {
    //     const res = await fetch(`http://localhost:8088/api/status?username=${encodeURIComponent(friendUsername)}`);
    //     if (!res.ok) return null;
    //     const statusData = await res.json();
    //     return statusData.status;
    //   } catch {
    //     return null;
    //   }
    // }

    for (const friend of friendsList) {
      if (!friend || typeof friend !== "string") {
        console.warn("Nom d'utilisateur invalide:", friend);
        continue;
      }

      const friendUsername = friend;
      const friendStatus = await getFriendStatus(friendUsername);

      // Création de l'élément <li>
      const li = document.createElement("li");
      li.className = `
        p-3 rounded-3xl bg-zinc-900/60 border border-white/20
        hover:border-white hover:bg-zinc-800/70
        flex items-center justify-between gap-4 transition-all
      `;

      // Pastille de statut
      const statusDot = document.createElement("span");
      statusDot.className = "w-3 h-3 rounded-full flex-shrink-0";

      if (friendStatus === 1) {
        statusDot.classList.add("bg-green-400"); // en ligne = vert
      } else if (friendStatus === 0) {
        statusDot.classList.add("bg-gray-400"); // hors ligne = gris clair
      } else {
        statusDot.classList.add("bg-transparent"); // statut inconnu = invisible
      }

      // Avatar (lettre)
      const avatarDiv = document.createElement("div");
      avatarDiv.textContent = friendUsername.charAt(0).toUpperCase();
      avatarDiv.className =
        "w-9 h-9 rounded-full flex items-center justify-center font-bold text-neon border border-neon";

      // Nom d'utilisateur + pastille + avatar regroupés à gauche
      const left = document.createElement("div");
      left.className = "flex items-center gap-3";

      // On crée un wrapper pour avatar + pastille (pour bien les aligner)
      const avatarWrapper = document.createElement("div");
      avatarWrapper.className = "relative flex items-center justify-center";

      avatarWrapper.appendChild(avatarDiv);

      // Positionnement pastille en bas à droite de l'avatar
      statusDot.style.position = "absolute";
      statusDot.style.bottom = "0";
      statusDot.style.right = "0";
      statusDot.style.border = "2px solid rgba(255,255,255,0.8)";
      statusDot.style.boxSizing = "content-box bounce";

      avatarWrapper.appendChild(statusDot);

      const nameSpan = document.createElement("span");
      nameSpan.className = "text-white text-sm font-semibold";
      if (friendStatus === 1) {
        nameSpan.textContent = `${friendUsername} (En ligne)`;
        nameSpan.style.color = "yellow";
      } else if (friendStatus === 0) {
        nameSpan.textContent = `${friendUsername} (Hors ligne)`;
        nameSpan.style.color = "red";
      } else {
        nameSpan.textContent = friendUsername;
      }

      left.appendChild(avatarWrapper);
      left.appendChild(nameSpan);

      // Bouton Supprimer
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
        const confirmRemove = confirm(`Supprimer ${friendUsername} de ta liste ?`);
        if (!confirmRemove) return;

        try {
          const res = await fetch(`http://localhost:8088/api/remove-friend/${username}/${friendUsername}`, {
            method: "DELETE"
          });

          if (res.ok) {
            showToast("Ami supprimé", "success");
            await getFriends(); // Rafraîchir la liste
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
    const response = await fetch(`http://localhost:8094/api/status?username=${encodeURIComponent(friendUsername)}`);
    if (!response.ok) {
      console.warn(`Statut non trouvé pour ${friendUsername} (code ${response.status})`);
      return null;
    }
    const data = await response.json();
    console.log(data);
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

  // Drag setup ici :
  const popup = document.getElementById('popup');
  const dragHandle = document.getElementById('drag-handle');

  if (!popup || !dragHandle) {
    console.log("Popup ou dragHandle introuvable dans le DOM");
    return;
  }

  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  dragHandle.style.cursor = 'move';

  dragHandle.onmousedown = (e) => {
    isDragging = true;
    offsetX = e.clientX - popup.offsetLeft;
    offsetY = e.clientY - popup.offsetTop;
    document.onmousemove = (e) => {
      if (isDragging) {
        popup.style.left = `${e.clientX - offsetX}px`;
        popup.style.top = `${e.clientY - offsetY}px`;
        popup.style.transform = 'none';
      }
    };
    document.onmouseup = () => {
      isDragging = false;
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };
}

function closeFriendsModal() {
  const modal = document.getElementById('friends-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

(window as any).addFriend = addFriend;
(window as any).getFriendStatus = getFriendStatus;
(window as any).openFriendsModal = openFriendsModal;
(window as any).closeFriendsModal = closeFriendsModal;


