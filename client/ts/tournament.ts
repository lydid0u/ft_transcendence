// import i18n from './i18n';

// Interface pour représenter la structure d'un tournoi
export interface Tournament {
  id: number
  creator_name: string
  participants: number
  maxParticipants: number
  status: string // "open", "in_progress", "finished"
  isFull: boolean
  creatorId: number
}

// Format des données reçues du backend
interface ApiTournament {
  id: number
  name: string
  participants: number
  maxParticipants: number
  creatorId: number
}

// Pour la notification
type MessageType = "success" | "error" | "info"

// Classe API pour les tournois
class TournamentAPI {
  private baseUrl: string
  private token: string | null

  constructor(baseUrl = "http://localhost:3000") {
    this.baseUrl = baseUrl
    this.token = localStorage.getItem("jwtToken")
  }

  private async fetchAPI<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.token}`,
        },
        credentials: "include",
      });
      const data = await response.json();
      return data as T;
    } catch (error) {
      throw error;
    }
  }

  async getTournamentList(): Promise<Tournament[]> {
    try {
      const data = await this.fetchAPI<ApiTournament[]>("/tournament/get-open");
      console.log("Tournois récupérés :", data);
      return data.map(t => ({
        ...t,
        isFull: t.participants >= t.maxParticipants
      }));
    } catch (error) {
      return [];
    }
  }

  async joinTournament(tournamentId: string): Promise<{ success: boolean, message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/tournament/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.token}`,
        },
        credentials: "include",
        body: JSON.stringify({ tournamentId : tournamentId }),
      });
      console.log("Réponse du serveur pour rejoindre le tournoi :", response);
      
      const data = await response.json();
      
      if (response.ok) {
        if (window.SPA && window.SPA.navigateTo) {
          window.SPA.navigateTo('/tournamenthome');
        }
        return { success: true, message: data.message || "Tournoi rejoint avec succès" }; 
      }
      
      // Vérifier si l'erreur est liée au créateur
      if (response.status === 400 && data.message && data.message.includes("not the creator")) {
        return { 
          success: false, 
          message: "Seul le créateur du tournoi peut rejoindre ce tournoi" 
        };
      }
      
      return { 
        success: false, 
        message: data.message || "Erreur lors de la tentative de rejoindre le tournoi" 
      }; 

    } catch (error) {
      return { success: false, message: "Erreur pour rejoindre le tournoi" };
    }
  }

 async createTournament(): Promise<{ success: boolean; message?: string; data?: any }> {
  try {
    // Vérifier si le token est disponible
    if (!this.token) {
      return { success: false, message: "Authentification requise" };
    }

      const response = await fetch(`${this.baseUrl}/tournament/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.token}`,
      },
      credentials: "include",
      body: JSON.stringify({}),
    });
    const result = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        message: result.message || `Erreur serveur (${response.status})`
      };
    }

    // La réponse du backend contient { status: 'success', data: { tournamentId } }
    // OU peut aussi être { success: true, ... } si vous avez modifié le backend
    const isSuccess = result.status === 'success' || result.success === true;
    return {
      success: isSuccess,
      message: isSuccess ? "Tournoi créé avec succès" : "Erreur lors de la création du tournoi",
      data: result.data || {}
    };
    //  La réponse du backend contient { status: 'success', data: { tournamentId } }
    // OU peut aussi être { success: true, ... } si vous avez modifié le backend
  } catch (error) {
    console.error("Error creating tournament:", error);
    return { success: false, message: "Erreur de connexion au serveur" };
  }
}
}

// Classe pour l'affichage de la liste des tournois
class TournamentListApp {
  private tournaments: Tournament[] = []
  private api: TournamentAPI

  // DOM
  private tournamentList: HTMLElement | null
  private loadingState: HTMLElement | null
  private emptyState: HTMLElement | null
  private messageContainer: HTMLElement | null
  private createTournamentBtn: HTMLElement | null

  constructor() {
    this.api = new TournamentAPI()
    this.tournamentList = document.getElementById("tournament-list")
    this.loadingState = document.getElementById("loading-state")
    this.emptyState = document.getElementById("empty-state")
    this.messageContainer = document.getElementById("message-container")
    this.createTournamentBtn = document.getElementById("create-tournament-btn")
    
    this.init()
  }

  private init(): void {
    if (!this.tournamentList || !this.loadingState || !this.emptyState) return
    
    // Ajout de l'écouteur d'événement pour le bouton de création de tournoi
    if (this.createTournamentBtn) {
      this.createTournamentBtn.addEventListener("click", () => {
        this.handleCreateTournament()
      })
    }
    
    this.loadTournamentList()
  }

  private async loadTournamentList(): Promise<void> {
    try {
      if (this.loadingState) this.loadingState.style.display = "block"
      if (this.emptyState) this.emptyState.style.display = "none"
      this.tournaments = await this.api.getTournamentList()
      this.renderTournamentList()
      if (this.loadingState) this.loadingState.style.display = "none"
      if (this.emptyState) this.emptyState.style.display = this.tournaments.length === 0 ? "block" : "none"
    } catch (error) {
      this.showNotification("Impossible de charger les tournois")
      if (this.loadingState) this.loadingState.style.display = "none"
    }
  }

  private renderTournamentList(): void {
    if (!this.tournamentList) return
    if (this.tournaments.length === 0) {
      this.tournamentList.innerHTML = ""
      if (this.emptyState) this.emptyState.style.display = "block"
      return
    }
    if (this.emptyState) this.emptyState.style.display = "none"
    this.tournamentList.innerHTML = this.tournaments.map(tournament => {
      const buttonDisabled = tournament.isFull ? "disabled" : ""
      const buttonText = tournament.isFull ? "Complet" : "Rejoindre"
      const buttonClass = tournament.isFull
        ? "px-4 py-2 bg-stone-500 text-white rounded-lg cursor-not-allowed"
        : "px-4 py-2 bg-[#1a1a1a] text-[#e6fdff] rounded hover:bg-[#222] transition-colors shadow-[0_0_10px_rgba(134,231,255,0.2)] hover:shadow-[0_0_15px_rgba(134,231,255,0.4)]"

      return `
        <div class="flex items-center justify-between p-4 bg-[#111] bg-opacity-40 backdrop-blur-sm rounded shadow-[0_0_10px_rgba(134,231,255,0.2)] mb-2">
        <div>
          <h3 class="font-bold text-[#e6fdff]">${tournament.creator_name}</h3>
          <p class="text-sm text-[#b3f0ff]">Statut: ${tournament.status}</p>
        </div>
          <button 
            class="${buttonClass}" 
            data-tournament-id="${tournament.id}" 
            ${buttonDisabled}
          >${buttonText}</button>
        </div>
      `
    }).join("")

    this.tournamentList.querySelectorAll("button[data-tournament-id]").forEach(btn => {
      btn.addEventListener("click", (event) => {
        const btnEl = event.currentTarget as HTMLButtonElement
        const tournamentId = btnEl.dataset.tournamentId
        if (tournamentId && !btnEl.disabled) {
          this.handleJoinTournament(tournamentId, btnEl)
        }
      })
    })
  }

  private async handleJoinTournament(tournamentId: string, btnEl: HTMLButtonElement): Promise<void> {
    btnEl.disabled = true
    btnEl.textContent = "..."
    const result = await this.api.joinTournament(tournamentId)
    if (result.success) {
      this.showNotification(window.i18n.translate('tournament.join_success'), "success")
      console.log("Tournoi rejoint avec succès :", tournamentId)
      if (typeof window.SPA !== 'undefined' && window.SPA.navigateTo) {
            window.SPA.navigateTo('/tournamenthome');
          } else {
            window.location.href = '/tournamenthome';
          }
    } else {
      this.showNotification(result.message || window.i18n.translate('tournament.join_error'), "error")
      btnEl.disabled = false
      btnEl.textContent = window.i18n.translate('tournament.join')
    }
  }

  private async handleCreateTournament(): Promise<void> {
    if (!this.createTournamentBtn) return
    
    // Désactiver le bouton pendant la création
    const originalText = this.createTournamentBtn.textContent || window.i18n.translate('tournament.create')
    this.createTournamentBtn.textContent = window.i18n.translate('tournament.creating')
    this.createTournamentBtn.classList.add("opacity-50", "cursor-not-allowed")
    
    try {
      const result = await this.api.createTournament()
      
      if (result.success) {
        this.showNotification(window.i18n.translate('tournament.create_success'),  "success")

        // Redirection vers la page de gestion du tournoi
        setTimeout(() => {
          if (typeof window.SPA !== 'undefined' && window.SPA.navigateTo) {
            window.SPA.navigateTo('/tournamenthome');
          } else {
            window.location.href = '/tournamenthome';
          }
        }, 1000);
      } else {
        this.showNotification(result.message || window.i18n.translate('tournament.create_error'), "error")
      }
    } catch (error) {
      this.showNotification(window.i18n.translate('common.error'), "error")
    } finally {
      // Réactiver le bouton
      this.createTournamentBtn.textContent = originalText
      this.createTournamentBtn.classList.remove("opacity-50", "cursor-not-allowed")
    }
  }

  private showNotification(message: string, type: MessageType = "error"): void {
    if (!this.messageContainer) {
      alert(message)
      return
    }
    const notification = document.createElement("div")
    notification.className = `p-4 mb-4 rounded-lg ${type === 'error' ? 'bg-red-500' : 'bg-blue-500'} text-white`
    notification.textContent = message
    this.messageContainer.appendChild(notification)
    setTimeout(() => notification.remove(), 3000)
  }
}

// Fonction globale pour afficher la liste des tournois
function displayTournamentList(): void {
  setTimeout(() => new TournamentListApp(), 100)
}

// Déclaration globale
declare global {
  interface Window {
    displayTournamentList: () => void;
  }
}

// Exposer au scope global
if (typeof window !== "undefined") {
  window.displayTournamentList = displayTournamentList
}

export { TournamentListApp, TournamentAPI, displayTournamentList };
