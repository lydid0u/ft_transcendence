async function changePassword() {
  const messageDiv = document.getElementById("message");
  if (!messageDiv) return;

  const form = document.getElementById("change-password-form");
  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const newPassword = document.getElementById("newPassword").value;
      const confirmNewPassword =
        document.getElementById("confirmNewPassword").value;

      if (newPassword != confirmNewPassword) {
        messageDiv.textContent =
          "Les mots de passe ne correspondent pas, reessayez.";
        messageDiv.style.color = "red";
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3000/auth/change-password",
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
            },
            body: JSON.stringify({ password:newPassword }),
          }
        );
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
        messageDiv.textContent = "Mot de passe changé avec succes !";
        messageDiv.style.color = "green";
      } catch (error) {
        messageDiv.textContent = "Erreur réseau. Veuillez réessayer.";
        messageDiv.style.color = "red";
      }
    });
  }
}

async function resetPassword() {
  const form = document.getElementById("reset-password-form");
  if (form) {
    form.addEventListener("reset-password-btn", async function (event) {
      const email = document.getElementById("email").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmNewPassword =
        document.getElementById("confirmNewPassword").value;

      if (newPassword == confirmNewPassword) {
        try {
          const response = await fetch(
            "http://localhost:3000/auth/reset-password",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email, newPassword }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (messageDiv) {
              messageDiv.textContent =
                "Mot de passe réinitialisé avec succès !";
              messageDiv.style.color = "green";
            }
          } else if (response.status === 400 && messageDiv) {
            messageDiv.textContent = "Erreur dans les données fournies.";
            messageDiv.style.color = "red";
          } else {
            if (messageDiv) {
              messageDiv.textContent = `Erreur inattendue: ${JSON.stringify(
                await response.json()
              )}`;
              messageDiv.style.color = "red";
            }
          }
        } catch (error) {
          if (messageDiv) {
            messageDiv.textContent = "Erreur réseau. Veuillez réessayer.";
            messageDiv.style.color = "red";
          }
        }
      } else {
        messageDiv.textContent =
          "Les mots de passe ne correspondent pas, reessayez.";
        messageDiv.style.color = "red";
      }
    });
  }
}
