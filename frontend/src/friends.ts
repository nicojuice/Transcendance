async function addFriends(add: string) : Promise<void> {
  const username = localStorage.getItem("username");
  console.log(localStorage.getItem("username"));
  try {
      const response = await fetch(`http://localhost:8087/api/user-management/add-friends`, {
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
