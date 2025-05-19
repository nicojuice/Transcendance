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

	try {
		const response = await fetch('http://localhost:8082/api/backend/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, email, password })
		});

		const data = await response.json();

		if (response.ok) {
			alert(data.message);
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


// V2
// async function register(e: Event): Promise<void> {
// 	e.preventDefault();

// 	const usernameInput = document.getElementById('username') as HTMLInputElement;
// 	const emailInput = document.getElementById('email') as HTMLInputElement;
// 	const passwordInput = document.getElementById('password') as HTMLInputElement;
// 	const confirmPasswordInput = document.getElementById('confirm-password') as HTMLInputElement;
// 	const avatarInput = document.getElementById('avatar') as HTMLInputElement;

// 	const username = usernameInput.value;
// 	const email = emailInput.value;
// 	const password = passwordInput.value;
// 	const confirmPassword = confirmPasswordInput.value;
// 	const avatarFile = avatarInput.files?.[0];

// 	if (!usernameInput || !emailInpsubmit
// 	}

// 	if (!avatarFile || avatarFile.type !== "image/png") {
// 		alert("Veuillez sélectionner un fichier PNG pour l'avatar.");
// 		return;
// 	}

// 	const formData = new FormData();
// 	formData.append("username", username);
// 	formData.append("email", email);
// 	formData.append("password", password);
// 	formData.append("avatar", avatarFile);

// 	try {
// 		const response = await fetch('http://localhost:8082/api/backend/register', {
// 			method: 'POST',
// 			body: formData
// 		});

// 		const data = await response.json();

// 		if (response.ok) {
// 			alert(data.message);
// 			window.location.href = './index.html';
// 		} else {
// 			alert(data.message || 'Erreur lors de l’inscription.');
// 		}
// 	} catch (err) {
// 		console.error('Erreur fetch:', err);
// 		alert('Erreur serveur');
// 	}
// }

// // Expose function to global scope
// (window as any).register = register;

// window.addEventListener('DOMContentLoaded', () => {
// 	const registerBtn = document.getElementById('signupForm');
// 	if (registerBtn) {
// 		registerBtn.addEventListener('click', register);
// 	}
// });

// //V3
// async function register(e: Event): Promise<void> {
// 	e.preventDefault();

// 	const usernameInput = document.getElementById('username') as HTMLInputElement;
// 	const emailInput = document.getElementById('email') as HTMLInputElement;
// 	const passwordInput = document.getElementById('password') as HTMLInputElement;
// 	const confirmPasswordInput = document.getElementById('confirm-password') as HTMLInputElement;
// 	const avatarPreview = document.getElementById('avatar-preview') as HTMLImageElement;

// 	if (!usernameInput || !emailInput || !passwordInput || !confirmPasswordInput || !avatarPreview) {
// 		console.error("Un champ est manquant dans le DOM !");
// 		alert("Erreur dans le formulaire. Veuillez recharger la page.");
// 		return;
// 	}

// 	const username = usernameInput.value;
// 	const email = emailInput.value;
// 	const password = passwordInput.value;
// 	const confirmPassword = confirmPasswordInput.value;

// 	if (password !== confirmPassword) {
// 		alert("Les mots de passe ne correspondent pas.");
// 		return;
// 	}

// 	const avatarSrc = avatarPreview.src;

// 	const formData = new FormData();
// 	formData.append("username", username);
// 	formData.append("email", email);
// 	formData.append("password", password);
// 	formData.append("avatar", avatarSrc); // ← on envoie directement le `src`

// 	try {
// 		const response = await fetch('http://localhost:8082/api/backend/register', {
// 			method: 'POST',
// 			body: formData
// 		});

// 		const data = await response.json();

// 		if (response.ok) {
// 			alert(data.message);
// 			window.location.href = './index.html';
// 		} else {
// 			alert(data.message || 'Erreur lors de l’inscription.');
// 		}
// 	} catch (err) {
// 		console.error('Erreur fetch:', err);
// 		alert('Erreur serveur');
// 	}
// }

// // Expose function to global scope
// (window as any).register = register;

//v4
// async function register(e: Event): Promise<void> {
//   e.preventDefault();

//   const usernameInput = document.getElementById('username') as HTMLInputElement;
//   const emailInput = document.getElementById('email') as HTMLInputElement;
//   const passwordInput = document.getElementById('password') as HTMLInputElement;
//   const confirmPasswordInput = document.getElementById('confirm-password') as HTMLInputElement;
//   const avatarPreview = document.getElementById('avatar-preview') as HTMLImageElement;

//   const username = usernameInput.value;
//   const email = emailInput.value;
//   const password = passwordInput.value;
//   const confirmPassword = confirmPasswordInput.value;

//   if (!username || !email || !password || !confirmPassword || !avatarPreview) {
//     alert("Formulaire invalide");
//     return;
//   }

//   if (password !== confirmPassword) {
//     alert("Les mots de passe ne correspondent pas.");
//     return;
//   }

//   // Vérifie si l’image est en base64 (upload perso) ou lien relatif (préfabriqué)
//   let avatarFile: File;
//   if (avatarPreview.src.startsWith('data:image')) {
//     // image base64
//     avatarFile = dataURLtoFile(avatarPreview.src, 'custom-avatar.png');
//   } else {
//     // image prédéfinie (ex: /assets/avatar1.png) → on la télécharge et transforme en blob
//     const response = await fetch(avatarPreview.src);
//     const blob = await response.blob();
//     avatarFile = new File([blob], 'preset-avatar.png', { type: blob.type });
//   }

//   const formData = new FormData();
//   formData.append("username", username);
//   formData.append("email", email);
//   formData.append("password", password);
//   formData.append("avatar", avatarFile);

//   try {
//     const response = await fetch('http://localhost:8082/api/backend/register', {
//       method: 'POST',
//       body: formData
//     });

//     const data = await response.json();

//     if (response.ok) {
//       alert(data.message);
//       window.location.href = './index.html';
//     } else {
//       alert(data.message || 'Erreur lors de l’inscription.');
//     }
//   } catch (err) {
//     console.error('Erreur fetch:', err);
//     alert('Erreur serveur');
//   }
// }

// (window as any).register = register;

// window.addEventListener('DOMContentLoaded', () => {
//   const registerForm = document.getElementById('signupForm');
//   if (registerForm) {
//     registerForm.addEventListener('submit', register);
//   }
// });
