// Interface simplifiée pour un match
interface Match {
  played_at: string;
  player1_name?: string;
  player2_name?: string;
  score_player1: number;
  score_player2: number;
  winner_id: number;
  player1_id: number;  // Pour déterminer si le joueur a gagné ou perdu
  game_mode?: string;  // Type de jeu: pong, tournament, snake, etc.
}

// Interface pour les stats de match
interface MatchStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winrate: number;
  matchHistory: Match[];
}

// Format des données reçues du backend
interface ApiMatchStats {
  matchplayed: number;
  victory: number;
  defeats: number;
  ratio: number;
}

// Interfaces pour les données Snake
interface SnakePlayerStats {
  player_id: number;
  username: string;
  best_score: number;
  play_count: number;
  rank: number;
  next_score_to_beat?: number;
}

interface SnakeLeaderboardEntry {
  player_id: number;
  username: string;
  best_score: number;
  rank: number;
}

interface SnakeHistoryEntry {
  player_id: number;
  score: number;
  played_at: string;
}

type MessageType = "success" | "error" | "info";

// Classe API simplifiée
class MatchHistoryAPI {
  private baseUrl: string;
  private token: string | null;

  constructor(baseUrl = "https://localhost:3000") {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem("jwtToken");
  }

  // Méthode utilitaire pour les appels API
  private async fetchAPI<T>(endpoint: string): Promise<T> {
    if (await window.SPA.checkJwtValidity()) {
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
  }

  // Récupérer les statistiques globales
  async getMatchHistory(): Promise<ApiMatchStats> {
    try {
      // Transmettre le type comme gameType ET game_mode pour compatibilité
      const data = await this.fetchAPI<ApiMatchStats>(`/history-details`);
      
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
  private matchStats: MatchStats | null = null;
  private api: MatchHistoryAPI;
  
  // Éléments DOM
  private gamesPlayed: HTMLElement | null;
  private winsCount: HTMLElement | null;
  private lossesCount: HTMLElement | null;
  private winratePercent: HTMLElement | null;
  private winrateChartEl: HTMLElement | null;
  private matchCount: HTMLElement | null;
  private matchesList: HTMLElement | null;
  private loadingState: HTMLElement | null;
  private emptyState: HTMLElement | null;
  private messageContainer: HTMLElement | null;
  private btnGamePong: HTMLButtonElement | null;
  private btnGameSnake: HTMLButtonElement | null;
  private currentGameType: string = 'pong'; // Par défaut: pong classic
  
  // Éléments DOM pour Snake
  private bestScoreEl: HTMLElement | null;
  private nextScoreEl: HTMLElement | null;
  private playerRankEl: HTMLElement | null;
  private leaderboardListEl: HTMLElement | null;
  private leaderboardCountEl: HTMLElement | null;
  private historyListEl: HTMLElement | null;
  private historyCountEl: HTMLElement | null;
  private snakeLoadingStateEl: HTMLElement | null;
  private snakeEmptyStateEl: HTMLElement | null;
  
  // Conteneurs pour les différents types de jeu
  private pongStatsContainer: HTMLElement | null;
  private snakeStatsContainer: HTMLElement | null;
  private pongHistoryContainer: HTMLElement | null;
  private snakeLeaderboardContainer: HTMLElement | null;
  private snakeHistoryContainer: HTMLElement | null;

  constructor() {
    this.api = new MatchHistoryAPI();

    // Récupération des éléments DOM pour Pong
    this.gamesPlayed = document.getElementById("games-played");
    this.winsCount = document.getElementById("wins-count");
    this.lossesCount = document.getElementById("losses-count");
    this.winratePercent = document.getElementById("winrate-percent");
    this.winrateChartEl = document.getElementById("winrateChart");
    this.matchCount = document.getElementById("match-count");
    this.matchesList = document.getElementById("matches-list");
    this.loadingState = document.getElementById("loading-state");
    this.emptyState = document.getElementById("empty-state");
    this.messageContainer = document.getElementById("message-container");
    
    // Nouveaux boutons pour le type de jeu
    this.btnGamePong = document.getElementById("btn-game-pong") as HTMLButtonElement;
    this.btnGameSnake = document.getElementById("btn-game-snake") as HTMLButtonElement;
    
    // Éléments DOM pour Snake
    this.bestScoreEl = document.getElementById("best-score");
    this.nextScoreEl = document.getElementById("next-score");
    this.playerRankEl = document.getElementById("player-rank");
    this.leaderboardListEl = document.getElementById("leaderboard-list");
    this.leaderboardCountEl = document.getElementById("leaderboard-count");
    this.historyListEl = document.getElementById("history-list");
    this.historyCountEl = document.getElementById("history-count");
    this.snakeLoadingStateEl = document.getElementById("snake-loading-state");
    this.snakeEmptyStateEl = document.getElementById("snake-empty-state");
    
    // Conteneurs pour les différents types de jeu
    this.pongStatsContainer = document.getElementById("pong-stats");
    this.snakeStatsContainer = document.getElementById("snake-stats");
    this.pongHistoryContainer = document.getElementById("pong-history");
    this.snakeLeaderboardContainer = document.getElementById("snake-leaderboard");
    this.snakeHistoryContainer = document.getElementById("snake-history");

    this.init();
  }
  
  // Initialisation
  private init(): void {
    if (!this.validateDomElements()) {
      return;
    }
    
    // Ajouter les événements pour les boutons de type de jeu
    this.setupGameTypeButtons();
    
    // Charger l'historique initial (Pong par défaut)
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
    
    if (this.btnGameSnake) {
      this.btnGameSnake.addEventListener('click', (event) => {
        event.preventDefault();
        this.changeGameType('snake');
      });
    }
  }
  
  // Changer le type de jeu et recharger les données
  private changeGameType(gameType: string): void {
    // Mise à jour du type de jeu courant
    this.currentGameType = gameType;
    
    // Mise à jour visuelle des boutons
    if (this.btnGamePong) {
      this.btnGamePong.classList.remove('bg-gradient-to-r', 'from-purple-dark', 'to-pink-medium', 'text-white');
      this.btnGamePong.classList.add('bg-white', 'text-gray-700', 'border', 'border-purple-200/50');
    }
    
    if (this.btnGameSnake) {
      this.btnGameSnake.classList.remove('bg-gradient-to-r', 'from-purple-dark', 'to-pink-medium', 'text-white');
      this.btnGameSnake.classList.add('bg-white', 'text-gray-700', 'border', 'border-purple-200/50');
    }
    
    // Activer uniquement le bouton sélectionné
    if (gameType === 'pong' && this.btnGamePong) {
      this.btnGamePong.classList.remove('bg-white', 'text-gray-700', 'border', 'border-purple-200/50');
      this.btnGamePong.classList.add('bg-gradient-to-r', 'from-purple-dark', 'to-pink-medium', 'text-white');
      
      // Afficher les éléments Pong et masquer les éléments Snake
      if (this.pongStatsContainer) this.pongStatsContainer.style.display = 'grid';
      if (this.snakeStatsContainer) this.snakeStatsContainer.style.display = 'none';
      if (this.pongHistoryContainer) this.pongHistoryContainer.style.display = 'block';
      if (this.snakeLeaderboardContainer) this.snakeLeaderboardContainer.style.display = 'none';
      if (this.snakeHistoryContainer) this.snakeHistoryContainer.style.display = 'none';
      
      // Charger les données Pong
      this.loadMatchHistory();
      
    } else if (gameType === 'snake' && this.btnGameSnake) {
      this.btnGameSnake.classList.remove('bg-white', 'text-gray-700', 'border', 'border-purple-200/50');
      this.btnGameSnake.classList.add('bg-gradient-to-r', 'from-purple-dark', 'to-pink-medium', 'text-white');
      
      // Afficher les éléments Snake et masquer les éléments Pong
      if (this.pongStatsContainer) this.pongStatsContainer.style.display = 'none';
      if (this.snakeStatsContainer) this.snakeStatsContainer.style.display = 'grid';
      if (this.pongHistoryContainer) this.pongHistoryContainer.style.display = 'none';
      if (this.snakeLeaderboardContainer) this.snakeLeaderboardContainer.style.display = 'block';
      if (this.snakeHistoryContainer) this.snakeHistoryContainer.style.display = 'block';
      
      // Charger les données Snake
      this.loadSnakeData();
    }
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
      const apiStats = await this.api.getMatchHistory();
      
      // 2. Récupération des matchs avec le type de jeu
      const matchHistory = await this.api.getHistoryDetails();
      
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
  
  // Trier les matchs par date (du plus récent au plus ancien)
  const sortedMatches = [...matches].sort((a, b) => {
    return new Date(b.played_at).getTime() - new Date(a.played_at).getTime();
  });
  
  // Limiter à 10 matchs après le tri
  const recentMatches = sortedMatches.slice(0, 10);
  
  // Récupérer l'ID de l'utilisateur actuel
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser.id;
  
  // Générer le HTML
  this.matchesList.innerHTML = recentMatches.map(match => {
    // Déterminer si le joueur a gagné (comparer winner_id avec l'ID du joueur actuel)
    const isWin = match.winner_id === currentUserId;
    
    const rowClass = isWin ? 'bg-blue-50' : 'bg-red-50';
    const resultClass = isWin ? 'text-blue-600' : 'text-red-600';
    
    // Use i18n translations if available
    const resultText = isWin 
      ? (window.i18n ? window.i18n.translate('matchHistory.victory') : 'Victory') 
      : (window.i18n ? window.i18n.translate('matchHistory.defeat') : 'Defeat');
    
    // Formater le mode de jeu pour l'affichage (première lettre majuscule)
    const gameMode = match.game_mode || this.currentGameType;
    const formattedGameMode = gameMode.charAt(0).toUpperCase() + gameMode.slice(1);
    
    return `
      <tr class="${rowClass}">
        <td class="px-4 py-3 text-sm">${match.played_at}</td>
        <td class="px-4 py-3 text-sm font-medium">${formattedGameMode}</td>
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

  // Chargement des données Snake
  private async loadSnakeData(): Promise<void> {
    try {
      // Afficher l'état de chargement
      if (this.snakeLoadingStateEl) {
        this.snakeLoadingStateEl.style.display = 'block';
      }
      
      // Récupérer l'ID utilisateur depuis localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        this.showNotification('Utilisateur non connecté', 'error');
        return;
      }
      
      const user = JSON.parse(userStr);
      const userId = user.id;
      
      // Charger en parallèle les 3 types de données
      await Promise.all([
        this.loadSnakePlayerStats(userId),
        this.loadSnakeLeaderboard(),
        this.loadSnakeHistory(userId)
      ]);
      
      // Masquer l'état de chargement
      if (this.snakeLoadingStateEl) {
        this.snakeLoadingStateEl.style.display = 'none';
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données Snake:', error);
      this.showNotification('Impossible de charger les données Snake', 'error');
      
      // Masquer l'état de chargement
      if (this.snakeLoadingStateEl) {
        this.snakeLoadingStateEl.style.display = 'none';
      }
    }
  }
  
  // Chargement des statistiques du joueur
  private async loadSnakePlayerStats(userId: number): Promise<void> {
    if (await window.SPA.checkJwtValidity()) {
      try {
        const response = await fetch(`https://localhost:3000/snake/player-stats/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques Snake');
      }
      
      const data: SnakePlayerStats = await response.json();
      
      // Mettre à jour l'UI
      if (this.playerRankEl) this.playerRankEl.textContent = data.rank.toString();
      if (this.bestScoreEl) this.bestScoreEl.textContent = data.best_score.toString();
      if (this.historyCountEl) this.historyCountEl.textContent = data.play_count.toString();
      
      // Afficher le score à battre s'il existe
      if (this.nextScoreEl) {
        if (data.next_score_to_beat) {
          this.nextScoreEl.textContent = data.next_score_to_beat.toString();
        } else {
          this.nextScoreEl.textContent = 'Vous êtes en tête !';
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques Snake:', error);
      // Ne pas montrer de notification ici car on gère déjà l'erreur dans loadSnakeData
    }
  }
}
  
  // Chargement du leaderboard
  private async loadSnakeLeaderboard(): Promise<void> {
    if (await window.SPA.checkJwtValidity()) {
      try {
        const response = await fetch('https://localhost:3000/snake/leaderboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du leaderboard Snake');
      }
      
      const data: SnakeLeaderboardEntry[] = await response.json();
      
      // Mettre à jour l'UI
      if (this.leaderboardListEl) {
        if (data.length === 0) {
          this.leaderboardListEl.innerHTML = '<tr><td colspan="4" class="px-4 py-3 text-center">Aucun score enregistré</td></tr>';
        } else {
          this.leaderboardListEl.innerHTML = data.map(entry => `
            <tr class="border-b border-gray-200 hover:bg-gray-50">
            <td class="px-4 py-3 text-sm font-medium">${entry.rank}</td>
            <td class="px-4 py-3 text-sm">${entry.username}</td>
            <td class="px-4 py-3 text-sm">${entry.best_score}</td>
            </tr>
            `).join('');
          }
        }
        
        // Mettre à jour le compteur
        if (this.leaderboardCountEl) {
          this.leaderboardCountEl.textContent = data.length.toString();
        }
      } catch (error) {
        console.error('Erreur lors du chargement du leaderboard Snake:', error);
        // Ne pas montrer de notification ici car on gère déjà l'erreur dans loadSnakeData
      }
    }
  }
  
  // Chargement de l'historique du joueur
  private async loadSnakeHistory(userId: number): Promise<void> {
    if (await window.SPA.checkJwtValidity()) {
      try {
        const response = await fetch(`http://localhost:3000/snake/player-history/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'historique Snake');
      }
      
      const data: SnakeHistoryEntry[] = await response.json();
      
      // Mettre à jour l'UI
      if (this.historyListEl) {
        if (data.length === 0) {
          this.historyListEl.innerHTML = '<tr><td colspan="3" class="px-4 py-3 text-center">Aucune partie jouée</td></tr>';
        } else {
          this.historyListEl.innerHTML = data.map(entry => {
            // Formater la date
            const date = new Date(entry.played_at);
            const formattedDate = date.toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            
            return `
            <tr class="border-b border-gray-200 hover:bg-gray-50">
            <td class="px-4 py-3 text-sm">${formattedDate}</td>
            <td class="px-4 py-3 text-sm">${entry.score}</td>
            </tr>
            `;
          }).join('');
        }
      }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique Snake:', error);
      }
    }
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
  const jwtToken = localStorage.getItem("jwtToken");
  if (!jwtToken) {
    if (window.SPA && typeof window.SPA.navigateTo === "function") {
      window.SPA.navigateTo("/login");
    } else {
      window.location.href = "login.html";
    }
    return;
  }
  setTimeout(() => new MatchHistoryApp(), 100);
}

// Déclarer les types globaux
declare global {
  interface Window {
    displayMatchHistory: typeof displayMatchHistory;
    SPA?: {
      navigateTo: (path: string) => void;
    };
    i18n?: {
      translate: (key: string) => string;
    };
  }
}

// Exposer la fonction au scope global IMMÉDIATEMENT
if (typeof window !== 'undefined') {
  window.displayMatchHistory = displayMatchHistory;
}

// Exporter les classes et fonctions
export { MatchHistoryApp, MatchHistoryAPI, displayMatchHistory };
