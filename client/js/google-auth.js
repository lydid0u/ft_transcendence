function handleGoogleAuth(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    
    // on decode le token jwt pour obtenir les info du user
    const objUserData = decodeJwtResponse(response.credential);
    
    const userData = {
        googleId: objUserData.sub,
        name: objUserData.name,
        email: objUserData.email,
        picture: objUserData.picture,
        token: response.credential
    };
    sendUserDataToBackend(userData);
}

// on prend le payload ,base64Url en base64 en json, puis on return le json en objet js
function decodeJwtResponse(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
}

function displayUserInfo(userData) {
    // cache le boutton de connexion
    const signinSection = document.getElementById('signin-section');
    const loginWithAccountSection = document.getElementById('loginWithAccountSection');
    if (signinSection) {
        signinSection.style.display = 'none';
    }
    if (loginWithAccountSection) {
        loginWithAccountSection.style.display = 'none';
    }
    
    // Afficher la section utilisateur
    const userSection = document.getElementById('user-section');
    if (userSection) {
        userSection.style.display = 'block';

        const userPhoto = document.getElementById('user-photo');
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        
        if (userPhoto) userPhoto.src = userData.picture;
        if (userName) userName.textContent = userData.name;
        if (userEmail) userEmail.textContent = userData.email;
    }
}

function signOut() {
    localStorage.removeItem('googleUser');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('jwtToken');
    
    // supprime le token google
    if (typeof google !== 'undefined' && google.accounts)
        google.accounts.id.disableAutoSelect();
    
    // cache la section info utilisateur
    const userSection = document.getElementById('user-section');
    if (userSection) {
        userSection.style.display = 'none';
    }
    
    // affiche le bouton de connexion
    const signinSection = document.getElementById('signin-section');
    const loginWithAccountSection = document.getElementById('loginWithAccountSection');

    if (signinSection) {
        signinSection.style.display = 'block';
    }
    if (loginWithAccountSection) {
        loginWithAccountSection.style.display = 'block';
    }

    console.log('Utilisateur déconnecté');
}
