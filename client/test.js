// Fonction appelée quand l'utilisateur se connecte
function handleCredentialResponse(response) {
    // Décoder le token JWT pour récupérer les infos utilisateur
    const userInfo = parseJwt(response.credential);
    
    // Afficher les infos
    document.getElementById('user-name').textContent = userInfo.name;
    document.getElementById('user-email').textContent = userInfo.email;
    document.getElementById('user-info').style.display = 'block';
    
    // Masquer le bouton de connexion
    document.getElementById('g_id_onload').style.display = 'none';
}

// Fonction pour décoder le JWT (token)
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Fonction de déconnexion
function signOut() {
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('g_id_onload').style.display = 'block';
    // Recharger la page pour réinitialiser
    location.reload();
}