function getUsername() {
  const savedUsername = localStorage.getItem("username");
  if (savedUsername) {
    // document.getElementById("username").textContent = savedUsername;
  }
}

(window as any).getUsername = getUsername;