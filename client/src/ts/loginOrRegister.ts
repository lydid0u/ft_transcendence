// Types and interfaces
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

// Global SPA interface
declare global {
  interface Window {
    SPA?: {
      navigateTo: (route: string) => void;
    };
  }
}

// Type guards
function isLoginResponse(data: any): data is LoginResponse {
  return data && typeof data === 'object' && 'user' in data && 'jwt' in data;
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

        if (messageDiv) {
          messageDiv.textContent = "Connexion réussie !";
          messageDiv.style.color = "green";
        }

        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(data.user || { email }));
        localStorage.setItem('jwtToken', data.jwt || '');

        if (window.SPA && typeof window.SPA.navigateTo === 'function') {
          window.SPA.navigateTo('/dashboard');
        }
      } else if (response.status === 401) {
        if (messageDiv) {
          messageDiv.textContent = "Email ou mot de passe incorrect.";
          messageDiv.style.color = "red";
        }
      } else {
        if (messageDiv) {
          messageDiv.textContent = `Erreur inattendue: ${response.status}`;
          messageDiv.style.color = "red";
        }
      }
    } catch (error: unknown) {
      if (messageDiv) {
        messageDiv.textContent = "Erreur réseau. Veuillez réessayer.";
        messageDiv.style.color = "red";
      }
    }
  });
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

      const data: unknown = await response.json();
      
      if (!isRegisterResponse(data)) {
        throw new Error("Format de réponse invalide");
      }

      if (messageDiv) {
        messageDiv.textContent = "Inscription réussie !";
        messageDiv.style.color = "green";
      }

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(data.user || { email }));
      localStorage.setItem('jwtToken', data.token || '');

      if (window.SPA && typeof window.SPA.navigateTo === 'function') {
        window.SPA.navigateTo('/dashboard');
      }
    } catch (error: unknown) {
      if (messageDiv) {
        messageDiv.textContent = "Erreur réseau. Veuillez réessayer.";
        messageDiv.style.color = "red";
      }
    }
  });
}

function alreadyLoggedIn(): void {
  const isAuthenticated: string | null = localStorage.getItem('isAuthenticated');
  
  if (isAuthenticated === 'true') {
    const contentDiv: HTMLElement | null = document.querySelector('#content');
    if (contentDiv) {
      contentDiv.innerHTML = `
        <div class="flex flex-col items-center rounded-[50px] h-full w-full p-8 bg-gradient-to-b from-stone-200 to-stone-300 no-scrollbar overflow-y-auto">
          <div class="w-full max-w-4xl text-center">
            <h1 class="text-5xl font-bold mb-12 text-stone-400">Tu es déjà connecté !</h1>
            <div onclick="window.SPA?.navigateTo('/home')" class="inline-block px-6 py-3 bg-stone-600 hover:bg-stone-700 text-white font-bold rounded-lg shadow-lg transform transition duration-300 hover:scale-105 cursor-pointer">
              Retourner à l'accueil
            </div>
          </div>
        </div>
      `;
    }
  }
}
window.alreadyLoggedIn = alreadyLoggedIn;
window.login = login;
window.register = register;