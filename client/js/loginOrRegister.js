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
        alert("register function called");
        alert("Inscription");
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const firstName = document.getElementById("firstName").value;
            const lastName = document.getElementById("lastName").value; 
            const email = document.getElementById("emailRegister").value;
            const pseudo = document.getElementById("pseudo").value;
            const createPassword = document.getElementById("createPassword").value;
            const confirmPassword = document.getElementById("confirmPassword").value;
            const messageDiv = document.getElementById('message');

            if (createPassword === confirmPassword) {
                alert("Les mots de passe correspondent, vous pouvez continuer l'inscription.");
                console.log("Passwords match, proceeding with registration...");
                try {
                    const response = await fetch('http://localhost:3000/auth/register', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ firstName, lastName, email, pseudo, password: createPassword })
                    });
                
                    if (response.ok) {
                        const data = await response.json();
                        if (messageDiv) {
                            messageDiv.textContent = "Inscription réussie !";
                            messageDiv.style.color = "green";
                        }
                        localStorage.setItem('isAuthenticated', 'true');
                        localStorage.setItem('user', JSON.stringify(data.user || { email }));
                        localStorage.setItem('jwtToken', data.token || '');
                        
                        if (window.SPA && typeof SPA.navigateTo === 'function') {
                            SPA.navigateTo('/dashboard');
                        }
                    } else if (response.status === 400 && messageDiv) {
                        messageDiv.textContent = "Erreur dans les données fournies.";
                        messageDiv.style.color = "red";
                    } else {
                        if (messageDiv) {
                            messageDiv.textContent = `Erreur inattendue: ${JSON.stringify(await response.json())}`;
                            messageDiv.style.color = "red";
                        }
                    }
                } catch (error) {
                    if (messageDiv) {
                        messageDiv.textContent = "Erreur réseau. Veuillez réessayer.";
                        messageDiv.style.color = "red";                            

                    }
                }  
            }
            else {
                    if (messageDiv) {
                        messageDiv.textContent = "Les mots de passe ne correspondent pas, réessayez.";
                        messageDiv.style.color = "red";
                    }
            }
    })
}
}
