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
  status: string; // "pending", "in_progress", "completed"
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
      const response = await fetch(`${this.baseUrl}/tournament/find-winner?tournament_id=${match.tournament_id}`, {
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
        console.error(`Erreur HTTP: ${response.status}`);
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

  constructor() {
    this.api = new TournamentLaunchAPI();

    // Initialisation des éléments DOM
    this.player1_name = document.getElementById("player1-name");
    this.player2_name = document.getElementById("player2-name");
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
      console.log("Match du tournoi:", match.player_1_name, match.player_2_name);
      this.player1_name = document.getElementById("player1-name");
      this.player2_name = document.getElementById("player2-name");
      // Logique pour afficher les détails du match
      if (this.player1_name && this.player2_name) {
        this.player1_name.textContent = match.player_1_name.toString();
        this.player2_name.textContent = match.player_2_name.toString();
        console.log("Noms des joueurs mis à jour:", match.player_1_name, match.player_2_name);
      }
    } else {
      console.error("Erreur lors de la récupération du match du tournoi.");
    }
  }

  async deleteLosers(match: TournamentMatch) {
    const result = await this.api.deleteTournamentLosers(match);
    if (result) {
      console.log("Perdants du tournoi supprimés:");
    } else {
      console.error("Erreur lors de la suppression des perdants du tournoi.");
    }
  } 
}

export { TournamentParticipant, TournamentMatch, TournamentLaunchAPI, TournamentLaunch };