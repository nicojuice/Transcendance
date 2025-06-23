import './i18n';

function startGameLocal() {

    const playersElement = document.getElementById("players") as HTMLSelectElement | null;
    const customElement = document.getElementById("custom") as HTMLSelectElement | null;
    
    if (!playersElement || !customElement) {
        throw new Error("Impossible de trouver les éléments 'players' ou 'custom'");
    }
    
    const players = playersElement.value; // OK car playersElement est un HTMLSelectElement
    const custom = customElement.value;
    
    console.log("Lancement de la partie avec :", players, "joueurs, custom =", custom);

  // Exemple : envoyer les données au serveur ou rediriger
  fetch("http://localhost:8096/api/rooms/local", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      players: Number(players),
      custom: custom === "yes"
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Erreur serveur: " + res.statusText);
      return res.json();
    })
    .then((data) => {
      console.log("Réponse serveur:", data);
      // Redirection ou autre action ici
    })
    .catch((err) => {
      console.error("Erreur lors de la création de la partie:", err);
    });
}

(window as any).startGameLocal = startGameLocal; 
