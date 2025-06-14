async function getUserDataFromBackend() {
    try {
        const response = await fetch('http://localhost:3000/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        console.log("HERE", localStorage.getItem('jwtToken'));
        const data = await response.json();
        console.log("Données du backend:", data);
        const contentDiv = document.querySelector(SPA.SPAattribute.contentDiv);
        contentDiv.innerHTML += `
            <div class="profile-data">
                <p>Nom: ${data.name}</p>
                <p>Email: ${data.email}</p>
                <p>Nombre de parties jouées: ${data.gamesPlayed}</p>
                <p>Nombre de victoires: ${data.wins}</p>
                <p>Nombre de défaites: ${data.losses}</p>
            </div>
        `;
    } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
    }
}
