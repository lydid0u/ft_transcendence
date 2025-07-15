// friends.ts - Complete friends management application

// Types and Interfaces
interface Friend {
  id: number
  user_id: number
  friend_id: number
  nickname?: string
}

interface ApiResponse {
  status: string
  message?: string
}

type MessageType = "success" | "error" | "info"

// API Class for handling backend requests
class FriendsAPI {
  private baseUrl: string

  constructor(baseUrl = "") {
    this.baseUrl = baseUrl
  }

  /**
   * Get all friends for the current user
   */
  async getAllFriends(): Promise<Friend[]> {
    try {
      const response = await fetch(`${this.baseUrl}/get-all-friends`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const friends: Friend[] = await response.json()
      return friends
    } catch (error) {
      console.error("Error fetching friends:", error)
      throw new Error("Impossible de récupérer la liste d'amis")
    }
  }

  /**
   * Add a new friend by nickname
   */
  async addFriend(friendNickname: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/friends-add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          friend_nickname: friendNickname,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse = await response.json()
      return result
    } catch (error) {
      console.error("Error adding friend:", error)
      throw new Error("Impossible d'ajouter cet ami")
    }
  }

  /**
   * Delete a friend by nickname
   */
  async deleteFriend(friendNickname: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/friends`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          friend_delete: friendNickname,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse = await response.json()
      return result
    } catch (error) {
      console.error("Error deleting friend:", error)
      throw new Error("Impossible de supprimer cet ami")
    }
  }
}

// Main Application Class
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
    this.bindEvents()
    this.loadFriends()
  }

  private bindEvents(): void {
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
      this.showLoading(true)
      this.friends = await this.api.getAllFriends()
      this.filteredFriends = [...this.friends]
      this.renderFriends()
      this.updateFriendsCount()
    } catch (error) {
      this.showMessage("Erreur lors du chargement des amis", "error")
      console.error("Error loading friends:", error)
    } finally {
      this.showLoading(false)
    }
  }

  private handleSearch(searchTerm: string): void {
    this.filteredFriends = this.friends.filter((friend) =>
      friend.nickname?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    this.renderFriends()
  }

  private async handleAddFriend(): Promise<void> {
    const nickname = this.searchInput.value.trim()

    if (!nickname) {
      this.showMessage("Veuillez entrer un pseudo", "error")
      return
    }

    // Check if friend already exists
    if (this.friends.some((friend) => friend.nickname === nickname)) {
      this.showMessage("Cet ami est déjà dans votre liste", "error")
      return
    }

    try {
      const result = await this.api.addFriend(nickname)
      if (result.status === "success") {
        this.showMessage("Ami ajouté avec succès!", "success")
        this.searchInput.value = ""
        await this.loadFriends() // Reload the friends list
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'ajout de l'ami"
      this.showMessage(errorMessage, "error")
    }
  }

  private async handleDeleteFriend(nickname: string): Promise<void> {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${nickname} de vos amis?`)) {
      return
    }

    try {
      const result = await this.api.deleteFriend(nickname)
      if (result.status === "success") {
        this.showMessage("Ami supprimé avec succès!", "success")
        await this.loadFriends() // Reload the friends list
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la suppression de l'ami"
      this.showMessage(errorMessage, "error")
    }
  }

  private renderFriends(): void {
    if (this.filteredFriends.length === 0) {
      this.friendsList.innerHTML = ""
      this.emptyState.classList.remove("hidden")
      return
    }

    this.emptyState.classList.add("hidden")

    this.friendsList.innerHTML = this.filteredFriends.map((friend) => this.createFriendHTML(friend)).join("")

    // Add event listeners to delete buttons
    this.friendsList.querySelectorAll("[data-delete-friend]").forEach((button) => {
      button.addEventListener("click", (e) => {
        const nickname = (e.target as HTMLElement).getAttribute("data-delete-friend")
        if (nickname) {
          this.handleDeleteFriend(nickname)
        }
      })
    })
  }

  private createFriendHTML(friend: Friend): string {
    const nickname = friend.nickname || "Utilisateur inconnu"
    const initial = nickname.charAt(0).toUpperCase()

    return `
      <li class="p-4 hover:bg-gray-50 transition-colors duration-150 animate-slide-up">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              ${initial}
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900">${nickname}</h3>
              <p class="text-sm text-gray-500">ID: ${friend.friend_id}</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button 
              data-delete-friend="${nickname}"
              class="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors duration-150"
              title="Supprimer cet ami"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </li>
    `
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

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new FriendsApp()
})

// Export for potential external use
export { FriendsApp, FriendsAPI }
