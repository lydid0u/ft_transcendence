interface TournamentParticipant {
  tournament_id: number;
  user_id: number;   // Changé de userId à user_id pour correspondre à la réponse API
  username?: string;
  alias?: string; // Rendu optionnel car peut ne pas être présent
  success?: boolean;
}

interface TournamentMatch {
  tournament_id: number;
  player1_name: string;
  player2_name: string;
  player1_score: number;
  player2_score: number;
  winner_id: number;
  next_player1_name?: string; // Nom du prochain adversaire pour le joueur 1
  next_player2_name?: string; // Nom du prochain adversaire pour le joueur 2
  finalist_name?: string; // Nom du finaliste
  status: string;
  round: string;
  created_at: string;
  updated_at: string;
}


// Classe API pour gérer les interactions avec le backend pour le tournoi
class TournamentLaunchAPI {
  private baseUrl: string;
  private token: string | null;

  constructor(baseUrl = "http://localhost:3000") {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem("jwtToken");
  }

  //   Méthode pour récupérer les détails du tournoi actif de l'utilisateur
  async getTournamentDetails(): Promise<TournamentParticipant[] | null> {
    try {
      const response = await fetch(`${this.baseUrl}/tournament/get-participants`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        console.error(`Erreur HTTP: ${response.status}`);
        return null;
      }

      const data = await response.json();
      console.log("Données brutes reçues:", data);
      
      // Si data est un objet avec une propriété participants qui est un tableau
      if (data && data.participants && Array.isArray(data.participants)) {
        return data.participants;
      }
      
      // Si data est déjà un tableau
      if (Array.isArray(data)) {
        return data;
      }
      
      return [];
    } catch (error) {
      console.error("Erreur lors de la récupération des détails du tournoi:", error);
      return null;
    }
  }

  async findWinnerOfTournament(match: TournamentMatch): Promise<number | null> {
    try {
      console.log("Recherche du gagnant du tournoi pour le match:", match.tournament_id);
      const response = await fetch(`${this.baseUrl}/tournament/find-winner?tournament_id=${match.tournament_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.token}`,
        },
        credentials: "include",
      });
      if (!response.ok) {
        console.error(`Erreur HTTP: ${response.statusText}`);
        return null;
      }
      const data = await response.json();
      if (!data || !data.winner) {
        return null;
      }
      console.log("Gagnant du tournoi trouvé:", data.winner);
      return data.winner;
    } catch (error) {
      console.error("Erreur lors de la recherche du gagnant du tournoi:", error);
      return null;
    }
  }

  // Creer une route pour changer le status du tournoi
  async setTournamentStatus(status: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/tournament/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.token}`,
        },
        credentials: "include",
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        console.error(`Erreur HTTP: ${response.status}`);
        return null;
      }
      const data = await response.json();
      console.log("Statut du tournoi reçu:", data);
      return data.status || null;
    } catch (error) {
      console.error("Erreur lors de la récupération du statut du tournoi:", error);
      return null;
    }
  }

  // Avoir le match a lancer
 async getTournamentMatch(): Promise<any | null> {
  try {
    const response = await fetch(`${this.baseUrl}/tournament/get-match`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.token}`,
      },
      credentials: "include",
    });
    if (!response.ok) {
      console.error(`Erreur HTTP: ${response.status}`);
      return null;
    }
    const data = await response.json();
    console.log("Match du tournoi reçu:", data);
    // Extraire les données du match de la réponse
    return data.match || null;
  } catch (error) {
    console.error("Erreur lors de la récupération du match du tournoi:", error);
    return null;
  }
}

async deleteTournament(tournamentId: number): Promise<boolean> {
  try {
    const response = await fetch(`${this.baseUrl}/tournament/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.token}`,
      },
      credentials: "include",
      body: JSON.stringify({ tournament_id: tournamentId })
    });
    if (!response.ok) {
      console.error(`Erreur HTTP: ${response.status}`);
      return false;
    }
    const result = await response.json();
    console.log("Résultat de la suppression du tournoi:", result);
    return result.success || false;
  } catch (error) {
    console.error("Erreur lors de la suppression du tournoi:", error);
    return false;
  }
}
  // Delete les perdants du tournoi
  async deleteTournamentLosers(match: TournamentMatch): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/tournament/delete-losers`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.token}`,
        },
        credentials: "include",
        body: JSON.stringify(match)
      });
      if (!response.ok) {
        console.error(`Erreur HTTP: ${response.status}`);
        return false;
      }
      const result = await response.json();
      console.log("Résultat de la suppression des perdants du tournoi:", result);
      return result.success || false;
    } catch (error) {
      console.error("Erreur lors de la suppression des perdants du tournoi:", error);
      return false;
    }
  }
  
  // envoyer les scores a chaque fin de match
  async sendMatchResults(match: TournamentMatch): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/tournament/send-match-results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.token}`,
        },
        credentials: "include",
        body: JSON.stringify(match)
      });
      if (!response.ok) {
        console.error(`Erreur HTTP: ${response.statusText}`);
        return false;
      }
      const result = await response.json();
      console.log("Résultat de l'envoi des résultats du match:", result);
      return result.success || false;
    } catch (error) {
      console.error("Erreur lors de l'envoi des résultats du match:", error);
      return false;
    }
  }
}

class TournamentLaunch
{
  private api: TournamentLaunchAPI;
  
  // player_1 et player_2 html element
  private player1_name: HTMLElement | null;
  private player2_name: HTMLElement | null;
  private next_player1_name: HTMLElement | null;
  private next_player2_name: HTMLElement | null;
  private current_round: HTMLElement | null;
  private finalist_name: HTMLElement | null;

  constructor() {
    this.api = new TournamentLaunchAPI();

    // Initialisation des éléments DOM
    document.getElementById('current-round')      // Pour le round actuel
    document.getElementById('player1-name')      // Nom joueur 1
    document.getElementById('player2-name')      // Nom joueur 2
    document.getElementById('next-player1')      // Prochain adversaire 1
    document.getElementById('next-player2')      // Prochain adversaire 2
    document.getElementById('finalist-section')  // Section finaliste
    document.getElementById('finalist-name')     // Nom du finaliste
    document.getElementById('next-game-container') // Conteneur bouton "Prochain match"
  }

  async startTournament() {
    const participants = await this.api.getTournamentDetails();
    if (participants) {
      console.log("Participants du tournoi:", participants);
      // Logique pour démarrer le tournoi
    } else {
      console.error("Aucun participant trouvé ou erreur lors de la récupération des participants.");
    }
  }

  async changeTournamentStatus(status: string) {
    const result = await this.api.setTournamentStatus(status);
    if (result) {
      console.log("Statut du tournoi changé:", status);
      // Logique pour gérer le changement de statut du tournoi
    } else {
      console.error("Erreur lors de la récupération du statut du tournoi.");
    }
  }

  async fetchMatch() {
    const match = await this.api.getTournamentMatch();
    if (match) {
      console.log("Match du tournoi:", match);
      this.player1_name = document.getElementById("player1-name");
      this.player2_name = document.getElementById("player2-name");
      
      // Récupérer les éléments DOM pour les prochains joueurs seulement s'ils existent dans les données
      if (match.next_player_1_name) {
        this.next_player1_name = document.getElementById("next-player1");
      }
      if (match.next_player_2_name) {
        this.next_player2_name = document.getElementById("next-player2");
      }
      if (match.finalist_name) {
        this.finalist_name = document.getElementById("finalist-name");
      }

      // Afficher les noms des joueurs actuels
      if (this.player1_name && this.player2_name) {
        this.player1_name.textContent = match.player_1_name || "Joueur 1"; // ✅ Corrigé
        this.player2_name.textContent = match.player_2_name || "Joueur 2"; // ✅ Corrigé
      }
      
      if (match.round == "finale") {
        console.log("Affichage du match de la finale:");
        this.current_round = document.getElementById("current-round");
        this.current_round.textContent = "Finale";
        const nextOpponentsSection = document.getElementById('next-opponents-section');
        if (nextOpponentsSection) {
          nextOpponentsSection.classList.add('hidden');
        }
        // console.log("Affichage du finaliste:", match.finalist_name);
      }
      // Afficher les prochains adversaires
      else if(match.round == "demi-finale 1") {
        console.log("Affichage des prochains adversaires:", match.next_player_1_name, match.next_player_2_name);
        this.next_player1_name.textContent = match.next_player_1_name || "Prochain adversaire 1"; // ✅ Corrigé
        this.next_player2_name.textContent = match.next_player_2_name || "Prochain adversaire 2"; // ✅ Corrigé
      }
      else if (match.round == "demi-finale 2") {
        console.log("Affichage du prochain adversaire 1:", match.next_player_1_name);
        this.next_player1_name = document.getElementById("next-player1");
        this.next_player1_name.textContent = match.finalist_name || "Finaliste inconnu";
        
      }
      // if (this.next_player1_name && !this.next_player2_name) {
      //   this.next_player1_name.textContent = match.next_player_1_name || "Prochain sera le finaliste"; // ✅ Corrigé
      // }
      
      // Vérifier s'il s'agit du dernier match du tournoi
      const participants = await this.api.getTournamentDetails();
      if (participants && participants.length <= 2) {
        // C'est le dernier match, on prépare l'affichage du bouton "Fin du tournoi"
        console.log("C'est le dernier match du tournoi!");
      }
    } else {
      console.error("Erreur lors de la récupération du match du tournoi.");
    }
  }

  async deleteLosers(match: TournamentMatch) {
    const result = await this.api.deleteTournamentLosers(match);
    if (result) {
      console.log("Perdants du tournoi supprimés:");
      
      // Vérifier s'il ne reste qu'un seul participant (le gagnant du tournoi)
      const participants = await this.api.getTournamentDetails();
      if (participants && participants.length === 1) {
        console.log("Le tournoi est terminé! Affichage du bouton de fin de tournoi.");
        this.showTournamentEndButton(participants[0]);
      }
    } 
} 
  
  // Nouvelle méthode pour afficher le bouton "Fin du tournoi"
  async showTournamentEndButton(winner: TournamentParticipant) {
    // Trouver ou créer le conteneur pour le bouton
    let endButtonContainer = document.getElementById('tournament-end-container');
    
    if (!endButtonContainer) {
      // Créer le conteneur s'il n'existe pas
      endButtonContainer = document.createElement('div');
      endButtonContainer.id = 'tournament-end-container';
      endButtonContainer.className = 'mt-6';
      
      // Créer le bouton
      const endButton = document.createElement('button');
      endButton.id = 'tournament-end-button';
      endButton.className = 'px-6 py-3 bg-[#ff5500] text-white font-bold rounded-lg hover:bg-[#ff7700] transition-colors shadow-lg';
      endButton.style.textShadow = 'none';
      endButton.textContent = 'Fin du tournoi';
      
      // Ajouter un gestionnaire d'événements au bouton
      endButton.addEventListener('click', () => {
        // Rediriger vers la page d'accueil du tournoi
        if (typeof window.SPA !== 'undefined' && window.SPA.navigateTo) {
          window.SPA.navigateTo('/tournoi');
        } else {
          window.location.href = '/tournoi';
        }
      });
      
      // Ajouter le bouton au conteneur
      endButtonContainer.appendChild(endButton);
      
      // Ajouter le conteneur à la page
      const gameContent = document.querySelector('.page-content');
      if (gameContent) {
        gameContent.appendChild(endButtonContainer);
      } else {
        // Si .page-content n'existe pas, ajouter au body
        document.body.appendChild(endButtonContainer);
      }
    } else {
      // Si le conteneur existe déjà, le rendre visible
      endButtonContainer.classList.remove('hidden');
    }
    
    // Afficher un message indiquant le gagnant
    const winnerName = winner.username || winner.alias || 'Joueur inconnu';
    alert(`Félicitations! ${winnerName} a remporté le tournoi!`);
  }
}

export { TournamentParticipant, TournamentMatch, TournamentLaunchAPI, TournamentLaunch };