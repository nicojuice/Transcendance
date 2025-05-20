// async function editUser(edit: string) : Promise<void> {
//   const username = localStorage.getItem("username");
  
//   try {
//       console.log(username, '<--- l ancien user');
//       console.log(edit, '<--- le nouveau user');
//       const response = await fetch(`http://localhost:8085/api/user-management/change-user`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ username, edit })
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert(data.message);
//         localStorage.removeItem("username");
//         localStorage.setItem(edit, edit);
//         const displayInput = document.getElementById("display-username") as HTMLInputElement;
//         if (displayInput) displayInput.textContent = edit;
//       } 
//       else {
//         alert(data.message || `Failed to edit username.`);
//       }

//   } catch (err) {
//       console.error('Erreur fetch:', err);
//       alert('Erreur serveur');
// 	}
// }

async function editUser(): Promise<void> {
  const oldUsername = localStorage.getItem("username");
  const newUsernameInput = document.getElementById("username") as HTMLInputElement;
  const edit = newUsernameInput?.value;

  if (!edit) {
    alert("Veuillez saisir un nouveau nom d'utilisateur.");
    return;
  }

  try {
    const response = await fetch(`http://localhost:8085/api/user-management/change-user`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: oldUsername, edit })
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message);

      // Met à jour localStorage
      localStorage.setItem("username", edit);

      // Met à jour tous les affichages du username
      const displayText = document.getElementById("display-username");
      if (displayText) displayText.textContent = edit;

      // Met aussi à jour le champ input si besoin
      if (newUsernameInput) newUsernameInput.value = edit;
    } else {
      alert(data.message || "Erreur lors de la modification.");
    }
  } catch (err) {
    console.error("Erreur fetch:", err);
    alert("Erreur serveur");
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

(window as any).editEmail = editEmail;

(window as any).editUser = editUser;

(window as any).editPass = editPass;