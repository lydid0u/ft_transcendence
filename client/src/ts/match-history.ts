// Interface simplifiée pour un match
interface Match {
  date: string
  player1_name?: string
  player2_name?: string
  score_player1: number
  score_player2: number
  winner_id: number
  player1_id: number  // Pour déterminer si le joueur a gagné ou perdu
}

// Interface pour les stats de match
interface MatchStats {
  gamesPlayed: number
  wins: number
  losses: number
  winrate: number
  matchHistory: Match[]
}

// Format des données reçues du backend
interface ApiMatchStats {
  matchplayed: number
  victory: number
  defeats: number
  ratio: number
}

type MessageType = "success" | "error" | "info"

// Classe API simplifiée
class MatchHistoryAPI {
  private baseUrl: string
  private token: string | null

  constructor(baseUrl = "http://localhost:3000") {
    this.baseUrl = baseUrl
    this.token = localStorage.getItem("jwtToken")
  }

  // Méthode utilitaire pour les appels API
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
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  // Récupérer les statistiques globales
  async getMatchHistory(): Promise<ApiMatchStats> {
    try {
      const data = await this.fetchAPI<ApiMatchStats>('/history-details');
      console.log("Stats récupérées:", data);
      return data;
    } catch (error) {
      console.error("Erreur stats:", error);
      return { matchplayed: 0, victory: 0, defeats: 0, ratio: 0 };
    }
  }

  // Récupérer l'historique détaillé des matchs
  async getHistoryDetails(): Promise<Match[]> {
    try {
      const data = await this.fetchAPI<Match[]>('/match-history');
      console.log("Historique récupéré:", data);
      return data;
    } catch (error) {
      console.error("Erreur historique:", error);
      return [];
    }
  }
}

// Classe simplifiée pour l'affichage de l'historique des matchs
class MatchHistoryApp {
  // Données
  private matchStats: MatchStats | null = null
  private api: MatchHistoryAPI

  // Éléments DOM
  private gamesPlayed: HTMLElement | null
  private winsCount: HTMLElement | null
  private lossesCount: HTMLElement | null
  private winratePercent: HTMLElement | null
  private winrateChartEl: HTMLElement | null
  private matchCount: HTMLElement | null
  private matchesList: HTMLElement | null
  private loadingState: HTMLElement | null
  private emptyState: HTMLElement | null
  private messageContainer: HTMLElement | null

  constructor() {
    console.log('🚀 MatchHistoryApp initialisé');
    this.api = new MatchHistoryAPI()

    // Récupération des éléments DOM
    this.gamesPlayed = document.getElementById("games-played")
    this.winsCount = document.getElementById("wins-count")
    this.lossesCount = document.getElementById("losses-count")
    this.winratePercent = document.getElementById("winrate-percent")
    this.winrateChartEl = document.getElementById("winrateChart")
    this.matchCount = document.getElementById("match-count")
    this.matchesList = document.getElementById("matches-list")
    this.loadingState = document.getElementById("loading-state")
    this.emptyState = document.getElementById("empty-state")
    this.messageContainer = document.getElementById("message-container")

    this.init()
  }
  
  // Initialisation
  private init(): void {
    console.log('⚙️ Initialisation...');
    if (!this.validateDomElements()) {
      return;
    }
    this.loadMatchHistory();
  }

  // Validation des éléments DOM
  private validateDomElements(): boolean {
    const elements = {
      gamesPlayed: !!this.gamesPlayed,
      winsCount: !!this.winsCount,
      lossesCount: !!this.lossesCount,
      winratePercent: !!this.winratePercent,
      winrateChartEl: !!this.winrateChartEl,
      matchCount: !!this.matchCount,
      matchesList: !!this.matchesList,
      loadingState: !!this.loadingState,
      emptyState: !!this.emptyState
    };
    
    const allPresent = Object.values(elements).every(Boolean);
    if (!allPresent) {
      console.error("❌ Éléments DOM manquants:", elements);
    }
    
    return allPresent;
  }

  // Chargement des données
  private async loadMatchHistory(): Promise<void> {
    try {
      console.log('🔄 Chargement de l\'historique...');
      
      // 1. Récupération des statistiques
      const apiStats = await this.api.getMatchHistory();
      console.log('✅ Statistiques:', apiStats);
      
      // 2. Récupération des matchs
      const matchHistory = await this.api.getHistoryDetails();
      console.log('✅ Matchs:', matchHistory);
      
      // 3. Préparation des données
      this.matchStats = {
        gamesPlayed: apiStats.matchplayed || 0,
        wins: apiStats.victory || 0,
        losses: apiStats.defeats || 0,
        winrate: apiStats.ratio || 0,
        matchHistory: matchHistory
      };
      
      // 4. Mise à jour de l'interface
      this.renderStats();
      this.displayWinRate();
      this.renderMatchHistory();
      
      // 5. Masquer le chargement
      if (this.loadingState) {
        this.loadingState.style.display = 'none';
      }
      
      // 6. État vide si nécessaire
      if (this.emptyState && matchHistory.length === 0) {
        this.emptyState.style.display = 'block';
      } else if (this.emptyState) {
        this.emptyState.style.display = 'none';
      }
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      this.showNotification('Impossible de charger l\'historique des matchs');
      if (this.loadingState) this.loadingState.style.display = 'none';
    }
  }
  
  // Affichage des statistiques
  private renderStats(): void {
    if (!this.matchStats) return;
    
    const { gamesPlayed, wins, losses, winrate } = this.matchStats;
    
    if (this.gamesPlayed) this.gamesPlayed.textContent = gamesPlayed.toString();
    if (this.winsCount) this.winsCount.textContent = wins.toString();
    if (this.lossesCount) this.lossesCount.textContent = losses.toString();
    if (this.winratePercent) this.winratePercent.textContent = `${winrate}%`;
    if (this.matchCount) this.matchCount.textContent = gamesPlayed.toString();
  }

  // Affichage du taux de victoire
  private displayWinRate(): void {
    if (!this.matchStats || !this.winrateChartEl) return;
    
    const { wins, losses, winrate } = this.matchStats;
    
    // Création d'un affichage simple
    const container = document.createElement('div');
    container.className = 'flex flex-col items-center justify-center p-4';
    container.innerHTML = `
      <div class="text-2xl font-bold">${wins} V - ${losses} D</div>
      <div class="text-lg text-gray-600 mt-2">Ratio: ${winrate}%</div>
    `;
    
    // Remplacer le canvas
    this.winrateChartEl.style.display = 'none';
    this.winrateChartEl.parentNode?.insertBefore(container, this.winrateChartEl);
  }

  // Affichage de l'historique des matchs
  private renderMatchHistory(): void {
    if (!this.matchStats || !this.matchesList) return;
    
    const matches = this.matchStats.matchHistory;
    
    if (matches.length === 0) {
      if (this.matchesList) this.matchesList.innerHTML = "";
      if (this.emptyState) this.emptyState.style.display = 'block';
      return;
    }
    
    // Masquer l'état vide
    if (this.emptyState) this.emptyState.style.display = 'none';
    
    // Limiter à 3 matchs
    const recentMatches = matches.slice(0, 3);
    
    // Générer le HTML
    this.matchesList.innerHTML = recentMatches.map(match => {
      // Déterminer si le joueur a gagné
      const isWin = match.winner_id === match.player1_id;
      const rowClass = isWin ? 'bg-blue-50' : 'bg-red-50';
      const resultClass = isWin ? 'text-blue-600' : 'text-red-600';
      const resultText = isWin ? 'Victoire' : 'Défaite';
      
      return `
        <tr class="${rowClass}">
          <td class="px-4 py-3 text-sm">${match.date}</td>
          <td class="px-4 py-3 text-sm font-medium">${match.player2_name || 'Adversaire'}</td>
          <td class="px-4 py-3 text-sm">${match.score_player1} - ${match.score_player2}</td>
          <td class="px-4 py-3">
            <span class="px-2 py-1 rounded-full ${resultClass} text-sm font-medium">
              ${resultText}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Affichage d'une notification
  private showNotification(message: string, type: MessageType = 'error'): void {
    console.log(`📢 ${message} (${type})`);
    
    // Si pas de conteneur, utiliser alert
    if (!this.messageContainer) {
      alert(message);
      return;
    }
    
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `p-4 mb-4 rounded-lg ${type === 'error' ? 'bg-red-500' : 'bg-blue-500'} text-white`;
    notification.textContent = message;
    
    // Ajouter au DOM
    this.messageContainer.appendChild(notification);
    
    // Supprimer après 3 secondes
    setTimeout(() => notification.remove(), 3000);
  }
}

// Fonction globale pour afficher l'historique des matchs
function displayMatchHistory(): void {
  console.log('🏓 Démarrage de l\'application d\'historique des matchs');
  setTimeout(() => new MatchHistoryApp(), 100);
}

// Exporter les classes et fonctions
export { MatchHistoryApp, MatchHistoryAPI, displayMatchHistory }

// Déclarer les types globaux
declare global {
  interface Window {
    displayMatchHistory: typeof displayMatchHistory;
  }
}

// Exposer la fonction au scope global
window.displayMatchHistory = displayMatchHistory;