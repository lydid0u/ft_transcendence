async function displayUserProfile() {
  try {
    const response = await fetch("http://localhost:3000/user", {
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
    const user = data.user; 
    console.log("User data received:", user); // Debug: voir ce que le backend renvoie
    localStorage.setItem("user", JSON.stringify(user));
    if (user && user.email) {
      localStorage.setItem("email", user.email);
    }

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
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
  }

  // getUserDataFromBackend();
}

async function getUserDataFromBackend() {
  try {
    const response = await fetch("http://localhost:3000/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
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
        const data = await response.json();
        const newUser = data.newUser;
        alert(`New username: ${JSON.stringify(newUser)}`);
        localStorage.setItem("user", JSON.stringify(newUser));
        const userGreeting = document.getElementById("user-greeting");
        if (userGreeting && newUser && newUser.username) {
          userGreeting.textContent = `Salut ${newUser.username}`;
        }
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
          "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
          // "Content-Type": "multipart/form-data" // Ne pas définir Content-Type pour FormData
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
      const data = await response.json();
      const user = data.newUser;
      localStorage.setItem("user", JSON.stringify(user));
      const userAvatar = document.getElementById("user-avatar");
      if (userAvatar && user && user.picture) {
        userAvatar.src = user.picture;
      }
      
    } catch (error) {
      messageDiv.textContent = "Erreur réseau. Veuillez réessayer.";
      messageDiv.style.color = "red";
    }
  });
}
}