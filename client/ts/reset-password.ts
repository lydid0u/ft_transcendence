
interface APIresetResponse {
  success: string;
  message?: string;
}


let resetEmail: string = '';
export function setupResetEmailForm() {
    console.log('Demarrage de la configuration du formulaire de réinitialisation de mot de passe');
  const emailForm = document.getElementById('reset-email-form') as HTMLFormElement | null;
  if (emailForm) {
    console.log('Initialisation du formulaire de réinitialisation de mot de passe');
    emailForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('email') as HTMLInputElement;
      const email = emailInput.value;
      resetEmail = email;
      const message = document.getElementById('reset-email-message') as HTMLElement;
      message.textContent = '';
      console.log('Envoi de la requête de réinitialisation pour l’email:', email);
      try {
        console.log('Envoi de la requête de réinitialisation pour l’email DANS POST:', email);
        const res = await fetch('http://localhost:3000/auth/2FA-code/pass', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data: APIresetResponse = await res.json();
        if (data.success) {
            if (window.SPA && typeof window.SPA.navigateTo === 'function') {
                console.log('Redirection vers la page OTP');
                localStorage.setItem('resetEmail', resetEmail);
                window.SPA.navigateTo('/otp-password');
            } 
            else 
            {
                window.location.href = 'otp-password.html';
            }
        }
      } catch (err) {
        console.error('Erreur réseau:', err);
        message.textContent = 'Erreur réseau.';
      }
    });
  }
}
if (document.getElementById('reset-email-form')) setupResetEmailForm();
