interface TournamentParticipant {
  tournament_id: number;
  user_id: number;  
  username?: string;
  alias?: string; 
  success?: boolean;
}

interface TournamentMatch {
  tournament_id: number;
  player1_name: string;
  player2_name: string;
  player1_score: number;
  player2_score: number;
  winner_id: number;
  next_player1_name?: string;
  next_player2_name?: string;
  finalist_name?: string;
  status: string;
  round: string;
  created_at: string;
  updated_at: string;
}


class TournamentLaunchAPI {
  private baseUrl: string;
  private token: string | null;

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem("jwtToken");
  }

  async getTournamentDetails(): Promise<TournamentParticipant[] | null> {
    if (await window.SPA.checkJwtValidity()) {
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
          // console.error(`Erreur HTTP: ${response.status}`);
          return null;
        }

        const data = await response.json();
        // console.log("Données brutes reçues:", data);

        if (data && data.participants && Array.isArray(data.participants)) {
          return data.participants;
        }

        if (Array.isArray(data)) {
          return data;
        }

        return [];
      } catch (error) {
        // console.error("Erreur lors de la récupération des détails du tournoi:", error);
        return null;
      }
    }
  }

  async findWinnerOfTournament(match: TournamentMatch): Promise<TournamentParticipant | null> {
    if (await window.SPA.checkJwtValidity()) {
      try {
        // console.log("Recherche du gagnant du tournoi pour le match:", match.tournament_id);
        const response = await fetch(`${this.baseUrl}/tournament/find-winner?tournament_id=${match.tournament_id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.token}`,
          },
          credentials: "include",
        });
        if (!response.ok) {
          // console.error(`Erreur HTTP: ${response.statusText}`);
          return null;
        }
        const data = await response.json();
        if (!data) {
          return null;
        }
        // console.log("Gagnant du tournoi trouvé:", data);
        return data.winner;
      } catch (error) {
        // console.error("Erreur lors de la recherche du gagnant du tournoi:", error);
        return null;
      }
    }
  }

  async setTournamentStatus(status: string): Promise<string | null> {
    if (await window.SPA.checkJwtValidity()) {
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
          // console.error(`Erreur HTTP: ${response.status}`);
          return null;
        }
        const data = await response.json();
        // console.log("Statut du tournoi reçu:", data);
        return data.status || null;
      } catch (error) {
        // console.error("Erreur lors de la récupération du statut du tournoi:", error);
        return null;
      }
    }
  }

  async getTournamentMatch(): Promise<any | null> {
    if (await window.SPA.checkJwtValidity()) {
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
          // console.error(`Erreur HTTP: ${response.status}`);
          return null;
        }
        const data = await response.json();
        // console.log("Match du tournoi reçu:", data);
        return data.match || null;
      } catch (error) {
        // console.error("Erreur lors de la récupération du match du tournoi:", error);
        return null;
      }
    }
  }

  async deleteTournament(tournamentId: number): Promise<boolean> {
    if (await window.SPA.checkJwtValidity()) {
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
          // console.error(`Erreur HTTP: ${response.status}`);
          return false;
        }
        const result = await response.json();
        // console.log("Résultat de la suppression du tournoi:", result);
        return result.success || false;
      } catch (error) {
        // console.error("Erreur lors de la suppression du tournoi:", error);
        return false;
      }
    }
  }
  async deleteTournamentLosers(match: TournamentMatch): Promise<boolean> {
    if (await window.SPA.checkJwtValidity()) {
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
          // console.error(`Erreur HTTP: ${response.status}`);
          return false;
        }
        const result = await response.json();
        // console.log("Résultat de la suppression des perdants du tournoi:", result);
        return result.success || false;
      } catch (error) {
        // console.error("Erreur lors de la suppression des perdants du tournoi:", error);
        return false;
      }
    }
  }

  async sendMatchResults(match: TournamentMatch): Promise<boolean> {
    if (await window.SPA.checkJwtValidity()) {
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
          // console.error(`Erreur HTTP: ${response.statusText}`);
          return false;
        }
        const result = await response.json();
        // console.log("Résultat de l'envoi des résultats du match:", result);
        return result.success || false;
      } catch (error) {
        // console.error("Erreur lors de l'envoi des résultats du match:", error);
        return false;
      }
    }
  }
}

class TournamentLaunch {
  private api: TournamentLaunchAPI;

  private player1_name: HTMLElement | null;
  private player2_name: HTMLElement | null;
  private next_player1_name: HTMLElement | null;
  private next_player2_name: HTMLElement | null;
  private current_round: HTMLElement | null;
  private finalist_name: HTMLElement | null;

  constructor() {
    this.api = new TournamentLaunchAPI();

    document.getElementById('current-round')
    document.getElementById('player1-name')
    document.getElementById('player2-name')
    document.getElementById('next-player1')
    document.getElementById('next-player2')
    document.getElementById('finalist-section')
    document.getElementById('finalist-name')
    document.getElementById('next-game-container')
  }

  async startTournament() {
    const participants = await this.api.getTournamentDetails();
    if (participants) {
      // console.log("Participants du tournoi:", participants);
    } else {
      // console.error("Aucun participant trouvé ou erreur lors de la récupération des participants.");
    }
  }

  async changeTournamentStatus(status: string) {
    const result = await this.api.setTournamentStatus(status);
    if (result) {
      // console.log("Statut du tournoi changé:", status);
    } else {
      // console.error("Erreur lors de la récupération du statut du tournoi.");
    }
  }

  async fetchMatch() {
    const match = await this.api.getTournamentMatch();
    if (match) {
      // console.log("Match du tournoi:", match);
      this.player1_name = document.getElementById("player1-name");
      this.player2_name = document.getElementById("player2-name");

      if (match.next_player_1_name) {
        this.next_player1_name = document.getElementById("next-player1");
      }
      if (match.next_player_2_name) {
        this.next_player2_name = document.getElementById("next-player2");
      }
      if (match.finalist_name) {
        this.finalist_name = document.getElementById("finalist-name");
      }

      if (this.player1_name && this.player2_name) {
        this.player1_name.textContent = match.player_1_name || "Joueur 1";
        this.player2_name.textContent = match.player_2_name || "Joueur 2";
      }

      if (match.round == "finale") {
        // console.log("Affichage du match de la finale:");
        this.current_round = document.getElementById("current-round");
        this.current_round.textContent = "Finale";
        const nextOpponentsSection = document.getElementById('next-opponents-section');
        if (nextOpponentsSection) {
          nextOpponentsSection.classList.add('hidden');
        }
      }
      else if (match.round == "demi-finale 1") {
        // console.log("Affichage des prochains adversaires:", match.next_player_1_name, match.next_player_2_name);
        this.next_player1_name.textContent = match.next_player_1_name || "Prochain adversaire 1";
      }
      else if (match.round == "demi-finale 2") {
        // console.log("Affichage du prochain adversaire 1:", match.next_player_1_name);
        // this.next_player1_name = document.getElementById("next-player1");
        this.next_player1_name.textContent = match.finalist_name || "Finaliste inconnu";

      }

      const participants = await this.api.getTournamentDetails();
      if (participants && participants.length <= 2) {
        // console.log("C'est le dernier match du tournoi!");
      }
    } else {
      // console.error("Erreur lors de la récupération du match du tournoi.");
    }
  }

  async deleteLosers(match: TournamentMatch) {
    const result = await this.api.deleteTournamentLosers(match);
    if (result) {
      // console.log("Perdants du tournoi supprimés:");

      const participants = await this.api.getTournamentDetails();
      if (participants && participants.length === 1) {
        // console.log("Le tournoi est terminé! Affichage du bouton de fin de tournoi.");
        this.showTournamentEndButton(participants[0]);
      }
    }
  }

  async showTournamentEndButton(winner: TournamentParticipant) {
    let endButtonContainer = document.getElementById('tournament-end-container');
    // console.log("Affichage du bouton de fin de tournoi pour le gagnant:", winner);

    if (!endButtonContainer) {
      endButtonContainer = document.createElement('div');
      endButtonContainer.id = 'tournament-end-container';
      endButtonContainer.className = 'mt-6';

      const winnerName = winner.username || winner.alias || 'Joueur inconnu';

      const winnerDisplay = document.createElement('div');
      winnerDisplay.id = 'tournament-winner-display';
      winnerDisplay.className = 'text-2xl font-bold text-center mb-4 p-3 bg-[#f3f3f3] rounded-lg';
      winnerDisplay.textContent = `Vainqueur du tournoi : ${winnerName}`;

      endButtonContainer.appendChild(winnerDisplay);

      const endButton = document.createElement('button');
      endButton.id = 'tournament-end-button';
      endButton.className = 'px-6 py-3 bg-[#ff5500] text-white font-bold rounded-lg hover:bg-[#ff7700] transition-colors shadow-lg';
      endButton.style.textShadow = 'none';
      endButton.textContent = 'Fin du tournoi';

      endButton.addEventListener('click', () => {
        if (typeof window.SPA !== 'undefined' && window.SPA.navigateTo) {
          window.SPA.navigateTo('/tournoi');
        } else {
          window.location.href = '/tournoi';
        }
      });

      endButtonContainer.appendChild(endButton);

      const gameContent = document.querySelector('.page-content');
      if (gameContent) {
        gameContent.appendChild(endButtonContainer);
      } else {
        document.body.appendChild(endButtonContainer);
      }
    } else {
      endButtonContainer.classList.remove('hidden');
    }
  }
}

export { TournamentParticipant, TournamentMatch, TournamentLaunchAPI, TournamentLaunch };