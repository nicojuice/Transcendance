function toggleDarkMode() {
  document.body.classList.toggle('bg-black');
  document.body.classList.toggle('text-white');
}

function openSettings() {
  alert("Settings modal coming soon!");
}

(window as any).toggleDarkMode = toggleDarkMode;
(window as any).openSettings = openSettings;