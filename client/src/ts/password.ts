// Types and interfaces
interface User {
  username: string;
  email: string;
  picture?: string;
}

interface UserResponse {
  user: User;
}

interface UsernameUpdateResponse {
  newUser: User;
}

interface AvatarUpdateResponse {
  newUser: User;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

// Type guards
function isUserResponse(data: any): data is UserResponse {
  return data && typeof data === 'object' && 'user' in data;
}

function isUsernameUpdateResponse(data: any): data is UsernameUpdateResponse {
  return data && typeof data === 'object' && 'newUser' in data;
}

// Main functions
async function displayUserProfile(): Promise<void> {
  try {
    const token: string | null = localStorage.getItem("jwtToken");
    console.log("🔑 Token récupéré:", token ? "✅ Existe" : "❌ Manquant");
    
    if (!token) {
      console.error("❌ Pas de token JWT trouvé");
      return;
    }

    console.log("🌐 Tentative de connexion à l'API...");
    
    const response: Response = await fetch("http://localhost:3000/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("📡 Réponse API:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText: string = await response.text();
      console.error("❌ Erreur API:", errorText);
      throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
    }

    const data: unknown = await response.json();
    console.log("✅ Données reçues:", data);
    
    if (!isUserResponse(data)) {
      throw new Error("Format de réponse invalide");
    }

    const user: User = data.user;
    console.log("👤 Objet utilisateur:", user);

    // Vérifier si les éléments existent
    const userGreeting: HTMLElement | null = document.getElementById("user-greeting");
    const userEmail: HTMLElement | null = document.getElementById("user-email");
    const userAvatar: HTMLImageElement | null = document.getElementById("user-avatar") as HTMLImageElement;

    console.log("🔍 Éléments DOM trouvés:", {
      greeting: userGreeting ? "✅" : "❌",
      email: userEmail ? "✅" : "❌",
      avatar: userAvatar ? "✅" : "❌"
    });

    if (userGreeting && user.username) {
      userGreeting.textContent = `Salut ${user.username}`;
      console.log("✅ Greeting mis à jour");
    }

    if (userEmail && user.email) {
      userEmail.textContent = user.email;
      console.log("✅ Email mis à jour");
    }

    if (userAvatar && user.picture) {
      userAvatar.src = user.picture;
      console.log("✅ Avatar mis à jour");
    }

    localStorage.setItem("user", JSON.stringify(user));
    if (user.email) {
      localStorage.setItem("email", user.email);
    }

  } catch (error: unknown) {
    const errorObj = error as Error;
    console.error("💥 ERREUR DÉTAILLÉE:", {
      message: errorObj.message,
      stack: errorObj.stack,
      name: errorObj.name
    });
    
    // Vérifier si c'est une erreur réseau
    if (error instanceof TypeError && errorObj.message.includes('fetch')) {
      console.error("🌐 Erreur réseau - Vérifiez que votre serveur backend est lancé");
    }
  }
}

async function getUserDataFromBackend(): Promise<void> {
  try {
    const token: string | null = localStorage.getItem("jwtToken");
    
    if (!token) {
      throw new Error("Token JWT manquant");
    }

    const response: Response = await fetch("http://localhost:3000/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

  } catch (error: unknown) {
    console.error("Erreur lors de la récupération des données:", error);
  }
}

async function changeUsername(): Promise<void> {
  const messageDiv: HTMLElement | null = document.getElementById("message");
  if (!messageDiv) return;

  const form: HTMLFormElement | null = document.getElementById("change-username-form") as HTMLFormElement;
  if (!form) return;

  form.addEventListener("submit", async function (event: Event): Promise<void> {
    event.preventDefault();

    const newUsernameInput: HTMLInputElement | null = document.getElementById("new-username") as HTMLInputElement;
    if (!newUsernameInput) return;

    const newUsername: string = newUsernameInput.value;
    const token: string | null = localStorage.getItem("jwtToken");
    const email: string | null = localStorage.getItem("email");

    if (!token || !email) {
      messageDiv.textContent = "Données d'authentification manquantes.";
      messageDiv.style.color = "red";
      return;
    }
    
    try {
      const response: Response = await fetch("http://localhost:3000/user/username", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newusername: newUsername,
          email: email,
        }),
      });

      if (response.status === 400) {
        messageDiv.textContent = "Erreur dans les données fournies.";
        messageDiv.style.color = "red";
        return;
      }

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        messageDiv.textContent = `Erreur inattendue: ${JSON.stringify(errorData)}`;
        messageDiv.style.color = "red";
        return;
      }

      messageDiv.textContent = "Pseudo changé avec succès !";
      messageDiv.style.color = "green";
      
      const data: unknown = await response.json();
      
      if (!isUsernameUpdateResponse(data)) {
        throw new Error("Format de réponse invalide");
      }

      const newUser: User = data.newUser;
      alert(`New username: ${JSON.stringify(newUser)}`);
      localStorage.setItem("user", JSON.stringify(newUser));
      
      const userGreeting: HTMLElement | null = document.getElementById("user-greeting");
      if (userGreeting && newUser.username) {
        userGreeting.textContent = `Salut ${newUser.username}`;
      }
    } catch (error: unknown) {
      messageDiv.textContent = "Erreur réseau. Veuillez réessayer.";
      messageDiv.style.color = "red";
    }
  });
}

async function changeAvatar(): Promise<void> {
  const form: HTMLFormElement | null = document.getElementById("change-avatar-form") as HTMLFormElement;
  if (!form) return;

  form.addEventListener("submit", async function(event: Event): Promise<void> {
    event.preventDefault();
    
    const messageDiv: HTMLElement | null = document.getElementById("message");
    if (!messageDiv) return;

    const token: string | null = localStorage.getItem("jwtToken");
    if (!token) {
      messageDiv.textContent = "Token d'authentification manquant.";
      messageDiv.style.color = "red";
      return;
    }

    try {
      const formData: FormData = new FormData(this);
      const response: Response = await fetch("http://localhost:3000/user/avatar", {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
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
      
      const data: unknown = await response.json();
      
      if (!isUsernameUpdateResponse(data)) { // Réutilise le même type guard car la structure est identique
        throw new Error("Format de réponse invalide");
      }

      const user: User = data.newUser;
      localStorage.setItem("user", JSON.stringify(user));
      
      const userAvatar: HTMLImageElement | null = document.getElementById("user-avatar") as HTMLImageElement;
      if (userAvatar && user.picture) {
        userAvatar.src = user.picture;
      }
      
    } catch (error: unknown) {
      messageDiv.textContent = "Erreur réseau. Veuillez réessayer.";
      messageDiv.style.color = "red";
    }
  });
}

async function changePassword(): Promise<void> {
  const messageDiv: HTMLElement | null = document.getElementById("message");
  if (!messageDiv) return;

  const form: HTMLFormElement | null = document.getElementById("change-password-form") as HTMLFormElement;
  if (!form) return;

  form.addEventListener("submit", async function (event: Event): Promise<void> {
    event.preventDefault();

    const newPasswordInput: HTMLInputElement | null = document.getElementById("newPassword") as HTMLInputElement;
    const confirmNewPasswordInput: HTMLInputElement | null = document.getElementById("confirmNewPassword") as HTMLInputElement;

    if (!newPasswordInput || !confirmNewPasswordInput) {
      messageDiv.textContent = "Éléments de formulaire manquants.";
      messageDiv.style.color = "red";
      return;
    }

    const newPassword: string = newPasswordInput.value;
    const confirmNewPassword: string = confirmNewPasswordInput.value;

    if (newPassword !== confirmNewPassword) {
      messageDiv.textContent = "Les mots de passe ne correspondent pas, réessayez.";
      messageDiv.style.color = "red";
      return;
    }

    const token: string | null = localStorage.getItem("jwtToken");
    if (!token) {
      messageDiv.textContent = "Token d'authentification manquant.";
      messageDiv.style.color = "red";
      return;
    }

    try {
      const response: Response = await fetch("http://localhost:3000/auth/change-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (response.status === 400) {
        messageDiv.textContent = "Erreur dans les données fournies.";
        messageDiv.style.color = "red";
        return;
      }

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        messageDiv.textContent = `Erreur inattendue: ${JSON.stringify(errorData)}`;
        messageDiv.style.color = "red";
        return;
      }

      messageDiv.textContent = "Mot de passe changé avec succès !";
      messageDiv.style.color = "green";
    } catch (error: unknown) {
      messageDiv.textContent = "Erreur réseau. Veuillez réessayer.";
      messageDiv.style.color = "red";
    }
  });
}

async function resetPassword(): Promise<void> {
  const messageDiv: HTMLElement | null = document.getElementById("message");
  if (!messageDiv) return;

  const form: HTMLFormElement | null = document.getElementById("reset-password-form") as HTMLFormElement;
  if (!form) return;

  form.addEventListener("submit", async function (event: Event): Promise<void> {
    event.preventDefault();

    const emailInput: HTMLInputElement | null = document.getElementById("email") as HTMLInputElement;
    const newPasswordInput: HTMLInputElement | null = document.getElementById("newPassword") as HTMLInputElement;
    const confirmNewPasswordInput: HTMLInputElement | null = document.getElementById("confirmNewPassword") as HTMLInputElement;

    if (!emailInput || !newPasswordInput || !confirmNewPasswordInput) {
      messageDiv.textContent = "Éléments de formulaire manquants.";
      messageDiv.style.color = "red";
      return;
    }

    const email: string = emailInput.value;
    const newPassword: string = newPasswordInput.value;
    const confirmNewPassword: string = confirmNewPasswordInput.value;

    if (newPassword !== confirmNewPassword) {
      messageDiv.textContent = "Les mots de passe ne correspondent pas, réessayez.";
      messageDiv.style.color = "red";
      return;
    }

    try {
      const response: Response = await fetch("http://localhost:3000/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, newPassword }),
      });

      if (response.ok) {
        const data: unknown = await response.json();
        messageDiv.textContent = "Mot de passe réinitialisé avec succès !";
        messageDiv.style.color = "green";
      } else if (response.status === 400) {
        messageDiv.textContent = "Erreur dans les données fournies.";
        messageDiv.style.color = "red";
      } else {
        const errorData: ApiErrorResponse = await response.json();
        messageDiv.textContent = `Erreur inattendue: ${JSON.stringify(errorData)}`;
        messageDiv.style.color = "red";
      }
    } catch (error: unknown) {
      messageDiv.textContent = "Erreur réseau. Veuillez réessayer.";
      messageDiv.style.color = "red";
    }
  });
}