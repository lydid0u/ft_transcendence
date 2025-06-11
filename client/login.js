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