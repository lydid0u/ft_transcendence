async function login() {
	const form = document.getElementById('login-form');
	if (form) {
		form.addEventListener('submit', async function (e) {
		e.preventDefault();

		const email = document.getElementById("email").value;
		const password = document.getElementById("password").value;
		const messageDiv = document.getElementById('message');

			try {
					const response = await fetch('http://localhost:3000/auth/login', {
					method: 'POST',
					headers: {'Content-Type': 'application/json'},
 			        body: JSON.stringify({ email, password })
 			        });
			   
 			        if (response.ok) {
 			            const data = await response.json();
 			            if (messageDiv) {
 			                messageDiv.textContent = "Connexion réussie !";
 			                messageDiv.style.color = "green";
 			            }
 			            localStorage.setItem('isAuthenticated', 'true');
 			            localStorage.setItem('user', JSON.stringify(data.user || { email }));
                        localStorage.setItem('jwtToken', data.jwt || '');
					 
				        if (window.SPA && typeof SPA.navigateTo === 'function') {
				          SPA.navigateTo('/dashboard');
				        }
 			       } else if (response.status === 401 && messageDiv) {
 			             messageDiv.textContent = "Email ou mot de passe incorrect.";
 			             messageDiv.style.color = "red";
 			       } else {
 			         if (messageDiv) {
 			             messageDiv.textContent = `Erreur inattendue: ${response.status}`;
 			             messageDiv.style.color = "red";
 			         }
 			       }
 			} catch (error) {
 		       if (messageDiv) {
 		           messageDiv.textContent = "Erreur réseau. Veuillez réessayer.";
 		           messageDiv.style.color = "red";
 		       }
 			}	 
		});
	}
}
    
async function register() {
    const form = document.getElementById('register-form');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = document.getElementById("emailRegister").value || "test@test.fr";
            const pseudo = document.getElementById("pseudo").value || "test";
            const createPassword = document.getElementById("createPassword").value  || "123";
            const confirmPassword = document.getElementById("confirmPassword").value || "123";;
            const messageDiv = document.getElementById('message');

            if (createPassword ==! confirmPassword) {
                messageDiv.textContent = "Les mots de passe ne correspondent pas, réessayez.";
                messageDiv.style.color = "red";
            }

            try {
                const response = await fetch('http://localhost:3000/auth/register', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ email, pseudo, password: createPassword })
                });
                
                if (!response.ok) {
                     messageDiv.textContent = `Erreur inattendue: ${JSON.stringify(await response.json())}`;
                        messageDiv.style.color = "red";
                }
                else if (response.status === 400) {
                    messageDiv.textContent = "Erreur dans les données fournies.";
                    messageDiv.style.color = "red";
                } 
                else if (response.ok) {
                    const data = await response.json();
                        messageDiv.textContent = "Inscription réussie !";
                        messageDiv.style.color = "green";
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('user', JSON.stringify(data.user || { email }));
                    localStorage.setItem('jwtToken', data.token || '');
                    
                    if (window.SPA && typeof SPA.navigateTo === 'function') {
                        SPA.navigateTo('/dashboard');
                    }
                } 
            } catch (error) {
                    messageDiv.textContent = "Erreur réseau. Veuillez réessayer.";
                    messageDiv.style.color = "red";                            
            }  
        })
    }
}

function alreadyLoggedIn() {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
        const contentDiv = document.querySelector('#content');
        if (contentDiv) {
            contentDiv.innerHTML = `
            <div class="flex flex-col items-center rounded-[50px] h-full w-full p-8 bg-gradient-to-b from-stone-200 to-stone-300 no-scrollbar overflow-y-auto">
                <div class="w-full max-w-4xl text-center">
                    <h1 class="text-5xl font-bold mb-12 text-stone-400">Tu es deja connecte !</h1>
                    <div onclick="SPA.navigateTo('/home')" class="inline-block px-6 py-3 bg-stone-600 hover:bg-stone-700 text-white font-bold rounded-lg shadow-lg transform transition duration-300 hover:scale-105">
                        Retourner à l'accueil
                    </div>
                </div>
            </div>`;
        }
    }
}
