// import i18n fr om './i18n';

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
      messageElement.setAttribute('data-i18n', 'dashboard.error_loading');
      messageElement.textContent = i18n.t('dashboard.error_loading');
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
      <h3 class="text-xl font-bold mb-3 text-[#e6fdff]" data-i18n="profile.title">${i18n.t('profile.title')}</h3>
      <p class="text-[#b3f0ff]"><strong data-i18n="common.username">${i18n.t('common.username')}:</strong> ${userData.username || i18n.t('dashboard.not_defined')}</p>
      <p class="text-[#b3f0ff]"><strong data-i18n="common.email">${i18n.t('common.email')}:</strong> ${userData.email || i18n.t('dashboard.not_defined')}</p>
      <p class="text-[#b3f0ff]"><strong data-i18n="dashboard.member_since">${i18n.t('dashboard.member_since')}:</strong> ${new Date(userData.created_at).toLocaleDateString() || i18n.t('dashboard.unknown')}</p>
    </div>
    <div class="bg-[#111] bg-opacity-80 rounded-2xl shadow-lg border border-[#85e7ff33] overflow-hidden backdrop-blur-sm p-6">
      <h3 class="text-xl font-bold mb-3 text-[#e6fdff]" data-i18n="profile.stats">${i18n.t('profile.stats')}</h3>
      <p class="text-[#b3f0ff]"><strong data-i18n="matchHistory.games_played">${i18n.t('matchHistory.games_played')}:</strong> ${userData.games_played || 0}</p>
      <p class="text-[#b3f0ff]"><strong data-i18n="profile.wins">${i18n.t('profile.wins')}:</strong> ${userData.wins || 0}</p>
      <p class="text-[#b3f0ff]"><strong data-i18n="profile.losses">${i18n.t('profile.losses')}:</strong> ${userData.losses || 0}</p>
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
