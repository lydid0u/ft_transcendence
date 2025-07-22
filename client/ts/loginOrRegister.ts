interface User {
  email: string;
  pseudo?: string;
  username?: string;
  [key: string]: any;
}

interface LoginResponse {
  user: User;
  jwt: string;
}

interface RegisterResponse {
  user: User;
  token: string;
}

interface AuthErrorResponse {
  message?: string;
  error?: string;
}

declare global {
  interface Window {
    SPA?: {
      navigateTo: (route: string) => void;
    };
  }
}

function isLoginResponse(data: any): data is LoginResponse {
  return data && typeof data === 'object' && 'user' in data;
}

function isRegisterResponse(data: any): data is RegisterResponse {
  return data && typeof data === 'object' && 'user' in data && 'token' in data;
}

async function login(): Promise<void> {
  const form: HTMLFormElement | null = document.getElementById('login-form') as HTMLFormElement;
  if (!form) return;

  form.addEventListener('submit', async function (e: Event): Promise<void> {
    e.preventDefault();

    const emailInput: HTMLInputElement | null = document.getElementById("email") as HTMLInputElement;
    const passwordInput: HTMLInputElement | null = document.getElementById("password") as HTMLInputElement;
    const messageDiv: HTMLElement | null = document.getElementById('message');

    if (!emailInput || !passwordInput) {
      if (messageDiv) {
        messageDiv.textContent = "Éléments de formulaire manquants.";
        messageDiv.style.color = "red";
      }
      return;
    }

    const email: string = emailInput.value;
    const password: string = passwordInput.value;

    if (!email || !password) {
      if (messageDiv) {
        messageDiv.textContent = "Veuillez remplir tous les champs.";
        messageDiv.style.color = "red";
      }
      return;
    }

    try {
      const response: Response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        const data: unknown = await response.json();
        
        if (!isLoginResponse(data)) {
          throw new Error("Format de réponse invalide");
        }
        
          localStorage.setItem('user', JSON.stringify(data.user || { email }));
    
          if (!data.jwt) {
            try {
              await fetch('http://localhost:3000/auth/2FA-code', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
              });
            } catch (err) {
              console.error("Erreur lors de l'envoi du code 2FA vers le mail:", err);
            }

            console.log('2fa active, redirection vers la page OTP');
            window.SPA?.navigateTo('/otp');
          } else {
            try {
        await fetch('http://localhost:3000/user/connection-status', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${data.jwt || ''}`,
              },
              body: JSON.stringify({ status: true }), // 1 = connecté et 0 = déconnecté
            });
          } 
        catch (err) {
            console.error("Erreur lors de la notification du status de connexion au backend:", err);
          }
            localStorage.setItem('jwtToken', data.jwt || '');
            localStorage.setItem('isAuthenticated', 'true');

            window.SPA?.navigateTo('/home');
          }

      } else if (response.status === 401) {
        if (messageDiv) {
          messageDiv.textContent = "Email ou mot de passe incorrect.";
          messageDiv.style.color = "red";
        }
      } 
        else if (response.status === 200) {
        if( messageDiv) {
          messageDiv.textContent = "Connexion réussie, redirection vers la page d'accueil.";
          messageDiv.style.color = "green";
        }
      } else {
        if (messageDiv) {
          messageDiv.textContent = `Erreur inattendue: ${response.status}`;
          messageDiv.style.color = "red";
        }
      }
    } catch (error: unknown) {
      if (messageDiv) {
        console.error("Erreur lors de la connexion:", error);
        messageDiv.textContent = "Erreur réseau on est ici. Veuillez réessayer.";
        messageDiv.style.color = "red";
      }
    }
  });
}

async function otpSubmit(email: string): Promise<void> {
  setTimeout(() => {
		const form = document.getElementById("otp-form") as HTMLFormElement | null;
    if (!form) return;
		form.addEventListener("submit", async (event: Event) => {
			event.preventDefault()
			const code: string = (document.getElementById("otp-code") as HTMLInputElement)?.value || ""

			try {
				const response = await fetch('http://localhost:3000/auth/2FA-verify', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({email, code })
				});
				if (!response.ok)
					throw new Error(`Erreur HTTP: ${response.status}`);

				const result = await response.json();
				console.log("Réponse du backend:", result);

				if (result.success) {
          try {
        await fetch('http://localhost:3000/user/connection-status', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${data.jwt || ''}`,
              },
              body: JSON.stringify({ status: 1 }), // 1 = connecté et 0 = déconnecté
            });
          } 
        catch (err) {
            console.error("Erreur lors de la notification du status de connexion au backend:", err);
          }
					localStorage.setItem('jwtToken', result.jwt);
          localStorage.setItem('isAuthenticated', 'true');
          console.log("Connexion réussie, redirection vers la page d'accueil");
					window.SPA.navigateTo('/home');
				}

			} catch (error) {
				console.error("Erreur lors de l'envoi au backend:", error);
			}
		})
	}, 100);
}


async function register(): Promise<void> {
  const form: HTMLFormElement | null = document.getElementById('register-form') as HTMLFormElement;
  if (!form) return;

  form.addEventListener('submit', async function (e: Event): Promise<void> {
    e.preventDefault();

    const emailInput: HTMLInputElement | null = document.getElementById("emailRegister") as HTMLInputElement;
    const pseudoInput: HTMLInputElement | null = document.getElementById("pseudo") as HTMLInputElement;
    const createPasswordInput: HTMLInputElement | null = document.getElementById("createPassword") as HTMLInputElement;
    const confirmPasswordInput: HTMLInputElement | null = document.getElementById("confirmPassword") as HTMLInputElement;
    const messageDiv: HTMLElement | null = document.getElementById('message');

    if (!emailInput || !pseudoInput || !createPasswordInput || !confirmPasswordInput) {
      if (messageDiv) {
        messageDiv.textContent = "Éléments de formulaire manquants.";
        messageDiv.style.color = "red";
      }
      return;
    }

    const email: string = emailInput.value || "test@test.fr";
    const pseudo: string = pseudoInput.value || "test";
    const createPassword: string = createPasswordInput.value || "123";
    const confirmPassword: string = confirmPasswordInput.value || "123";

    // Fixed the comparison operator (was ==! instead of !==)
    if (createPassword !== confirmPassword) {
      if (messageDiv) {
        messageDiv.textContent = "Les mots de passe ne correspondent pas, réessayez.";
        messageDiv.style.color = "red";
      }
      return;
    }

    try {
      const response: Response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pseudo, password: createPassword })
      });
      const data: unknown = await response.json();

      if (response.status === 400) {
        if (messageDiv) {
          messageDiv.textContent = "Erreur dans les données fournies.";
          messageDiv.style.color = "red";
        }
        return;
      }

      if (!response.ok) {
        const errorData: AuthErrorResponse = await response.json();
        if (messageDiv) {
          messageDiv.textContent = `Erreur inattendue: ${JSON.stringify(errorData)}`;
          messageDiv.style.color = "red";
        }
        return;
      }

      
      // KHALID A COMMENTER PARCE QU'A CHAQUE INSCRIPTION L'ERREUR APPARAIT, FONCTION A CHECK
      // KHALID A COMMENTER PARCE QU'A CHAQUE INSCRIPTION L'ERREUR APPARAIT, FONCTION A CHECK      
      // KHALID A COMMENTER PARCE QU'A CHAQUE INSCRIPTION L'ERREUR APPARAIT, FONCTION A CHECK
      // if (!isRegisterResponse(data)) {
      //   throw new Error("Format de réponse invalide");
      // } 
      // KHALID A COMMENTER PARCE QU'A CHAQUE INSCRIPTION L'ERREUR APPARAIT, FONCTION A CHECK
      // KHALID A COMMENTER PARCE QU'A CHAQUE INSCRIPTION L'ERREUR APPARAIT, FONCTION A CHECK
      // KHALID A COMMENTER PARCE QU'A CHAQUE INSCRIPTION L'ERREUR APPARAIT, FONCTION A CHECK


      if (messageDiv) {
        messageDiv.textContent = "Inscription réussie !";
        messageDiv.style.color = "green";
      }

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(data.user || { email }));
      localStorage.setItem('jwtToken', data.jwt || '');

      try {
        await fetch('http://localhost:3000/user/connection-status', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${data.jwt || ''}`,
              },
              body: JSON.stringify({ status: 1 }), // 1 = connecté et 0 = déconnecté
            });
          } 
        catch (err) {
            console.error("Erreur lors de la notification du status de connexion au backend:", err);
          }
      if (window.SPA && typeof window.SPA.navigateTo === 'function') {
        window.SPA.navigateTo('/dashboard');
      }
    } catch (error: unknown) {
      if (messageDiv) {
        console.error("Erreur lors de l'inscription:", error);
        messageDiv.textContent = "Erreur réseau 2. Veuillez réessayer.";
        messageDiv.style.color = "red";
      }
    }
  });
}


window.SPA = window.SPA || {};
window.login = login;
window.register = register;
window.otpSubmit = otpSubmit;