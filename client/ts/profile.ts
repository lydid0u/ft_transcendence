import { translate as t } from './i18n';

interface User {
  username?: string
  email?: string
  picture?: string
}

interface UserResponse {
  user: User
}

interface ChangeUserResponse {
  newusername?: string
  newUser?: User
  message?: string
  picture?: string
}

async function displayUserProfile(): Promise<void> {
    const jwtToken = localStorage.getItem("jwtToken");
  if (!jwtToken) {
    if (window.SPA && typeof window.SPA.navigateTo === "function") {
      window.SPA.navigateTo("/login");
    }
    return;
  }
  try {
    const response: Response = await fetch("https://localhost:3000/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    })

    if (!response.ok) {
      console.log("la")
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const data: UserResponse = await response.json()
    const user: User = data.user
    console.log("User data received:", user)

    localStorage.setItem("user", JSON.stringify(user))

    if (user?.username) localStorage.setItem("username", user.username)
    if (user?.email) localStorage.setItem("email", user.email)

    const userGreeting: HTMLElement | null = document.getElementById("user-greeting")
    if (userGreeting && user?.username) {
      userGreeting.textContent = `${t('profile.greeting')} ${user.username}`
    }

    const userEmail: HTMLElement | null = document.getElementById("user-email")
    if (userEmail && user?.email) {
      userEmail.textContent = user.email
    }

    const userAvatar: HTMLImageElement | null = document.getElementById("user-avatar") as HTMLImageElement
    if (userAvatar && user?.picture) {
      userAvatar.src = user.picture
    }

  } catch (error: unknown) {
    console.error("Erreur lors de la récupération des données:", error)
  }
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
      const response: Response = await fetch("https://localhost:3000/user/username", {
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

      if (data.newUser) {
        console.log(`New username: ${JSON.stringify(data.newUser.username)}`)
        localStorage.setItem("user", JSON.stringify(data.newUser))
        const userGreeting = document.getElementById("user-greeting") as HTMLElement
        if (userGreeting && data.newUser.username) userGreeting.textContent = `Salut ${data.newUser.username}`

        showMessage("message-username", "Pseudo changé avec succès !", "success")
        form.reset()
      } else {
        console.error("Aucun utilisateur trouvé dans la réponse de l'API.")
        showMessage("message-username", "Erreur lors de la mise à jour du pseudo.", "error")
      }
    } catch (error) {
      console.error("Erreur lors du changement de pseudo:", error)
      showMessage("message-username", "Erreur réseau 3. Veuillez réessayer.", "error")
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

      const response: Response = await fetch("https://localhost:3000/user/avatar", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          // on definit pas Content-Type pour FormData
        },
        body: formData,
      })

      if (response.status === 400) {
        showMessage("message-avatar", "Erreur lors de l'envoi de l'avatar, veuillez réessayer.", "error")
        return
      }

      const data: ChangeUserResponse = await response.json()
      console.log("retour de l'api dans changeAvatar:", data)

      if (data.newUser) {
        localStorage.setItem("user", JSON.stringify(data.newUser))
        const userAvatar = document.getElementById("user-avatar") as HTMLImageElement
        if (userAvatar && data.newUser.picture) userAvatar.src = data.newUser.picture

        showMessage("message-avatar", "Avatar changé avec succès !", "success")
        form.reset()
      }
    } catch (error) {
      showMessage("message-avatar", "Erreur réseau 4. Veuillez réessayer.", "error")
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
    console.log("isActivate:", isActivate, "boolean:", boolean)
    try {
      const response: Response = await fetch("https://localhost:3000/user/2fa-activate", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
        body: JSON.stringify({email: localStorage.getItem("email"), isActivate: boolean,
        }),
      })

      console.log("Response status:", localStorage.getItem("email"), boolean)
      if (response.status === 400) {
        showMessage("message-2fa", "Erreur lors de la mise à jour de la 2FA.", "error")
        console.log("Response status 400, returning")
        return
      }

      if (!response.ok) 
        throw new Error("Échec de la requête")

      localStorage.setItem("2fa_enabled", boolean.toString())
      messageDiv.textContent = isActivate ? t('profile.tfa_enabled_success') : t('profile.tfa_disabled_success')
      messageDiv.classList.remove("hidden")

      setTimeout(() => {
        messageDiv.classList.add("hidden")
      }, 5000)
    } catch (error) {
      console.log("LERREUR", error)
      messageDiv.textContent = t('profile.tfa_update_error')
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
      const response = await fetch("https://localhost:3000/auth/change-password", {
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
      showMessage("message-password", "Erreur réseau 5. Veuillez réessayer.", "error")
    }
  })
}

document.addEventListener("DOMContentLoaded", () => {
  displayUserProfile()
  changeUsername()
  changeAvatar()
  activate2fa()
  changePassword()
})

export { displayUserProfile, changeUsername, changePassword, changeAvatar, activate2fa }
declare global {
  interface Window {
    displayUserProfile: typeof displayUserProfile
    changeUsername: typeof changeUsername
    changeAvatar: typeof changeAvatar
    activate2fa: typeof activate2fa
    changePassword: typeof changePassword
  }
}

console.log("Registering profile functions to window object")
window.displayUserProfile = displayUserProfile
window.changeUsername = changeUsername
window.changePassword = changePassword
window.changeAvatar = changeAvatar
window.activate2fa = activate2fa
