import "./i18n";
export async function updateConnectionStatus(status: 0 | 1): Promise<void> {
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  if (!username || !token) {
    console.error("Utilisateur ou token manquant");
    return;
  }

  try {
    const response = await fetch("http://localhost:8094/api/status", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, status }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }

  } catch (error) {
    console.error("❌ Échec de la mise à jour du statut de connexion :", error);
  }
}
