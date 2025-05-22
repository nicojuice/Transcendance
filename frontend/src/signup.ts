import { user_exist } from "./nav";

async function register(e: Event): Promise<void> {
	e.preventDefault();

	const usernameInput = document.getElementById('username') as HTMLInputElement;
	const emailInput = document.getElementById('email') as HTMLInputElement;
	const passwordInput = document.getElementById('password') as HTMLInputElement;
	const confirmPasswordInput = document.getElementById('confirm-password') as HTMLInputElement;

	const username = usernameInput.value;
	const email = emailInput.value;
	const password = passwordInput.value;
	const confirmPassword = confirmPasswordInput.value;

	if (await user_exist(username) === true)
	{
		alert("An user already uses this username")
		return ;
	}

	if (password !== confirmPassword) {
		alert("Les mots de passe ne correspondent pas.");
		return;
	}

	try {
		const response = await fetch('http://localhost:8082/api/backend/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, email, password })
		});

		const data = await response.json();

		if (response.ok) {
			alert(data.message);
			localStorage.setItem('username', username);
			// localStorage.setItem('isConnected', 'true');
			window.location.href =  './index.html';
		} else {
			alert(data.message || 'Erreur lors de l’inscription.');
		}

	} catch (err) {
		console.error('Erreur fetch:', err);
		alert('Erreur serveur');
	}
};

// Expose function to global scope
(window as any).register = register;

window.addEventListener('DOMContentLoaded', () => {
  const registerBtn = document.getElementById('register-button');
  if (registerBtn) {
    registerBtn.addEventListener('click', register);
  }
});

