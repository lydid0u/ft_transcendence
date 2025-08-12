let resetJwt: string = '';

export function setupNewPasswordForm() {
  const newPasswordForm = document.getElementById('new-password-form') as HTMLFormElement | null;
  if (newPasswordForm) {
    // Assurez-vous que le formulaire n'a pas d'attribut "action" dans le HTML
    if (newPasswordForm.hasAttribute('action')) {
      newPasswordForm.removeAttribute('action');
    }
    
    newPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log("Formulaire soumis, événement intercepté");
      
      const passwordInput = document.getElementById('new-password') as HTMLInputElement;
      const confirmInput = document.getElementById('confirm-password') as HTMLInputElement;
      const password = passwordInput.value;
      const confirm = confirmInput.value;
      const message = document.getElementById('new-password-message') as HTMLElement;
      message.textContent = '';
      
      if (password !== confirm) {
        message.textContent = 'Les mots de passe ne correspondent pas.';
        return;
      }
      
      const email = localStorage.getItem('resetEmail');
      if (!email) {
        message.textContent = 'Erreur : email manquant.';
        return;
      }
      
      try {
        console.log("Tentative de réinitialisation du mot de passe pour:", email);
        const res = await fetch('/api/auth/reset-new-password', {
          method: 'PATCH',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        console.log("Réponse du backend:", data);
        
        if (data.success) {
          message.textContent = 'Mot de passe réinitialisé avec succès. Redirection...';
          message.style.color = 'green';
          localStorage.removeItem('resetEmail');
          setTimeout(() => {
            if (window.SPA && typeof window.SPA.navigateTo === 'function') {
              window.SPA.navigateTo('/login');
            } else {
              window.location.href = '/login';
            }
          }, 1000);
        } else {
          message.textContent = data.message || 'Erreur lors du changement de mot de passe.';
          message.style.color = 'red';
        }
      } catch (err) {
        console.error('Erreur réseau:', err);
        message.textContent = 'Erreur de connexion au serveur.';
        message.style.color = 'red';
      }
      
      return false; // Empêche encore plus la soumission normale du formulaire
    });
  } else {
    console.error("Formulaire new-password-form non trouvé dans le DOM");
  }
}

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('new-password-form')) {
    console.log("Formulaire trouvé, initialisation...");
    setupNewPasswordForm();
  }
});

// Initialisation immédiate aussi pour s'assurer que ça marche dans tous les cas
if (document.getElementById('new-password-form')) setupNewPasswordForm();