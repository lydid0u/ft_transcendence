// Define the User interface to type the user object
interface User {
  username?: string;
  email?: string;
  picture?: string;
}

// Define the API response structure
interface UserResponse {
  user: User;
}

//interface pour la reponse de l'api
interface ChangeUsernameResponse {
  newusername?: string; // Si ton API retourne juste le nouveau username
  user?: User;          // Si ton API retourne l'utilisateur complet
  message?: string;     // Message de succès/erreur optionnel
}

async function displayUserProfile(): Promise<void> {
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

    const data: UserResponse = await response.json();
    const user: User = data.user;
    console.log("User data received:", user); // Debug: voir ce que le backend renvoie
    localStorage.setItem("user", JSON.stringify(user));

    if (user?.email) {
      localStorage.setItem("email", user.email);
    }

    const userGreeting: HTMLElement | null = document.getElementById("user-greeting");
    if (userGreeting && user?.username) {
      userGreeting.textContent = `Salut ${user.username}`;
    }

    const userEmail: HTMLElement | null = document.getElementById("user-email");
    if (userEmail && user?.email) {
      userEmail.textContent = user.email;
    }

    const userAvatar: HTMLImageElement | null = document.getElementById("user-avatar") as HTMLImageElement;
    if (userAvatar && user?.picture) {
      userAvatar.src = user.picture;
    }
  } catch (error: unknown) {
    console.error("Erreur lors de la récupération des données:", error);
  }
}

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

  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
  }
}

async function changeUsername(): Promise<void> {
  const messageDiv: HTMLElement | null = document.getElementById("message");
  if (!messageDiv) return;

  const form = document.getElementById("change-username-form") as HTMLFormElement | null;
  if (!form) return;
  form.addEventListener("submit", async function (event: Event) {
    event.preventDefault();

    const newUsername: string = (document.getElementById("new-username") as HTMLInputElement)?.value || "";
    if (!newUsername) {
      messageDiv.textContent = "Le nom d'utilisateur ne peut pas être vide.";
      messageDiv.style.color = "red";
      return;
    }

    try {
      const response: Response = await fetch("http://localhost:3000/user/username", {
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
      if (response.status === 401) {
        messageDiv.textContent = "Vous devez être connecté pour changer votre pseudo.";
        messageDiv.style.color = "red";
        return;
      } else if (response.status === 400) {
        messageDiv.textContent = "Le nom d'utilisateur est déjà pris.";
        messageDiv.style.color = "red";
        return;
      }
      messageDiv.textContent = "Pseudo changé avec succès !";
      messageDiv.style.color = "green";

      const data: ChangeUsernameResponse = await response.json();
      console.log("Response data API:", data);

      if (data.user) {
        alert(`New username: ${JSON.stringify(data.user.username)}`);
        localStorage.setItem("user", JSON.stringify(data.user));
        const userGreeting = document.getElementById("user-greeting");
        if (userGreeting && data.user && data.user.username) {
          userGreeting.textContent = `Salut ${data.user.username}`;
        }
      } else {
        console.error("Aucun utilisateur trouvé dans la réponse de l'API.");
        messageDiv.textContent = "Erreur lors de la mise à jour du pseudo.";
        messageDiv.style.color = "red";
      }
  } catch (error) {
    console.error("Erreur lors du changement de pseudo:", error);
    messageDiv.textContent = "Erreur réseau. Veuillez réessayer.";
    messageDiv.style.color = "red";
  }
  });
}

async function changeAvatar() {
  const form = document.getElementById("change-avatar-form");
  if (form) {
    form.addEventListener("submit", async function (event: Event) {
      event.preventDefault();
      const messageDiv: HTMLElement | null = document.getElementById("message");
      if (!messageDiv) return;
      try {
        const formData = new FormData(this);
        const response: Response = await fetch("http://localhost:3000/user/avatar", {
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

async function activate2fa() {
  const checkbox = document.getElementById("2fa-checkbox");
  const messageDiv = document.getElementById("message");
  if (!checkbox || !messageDiv) return;

  // 🔁 1. Restaurer l’état sauvegardé
  const saved2FA = localStorage.getItem("2fa_enabled");
  if (saved2FA === "true") {
    checkbox.checked = true;
  }

  // 📌 2. Écoute le changement du switch
  checkbox.addEventListener("change", async function (event: Event) {
    alert(`2FA is now ${event.target.checked ? "enabled" : "disabled"}`);
    const isChecked = event.target.checked;
    const booleanValue = isChecked; // true ou false selon l'état

    messageDiv.textContent = isChecked
      ? "Activation de la double authentification..."
      : "Désactivation de la double authentification...";

    // try {
    const response: Response = await fetch("http://localhost:3000/user/2fa-verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
      body: JSON.stringify({
        email: localStorage.getItem("email"),
        boolean: booleanValue,
      }),
    });

    if (response.ok) {
      // 🔒 3. Sauvegarde locale de l’état
      localStorage.setItem("2fa_enabled", booleanValue.toString());
      messageDiv.textContent = isChecked
        ? "2FA activée avec succès."
        : "2FA désactivée avec succès.";
    } else {
      throw new Error("Échec de la requête");
    }
    // } catch (error) {
    // console.error(error);
    // messageDiv.textContent = "Erreur lors de la mise à jour de la 2FA.";
    // checkbox.checked = !isChecked;
    // }
  });
}

// Appelle la fonction après que la page soit chargée
// window.addEventListener("DOMContentLoaded", activate2fa);
