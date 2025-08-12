interface TournamentParticipant {
  tournament_id: number;
  user_id: number;
  username?: string;
  alias?: string;
  success?: boolean;
}

class TournamentHomeAPI {
  private baseUrl: string;
  private token: string | null;

  constructor(baseUrl = "/api") {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem("jwtToken");
  }

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
      // console.error("Erreur lors de l'ajout du joueur:", error);
      return { success: false, message: "Erreur de connexion au serveur" };
    }
  }

  async addPlayerByEmail(tournamentId: number, email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/tournament/add-player-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.token}`,
        },
        credentials: "include",
        body: JSON.stringify({ tournamentId, email }),
      });
      const result = await response.json();
      return {
        success: response.ok,
        message: result.message || (response.ok ? "Joueur ajouté avec succès" : "Erreur lors de l'ajout du joueur")
      };
    } catch (error) {
      // console.error("Erreur lors de l'ajout du joueur:", error);
      return { success: false, message: "Erreur de connexion au serveur" };
    }
  }

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
      // console.error("Erreur lors du lancement du tournoi:", error);
      return { success: false, message: "Erreur de connexion au serveur" };
    }
  }
}

class TournamentHomeApp {
  private api: TournamentHomeAPI;
  private tournamentId: number | null = null;
  
  private playerListElement: HTMLElement | null;
  private addPlayerBtn: HTMLElement | null;
  private playerNameInput: HTMLInputElement | null;
  private tournamentStartBtn: HTMLElement | null;
  private messageContainer: HTMLElement | null;
  private tournamentQuitBtn: HTMLElement | null;
  private loginPlayerBtn: HTMLElement | null;
  private playerLoginForm: HTMLElement | null;
  private playerLoginEmail: HTMLInputElement | null;
  private playerLoginPassword: HTMLInputElement | null;
  private playerLoginSubmit: HTMLElement | null;
  private playerLoginCancel: HTMLElement | null;

  constructor() {
    this.api = new TournamentHomeAPI();
    
    this.playerListElement = document.getElementById("player-list");
    this.addPlayerBtn = document.getElementById("add-player-btn");
    this.playerNameInput = document.getElementById("player-name") as HTMLInputElement;
    this.tournamentStartBtn = document.getElementById("tournament-start-btn");
    this.messageContainer = document.getElementById("message-container");
    this.tournamentQuitBtn = document.getElementById("tournament-quit-btn");
    this.loginPlayerBtn = document.getElementById("login-player-btn");
    this.playerLoginForm = document.getElementById("player-login-form");
    this.playerLoginEmail = document.getElementById("player-login-email") as HTMLInputElement;
    this.playerLoginPassword = document.getElementById("player-login-password") as HTMLInputElement;
    this.playerLoginSubmit = document.getElementById("player-login-submit");
    this.playerLoginCancel = document.getElementById("player-login-cancel");

    this.init();
  }

  private setupEventListeners(): void {
    if (this.addPlayerBtn) {
        // console.log("Add Player Button found");
      this.addPlayerBtn.addEventListener("click", () => this.handleAddPlayer());
    }
    if (this.tournamentStartBtn) {
      this.tournamentStartBtn.addEventListener("click", () => {
        this.validateTournamentAccess();
      });
    }
    if (this.tournamentQuitBtn){
      this.tournamentQuitBtn.addEventListener("click", () => this.deleteTournament());
    }
    if (this.loginPlayerBtn) {
      this.loginPlayerBtn.addEventListener("click", () => this.loginPlayerTournament());
    }
    if (this.playerLoginSubmit) {
  this.playerLoginSubmit.addEventListener("click", () => this.handlePlayerLogin());
    }
    if (this.playerLoginCancel) {
      this.playerLoginCancel.addEventListener("click", () => {
    if (this.playerLoginForm)
      this.playerLoginForm.classList.add("hidden");
    });
  }
}

  private async init(): Promise<void> {
    const tournamentDetails = await this.api.getTournamentDetails();
    
    
    
    this.tournamentId = (tournamentDetails && tournamentDetails.length > 0) ? tournamentDetails[0].tournament_id : null;
    // console.log("DETAILS DU TOURNOI:", tournamentDetails);
    this.renderParticipants(tournamentDetails || []);
    
    this.setupEventListeners();
  }

  private renderParticipants(participants: TournamentParticipant[]): void {
    // console.log("Rendering participants:", participants);
    if (!this.playerListElement) return;
    
    if (participants.length === 0) {
      this.playerListElement.innerHTML = "<p class='text-center text-gray-500'>Aucun joueur inscrit pour le moment</p>";
      return;
    }
    
    this.playerListElement.innerHTML = participants.map(participant => {
      const displayName = participant.username || participant.alias ||
                         (participant.user_id ? `Joueur #${participant.user_id}` : 'Joueur inconnu');
      
      return `
      <div class="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow transition-all">
        <div class="flex items-center">
          <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
            ${displayName.charAt(0).toUpperCase()}
          </div>
          <span class="ml-3 text-gray-800 font-medium">${displayName}</span>
        </div>
        <div class="text-sm text-gray-500">
          Participant
        </div>
      </div>
      `;
    }).join("");
  }

  private async deleteTournament(): Promise<void> {
    if (!this.tournamentId) return;
    try {
      const response = await fetch(`/api/tournament/delete`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`
        },
        credentials: "include",
      });

      if (response.ok) {
        this.showMessage("Tournoi supprimé avec succès", "success");
        window.location.href = '/home';
      } else {
        const errorData = await response.json();
        this.showMessage(errorData.message || "Erreur lors de la suppression du tournoi", "error");
      }
    } catch (error) {
      // console.error("Erreur lors de la suppression du tournoi:", error);
      this.showMessage("Erreur de connexion au serveur", "error");
    }
  }

  private loginPlayerTournament(): void {
  if (!this.playerLoginForm) return;
  this.playerLoginForm.classList.remove("hidden");
}

private async handlePlayerLogin(): Promise<void> {
  if (!this.playerLoginEmail || !this.playerLoginPassword) return;
  const email = this.playerLoginEmail.value.trim();
  const password = this.playerLoginPassword.value;

  if (!email || !password) {
    this.showMessage("Veuillez remplir tous les champs", "error");
    return;
  }

  this.showMessage(`Tentative de connexion pour ${email}...`, "info");
  const response = await fetch("/api/tournament/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`
    },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (data.success === true) {

    // console.log("Connexion réussie:", data.data.email);
    
    if (!this.tournamentId) {
      this.showMessage("Erreur: Tournoi non trouvé", "error");
      if (this.playerLoginForm) this.playerLoginForm.classList.add("hidden");
      return;
    }
    
    try {
      const result = await this.api.addPlayerByEmail(this.tournamentId, data.data.email);
      if (result.success) {
        this.showMessage(`Joueur "${data.data.email}" ajouté avec succès!`, "success");
        
        const updatedParticipants = await this.api.getTournamentDetails();
        if (updatedParticipants) {
          this.renderParticipants(updatedParticipants);
        }
      } else {
        this.showMessage(result.message, "error");
      }
    } catch (error) {
      // console.error("Erreur lors de l'ajout du joueur:", error);
      this.showMessage("Erreur lors de l'ajout du joueur au tournoi", "error");
    }
  } else {
    // console.log("Erreur de connexion:", data.message);
    this.showMessage(data.message || "Veuillez réessayer", "error");
  }
  if (this.playerLoginForm) this.playerLoginForm.classList.add("hidden");
}

  private async handleAddPlayer(): Promise<void> {
    if (!this.playerNameInput || !this.tournamentId) return;
    
    const alias = this.playerNameInput.value.trim();
    
    if (!alias) {
      this.showMessage("Veuillez entrer un nom de joueur", "error");
      return;
    }
    const participants = await this.api.getTournamentDetails();
    const existingParticipant = participants?.find(p => p.username === alias || p.alias === alias);
    if (existingParticipant) {
      this.showMessage(`Le joueur "${alias}" est déjà inscrit`, "error");
      this.playerNameInput.value = "";
      return;
    }

    if (participants && participants.length >= 4) {
      this.showMessage("Le tournoi est complet, vous ne pouvez pas ajouter plus de joueurs", "error");
      this.playerNameInput.value = "";
      return;
    }
    const result = await this.api.addPlayerByAlias(this.tournamentId, alias);
    
    if (result.success) {
      this.showMessage(`Joueur "${alias}" ajouté avec succès!`, "success");
      
      const updatedParticipants = await this.api.getTournamentDetails();
      if (updatedParticipants) {
        this.renderParticipants(updatedParticipants);
      }
    } else {
      this.showMessage(result.message, "error");
    }
    
    this.playerNameInput.value = "";
  }
  
  private async validateTournamentAccess(): Promise<void> {
    if (!this.tournamentId) {
      this.showMessage("Erreur: Aucun tournoi actif trouvé", "error");
      return;
    }
    
    const participants = await this.api.getTournamentDetails();
    if (!participants || participants.length < 2) {
      this.showMessage("Le tournoi doit avoir au moins 2 participants pour être lancé", "error");
      return;
    }
    
    this.showMessage("Lancement du tournoi...", "success");
    setTimeout(() => {
      if (typeof window.SPA !== 'undefined' && window.SPA.navigateTo) {
        window.SPA.navigateTo('/game1v1Tournament');
      } else {
        window.location.href = '/game1v1Tournament';
      }
    }, 1000);
  }

  private async handleLaunchTournament(): Promise<void> {
    if (!this.tournamentId) return;
    
    const result = await this.api.launchTournament(this.tournamentId);
    
    if (result.success) {
      this.showMessage("Tournoi lancé avec succès! Redirection...", "success");
      
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
    
    setTimeout(() => {
      if (notification.parentNode === this.messageContainer) {
        notification.remove();
      }
    }, 3000);
  }
}

function initTournamentHome(): void {
  new TournamentHomeApp();
}

declare global {
  interface Window {
    initTournamentHome: () => void;
    SPA?: any;
  }
}

if (typeof window !== "undefined") {
  window.initTournamentHome = initTournamentHome;
}

export { initTournamentHome };
