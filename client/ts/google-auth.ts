interface GoogleAuthResponse {
	credential: string;
}

interface GoogleJwtPayload {
	sub: string; // Google ID
	name: string;
	email: string;
	picture: string;
	iss: string; // issuer
	aud: string; // audience
	exp: number; // expiration time
	iat: number; // issued at time
	[key: string]: any;
}

interface UserData {
	googleId: string;
	name: string;
	email: string;
	picture: string;
	token: string;
	jwt?: string;
}

declare global {
	interface Window {
		google?: {
			accounts: {
				id: {
					disableAutoSelect: () => void;
				};
			};
		};
	}
}

async function sendUserDataToBackend(userData: UserData): Promise<void> {
	try {
		const response = await fetch('https://localhost:3000/auth/google', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(userData)
		});

		if (!response.ok) {
			throw new Error(`Erreur HTTP: ${response.status}`);
		}

		const data = await response.json();
		console.log("Réponse du backend:", data, data.jwt);

		localStorage.setItem('googleUser', JSON.stringify(userData));
		localStorage.setItem('user', JSON.stringify(data.user || userData));
		localStorage.setItem('isAuthenticated', 'true');
		if (!data.jwt) {
			console.log("Utilisateur authentifié, redirection vers la page de connexion Google");
			window.SPA.navigateTo('/googleLogin');
		}
		else {
			try {
        await fetch('https://localhost:3000/user/connection-status', {
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
			localStorage.setItem('jwtToken', data.jwt);
			window.SPA.navigateTo('/home');
		}
	} catch (error) {
		console.error("Erreur lors de l'envoi au backend:", error);

		localStorage.removeItem('googleUser');
		localStorage.removeItem('isAuthenticated');
		localStorage.removeItem('jwtToken');

		// if (typeof google !== 'undefined' && google.accounts) {
		// 	google.accounts.id.disableAutoSelect();
		// }

		if (window.SPA && typeof window.SPA.navigateTo === 'function') {
			window.SPA.navigateTo('/login');
		}
	}
}

async function addPseudoForGoogleLogin(userData: UserData): Promise<void> {
    setTimeout(() => {
        const form = document.getElementById("google-username-form") as HTMLFormElement | null
        const message = document.getElementById("message-username") as HTMLElement | null
        if (!form || !message) return

        form.addEventListener("submit", async (event: Event) => {
            event.preventDefault()
            const username: string = (document.getElementById("new-username") as HTMLInputElement)?.value || ""
            
            if (!username && message) {
                message.textContent = "Le nom d'utilisateur ne peut pas être vide."
                message.style.color = "red"
                return
            }

            try {
                const response = await fetch('https://localhost:3000/auth/google-username', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, userData })
                });

                const result = await response.json();
                console.log("Réponse du backend:", result);

                if (!response.ok) {
                    // Afficher le message d'erreur du serveur
                    if (message) {
						message.classList.remove('hidden'); // Si vous gardez la classe hidden
						message.textContent = "Ce nom d'utilisateur est déjà pris. Veuillez en choisir un autre.";
						message.style.color = "red";
					}
                    // Si le nom d'utilisateur est déjà pris
                    if (response.status === 409 || result.message?.includes("already taken")) {
                        if (message) {
                            message.textContent = "Ce nom d'utilisateur est déjà pris. Veuillez en choisir un autre.";
                            message.style.color = "red";
                        }
                        // Vider le champ du nom d'utilisateur pour que l'utilisateur puisse en saisir un autre
                        const usernameInput = document.getElementById("new-username") as HTMLInputElement;
                        if (usernameInput) {
                            usernameInput.value = "";
                            usernameInput.focus();
                        }
                    }
                    throw new Error(result.message || `Erreur HTTP: ${response.status}`);
                }

                if (result.success) {
                    localStorage.setItem('jwtToken', result.jwt);
                    await fetch('https://localhost:3000/user/connection-status', {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${result.jwt || ''}`,
                        },
                        body: JSON.stringify({ status: true }),
                    });
                    window.SPA.navigateTo('/home');
                }
            } catch (error) {
                console.error("Erreur lors de l'envoi au backend:", error);
                // Ne pas rediriger en cas d'erreur pour permettre à l'utilisateur de corriger
            }
        })
    }, 100);
}

function handleGoogleAuth(response: GoogleAuthResponse): void {
	try {
		console.log("Encoded JWT ID token: " + response.credential);

		// Decode the JWT token to get user info
		const objUserData: GoogleJwtPayload = decodeJwtResponse(response.credential);

		const userData: UserData = {
			googleId: objUserData.sub,
			name: objUserData.name,
			email: objUserData.email,
			picture: objUserData.picture,
			token: response.credential
		};

		sendUserDataToBackend(userData);
	} catch (error) {
		console.error('Erreur lors de la gestion de l\'authentification Google:', error);
	}
}

// Decode JWT token: take the payload, convert base64Url to base64 to JSON, then return JSON as JS object
function decodeJwtResponse(token: string): GoogleJwtPayload {
	try {
		const parts: string[] = token.split('.');

		if (parts.length !== 3) {
			throw new Error('Token JWT invalide - format incorrect');
		}

		const base64Url: string = parts[1];
		const base64: string = base64Url.replace(/-/g, '+').replace(/_/g, '/');

		const jsonPayload: string = decodeURIComponent(
			atob(base64)
				.split('')
				.map(function (c: string): string {
					return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
				})
				.join('')
		);

		const payload: GoogleJwtPayload = JSON.parse(jsonPayload);

		// Validate required fields
		if (!payload.sub || !payload.name || !payload.email) {
			throw new Error('Token JWT invalide - données utilisateur manquantes');
		}

		return payload;
	} catch (error) {
		console.error('Erreur lors du décodage du token JWT:', error);
		throw new Error('Impossible de décoder le token JWT');
	}
}

function isUserAuthenticated(): boolean {
	const isAuthenticated: string | null = localStorage.getItem('isAuthenticated');
	const jwtToken: string | null = localStorage.getItem('jwtToken');

	return isAuthenticated === 'true' && !!jwtToken;
}

window.addPseudoForGoogleLogin = addPseudoForGoogleLogin;
window.handleGoogleAuth = handleGoogleAuth;