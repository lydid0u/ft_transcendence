// // Types and interfaces
// interface User {
//   username: string;
//   email: string;
//   picture?: string;
// }

// interface UserResponse {
//   user: User;
// }

// interface UsernameUpdateResponse {
//   newUser: User;
// }

// interface AvatarUpdateResponse {
//   newUser: User;
// }

// interface ApiErrorResponse {
//   message?: string;
//   error?: string;
// }

// // Type guards
// function isUserResponse(data: any): data is UserResponse {
//   return data && typeof data === 'object' && 'user' in data;
// }

// function isUsernameUpdateResponse(data: any): data is UsernameUpdateResponse {
//   return data && typeof data === 'object' && 'newUser' in data;
// }

// // Main functions
// async function displayUserProfile(): Promise<void> {
//   try {
//     const token: string | null = localStorage.getItem("jwtToken");
//     console.log("🔑 Token récupéré:", token ? "✅ Existe" : "❌ Manquant");
    
//     if (!token) {
//       console.error("❌ Pas de token JWT trouvé");
//       return;
//     }

//     console.log("🌐 Tentative de connexion à l'API...");
    
//     const response: Response = await fetch("http://localhost:3000/user", {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     console.log("📡 Réponse API:", {
//       status: response.status,
//       statusText: response.statusText,
//       ok: response.ok
//     });

//     if (!response.ok) {
//       const errorText: string = await response.text();
//       console.error("❌ Erreur API:", errorText);
//       throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
//     }

//     const data: unknown = await response.json();
//     console.log("✅ Données reçues:", data);
    
//     if (!isUserResponse(data)) {
//       throw new Error("Format de réponse invalide");
//     }

//     const user: User = data.user;
//     console.log("👤 Objet utilisateur:", user);

//     // Vérifier si les éléments existent
//     const userGreeting: HTMLElement | null = document.getElementById("user-greeting");
//     const userEmail: HTMLElement | null = document.getElementById("user-email");
//     const userAvatar: HTMLImageElement | null = document.getElementById("user-avatar") as HTMLImageElement;

//     console.log("🔍 Éléments DOM trouvés:", {
//       greeting: userGreeting ? "✅" : "❌",
//       email: userEmail ? "✅" : "❌",
//       avatar: userAvatar ? "✅" : "❌"
//     });

//     if (userGreeting && user.username) {
//       userGreeting.textContent = `Salut ${user.username}`;
//       console.log("✅ Greeting mis à jour");
//     }

//     if (userEmail && user.email) {
//       userEmail.textContent = user.email;
//       console.log("✅ Email mis à jour");
//     }

//     if (userAvatar && user.picture) {
//       userAvatar.src = user.picture;
//       console.log("✅ Avatar mis à jour");
//     }

//     localStorage.setItem("user", JSON.stringify(user));
//     if (user.email) {
//       localStorage.setItem("email", user.email);
//     }

//   } catch (error: unknown) {
//     const errorObj = error as Error;
//     console.error("💥 ERREUR DÉTAILLÉE:", {
//       message: errorObj.message,
//       stack: errorObj.stack,
//       name: errorObj.name
//     });
    
//     // Vérifier si c'est une erreur réseau
//     if (error instanceof TypeError && errorObj.message.includes('fetch')) {
//       console.error("🌐 Erreur réseau - Vérifiez que votre serveur backend est lancé");
//     }
//   }
// }

// async function getUserDataFromBackend(): Promise<void> {
//   try {
//     const token: string | null = localStorage.getItem("jwtToken");
    
//     if (!token) {
//       throw new Error("Token JWT manquant");
//     }

//     const response: Response = await fetch("http://localhost:3000/user", {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`Erreur HTTP: ${response.status}`);
//     }

//   } catch (error: unknown) {
//     console.error("Erreur lors de la récupération des données:", error);
//   }
// }

// async function changeUsername(): Promise<void> {
//   const messageDiv: HTMLElement | null = document.getElementById("message");
//   if (!messageDiv) return;

//   const form: HTMLFormElement | null = document.getElementById("change-username-form") as HTMLFormElement;
//   if (!form) return;

//   form.addEventListener("submit", async function (event: Event): Promise<void> {
//     event.preventDefault();

//     const newUsernameInput: HTMLInputElement | null = document.getElementById("new-username") as HTMLInputElement;
//     if (!newUsernameInput) return;

//     const newUsername: string = newUsernameInput.value;
//     const token: string | null = localStorage.getItem("jwtToken");
//     const email: string | null = localStorage.getItem("email");

//     if (!token || !email) {
//       messageDiv.textContent = "Données d'authentification manquantes.";
//       messageDiv.style.color = "red";
//       return;
//     }
    
//     try {
//       const response: Response = await fetch("http://localhost:3000/user/username", {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           newusername: newUsername,
//           email: email,
//         }),
//       });

//       if (response.status === 400) {
//         messageDiv.textContent = "Erreur dans les données fournies.";
//         messageDiv.style.color = "red";
//         return;
//       }

//       if (!response.ok) {
//         const errorData: ApiErrorResponse = await response.json();
//         messageDiv.textContent = `Erreur inattendue: ${JSON.stringify(errorData)}`;
//         messageDiv.style.color = "red";
//         return;
//       }

//       messageDiv.textContent = "Pseudo changé avec succès !";
//       messageDiv.style.color = "green";
      
//       const data: unknown = await response.json();
      
//       if (!isUsernameUpdateResponse(data)) {
//         throw new Error("Format de réponse invalide");
//       }

//       const newUser: User = data.newUser;
//       alert(`New username: ${JSON.stringify(newUser)}`);
//       localStorage.setItem("user", JSON.stringify(newUser));
      
//       const userGreeting: HTMLElement | null = document.getElementById("user-greeting");
//       if (userGreeting && newUser.username) {
//         userGreeting.textContent = `Salut ${newUser.username}`;
//       }
//     } catch (error: unknown) {
//       messageDiv.textContent = "Erreur réseau. Veuillez réessayer.";
//       messageDiv.style.color = "red";
//     }
//   });
// }

// async function changeAvatar(): Promise<void> {
//   const form: HTMLFormElement | null = document.getElementById("change-avatar-form") as HTMLFormElement;
//   if (!form) return;

//   form.addEventListener("submit", async function(event: Event): Promise<void> {
//     event.preventDefault();
    
//     const messageDiv: HTMLElement | null = document.getElementById("message");
//     if (!messageDiv) return;

//     const token: string | null = localStorage.getItem("jwtToken");
//     if (!token) {
//       messageDiv.textContent = "Token d'authentification manquant.";
//       messageDiv.style.color = "red";
//       return;
//     }

//     try {
//       const formData: FormData = new FormData(this);
//       const response: Response = await fetch("http://localhost:3000/user/avatar", {
//         method: "PATCH",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//           // "Content-Type": "multipart/form-data" // Ne pas définir Content-Type pour FormData
//         },
//         body: formData
//       });

//       if (!response.ok) {
//         messageDiv.textContent = "Erreur lors de l'envoi de l'avatar.";
//         messageDiv.style.color = "red";
//         return;
//       }

//       messageDiv.textContent = "Avatar changé avec succès !";
//       messageDiv.style.color = "green";
      
//       const data: unknown = await response.json();
      
//       if (!isUsernameUpdateResponse(data)) { // Réutilise le même type guard car la structure est identique
//         throw new Error("Format de réponse invalide");
//       }

//       const user: User = data.newUser;
//       localStorage.setItem("user", JSON.stringify(user));
      
//       const userAvatar: HTMLImageElement | null = document.getElementById("user-avatar") as HTMLImageElement;
//       if (userAvatar && user.picture) {
//         userAvatar.src = user.picture;
//       }
      
//     } catch (error: unknown) {
//       messageDiv.textContent = "Erreur réseau. Veuillez réessayer.";
//       messageDiv.style.color = "red";
//     }
//   });
// }

// Define the User interface to type the user object
interface User {
  username?: string;
  email?: string;
  picture?: string;
}


// Define the API response structure
interface UserResponse {
  user: User;
}


//interface pour la reponse de l'api
interface ChangeUserResponse {
  newusername?: string; // Si ton API retourne juste le nouveau username
  user?: User;          // Si ton API retourne l'utilisateur complet
  message?: string;
  picture?: string;
}


async function displayUserProfile(): Promise<void> {
  try {
    const response: Response = await fetch("http://localhost:3000/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    });


    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }


    const data: UserResponse = await response.json();
    const user: User = data.user;
    console.log("User data received:", user); // Debug: voir ce que le backend renvoie
    localStorage.setItem("user", JSON.stringify(user));


    if (user?.email)
      localStorage.setItem("email", user.email);


    const userGreeting: HTMLElement | null = document.getElementById("user-greeting");
    if (userGreeting && user?.username) {
      userGreeting.textContent = `Salut ${user.username}`;
    }


    const userEmail: HTMLElement | null = document.getElementById("user-email");
    if (userEmail && user?.email) {
      userEmail.textContent = user.email;
    }


    const userAvatar: HTMLImageElement | null = document.getElementById("user-avatar") as HTMLImageElement;
    if (userAvatar && user?.picture) {
      userAvatar.src = user.picture;
    }
  } catch (error: unknown) {
    console.error("Erreur lors de la récupération des données:", error);
  }
}


async function getUserDataFromBackend(): Promise<void> {
  try {
    const response: Response = await fetch("http://localhost:3000/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    });


    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }


  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
  }
}


async function changeUsername(): Promise<void> {
  const messageDiv: HTMLElement | null = document.getElementById("message");
  if (!messageDiv) return;


  const form = document.getElementById("change-username-form") as HTMLFormElement | null;
  if (!form) return;
  form.addEventListener("submit", async function (event: Event) {
    event.preventDefault();


    const newUsername: string = (document.getElementById("new-username") as HTMLInputElement)?.value || "";
    if (!newUsername) {
      messageDiv.textContent = "Le nom d'utilisateur ne peut pas être vide.";
      messageDiv.style.color = "red";
      return;
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
      });
      // if (response.status === 401) {
      //   messageDiv.textContent = "Vous devez être connecté pour changer votre pseudo.";
// Expose functions globally for SPA routing
// @ts-ignore
window.displayUserProfile = displayUserProfile;
// @ts-ignore
window.getUserDataFromBackend = getUserDataFromBackend;
      //   messageDiv.style.color = "red";
      //   return;
      // } else
      if (response.status === 400) {
        messageDiv.textContent = "Le nom d'utilisateur est déjà pris.";
        messageDiv.style.color = "red";
        return;
      }
      messageDiv.textContent = "Pseudo changé avec succès !";
      messageDiv.style.color = "green";


      const data: ChangeUserResponse = await response.json();
      console.log("Response data API in change Username:", data);


      if (data.user) {
        console.log(`New username: ${JSON.stringify(data.user.username)}`);
        localStorage.setItem("user", JSON.stringify(data.user));
        const userGreeting = document.getElementById("user-greeting") as HTMLElement;
        if (userGreeting && data.user.username)
          userGreeting.textContent = `Salut ${data.user.username}`;
      } else {
        console.error("Aucun utilisateur trouvé dans la réponse de l'API.");
        messageDiv.textContent = "Erreur lors de la mise à jour du pseudo.";
        messageDiv.style.color = "red";
      }
  } catch (error) {
    console.error("Erreur lors du changement de pseudo:", error);
    messageDiv.textContent = "Erreur réseau. Veuillez réessayer.";
    messageDiv.style.color = "red";
  }
  });
}


async function changeAvatar() {
  const messageDiv: HTMLElement | null = document.getElementById("message");
  const form = document.getElementById("change-avatar-form") as HTMLFormElement;
  if (!messageDiv || !form) return;
    form.addEventListener("submit", async function (event: Event) {
      event.preventDefault();


      try {
        const target = event.target as HTMLFormElement;
        const formData = new FormData(target);


        const response: Response = await fetch("http://localhost:3000/user/avatar", {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`,
            // Ne pas définir Content-Type pour FormData
          },
          body: formData
        });
        // if (response.status === 401) {
        // messageDiv.textContent = "Vous devez être connecté pour changer votre avatar.";
        // messageDiv.style.color = "red";
        // return;
        // } else
        if (response.status === 400) {
          messageDiv.textContent = "Erreur lors de l'envoi de l'avatar, veuillez réesayer.";
          messageDiv.style.color = "red";
          return;
        }
        messageDiv.textContent = "Avatar changé avec succès !";
        messageDiv.style.color = "green";


        const data : ChangeUserResponse = await response.json();
        console.log("retour de l'api dans changeAvatar:", data);


        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          const userAvatar = document.getElementById("user-avatar") as HTMLImageElement;
          if (userAvatar && data.user.picture)
            userAvatar.src = data.user.picture;
        }
      } catch (error) {
        messageDiv.textContent = "Erreur réseau. Veuillez réessayer.";
        messageDiv.style.color = "red";
      }
    });
}


async function activate2fa() {
  const checkbox = document.getElementById("2fa-checkbox") as HTMLInputElement;
  console.log("Checkbox:", checkbox);
  const messageDiv = document.getElementById("message-2fa") as HTMLElement;
  if (!checkbox || !messageDiv) return;
  alert("2FA is not implemented yet, this is just a placeholder.");


  const saved2FA = localStorage.getItem("2fa_enabled");
  if (saved2FA === "true")
    checkbox.checked = true;


  checkbox.addEventListener("change", async function (event: Event) {
    if (!event.target) return;


    const button = event.target as HTMLInputElement;


    if (!button.checked) {
      const confirmation = confirm("Êtes-vous sûr de vouloir désactiver la double authentification ?");
      if (!confirmation) {
        button.checked = true; // Revenir à l'état précédent si l'utilisateur annule
        return;
      }
    }
    alert(`2FA is now ${button.checked ? "enabled" : "disabled"}`);
    const isActivate = button.checked;
    const boolean = isActivate;


    messageDiv.textContent = isActivate ? "Activation de la double authentification..." : "Désactivation de la double authentification...";


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
      });


      if (!response.ok)
        throw new Error("Échec de la requête");
      localStorage.setItem("2fa_enabled", boolean.toString());
      messageDiv.textContent = isActivate ? "2FA activée avec succès." : "2FA désactivée avec succès.";
    } catch (error) {
      console.error(error);
      messageDiv.textContent = "Erreur lors de la mise à jour de la 2FA.";
      checkbox.checked = !isActivate;
    }
  });
}


// localStorage.removeItem("user");


function onlineStatus () {
 // 🎯 INTERFACES TYPESCRIPT (définition des types)
        interface DropdownOption {
            text: string;
            value: string;
        }
       
        interface DropdownElements {
            button: HTMLButtonElement;
            menu: HTMLDivElement;
            arrow: SVGElement;
            buttonText: HTMLSpanElement;
            selectedStatus: HTMLParagraphElement;
            options: NodeListOf<HTMLButtonElement>;
        }


        // 🔧 VARIABLES PRINCIPALES AVEC TYPES TYPESCRIPT
        // En TypeScript, on spécifie les types pour chaque variable
        const dropdownButton = document.getElementById('dropdownButton');
        const dropdownMenu = document.getElementById('dropdownMenu');
        const dropdownArrow = document.getElementById('dropdownArrow');
        const buttonText = document.getElementById('buttonText');
        const selectedStatus = document.getElementById('selectedStatus');
        const dropdownOptions = document.querySelectorAll('.dropdown-option');


        // 🔒 VÉRIFICATION DES TYPES (TypeScript compile-time check)
        // En TypeScript, on vérifie que les éléments existent
        if (!dropdownButton || !dropdownMenu || !dropdownArrow || !buttonText || !selectedStatus) {
            throw new Error('Un ou plusieurs éléments du dropdown sont manquants');
        }


        // Variable typée pour tracker l'état du menu
        let isMenuOpen = false;


        // 🎯 CLASSE TYPESCRIPT POUR GÉRER LE DROPDOWN
        class DropdownManager {
            constructor() {
                this.isOpen = false;
                this.initializeEventListeners();
            }


            // Méthode pour ouvrir/fermer le menu
            toggleDropdown() {
                this.isOpen = !this.isOpen;
               
                if (this.isOpen) {
                    this.openMenu();
                } else {
                    this.closeMenu();
                }
            }


            // Méthode pour ouvrir le menu
            openMenu() {
                dropdownMenu.classList.remove('hidden');
                dropdownArrow.style.transform = 'rotate(180deg)';
                this.isOpen = true;
            }


            // Méthode pour fermer le menu
            closeMenu() {
                dropdownMenu.classList.add('hidden');
                dropdownArrow.style.transform = 'rotate(0deg)';
                this.isOpen = false;
            }


            // Méthode pour sélectionner une option (avec types TypeScript)
            selectOption(optionText, optionValue) {
                // Vérification des types en TypeScript
                if (typeof optionText !== 'string' || typeof optionValue !== 'string') {
                    console.error('Les paramètres doivent être des strings');
                    return;
                }


                // Mettre à jour le texte du bouton
                buttonText.textContent = optionText;
               
                // Mettre à jour l'affichage du status sélectionné
                selectedStatus.textContent = optionText;
               
                // Fermer le menu
                this.closeMenu();
               
                // Log avec type safety
                console.log('Option sélectionnée:', { text: optionText, value: optionValue });
            }


            // Méthode pour gérer les clics extérieurs (avec type Event)
            handleOutsideClick(event) {
                const target = event.target;
               
                // Vérification de type TypeScript
                if (!(target instanceof Element)) {
                    return;
                }


                // Si le clic n'est pas sur le dropdown, on le ferme
                if (!dropdownButton.contains(target) && !dropdownMenu.contains(target)) {
                    this.closeMenu();
                }
            }


            // Méthode pour gérer les touches clavier (avec type KeyboardEvent)
            handleKeyPress(event) {
                if (event.key === 'Escape' && this.isOpen) {
                    this.closeMenu();
                }
            }


            // Initialisation des event listeners avec types TypeScript
            initializeEventListeners() {
                // Clic sur le bouton principal
                dropdownButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleDropdown();
                });


                // Clic sur les options
                dropdownOptions.forEach((option) => {
                    option.addEventListener('click', (e) => {
                        e.stopPropagation();
                       
                        const optionText = option.textContent || '';
                        const optionValue = option.getAttribute('data-value') || '';
                       
                        this.selectOption(optionText, optionValue);
                    });
                });


                // Clics extérieurs
                document.addEventListener('click', (e) => this.handleOutsideClick(e));


                // Touches clavier
                document.addEventListener('keydown', (e) => this.handleKeyPress(e));
            }
        }


        // 🚀 INITIALISATION DU DROPDOWN MANAGER
        // En TypeScript, on instancie la classe avec type safety
        const dropdownManager = new DropdownManager();


        // 🎯 FONCTION UTILITAIRE AVEC TYPES TYPESCRIPT
        // Cette fonction pourrait être utilisée pour ajouter des options dynamiquement
        function addDropdownOption(text, value) {
            // Vérification des types
            if (typeof text !== 'string' || typeof value !== 'string') {
                throw new Error('Les paramètres doivent être des strings');
            }


            const option = document.createElement('button');
            option.className = 'dropdown-option w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors duration-150';
            option.textContent = text;
            option.setAttribute('data-value', value);
           
            // Ajouter l'event listener
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownManager.selectOption(text, value);
            });


            dropdownMenu.appendChild(option);
        }
}

