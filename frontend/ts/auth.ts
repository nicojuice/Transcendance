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

	if (password !== confirmPassword) {
		alert("Les mots de passe ne correspondent pas.");
		return;
	}

	alert("Merci!");

	try {
		const response = await fetch('/api/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, email, password })
		});

		const data = await response.json();

		if (response.ok) {
			alert(data.message);
			window.location.href =  '/index.html';
		} else {
			alert(data.message || 'Erreur lors de l’inscription.');
		}

	} catch (err) {
		console.error('Erreur fetch:', err);
		alert('Erreur serveur');
	}
};

async function connect(e: Event): Promise<void> {
	e.preventDefault();

	const username = (document.getElementById('username') as HTMLInputElement).value;
	const password = (document.getElementById('password') as HTMLInputElement).value;


	alert("le serveur va comparer");
	try {
		const response = await fetch('/api/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password })
		});
		const data = await response.json();
		if (response.ok) {
			alert(data.message);
			window.location.href = '/gg.html';
		}
		else {
			alert(data.message || 'Erreur lors de la connexion.');
		}
	} catch (err) {
		console.error('Erreur fetch:', err);
		alert('Erreur serveur');
	}
};

// Expose function to global scope
(window as any).register = register;