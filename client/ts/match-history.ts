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
  async getMatchHistory(gameType: string = 'pong'): Promise<ApiMatchStats> {
    try {
      // Transmettre le type comme gameType ET game_mode pour compatibilité
      const data = await this.fetchAPI<ApiMatchStats>(`/history-details?gameType=${gameType}&game_mode=${gameType}`);
      
      // Vérifier la structure des données
      if (!data) {
        return { matchplayed: 0, victory: 0, defeats: 0, ratio: 0 };
      }
      
      // Convertir les valeurs en nombres si nécessaire
      const stats = {
        matchplayed: typeof data.matchplayed === 'number' ? data.matchplayed : Number(data.matchplayed) || 0,
        victory: typeof data.victory === 'number' ? data.victory : Number(data.victory) || 0,
        defeats: typeof data.defeats === 'number' ? data.defeats : Number(data.defeats) || 0,
        ratio: typeof data.ratio === 'number' ? data.ratio : Number(data.ratio) || 0
      };
      
      return stats;
    } catch (error) {
      return { matchplayed: 0, victory: 0, defeats: 0, ratio: 0 };
    }
  }

  // Récupérer l'historique détaillé des matchs
  async getHistoryDetails(gameType: string = 'pong'): Promise<Match[]> {
    try {
      // Transmettre le type comme gameType ET game_mode pour compatibilité
      const data = await this.fetchAPI<Match[]>(`/match-history?gameType=${gameType}&game_mode=${gameType}`);
      return data;
    } catch (error) {
      return [];
    }
  }
}

// Classe simplifiée pour l'affichage de l'historique des matchs
class MatchHistoryApp {
  // Données
  private matchStats: MatchStats | null = null
  private api: MatchHistoryAPI
  private currentGameType: string = 'pong' // Par défaut: pong classic

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
  private btnGamePong: HTMLButtonElement | null
  private btnGameCustom: HTMLButtonElement | null

  constructor() {
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
    
    // Nouveaux boutons pour le type de jeu
    this.btnGamePong = document.getElementById("btn-game-pong") as HTMLButtonElement
    this.btnGameCustom = document.getElementById("btn-game-custom") as HTMLButtonElement

    this.init()
  }
  
  // Initialisation
  private init(): void {
    if (!this.validateDomElements()) {
      return;
    }
    
    // Ajouter les événements pour les boutons de type de jeu
    this.setupGameTypeButtons();
    
    // Charger l'historique initial
    this.loadMatchHistory();
  }
  
  // Configuration des boutons de type de jeu
  private setupGameTypeButtons(): void {
    if (this.btnGamePong) {
      this.btnGamePong.addEventListener('click', (event) => {
        event.preventDefault();
        this.changeGameType('pong');
      });
    }
    
    if (this.btnGameCustom) {
      this.btnGameCustom.addEventListener('click', (event) => {
        event.preventDefault();
        this.changeGameType('custom');
      });
    }
  }
  
  // Changer le type de jeu et recharger les données
  private changeGameType(gameType: string): void {
    
    // Mise à jour du type de jeu courant
    this.currentGameType = gameType;
    
    // Mise à jour visuelle des boutons - approche plus robuste avec classList
    if (this.btnGamePong) {
      this.btnGamePong.classList.remove('bg-stone-600');
      this.btnGamePong.classList.add('bg-stone-400');
    }
    
    if (this.btnGameCustom) {
      this.btnGameCustom.classList.remove('bg-stone-600');
      this.btnGameCustom.classList.add('bg-stone-400');
    }
    
    // Activer uniquement le bouton sélectionné
    if (gameType === 'pong' && this.btnGamePong) {
      this.btnGamePong.classList.remove('bg-stone-400');
      this.btnGamePong.classList.add('bg-stone-600');
    } else if (gameType === 'custom' && this.btnGameCustom) {
      this.btnGameCustom.classList.remove('bg-stone-400');
      this.btnGameCustom.classList.add('bg-stone-600');
    }
    
    // Recharger l'historique avec le nouveau type de jeu
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
    
    return Object.values(elements).every(Boolean);
  }

  // Chargement des données
  private async loadMatchHistory(): Promise<void> {
    try {
      if (this.loadingState) {
        this.loadingState.style.display = 'block';
      }
      if (this.emptyState) {
        this.emptyState.style.display = 'none';
      }
      
      // 1. Récupération des statistiques avec le type de jeu
      const apiStats = await this.api.getMatchHistory(this.currentGameType);
      
      // 2. Récupération des matchs avec le type de jeu
      const matchHistory = await this.api.getHistoryDetails(this.currentGameType);
      
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
      this.showNotification('Impossible de charger l\'historique des matchs');
      if (this.loadingState) this.loadingState.style.display = 'none';
    }
  }
  
  // Affichage des statistiques
  private renderStats(): void {
    if (!this.matchStats) {
      return;
    }
    
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
    
    // Nettoyer les anciens affichages
    const parent = this.winrateChartEl.parentNode;
    if (parent) {
      // Supprimer tous les conteneurs de taux de victoire précédents
      const existingContainers = parent.querySelectorAll('.win-rate-container');
      existingContainers.forEach(container => container.remove());
    }
    
    // Création d'un nouvel affichage
    const container = document.createElement('div');
    container.className = 'flex flex-col items-center justify-center p-4 win-rate-container';
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
  setTimeout(() => new MatchHistoryApp(), 100);
}

// Déclarer les types globaux
declare global {
  interface Window {
    displayMatchHistory: typeof displayMatchHistory;
  }
}

// Exposer la fonction au scope global IMMÉDIATEMENT
if (typeof window !== 'undefined') {
  window.displayMatchHistory = displayMatchHistory;
}

// Exporter les classes et fonctions
export { MatchHistoryApp, MatchHistoryAPI, displayMatchHistory };