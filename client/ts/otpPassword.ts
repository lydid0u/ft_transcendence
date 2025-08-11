let resetEmail: string = '';

export function setupOtpForm() {
  console.log('Demarrage de la configuration du formulaire OTP');
  const otpForm = document.getElementById('otp-form') as HTMLFormElement | null;
  if (otpForm) {
    otpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const otpInput = document.getElementById('otp-code') as HTMLInputElement;
      const code = otpInput.value;
      const message = document.getElementById('otp-message') as HTMLElement;
      message.textContent = '...'; 
      message.classList.remove('hidden');
      resetEmail = localStorage.getItem('resetEmail') || '';
      if (!resetEmail) {
        message.textContent = 'Aucune adresse e-mail trouvée pour la réinitialisation.';
        return;
      }
      try {
        const res = await fetch('http://localhost:3000/auth/2FA-verify/pass', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: resetEmail, code })
        });
        const data = await res.json();
        if (data.success === true) {
          message.textContent = 'Code vérifié avec succès. Vous pouvez maintenant définir un nouveau mot de passe.';
          if (window.SPA && typeof window.SPA.navigateTo === 'function') {
            window.SPA.navigateTo('/resetNewPassword');
          }
        } else {
          message.textContent = data.message || 'Code incorrect ou expiré.';
        }
      } catch (err) {
        message.textContent = 'Erreur réseau.';
      }
    });
  }
}
