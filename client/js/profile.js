function displayUserProfile(user) {
  const userGreeting = document.getElementById("user-greeting");
  if (userGreeting && user && user.username) {
    userGreeting.textContent = `Salut ${user.username}`;
  }

  const userEmail = document.getElementById("user-email");
  if (userEmail && user && user.email) {
    userEmail.textContent = user.email;
  }

  const userAvatar = document.getElementById("user-avatar");
  if (userAvatar && user && user.picture) {
    userAvatar.src = user.picture;
  }

  getUserDataFromBackend();
}

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

async function changeUsername() {
  const messageDiv = document.getElementById("message");
  if (!messageDiv) return;

  const form = document.getElementById("change-username-form");
  if (form) {

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const newUsername = document.getElementById("new-username").value;
      
      try {
        alert(newUsername);
        const response = await fetch("http://localhost:3000/user/username", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
          body: JSON.stringify({
            newusername: newUsername,
            email: localStorage.getItem("email"),
          }),
        });
        alert(response.status);
        if (!response.ok) {
          messageDiv.textContent = `Erreur inattendue: ${JSON.stringify(
            await response.json()
          )}`;
          messageDiv.style.color = "red";
          return;
        }
        if (response.status === 400) {
          messageDiv.textContent = "Erreur dans les données fournies.";
          messageDiv.style.color = "red";
          return;
        }
        messageDiv.textContent = "Pseudo change avec succes !";
        messageDiv.style.color = "green";
      } catch (error) {
        messageDiv.textContent = "Erreur réseau. Veuillez réessayer.";
        messageDiv.style.color = "red";
      }
    });
  }
}

async function changeAvatar() {
const form = document.getElementById("change-avatar-form");
if (form) {
  form.addEventListener("submit", async function(event) {
    event.preventDefault();
    const messageDiv = document.getElementById("message");
    try {
      const formData = new FormData(this);
      const response = await fetch("http://localhost:3000/user/avatar", {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`
        },
        body: formData
      });
      if (!response.ok) {
        messageDiv.textContent = "Erreur lors de l'envoi de l'avatar.";
        messageDiv.style.color = "red";
        return;
      }
      messageDiv.textContent = "Avatar changé avec succès !";
      messageDiv.style.color = "green";
    } catch (error) {
      messageDiv.textContent = "Erreur réseau. Veuillez réessayer.";
      messageDiv.style.color = "red";
    }
  });
}
}