async function addFriends(add: string) : Promise<void> {
  const username = localStorage.getItem("username");
  console.log(localStorage.getItem("username"), 'l user en question');
  console.log(add,"le compte a add");

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
        alert(data.message);
      } else {
        alert(data.message || `Failed to add friends.`);
      }

  } catch (err) {
      console.error('Erreur fetch:', err);
      alert('Erreur serveur');
	}
}

(window as any).addFriends = addFriends;

window.addEventListener('DOMContentLoaded', () => {
  const connectBtn = document.getElementById('addfriend');
  if (connectBtn) {
    connectBtn.addEventListener('click', () => {
      addFriends("quelquun");
    });
  }
});
