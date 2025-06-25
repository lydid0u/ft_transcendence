async function sendUserDataToBackend(userData) {
    try {
            const response = await fetch('http://localhost:3000/auth/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        // on recupere la reponse du backend, 
        const result = await response.json();
        console.log("Réponse du backend:", result);

        // save dans localStorage pour la session locale
        localStorage.setItem('googleUser', JSON.stringify(userData));
        localStorage.setItem('isAuthenticated', 'true');
        if (result.token) 
            localStorage.setItem('jwtToken', result.token);
        
        displayUserInfo(userData);
        if (window.SPA && typeof SPA.navigateTo === 'function') {
            SPA.navigateTo('/dashboard');
        }

    } catch (error) {
        console.error("Erreur lors de l'envoi au backend:", error);
        
        localStorage.removeItem('googleUser');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('jwtToken');

        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.disableAutoSelect();
        }
        
        if (window.SPA && typeof SPA.navigateTo === 'function') {
            SPA.navigateTo('/login');
        }
        
        alert('Erreur de connexion au serveur. Veuillez réessayer.');
    }
}