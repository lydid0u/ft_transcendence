interface Friend {
  id: number
  user_id?: number
  friend_id?: number
  username?: string
  email?: string
}

interface ApiResponse {
  status: string
  message?: string
}

type MessageType = "success" | "error" | "info"

class FriendsAPI {
  private baseUrl: string

  constructor(baseUrl = "http://localhost:3000") {
    this.baseUrl = baseUrl
  }

  /**
   * Get all friends for the current user
   */

   
  async getAllFriends(): Promise<any> {
    try {
      const token = localStorage.getItem("jwtToken");
      
      const response = await fetch(`${this.baseUrl}/get-all-friends`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include", // Include cookies for authentication
      });
      const responseText = await response.text();
      
      // Parse la réponse à nouveau car .text() a déjà consommé le body
      return JSON.parse(responseText);
    } catch (error) {
      console.error("Error fetching friends:", error);
      throw new Error(`HTTP error! status: 999`);
    }
  }
    
  async addFriend(username: string): Promise<ApiResponse> {
    try {
      const token = localStorage.getItem("jwtToken");
      
      const response = await fetch(`${this.baseUrl}/friends-add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          friend_nickname: username, // Le backend attend friend_nickname
        }),
      });

      const responseText = await response.text();
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = JSON.parse(responseText);
      return result;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Impossible d'ajouter cet ami");
    }
  }
  async getOnlineStatus(username: string): Promise<boolean> {
    const token = localStorage.getItem("jwtToken");
    console.log("Checking online status for:", username);
    const response = await fetch(`${this.baseUrl}/user/get-online-status?friend_nickname=${encodeURIComponent(username)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      credentials: "include",
    });
    const result = await response.json();
    return result.isOnline === true;
  }
}

class FriendsApp {
  private friends: Friend[] = []
  private filteredFriends: Friend[] = []
  private api: FriendsAPI

  // DOM Elements
  private searchInput: HTMLInputElement
  private addFriendBtn: HTMLButtonElement
  private friendsList: HTMLUListElement
  private friendsCount: HTMLSpanElement
  private loadingState: HTMLDivElement
  private emptyState: HTMLDivElement
  private messageContainer: HTMLDivElement

  constructor() {
    this.api = new FriendsAPI() // Update with your API base URL if needed

    // Initialize DOM elements
    this.searchInput = document.getElementById("search-input") as HTMLInputElement
    this.addFriendBtn = document.getElementById("add-friend-btn") as HTMLButtonElement
    this.friendsList = document.getElementById("friends-list") as HTMLUListElement
    this.friendsCount = document.getElementById("friends-count") as HTMLSpanElement
    this.loadingState = document.getElementById("loading-state") as HTMLDivElement
    this.emptyState = document.getElementById("empty-state") as HTMLDivElement
    this.messageContainer = document.getElementById("message-container") as HTMLDivElement

    this.init()
  }

  private init(): void {
    // Vérifier si les éléments DOM existent
    if (!this.searchInput || !this.addFriendBtn || !this.friendsList || 
        !this.friendsCount || !this.loadingState || !this.emptyState || !this.messageContainer) {
      console.error("DOM elements not found. Make sure the friends page is loaded correctly.");
      // Afficher un message dans la console pour faciliter le débogage
      console.log("Missing DOM elements:", {
        searchInput: !!this.searchInput,
        addFriendBtn: !!this.addFriendBtn,
        friendsList: !!this.friendsList,
        friendsCount: !!this.friendsCount,
        loadingState: !!this.loadingState,
        emptyState: !!this.emptyState,
        messageContainer: !!this.messageContainer
      });
      return;
    }
    
    this.bindEvents()
    this.loadFriends()
  }

  private bindEvents(): void {
    if (!this.searchInput || !this.addFriendBtn) {
      console.error("Cannot bind events - DOM elements are missing");
      return;
    }

    // Search input event
    this.searchInput.addEventListener("input", (e: Event) => {
      const target = e.target as HTMLInputElement
      this.handleSearch(target.value)
    })

    // Add friend button event
    this.addFriendBtn.addEventListener("click", () => {
      this.handleAddFriend()
    })

    // Enter key on search input
    this.searchInput.addEventListener("keypress", (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        this.handleAddFriend()
      }
    })
  }

  private async loadFriends(): Promise<void> {
  try {
    this.showLoading(true);
    const response = await this.api.getAllFriends();
    console.log("Réponse API complète:", response);
    
    // Extraire correctement les amis de la réponse
    if (response && response.friends && Array.isArray(response.friends)) {
      this.friends = response.friends;
    } else if (Array.isArray(response)) {
      this.friends = response;
    } else {
      this.friends = [];
      console.error("Format de réponse inattendu:", response);
    }
    
    console.log("Amis extraits:", this.friends);
    this.filteredFriends = [...this.friends];
    await this.renderFriends();
    this.updateFriendsCount();
  } catch (error) {
    this.showMessage("Erreur lors du chargement des amis", "error");
    console.error("❌ Error loading friends:", error);
  } finally {
    this.showLoading(false);
  }
}

  private async handleSearch(searchTerm: string): Promise<void> {
    this.filteredFriends = this.friends.filter((friend) =>
      friend.username?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    await this.renderFriends()
  }

  private async handleAddFriend(): Promise<void> {
    const username = this.searchInput.value.trim()
    if (!username) {
      this.showMessage("Veuillez entrer un pseudo", "error")
      return
    }
    try {
      const result = await this.api.addFriend(username)
      if (result.status === "success") {
        this.showMessage("Ami ajouté avec succès!", "success")
        this.searchInput.value = ""
        // Ajouter un délai avant de recharger pour laisser le temps à la base de données
        setTimeout(async () => {
          await this.loadFriends() // Reload the friends list
        }, 500);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'ajout de l'ami"
      this.showMessage(errorMessage, "error")
    }
  }

  private async renderFriends(): Promise<void> {
    if (this.filteredFriends.length === 0) {
      this.friendsList.innerHTML = ""
      this.emptyState.classList.remove("hidden")
      return
    }

    this.emptyState.classList.add("hidden")

    // Générer le HTML sans bouton de suppression
    const htmlArray = await Promise.all(
    this.filteredFriends.map((friend) => this.createFriendHTML(friend))
  );
  this.friendsList.innerHTML = htmlArray.join("");
}

  private async createFriendHTML(friend: Friend): Promise<string> {
  const username = friend.username || "Utilisateur inconnu";
  const initial = username.charAt(0).toUpperCase();
  const isOnline = await this.api.getOnlineStatus(username);
  const statusColor = isOnline ? "#22c55e" : "#ef4444"; // vert ou rouge
  const statusText = isOnline ? "En ligne" : "Hors ligne";

  return `
    <li class="p-4 hover:bg-gray-50 transition-colors duration-150 animate-slide-up">
      <div class="flex items-center">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            ${initial}
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">${username}</h3>
            <div class="flex items-center gap-2 mt-1">
              <span class="inline-block w-3 h-3 rounded-full" style="background:${statusColor};"></span>
              <span class="text-sm font-semibold" style="color:${statusColor};">${statusText}</span>
            </div>
          </div>
        </div>
      </div>
    </li>
  `;
}

  private updateFriendsCount(): void {
    this.friendsCount.textContent = this.friends.length.toString()
  }

  private showLoading(show: boolean): void {
    if (show) {
      this.loadingState.classList.remove("hidden")
      this.friendsList.innerHTML = ""
      this.emptyState.classList.add("hidden")
    } else {
      this.loadingState.classList.add("hidden")
    }
  }

  private showMessage(message: string, type: MessageType = "info"): void {
    const messageId = Date.now()
    const bgColor = type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500"

    const messageElement = document.createElement("div")
    messageElement.id = `message-${messageId}`
    messageElement.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg mb-2 animate-slide-up`
    messageElement.innerHTML = `
      <div class="flex items-center justify-between">
        <span>${message}</span>
        <button class="ml-4 text-white hover:text-gray-200 close-message">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `

    // Add close event listener
    const closeButton = messageElement.querySelector(".close-message")
    closeButton?.addEventListener("click", () => {
      messageElement.remove()
    })

    this.messageContainer.appendChild(messageElement)

    // Auto remove after 5 seconds
    setTimeout(() => {
      const element = document.getElementById(`message-${messageId}`)
      if (element) {
        element.remove()
      }
    }, 5000)
  }
}

// Fonction qui sera appelée par le SPA router
function displayFriendsList() {
  console.log("🔄 Initialisation de la liste d'amis via displayFriendsList()");
  // Petite temporisation pour s'assurer que le DOM est complètement chargé
  setTimeout(() => {
    if (document.getElementById("friends-list") && 
        document.getElementById("search-input")) {
      console.log("✅ FriendsApp: Éléments DOM trouvés, initialisation");
      new FriendsApp();
    } else {
      console.warn("⚠️ FriendsApp: Éléments DOM non trouvés");
    }
  }, 100);
}

// Export for potential external use
export { FriendsApp, FriendsAPI, displayFriendsList }

// Make functions available globally for the SPA router
declare global {
  interface Window {
    FriendsApp: typeof FriendsApp;
    displayFriendsList: typeof displayFriendsList;
  }
}

// Expose to window for SPA
window.FriendsApp = FriendsApp;
window.displayFriendsList = displayFriendsList;