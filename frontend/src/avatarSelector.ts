const avatars: string[] = [
  '/assets/avatar1.png',
  '/assets/avatar2.png',
  '/assets/avatar3.png',
];

let currentIndex: number = 0;

function changeAvatar(direction: number): void {
  currentIndex = (currentIndex + direction + avatars.length) % avatars.length;

  const avatarElement = document.getElementById('avatar-preview') as HTMLImageElement | null;

  if (avatarElement) {
    avatarElement.src = avatars[currentIndex];
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
    }
  };
  reader.readAsDataURL(file);
}

(window as any).changeAvatar = changeAvatar;
(window as any).uploadCustomAvatar = uploadCustomAvatar;