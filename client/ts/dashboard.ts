async function getUserDataFromBackend(): Promise<void> {
  try {
    const response: Response = await fetch("http://localhost:3000/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const userData = await response.json();
    displayDashboardData(userData);

  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    const messageElement = document.getElementById("message");
    if (messageElement) {
      messageElement.textContent = "Erreur lors du chargement des données utilisateur.";
    }
  }
}

function displayDashboardData(userData: any): void {
  const statsContainer = document.getElementById("user-stats");
  if (!statsContainer) return;

  // Clear previous content
  statsContainer.innerHTML = '';

  // Create statistics cards
  const statsHTML = `
    <div class="bg-white p-6 rounded-xl shadow-md">
      <h3 class="text-xl font-bold mb-3 text-stone-700">Profil</h3>
      <p class="text-stone-600"><strong>Pseudo:</strong> ${userData.username || 'Non défini'}</p>
      <p class="text-stone-600"><strong>Email:</strong> ${userData.email || 'Non défini'}</p>
      <p class="text-stone-600"><strong>Membre depuis:</strong> ${new Date(userData.created_at).toLocaleDateString() || 'Inconnu'}</p>
    </div>
    <div class="bg-white p-6 rounded-xl shadow-md">
      <h3 class="text-xl font-bold mb-3 text-stone-700">Statistiques</h3>
      <p class="text-stone-600"><strong>Parties jouées:</strong> ${userData.games_played || 0}</p>
      <p class="text-stone-600"><strong>Victoires:</strong> ${userData.wins || 0}</p>
      <p class="text-stone-600"><strong>Défaites:</strong> ${userData.losses || 0}</p>
    </div>
  `;

  statsContainer.innerHTML = statsHTML;
}

export { getUserDataFromBackend };

// on rend la fonction globalement disponible pour le router SPA
declare global {
  interface Window {
    getUserDataFromBackend: typeof getUserDataFromBackend;
  }
}

window.getUserDataFromBackend = getUserDataFromBackend;
