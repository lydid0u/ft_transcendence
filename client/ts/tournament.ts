// Interface simplifiée pour un tournoi
interface Tournament {
  id: string
  name: string
  participants: number
  maxParticipants: number
  isFull: boolean
  creatorId: number
}

// Format des données reçues du backend
interface ApiTournament {
  id: string
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
        body: JSON.stringify({ tournament_id: tournamentId }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: "Erreur pour rejoindre le tournoi" };
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

  constructor() {
    this.api = new TournamentAPI()
    this.tournamentList = document.getElementById("tournament-list")
    this.loadingState = document.getElementById("loading-state")
    this.emptyState = document.getElementById("empty-state")
    this.messageContainer = document.getElementById("message-container")
    this.init()
  }

  private init(): void {
    if (!this.tournamentList || !this.loadingState || !this.emptyState) return
    this.loadTournamentList()
  }

  private async loadTournamentList(): Promise<void> {
    try {
      if (this.loadingState) this.loadingState.style.display = "block"
      if (this.emptyState) this.emptyState.style.display = "none"
      this.tournaments = await this.api.getTournamentList()
      console.log("Tournois chargés :", this.tournaments)
      this.renderTournamentList()
      if (this.loadingState) this.loadingState.style.display = "none"
      if (this.emptyState) this.emptyState.style.display = this.tournaments.length === 0 ? "block" : "none"
    } catch (error) {
      this.showNotification("Impossible de charger les tournois")
      if (this.loadingState) this.loadingState.style.display = "none"
    }
  }

  private renderTournamentList(): void {
    console.log("Rendu de la liste des tournois :", this.tournaments)
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
            <h3 class="font-bold text-[#e6fdff]">${tournament.name}</h3>
            <p class="text-sm text-[#b3f0ff]">${tournament.participants}/${tournament.maxParticipants} participants</p>
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
      this.showNotification("Inscrit au tournoi !", "success")
      await this.loadTournamentList()
    } else {
      this.showNotification(result.message || "Erreur d'inscription", "error")
      btnEl.disabled = false
      btnEl.textContent = "Rejoindre"
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