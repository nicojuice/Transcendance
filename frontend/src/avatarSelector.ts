const avatars: string[] = [
  '/assets/avatar1.png',
  '/assets/avatar2.png',
  '/assets/avatar3.png',
  '/assets/avatar4.png',
  '/assets/avatar5.png',
  '/assets/avatar6.png',
  '/assets/avatar7.png',
  '/assets/avatar8.png',
  '/assets/avatar9.png',
  '/assets/avatar10.png',
  '/assets/avatar11.png',
  '/assets/avatar12.png',
  '/assets/avatar12.png',
  '/assets/avatar13.png',
  '/assets/avatar14.png',
  '/assets/avatar15.png',
];

let currentIndex: number = 0;

function changeAvatar(direction: number): void {
  currentIndex = (currentIndex + direction + avatars.length) % avatars.length;

  const avatarElement = document.getElementById('avatar-preview') as HTMLImageElement | null;

  if (avatarElement) {
    avatarElement.src = "/assets/default_pfp.jpg"; //avatars[currentIndex];
  }
}

export async function sendImgToDB(file: File): Promise<void> {
  const username = localStorage.getItem("username");
  const formData = new FormData();

  if (!username)
    return;
  formData.append("username", username);
  formData.append("avatar", file);
  try {
	  const response = await fetch(`http://localhost:8086/api/backend/add-avatar`, {
	  	method: 'PATCH',
	  	body: formData
	});

		const data = await response.json();
		if (response.ok) {
			alert(data.message || 'Image upload');
		} else {
			alert(data.message || 'Failed to upload image');
		}

	} catch (err) {
		console.error('Erreur fetch:', err);
		alert('Erreur serveur');
	}
}

function uploadCustomAvatar(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function () {
    const avatarPreview = document.getElementById('avatar-preview') as HTMLImageElement | null;
    if (avatarPreview && typeof reader.result === 'string') {
      avatarPreview.src = reader.result;
      sendImgToDB(file);
    }
  };
  reader.readAsDataURL(file);
}


let selectedAvatar: string = '';

function toggleAvatarDropdown(): void {
  const dropdown = document.getElementById('avatar-dropdown');
  dropdown?.classList.toggle('hidden');
}


function chooseAvatar(path: string): void {
  selectedAvatar = path;

  const avatars = document.querySelectorAll('.avatar-option');
  avatars.forEach((el) => el.classList.remove('ring-4', 'ring-blue-500'));
  const selected = document.querySelector(`img[data-src="${path}"]`);
  selected?.classList.add('ring-4', 'ring-blue-500');
}


function selectAvatar(path: string, btn: HTMLButtonElement): void {
  selectedAvatar = path;

  const allButtons = document.querySelectorAll('.avatar-btn');
  allButtons.forEach(b => b.classList.remove('border-white'));

  btn.classList.add('border-white');
}


function confirmAvatarSelection(): void {
  if (!selectedAvatar) return;

  const preview = document.getElementById('avatar-preview') as HTMLImageElement | null;
  if (preview) {
    preview.src = selectedAvatar;
  }

  const dropdown = document.getElementById('avatar-dropdown');
  dropdown?.classList.add('hidden');
}

(window as any).selectAvatar = selectAvatar;
(window as any).confirmAvatarSelection = confirmAvatarSelection;
(window as any).toggleAvatarDropdown = toggleAvatarDropdown;
(window as any).chooseAvatar = chooseAvatar;
(window as any).changeAvatar = changeAvatar;
(window as any).uploadCustomAvatar = uploadCustomAvatar;