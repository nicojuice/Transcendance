import { navigate } from "./nav"
import { getUsername } from "./fetchs";

async function addFriend(add: string) : Promise<void> {
  const username = await getUsername();//localStorage.getItem("username");
  //console.log(localStorage.getItem("username"), 'l user en question');
  //console.log(add,"le compte a add");

  if (add === await getUsername())//localStorage.getItem("username"))
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

export async function getFriends() : Promise<void> {
  const username = await getUsername();//localStorage.getItem("username");
  if (!username)
  {
    await navigate("log");
    return ;
  }
  try {
    const reponse = await fetch(`http://localhost:8088/api/get-friends?username=${encodeURIComponent(username)}`, {
      method: "GET"
    });
    if (!reponse.ok)
      throw new Error(`Erreur API : ${reponse.status}`);
    const data = await reponse.json();
    const friendsList = data.friends as string[];
    const ul = document.getElementById("friends-list");
    if (!ul)
      return;
    ul.innerHTML = "";
    friendsList.forEach(friend => {
      const li = document.createElement("li");
      li.textContent = friend;
      ul.appendChild(li);
    });
  } catch (err) {

  }
}

(window as any).addFriend = addFriend;

window.addEventListener('DOMContentLoaded', () => {
  const connectBtn = document.getElementById('addfriend');
  if (connectBtn) {
    connectBtn.addEventListener('click', () => {
      addFriend("quelquun");
    });
  }
});
