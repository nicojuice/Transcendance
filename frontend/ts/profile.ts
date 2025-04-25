function get_username(): string {
	return ("");
}

async function change_username(e: Event): Promise<void> {
	e.preventDefault();

	const username = (document.getElementById('own_username') as HTMLInputElement).value;
	const password = (document.getElementById('own_password') as HTMLInputElement).value;

	try {
		const response = await fetch('/api/user-management/su', {
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
}
