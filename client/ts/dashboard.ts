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
    <div class="bg-[#111] bg-opacity-80 rounded-2xl shadow-lg border border-[#85e7ff33] overflow-hidden backdrop-blur-sm p-6">
      <h3 class="text-xl font-bold mb-3 text-[#e6fdff]">Profil</h3>
      <p class="text-[#b3f0ff]"><strong>Pseudo:</strong> ${userData.username || 'Non défini'}</p>
      <p class="text-[#b3f0ff]"><strong>Email:</strong> ${userData.email || 'Non défini'}</p>
      <p class="text-[#b3f0ff]"><strong>Membre depuis:</strong> ${new Date(userData.created_at).toLocaleDateString() || 'Inconnu'}</p>
    </div>
    <div class="bg-[#111] bg-opacity-80 rounded-2xl shadow-lg border border-[#85e7ff33] overflow-hidden backdrop-blur-sm p-6">
      <h3 class="text-xl font-bold mb-3 text-[#e6fdff]">Statistiques</h3>
      <p class="text-[#b3f0ff]"><strong>Parties jouées:</strong> ${userData.games_played || 0}</p>
      <p class="text-[#b3f0ff]"><strong>Victoires:</strong> ${userData.wins || 0}</p>
      <p class="text-[#b3f0ff]"><strong>Défaites:</strong> ${userData.losses || 0}</p>
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
