interface ApiErrorResponse {
  message?: string;
  error?: string;
}

async function changePassword(): Promise<void> {
  const messageDiv = document.getElementById("message") as HTMLElement;
  const form = document.getElementById("change-password-form") as HTMLFormElement;
  if (!messageDiv || !form) return;

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
        messageDiv.textContent = "Erreur de saisie dans les données fournies.";
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
      messageDiv.textContent = "Erreur réseau 2. Veuillez réessayer.";
      messageDiv.style.color = "red";
    }
  });
}

async function resetPassword(): Promise<void> {
  const messageDiv = document.getElementById("message") as HTMLElement;
  const form = document.getElementById("reset-password-form") as HTMLFormElement;
  if (!messageDiv || !form) return;

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
        messageDiv.textContent = "Erreur de saisie dans les données fournies.";
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

export { changePassword, resetPassword };

declare global {
  interface Window {
    changePassword: typeof changePassword;
    resetPassword: typeof resetPassword;
  }
}

window.changePassword = changePassword;
window.resetPassword = resetPassword;