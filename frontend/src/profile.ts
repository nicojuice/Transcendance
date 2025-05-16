export function initProfilePage(): void {
	const storedUsername = localStorage.getItem('username');
	if (storedUsername) {
		const displayUsername = document.getElementById('display-username');
		if (displayUsername) {
			displayUsername.textContent = storedUsername;
		}
	}
}

