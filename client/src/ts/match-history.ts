interface Match {
  id: number
  date: string
  player1_id: number
  player2_id: number
  player1_name?: string
  player2_name?: string
  score_player1: number
  score_player2: number
  winner_id: number
  result?: 'Win' | 'Loss' // Pour faciliter l'affichage
}

interface MatchStats {
  gamesPlayed: number
  wins: number
  losses: number
  winrate: number
  matchHistory: Match[]
}

interface ApiResponse {
  status: string
  message?: string
}

type MessageType = "success" | "error" | "info"

class MatchHistoryAPI {
  private baseUrl: string

  constructor(baseUrl = "http://localhost:3000") {
    this.baseUrl = baseUrl
  }

  async getMatchHistory(): Promise<MatchStats> {
    try {
      const token = localStorage.getItem("jwtToken");
      
      const response = await fetch(`${this.baseUrl}/history-details`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
      });
      
      const responseText = await response.text();
      console.log("Server match history response:", responseText);
      
      // Parse la réponse à nouveau car .text() a déjà consommé le body
      return JSON.parse(responseText);
    } catch (error) {
      console.error("Error fetching match history:", error);
      throw new Error(`HTTP error! status: 999`);
    }
  }
}

class MatchHistoryApp {
  private matchStats: MatchStats | null = null
  private api: MatchHistoryAPI
  private winrateChart: any // Chart.js instance

  // DOM Elements
  private gamesPlayed: HTMLElement
  private winsCount: HTMLElement
  private lossesCount: HTMLElement
  private winratePercent: HTMLElement
  private winrateChartEl: HTMLCanvasElement
  private matchCount: HTMLElement
  private matchesList: HTMLElement
  private loadingState: HTMLDivElement
  private emptyState: HTMLDivElement
  private messageContainer: HTMLDivElement

  constructor() {
    this.api = new MatchHistoryAPI()

    // Initialize DOM elements
    this.gamesPlayed = document.getElementById("games-played") as HTMLElement
    this.winsCount = document.getElementById("wins-count") as HTMLElement
    this.lossesCount = document.getElementById("losses-count") as HTMLElement
    this.winratePercent = document.getElementById("winrate-percent") as HTMLElement
    this.winrateChartEl = document.getElementById("winrateChart") as HTMLCanvasElement
    this.matchCount = document.getElementById("match-count") as HTMLElement
    this.matchesList = document.getElementById("matches-list") as HTMLElement
    this.loadingState = document.getElementById("loading-state") as HTMLDivElement
    this.emptyState = document.getElementById("empty-state") as HTMLDivElement
    this.messageContainer = document.getElementById("message-container") as HTMLDivElement

    this.init()
  }
   private init(): void {
    // Vérifier si les éléments DOM existent
    if (!this.gamesPlayed || !this.winsCount || !this.lossesCount || 
        !this.winratePercent || !this.winrateChartEl || !this.matchCount || 
        !this.matchesList || !this.loadingState || !this.emptyState) {
      console.error("DOM elements not found. Make sure the match history page is loaded correctly.");
      // Afficher un message dans la console pour faciliter le débogage
      console.log("Missing DOM elements:", {
        gamesPlayed: !!this.gamesPlayed,
        winsCount: !!this.winsCount,
        lossesCount: !!this.lossesCount,
        winratePercent: !!this.winratePercent,
        winrateChartEl: !!this.winrateChartEl,
        matchCount: !!this.matchCount,
        matchesList: !!this.matchesList,
        loadingState: !!this.loadingState,
        emptyState: !!this.emptyState
      });
      return;
    }
    this.loadMatchHistory()
  }

 private async loadMatchHistory(): Promise<void> {
  try {
    console.log("🔄 Chargement de l'historique des matchs...");
    this.showLoading(true);
    
    // DONNÉES STATIQUES DE TEST
    const mockStats = {
      gamesPlayed: 10,
      wins: 7,
      losses: 3,
      winrate: 70,
      matchHistory: [
        {
          id: 1,
          date: "2025-07-14",
          player1_id: 1,
          player2_id: 2,
          player1_name: "Toi",
          player2_name: "Bob",
          score_player1: 11,
          score_player2: 5,
          winner_id: 1,
          result: "Win"
        },
        {
          id: 2,
          date: "2025-07-13",
          player1_id: 1,
          player2_id: 3,
          player1_name: "Toi",
          player2_name: "Alice",
          score_player1: 7,
          score_player2: 11,
          winner_id: 3,
          result: "Loss"
        },
        {
          id: 3,
          date: "2025-07-12",
          player1_id: 1,
          player2_id: 4,
          player1_name: "Toi",
          player2_name: "Charlie",
          score_player1: 11,
          score_player2: 9,
          winner_id: 1,
          result: "Win"
        }
      ]
    };
    
    // Utiliser des données statiques au lieu de l'API
    console.log("📊 Données statiques de test:", mockStats);
    this.matchStats = mockStats;
    this.renderStats();
    this.initWinrateChart();
    this.renderMatchHistory();
    
    console.log("✅ Historique des matchs chargé avec succès (données statiques)");
  } catch (error) {
    this.showMessage("Erreur lors du chargement de l'historique des matchs", "error");
    console.error("❌ Error loading match history:", error);
  } finally {
    this.showLoading(false);
  }
}

  private renderStats(): void {
    if (!this.matchStats) return;

    const { gamesPlayed, wins, losses, winrate } = this.matchStats;
    
    this.gamesPlayed.textContent = gamesPlayed.toString();
    this.winsCount.textContent = wins.toString();
    this.lossesCount.textContent = losses.toString();
    this.winratePercent.textContent = `${winrate}%`;
    this.matchCount.textContent = gamesPlayed.toString();
  }

   private initWinrateChart(): void {
    if (!this.matchStats) return;
    
    const { wins, losses } = this.matchStats;
    const ctx = this.winrateChartEl.getContext('2d');
    
    if (!ctx) return;
    
    // @ts-ignore - Chart est globalement disponible via le CDN
    this.winrateChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Victoires', 'Défaites'],
        datasets: [{
          data: [wins, losses],
          backgroundColor: ['#3b82f6', '#dc2626'], // Bleu et Rouge comme demandé
          borderWidth: 0
        }]
      },
      options: {
        cutout: '70%',
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        }
      }
    });
  }

  private renderMatchHistory(): void {
    if (!this.matchStats || !this.matchStats.matchHistory || this.matchStats.matchHistory.length === 0) {
      this.matchesList.innerHTML = "";
      this.emptyState.classList.remove("hidden");
      return;
    }
    this.emptyState.classList.add("hidden");

    // Limiter à 3 matchs comme demandé
    const recentMatches = this.matchStats.matchHistory.slice(0, 3);
    
    // Générer le HTML pour les matchs
    this.matchesList.innerHTML = recentMatches
      .map((match) => this.createMatchHTML(match))
      .join("");
  }

  private createMatchHTML(match: Match): string {
    const isWin = match.result === 'Win';
    const rowClass = isWin ? 'bg-blue-50' : 'bg-red-50';
    const resultClass = isWin ? 'text-blue-600' : 'text-red-600';
    const resultText = isWin ? 'Victoire' : 'Défaite';

    return `
      <tr class="${rowClass}">
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${match.date}
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-medium text-gray-900">${match.player2_name || 'Adversaire'}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${match.score_player1} - ${match.score_player2}
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-sm leading-5 font-semibold rounded-full ${resultClass}">
            ${resultText}
          </span>
        </td>
      </tr>
    `;
  }

  private showLoading(show: boolean): void {
    if (show) {
      this.loadingState.classList.remove("hidden");
      this.matchesList.innerHTML = "";
      this.emptyState.classList.add("hidden");
    } else {
      this.loadingState.classList.add("hidden");
    }
  }

  private showMessage(message: string, type: MessageType = "info"): void {
    const messageId = Date.now();
    const bgColor = type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500";

    const messageElement = document.createElement("div");
    messageElement.id = `message-${messageId}`;
    messageElement.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg mb-2 animate-slide-up`;
    messageElement.innerHTML = `
      <div class="flex items-center justify-between">
        <span>${message}</span>
        <button class="ml-4 text-white hover:text-gray-200 close-message">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;

    // Add close event listener
    const closeButton = messageElement.querySelector(".close-message");
    closeButton?.addEventListener("click", () => {
      messageElement.remove();
    });

    this.messageContainer.appendChild(messageElement);

    // Auto remove after 5 seconds
    setTimeout(() => {
      const element = document.getElementById(`message-${messageId}`);
      if (element) {
        element.remove();
      }
    }, 5000);
  }
}
  function displayMatchHistory() {
  setTimeout(() => {
    if (document.getElementById("matches-list") && 
        document.getElementById("winrateChart")) {
      new MatchHistoryApp();
    } else {
      console.warn("⚠️ MatchHistoryApp: Éléments DOM non trouvés");
    }
  }, 100);
}

export { MatchHistoryApp, MatchHistoryAPI, displayMatchHistory }

declare global {
  interface Window {
    MatchHistoryApp: typeof MatchHistoryApp;
    displayMatchHistory: typeof displayMatchHistory;
  }
}

window.MatchHistoryApp = MatchHistoryApp;
window.displayMatchHistory = displayMatchHistory;