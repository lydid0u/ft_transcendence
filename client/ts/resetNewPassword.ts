
let resetJwt: string = '';

export function setupNewPasswordForm() {
  const newPasswordForm = document.getElementById('new-password-form') as HTMLFormElement | null;
  if (newPasswordForm) {
    newPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
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
        const res = await fetch('http://localhost:3000/auth/reset-new-password', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
          localStorage.removeItem('resetEmail');
          window.location.href = 'login.html';
        } else {
          message.textContent = data.message || 'Erreur lors du changement de mot de passe.';
        }
      } catch (err) {
        message.textContent = 'Erreur réseau.';
      }
    });
  }
}

if (document.getElementById('new-password-form')) setupNewPasswordForm();
