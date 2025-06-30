
async function getUserDataFromBackend() {
  try {
    const response = await fetch("http://localhost:3000/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("Données du backend:", data);

    // Mettre à jour les statistiques dans la section dédiée
    const userStats = document.getElementById("user-stats");
    if (userStats) {
      userStats.innerHTML = `
                <div class="bg-stone-50 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold text-stone-600 mb-2">Statistiques</h3>
                    <p class="text-stone-500">Parties jouées: <span class="font-medium text-stone-700">${
                      data.gamesPlayed || 0
                    }</span></p>
                    <p class="text-stone-500">Victoires: <span class="font-medium text-green-600">${
                      data.wins || 0
                    }</span></p>
                    <p class="text-stone-500">Défaites: <span class="font-medium text-red-600">${
                      data.losses || 0
                    }</span></p>
                </div>`;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    const userStats = document.getElementById("user-stats");
    if (userStats) {
      userStats.innerHTML = `
                <div class="bg-red-50 p-4 rounded-lg">
                    <p class="text-red-600">Erreur lors du chargement des données</p>
                </div>
            `;
    }
  }
}