import { fetchProfile } from "./editprofile"
import { getUsername } from "./fetchs";

// export function initProfilePage(): void {
// 	const storedUsername = localStorage.getItem('username');
// 	if (storedUsername) {
// 		const displayUsername = document.getElementById('display-username');
// 		if (displayUsername) {
// 			displayUsername.textContent = storedUsername;
// 		}
// 	}
// }

async function displayAvatar(username: string): Promise<void> {
	try {
		//console.log("display avatar");
		const res = await fetch(`http://localhost:8086/api/backend/get-avatar/${encodeURIComponent(username)}`);
		if (!res.ok)
			throw new Error("Avatar not found");

		const blob = await res.blob();
		const imageUrl = URL.createObjectURL(blob);

		// Exemple d’utilisation : afficher l’image dans une balise <img id="avatar">
		const img = document.getElementById("avatar-preview") as HTMLImageElement;
		if (img)
		{
			//console.log("image set");
			img.src = imageUrl;
		}
	} catch (err) {
		console.error("Error fetching avatar:", err);
	}
}

export async function initProfilePage(): Promise<void> {
	await fetchProfile();

	const storedUsername = await getUsername();//localStorage.getItem('username');
	if (storedUsername) {
		const displayUsername = document.getElementById('display-username');
		if (displayUsername) {
			displayUsername.textContent = storedUsername;
		}
		await displayAvatar(storedUsername);
	}
}

