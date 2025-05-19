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