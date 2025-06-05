import { navigate } from "./nav";
import { showToast } from "./showToast";

async function addFriend(add: string) : Promise<void> {
  const username = localStorage.getItem("username");
  //console.log(localStorage.getItem("username"), 'l user en question');
  //console.log(add,"le compte a add");

  if (add === localStorage.getItem("username"))
  {
    alert("impossible de s'ajouter soi-meme en ami, t'as pas d'ami ou quoi ??? La honte mdrrr");
    return ;
  }

  try {
      const response = await fetch(`http://localhost:8088/api/add-friends`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, friend: add })
      });

      const data = await response.json();

      if (response.ok) {
        //alert(data.message);
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
    const friendsList = data.friends as {
      username: string;
      avatar?: string | null;
    }[];
    const ul = document.getElementById("friends-list");
    const emptyText = document.getElementById("empty-friends-text");

    if (!ul) return;
    ul.innerHTML = "";

    if (friendsList.length === 0 && emptyText) {
      emptyText.style.display = "block";
    } else if (emptyText) {
      emptyText.style.display = "none";
    }

    friendsList.forEach((friend) => {
      const li = document.createElement("li");
      li.className = `
        p-3 rounded-3xl bg-zinc-900/60 border border-white/20
        hover:border-white hover:bg-zinc-800/70
        flex items-center justify-between gap-4 transition-all
      `;

      let avatarEl: HTMLElement;

      if (friend.avatar) {
        const img = document.createElement("img");
        img.src = friend.avatar;
        img.alt = `${friend.username}'s avatar`;
        img.className =
          "w-9 h-9 rounded-full object-cover border border-white/20";
        avatarEl = img;
      } else {
        const div = document.createElement("div");
        div.textContent = friend.username.charAt(0).toUpperCase();
        div.className =
          "w-9 h-9 rounded-full flex items-center justify-center font-bold text-white bg-neon border border-white/20";
        avatarEl = div;
      }

      // 🧑‍🤝‍🧑 Nom
      const name = document.createElement("span");
      name.textContent = friend.username;
      name.className = "text-white text-sm";

      // ❌ Bouton Supprimer
      const removeBtn = document.createElement("button");
      removeBtn.className = "hover:text-red-500 text-white transition-colors";
      removeBtn.title = "Remove friend";
      removeBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      `;
      removeBtn.onclick = async () => {
        const confirmRemove = confirm(
          `Supprimer ${friend.username} de ta liste ?`
        );
        if (!confirmRemove) return;

        try {
          const res = await fetch(`http://localhost:8088/api/remove-friend`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, friend: friend.username }),
          });

          if (res.ok) {
            await getFriends(); // Refresh list
          } else {
            const errData = await res.json();
            showToast(errData.message || "Échec de la suppression", "error");
          }
        } catch (err) {
          console.error(err);
          showToast("Erreur serveur", "error");
        }
      };

      const left = document.createElement("div");
      left.className = "flex items-center gap-3";
      left.appendChild(avatarEl);
      left.appendChild(name);

      li.appendChild(left);
      li.appendChild(removeBtn);
      ul.appendChild(li);
    });
  } catch (err) {
    console.error("Erreur lors du chargement des amis :", err);
  }
}

(window as any).addFriend = addFriend;
