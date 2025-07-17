// Define the User interface to type the user object
interface User {
  username?: string
  email?: string
  picture?: string
}

// Define the API response structure
interface UserResponse {
  user: User
}

// Interface pour la reponse de l'api
interface ChangeUserResponse {
  newusername?: string // Si ton API retourne juste le nouveau username
  user?: User // Si ton API retourne l'utilisateur complet
  message?: string
  picture?: string
}

// Status types
type StatusType = "online" | "busy" | "offline"

// Status configuration
const statusConfig = {
  online: {
    bgColor: "bg-green-500",
    text: "En ligne",
    description: "Disponible pour jouer",
    animation: "animate-pulse",
  },
  busy: {
    bgColor: "bg-orange-500",
    text: "Occupé",
    description: "Ne pas déranger",
    animation: "",
  },
  offline: {
    bgColor: "bg-gray-400",
    text: "Hors ligne",
    description: "Indisponible",
    animation: "",
  },
}

// Current user status
let currentStatus: StatusType = "online"

async function displayUserProfile(): Promise<void> {
  try {
    const response: Response = await fetch("http://localhost:3000/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const data: UserResponse = await response.json()
    const user: User = data.user
    console.log("User data received:", user) // Debug: voir ce que le backend renvoie

    localStorage.setItem("user", JSON.stringify(user))

    if (user?.username) localStorage.setItem("username", user.username)
    if (user?.email) localStorage.setItem("email", user.email)

    const userGreeting: HTMLElement | null = document.getElementById("user-greeting")
    if (userGreeting && user?.username) {
      userGreeting.textContent = `Salut ${user.username}`
    }

    const userEmail: HTMLElement | null = document.getElementById("user-email")
    if (userEmail && user?.email) {
      userEmail.textContent = user.email
    }

    const userAvatar: HTMLImageElement | null = document.getElementById("user-avatar") as HTMLImageElement
    if (userAvatar && user?.picture) {
      userAvatar.src = user.picture
    }

    // Load user status
    loadUserStatus()
  } catch (error: unknown) {
    console.error("Erreur lors de la récupération des données:", error)
  }
}

function loadUserStatus(): void {
  const savedStatus = localStorage.getItem("userStatus") as StatusType
  if (savedStatus && ["online", "busy", "offline"].includes(savedStatus)) {
    currentStatus = savedStatus
  }
  updateStatusDisplay()
}

function updateStatusDisplay(): void {
  const statusButton = document.getElementById("status-button")
  const currentStatusIndicator = document.getElementById("current-status-indicator")
  const currentStatusText = document.getElementById("current-status-text")
  const currentStatusDescription = document.getElementById("current-status-description")

  if (statusButton) {
    // Remove all status classes
    statusButton.className = statusButton.className
      .split(" ")
      .filter((cls) => !cls.startsWith("bg-") && !cls.includes("animate"))
      .join(" ")

    // Add current status classes
    statusButton.classList.add(statusConfig[currentStatus].bgColor)
    if (statusConfig[currentStatus].animation) {
      statusButton.classList.add(statusConfig[currentStatus].animation)
    }

    // Update title
    statusButton.title = `Statut: ${statusConfig[currentStatus].text}`
  }

  if (currentStatusIndicator) {
    // Remove all background color classes
    currentStatusIndicator.className = currentStatusIndicator.className
      .split(" ")
      .filter((cls) => !cls.startsWith("bg-"))
      .join(" ")
    currentStatusIndicator.classList.add(statusConfig[currentStatus].bgColor)
  }

  if (currentStatusText) {
    currentStatusText.textContent = statusConfig[currentStatus].text
  }

  if (currentStatusDescription) {
    currentStatusDescription.textContent = `- ${statusConfig[currentStatus].description}`
  }

  // Update active status in dropdown
  updateActiveStatusOption()
}

function updateActiveStatusOption(): void {
  const statusOptions = document.querySelectorAll(".status-option")
  statusOptions.forEach((option) => {
    const button = option as HTMLButtonElement
    const status = button.getAttribute("data-status") as StatusType

    if (status === currentStatus) {
      button.classList.add("bg-blue-50")
    } else {
      button.classList.remove("bg-blue-50")
    }
  })
}

function changeStatus(newStatus: StatusType): void {
  currentStatus = newStatus
  localStorage.setItem("userStatus", newStatus)
  updateStatusDisplay()
  hideStatusDropdown()

  // Show notification
  showStatusNotification(`Statut changé vers: ${statusConfig[newStatus].text}`)

  // Optionally send to backend
  updateStatusOnServer(newStatus)
}

async function updateStatusOnServer(status: StatusType): Promise<void> {
  try {
    const response = await fetch("http://localhost:3000/user/status", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      console.error("Erreur lors de la mise à jour du statut sur le serveur")
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error)
  }
}

function showStatusNotification(message: string): void {
  // Create temporary notification
  const notification = document.createElement("div")
  notification.className =
    "fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-0 opacity-100"
  notification.textContent = message

  document.body.appendChild(notification)

  // Animate in
  setTimeout(() => {
    notification.classList.add("translate-x-0", "opacity-100")
  }, 10)

  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.add("translate-x-full", "opacity-0")
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 300)
  }, 3000)
}

function showStatusDropdown(): void {
  const dropdown = document.getElementById("status-dropdown")
  if (dropdown) {
    dropdown.classList.remove("hidden")
    setTimeout(() => {
      dropdown.classList.remove("opacity-0", "-translate-y-2")
      dropdown.classList.add("opacity-100", "translate-y-0")
    }, 10)
  }
}

function hideStatusDropdown(): void {
  const dropdown = document.getElementById("status-dropdown")
  if (dropdown) {
    dropdown.classList.remove("opacity-100", "translate-y-0")
    dropdown.classList.add("opacity-0", "-translate-y-2")
    setTimeout(() => {
      dropdown.classList.add("hidden")
    }, 200)
  }
}

function initializeStatusSystem(): void {
  const statusButton = document.getElementById("status-button")
  const statusOptions = document.querySelectorAll(".status-option")

  // Status button click handler
  if (statusButton) {
    statusButton.addEventListener("click", (e) => {
      e.stopPropagation()
      const dropdown = document.getElementById("status-dropdown")
      if (dropdown && dropdown.classList.contains("hidden")) {
        showStatusDropdown()
      } else {
        hideStatusDropdown()
      }
    })
  }

  // Status option click handlers
  statusOptions.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.stopPropagation()
      const status = (e.currentTarget as HTMLButtonElement).getAttribute("data-status") as StatusType
      if (status) {
        changeStatus(status)
      }
    })
  })

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    const dropdown = document.getElementById("status-dropdown")
    const statusButton = document.getElementById("status-button")

    if (dropdown && statusButton && !dropdown.contains(e.target as Node) && !statusButton.contains(e.target as Node)) {
      hideStatusDropdown()
    }
  })

  // Initialize display
  updateStatusDisplay()
}

function showMessage(elementId: string, message: string, type: "success" | "error"): void {
  const messageDiv = document.getElementById(elementId)
  if (messageDiv) {
    messageDiv.textContent = message

    // Remove existing classes
    messageDiv.className = messageDiv.className
      .split(" ")
      .filter((cls) => !cls.includes("text-") && !cls.includes("bg-") && !cls.includes("border-"))
      .join(" ")

    // Add new classes based on type
    if (type === "success") {
      messageDiv.classList.add(
        "mt-4",
        "text-sm",
        "p-3",
        "rounded-lg",
        "border-l-4",
        "text-green-600",
        "bg-green-50",
        "border-green-400",
      )
    } else {
      messageDiv.classList.add(
        "mt-4",
        "text-sm",
        "p-3",
        "rounded-lg",
        "border-l-4",
        "text-red-600",
        "bg-red-50",
        "border-red-400",
      )
    }

    messageDiv.classList.remove("hidden")

    // Hide after 5 seconds
    setTimeout(() => {
      messageDiv.classList.add("hidden")
    }, 5000)
  }
}

async function changeUsername(): Promise<void> {
  const form = document.getElementById("change-username-form") as HTMLFormElement | null
  if (!form) return

  form.addEventListener("submit", async (event: Event) => {
    event.preventDefault()

    const newUsername: string = (document.getElementById("new-username") as HTMLInputElement)?.value || ""

    if (!newUsername) {
      showMessage("message-username", "Le nom d'utilisateur ne peut pas être vide.", "error")
      return
    }

    try {
      const response: Response = await fetch("http://localhost:3000/user/username", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
        body: JSON.stringify({
          newusername: newUsername,
          email: localStorage.getItem("email"),
        }),
      })

      if (response.status === 400) {
        showMessage("message-username", "Le nom d'utilisateur est déjà pris.", "error")
        return
      }

      const data: ChangeUserResponse = await response.json()
      console.log("Response data API in change Username:", data)

      if (data.user) {
        console.log(`New username: ${JSON.stringify(data.user.username)}`)
        localStorage.setItem("user", JSON.stringify(data.user))
        const userGreeting = document.getElementById("user-greeting") as HTMLElement
        if (userGreeting && data.user.username) userGreeting.textContent = `Salut ${data.user.username}`

        showMessage("message-username", "Pseudo changé avec succès !", "success")
        form.reset()
      } else {
        console.error("Aucun utilisateur trouvé dans la réponse de l'API.")
        showMessage("message-username", "Erreur lors de la mise à jour du pseudo.", "error")
      }
    } catch (error) {
      console.error("Erreur lors du changement de pseudo:", error)
      showMessage("message-username", "Erreur réseau. Veuillez réessayer.", "error")
    }
  })
}

async function changeAvatar() {
  const form = document.getElementById("change-avatar-form") as HTMLFormElement
  if (!form) return

  form.addEventListener("submit", async (event: Event) => {
    event.preventDefault()

    try {
      const target = event.target as HTMLFormElement
      const formData = new FormData(target)

      const response: Response = await fetch("http://localhost:3000/user/avatar", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          // ne pas définir Content-Type pour FormData
        },
        body: formData,
      })

      if (response.status === 400) {
        showMessage("message-avatar", "Erreur lors de l'envoi de l'avatar, veuillez réessayer.", "error")
        return
      }

      const data: ChangeUserResponse = await response.json()
      console.log("retour de l'api dans changeAvatar:", data)

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user))
        const userAvatar = document.getElementById("user-avatar") as HTMLImageElement
        if (userAvatar && data.user.picture) userAvatar.src = data.user.picture

        showMessage("message-avatar", "Avatar changé avec succès !", "success")
        form.reset()
      }
    } catch (error) {
      showMessage("message-avatar", "Erreur réseau. Veuillez réessayer.", "error")
    }
  })
}

async function activate2fa() {
  const checkbox = document.getElementById("2fa-checkbox") as HTMLInputElement
  const messageDiv = document.getElementById("message-2fa") as HTMLElement
  if (!checkbox || !messageDiv) return

  const saved2FA = localStorage.getItem("2fa_enabled")
  if (saved2FA === "true") checkbox.checked = true

  checkbox.addEventListener("change", async (event: Event) => {
    if (!event.target) return
    const button = event.target as HTMLInputElement

    if (!button.checked) {
      const confirmation = confirm("Êtes-vous sûr de vouloir désactiver la double authentification ?")
      if (!confirmation) {
        button.checked = true // revenir à l'état précédent si l'user annule
        return
      }
    }

    const isActivate = button.checked
    const boolean = isActivate

    try {
      const response: Response = await fetch("http://localhost:3000/user/2fa-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
        body: JSON.stringify({
          email: localStorage.getItem("email"),
          boolean: boolean,
        }),
      })

      if (!response.ok) throw new Error("Échec de la requête")

      localStorage.setItem("2fa_enabled", boolean.toString())
      messageDiv.textContent = isActivate ? "2FA activée avec succès." : "2FA désactivée avec succès."
      messageDiv.classList.remove("hidden")

      setTimeout(() => {
        messageDiv.classList.add("hidden")
      }, 5000)
    } catch (error) {
      console.error(error)
      messageDiv.textContent = "Erreur lors de la mise à jour de la 2FA."
      messageDiv.classList.remove("hidden")
      checkbox.checked = !isActivate
    }
  })
}

async function changePassword(): Promise<void> {
  const form = document.getElementById("change-password-form") as HTMLFormElement
  if (!form) return

  form.addEventListener("submit", async (event: Event) => {
    event.preventDefault()

    const formData = new FormData(event.target as HTMLFormElement)
    const actualPassword = formData.get("actualPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmNewPassword = formData.get("confirmNewPassword") as string

    if (newPassword !== confirmNewPassword) {
      showMessage("message-password", "Les mots de passe ne correspondent pas.", "error")
      return
    }

    try {
      const response = await fetch("http://localhost:3000/user/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
        body: JSON.stringify({
          actualPassword,
          newPassword,
        }),
      })

      if (response.ok) {
        showMessage("message-password", "Mot de passe changé avec succès !", "success")
        form.reset()
      } else {
        showMessage("message-password", "Mot de passe actuel incorrect.", "error")
      }
    } catch (error) {
      showMessage("message-password", "Erreur réseau. Veuillez réessayer.", "error")
    }
  })
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  displayUserProfile()
  initializeStatusSystem()
  changeUsername()
  changeAvatar()
  activate2fa()
  changePassword()
})

export { displayUserProfile, changeUsername, changeAvatar, activate2fa, changeStatus, initializeStatusSystem }

declare global {
  interface Window {
    displayUserProfile: typeof displayUserProfile
    changeUsername: typeof changeUsername
    changeAvatar: typeof changeAvatar
    activate2fa: typeof activate2fa
    changeStatus: typeof changeStatus
    initializeStatusSystem: typeof initializeStatusSystem
  }
}

// Make sure these functions are exported to the window object
// with a console message confirming they're being registered
console.log("Registering profile functions to window object")
window.displayUserProfile = displayUserProfile
window.changeUsername = changeUsername
window.changeAvatar = changeAvatar
window.activate2fa = activate2fa
window.changeStatus = changeStatus
window.initializeStatusSystem = initializeStatusSystem
