import { setCookie } from 'typescript-cookie';


async function connect(e: Event): Promise<void> {
	e.preventDefault();

	const username = (document.getElementById('username') as HTMLInputElement).value;
	const password = (document.getElementById('password') as HTMLInputElement).value;

	try {
		const response = await fetch('/api/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password })
		});
		const data = await response.json();
		if (response.ok) {
			alert(data.message);
			setCookie('username', username);
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
(window as any).connect = connect;

window.addEventListener('DOMContentLoaded', () => {
  const connectBtn = document.getElementById('connect-button');
  if (connectBtn) {
    connectBtn.addEventListener('click', connect);
  }
});