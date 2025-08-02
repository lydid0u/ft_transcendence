// Interface pour les participants du tournoi
interface TournamentParticipant {
  tournament_id: number;
  user_id: number;   // Changé de userId à user_id pour correspondre à la réponse API
  username?: string; // Rendu optionnel car peut ne pas être présent
}

// Classe API pour gérer les interactions avec le backend pour le tournoi
class TournamentHomeAPI {
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

  // Méthode pour ajouter un joueur au tournoi par son alias
  async addPlayerByAlias(tournamentId: number, alias: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/tournament/add-player-alias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.token}`,
        },
        credentials: "include",
        body: JSON.stringify({ tournamentId, alias }),
      });

      const result = await response.json();
      return {
        success: response.ok,
        message: result.message || (response.ok ? "Joueur ajouté avec succès" : "Erreur lors de l'ajout du joueur")
      };
    } catch (error) {
      console.error("Erreur lors de l'ajout du joueur:", error);
      return { success: false, message: "Erreur de connexion au serveur" };
    }
  }

  // Méthode pour lancer le tournoi
  async launchTournament(tournamentId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/tournament/launch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.token}`,
        },
        credentials: "include",
        body: JSON.stringify({ tournamentId }),
      });

      const result = await response.json();
      return {
        success: response.ok,
        message: result.message || (response.ok ? "Tournoi lancé avec succès" : "Erreur lors du lancement du tournoi")
      };
    } catch (error) {
      console.error("Erreur lors du lancement du tournoi:", error);
      return { success: false, message: "Erreur de connexion au serveur" };
    }
  }
}

// Classe pour gérer l'interface utilisateur de la page tournamenthome
class TournamentHomeApp {
  private api: TournamentHomeAPI;
  private tournamentId: number | null = null;
  
  // Éléments DOM
  private playerListElement: HTMLElement | null;
  private addPlayerBtn: HTMLElement | null;
  private playerNameInput: HTMLInputElement | null;
  private tournamentStartBtn: HTMLElement | null;
  private messageContainer: HTMLElement | null;

  constructor() {
    this.api = new TournamentHomeAPI();
    
    // Initialisation des éléments DOM
    this.playerListElement = document.getElementById("player-list");
    this.addPlayerBtn = document.getElementById("add-player-btn");
    this.playerNameInput = document.getElementById("player-name") as HTMLInputElement;
    this.tournamentStartBtn = document.getElementById("tournament-start-btn");
    this.messageContainer = document.getElementById("message-container");
    
    this.init();
  }

  private async init(): Promise<void> {
    // Récupération des détails du tournoi
    const tournamentDetails = await this.api.getTournamentDetails();
    
    
    
    this.tournamentId = (tournamentDetails && tournamentDetails.length > 0) ? tournamentDetails[0].tournament_id : null;
    console.log("DETAILS DU TOURNOI:", tournamentDetails);
    // Affichage des participants
    this.renderParticipants(tournamentDetails || []);
    
    // Configuration des écouteurs d'événements
    this.setupEventListeners();
  }

  private renderParticipants(participants: TournamentParticipant[]): void {
    console.log("Rendering participants:", participants);
    if (!this.playerListElement) return;
    
    if (participants.length === 0) {
      this.playerListElement.innerHTML = "<p class='text-center text-[#b3f0ff]'>Aucun joueur inscrit pour le moment</p>";
      return;
    }
    
    this.playerListElement.innerHTML = participants.map(participant => {
      // Déterminer quel nom afficher (username si disponible, sinon user_id)
      const displayName = participant.username || 
                         (participant.user_id ? `Joueur #${participant.user_id}` : 'Joueur inconnu');
      
      return `
      <div class="flex items-center justify-between p-4 bg-[#111] bg-opacity-40 backdrop-blur-sm rounded shadow-[0_0_10px_rgba(134,231,255,0.2)] mb-2">
        <div class="flex items-center">
          <span class="text-[#e6fdff] font-medium">${displayName}</span>
        </div>
      </div>
      `;
    }).join("");
  }

  private setupEventListeners(): void {
    // Écouteur pour le bouton d'ajout de joueur
    if (this.addPlayerBtn) {
        console.log("Add Player Button found");
      this.addPlayerBtn.addEventListener("click", () => this.handleAddPlayer());
    }
    
    // Écouteur pour le bouton de lancement du tournoi
    if (this.tournamentStartBtn) {
      this.tournamentStartBtn.addEventListener("click", () => this.handleLaunchTournament());
    }
  }

  private async handleAddPlayer(): Promise<void> {
    if (!this.playerNameInput || !this.tournamentId) return;
    
    const alias = this.playerNameInput.value.trim();
    
    if (!alias) {
      this.showMessage("Veuillez entrer un nom de joueur", "error");
      return;
    }
    
    // Appel de l'API pour ajouter un joueur
    const result = await this.api.addPlayerByAlias(this.tournamentId, alias);
    
    if (result.success) {
      this.showMessage(`Joueur "${alias}" ajouté avec succès!`, "success");
      
      // Recharger la liste des participants
      const updatedParticipants = await this.api.getTournamentDetails();
      if (updatedParticipants) {
        this.renderParticipants(updatedParticipants);
      }
    } else {
      this.showMessage(result.message, "error");
    }
    
    // Réinitialisation du champ de saisie
    this.playerNameInput.value = "";
  }

  private async handleLaunchTournament(): Promise<void> {
    if (!this.tournamentId) return;
    
    // Appel de l'API pour lancer le tournoi
    const result = await this.api.launchTournament(this.tournamentId);
    
    if (result.success) {
      this.showMessage("Tournoi lancé avec succès! Redirection...", "success");
      
      // Redirection vers la page du tournoi après un court délai
      setTimeout(() => {
        if (typeof window.SPA !== 'undefined' && window.SPA.navigateTo) {
          window.SPA.navigateTo('/tournament-game');
        } else {
          window.location.href = '/tournament-game';
        }
      }, 2000);
    } else {
      this.showMessage(result.message, "error");
    }
  }

  private showMessage(message: string, type: "success" | "error" | "info" = "info"): void {
    if (!this.messageContainer) return;
    
    const colorClass = type === "success" ? "bg-blue-500" : 
                       type === "error" ? "bg-red-500" : 
                       "bg-[#1a1a1a]";
    
    const notification = document.createElement("div");
    notification.className = `p-4 mb-4 rounded-lg ${colorClass} text-white`;
    notification.textContent = message;
    
    this.messageContainer.innerHTML = "";
    this.messageContainer.appendChild(notification);
    
    // Disparition automatique après 3 secondes
    setTimeout(() => {
      if (notification.parentNode === this.messageContainer) {
        notification.remove();
      }
    }, 3000);
  }
}

// Fonction d'initialisation pour la page tournamenthome
function initTournamentHome(): void {
  new TournamentHomeApp();
}

// Rendre la fonction accessible globalement
declare global {
  interface Window {
    initTournamentHome: () => void;
    SPA: any;
  }
}

if (typeof window !== "undefined") {
  window.initTournamentHome = initTournamentHome;
}

export { initTournamentHome };
