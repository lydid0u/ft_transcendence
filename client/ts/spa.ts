import { activate2fa } from "./profile";
// import i18n from './i18n';

interface RouteConfig {
  title: string;
  content: string;
  routeScript?: () => void;
}

interface SPAAttributes {
  defaultRoute: string;
  contentDiv: string;
  contentParent?: Node | null;
  currentGameInstance?: Game | Game1v1 | null;

}

interface GoogleAuthConfig {
  client_id: string;
  callback: (response: any) => void;
}

interface GoogleAccounts {
  id: {
    initialize: (config: GoogleAuthConfig) => void;
    renderButton: (element: Element | null, options: any) => void;
  };
}

import { Game } from './gameAI';
import { Game1v1 } from './game1v1';

declare global {
  interface Window {
    google?: {
      accounts: GoogleAccounts;
    };
  }
}

declare function getUserDataFromBackend(): void;
declare function handleGoogleAuth(response: any): void;
declare function addPseudoForGoogleLogin(userData: UserData): Promise<void>;
declare function login(): void;
declare function register(): void;
declare function displayFriendsList(): void;
declare function changePassword(): Promise<void>;
declare function displayUserProfile(): Promise<void>;
declare function changeUsername(): Promise<void>;
declare function changeAvatar(): Promise<void>;
declare function displayMatchHistory(): void;
declare function displayTournamentList(): void;
declare function otpSubmit(email: string): Promise<void>;

const SPA = {
  SPAattribute: {
    defaultRoute: '/', // page par défaut
    contentDiv: '#content', // id de l'html où le contenu sera chargé
    contentParent: null as Node | null
  } as SPAAttributes,

  handleLayout: function(route: string): void {
  const content: HTMLElement | null = document.querySelector(this.SPAattribute.contentDiv);
  const isLanding: boolean = route === '/';

  if (isLanding) {
    // Style pour la page d'accueil
    document.body.style.cssText = 'overflow: auto; height: auto; background: white;';

    if (content) {
      if (!this.SPAattribute.contentParent) {
        this.SPAattribute.contentParent = content.parentNode;
      }
      if (content.parentNode !== document.body) {
        document.body.appendChild(content);
      }
      content.style.cssText = 'position: static; margin: 0; max-width: none; background: transparent; box-shadow: none; border-radius: 0; min-height: 100vh; padding: 0;';
    }
  } else {
    // Style pour les autres pages
    document.body.style.cssText = 'overflow: hidden; height: 100vh; background: #050507;';

    if (content && this.SPAattribute.contentParent && content.parentNode !== this.SPAattribute.contentParent) {
      this.SPAattribute.contentParent.appendChild(content);
      content.style.cssText = '';
    }
  }
},

  VhsTransition: function(): void {
    const app: HTMLElement | null = document.querySelector('#content');
    if (!app) return;

    app.innerHTML = `
      <div class="vhs-transition">
        <img src="media/vhs.gif" class="vhs-gif" alt="Transition VHS">
      </div>
    `;

    setTimeout(() => {
      this.navigateTo('/home');
    }, 2000);
  },

  routes: {
    '/': {
      title: 'ft_transcendence',
      content: 'pages/landing.html'
    },

    '/home': {
      title: 'common.home',
      content: 'pages/home.html'
    },

    '/about': {
      title: 'common.about',
      content: 'pages/about.html'
    },

    '/tournoi': {
      title: 'common.tournament',
      content: 'pages/tournament.html',
      routeScript: function(): void {
        setTimeout(() => {
          if (typeof window.displayTournamentList === 'function') {
            window.displayTournamentList();
          } else {
            import('./tournament').then(module => {
              if (module && module.displayTournamentList) {
                module.displayTournamentList();
                window.displayTournamentList = module.displayTournamentList;
              }
            });
          }
        }, 100);
      }
    },

    '/tournamenthome': {
      title: 'Démarrer un tournoi',
      content: 'pages/tournamenthome.html',
      routeScript: function(): void {
        setTimeout(() => {
          if (typeof window.initTournamentHome === 'function') {
            window.initTournamentHome();
          } else {
            import('./tournamenthome').then(module => {
              if (module && module.initTournamentHome) {
                module.initTournamentHome();
                window.initTournamentHome = module.initTournamentHome;
              }
            });
          }
        }, 100);
      }
    },


    '/dashboard': {
      title: 'home.dashboard',
      content: 'pages/dashboard.html',
      routeScript: function(): void {
        getUserDataFromBackend();
      }
    },

    '/login': {
      title: 'common.login',
      content: 'pages/login.html',
  routeScript: function(): void {
      if (typeof window.google !== 'undefined' && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: "632484486903-vm1hfg66enqfkffsmlhih0au506obuch.apps.googleusercontent.com",
          callback: handleGoogleAuth
        });
        const signInElement: Element | null = document.querySelector('.g_id_signin');
        if (signInElement) {
          window.google.accounts.id.renderButton(
            signInElement,
            {
              theme: "outline",
              size: "large",
              text: "sign_in_with",
              shape: "rounded",
              logo_alignment: "left"
            }
          );
        }
      }
      login();
  }
},

    '/reset-password': {
      title: 'resetPassword.title',
      content: 'pages/reset-password.html',
      routeScript: function(): void {
    import('./reset-password').then(module => {
      if (module && module.setupResetEmailForm) {
        module.setupResetEmailForm();
      }
    });
  }
},

    '/otp': {
      title: 'Double Authentification',
      content: 'pages/otp.html',
      routeScript: function(): void {
        const otpInput: HTMLInputElement | null = document.querySelector('#otp-input');
        const email = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').email : '';
        console.log('email', email);
        if (!email) {
          console.error(i18n.t('errors.noUserFound'));
          return;
        }
        if (otpInput) {
          otpInput.focus(); // ca met le curseur directement dans le champ de saisie
        }
        otpSubmit(email);
      }
    },

    '/otp-password': {
      title: 'Réinitialiser le mot de passe',
      content: 'pages/otp-password.html',
      routeScript: function(): void {
        console.log('Initialisation du formulaire OTP pour la réinitialisation de mot de passe');
        import('./otpPassword').then(module => {
          if (module && module.setupOtpForm) {
            module.setupOtpForm();
          }
        });
      }
    },

    '/resetNewPassword': {
      title: 'Nouveau mot de passe',
      content: 'pages/newPasswordReset.html',
      routeScript: function(): void {
        import('./resetNewPassword').then(module => {
          if (module && module.setupNewPasswordForm) {
            module.setupNewPasswordForm();
          }
        });
      }
    },

    '/googleLogin': {
      title: 'Google Login',
      content: 'pages/googleLogin.html',
        routeScript: function(): void {
        const googleUser = localStorage.getItem('googleUser');
        if (googleUser) {
          const userData: UserData = JSON.parse(googleUser);
          addPseudoForGoogleLogin(userData);
        }
      }
    },

    '/register': {
      title: 'register',
      content: 'pages/register.html',
      routeScript: function(): void {
        register();
      }
    },

    '/friends': {
      title: 'friends',
      content: 'pages/friends.html',
      routeScript: function(): void {
        displayFriendsList();
      }
    },

    '/pong': {
      title: 'Pong',
      content: 'pages/pong.html',
      routeScript: function(): void {
        changePassword();
      }
    },
    
      '/match-history': {
    title: 'Historique des matchs',
    content: 'pages/match-history.html',
    routeScript: function(): void {
      setTimeout(() => {
        if (typeof window.displayMatchHistory === 'function') {
          window.displayMatchHistory();
        } else {
          // Essayer de charger et d'initialiser directement
          import('./match-history').then(module => {
            if (module && module.displayMatchHistory) {
              module.displayMatchHistory();
              // Définir aussi sur window pour les futurs appels
              window.displayMatchHistory = module.displayMatchHistory;
            }
          });
        }
      }, 100);
    }
  },

  
	'/gameAI': {
			title: 'Pong AI Game',
			content: 'pages/gameAI.html',
			routeScript: function ()
			{
				function tryInitGameAI() {
					const canvas = document.getElementById('game-canvas');
					if (!canvas)
					{
						console.error('Game-canvas not found');
						setTimeout(tryInitGameAI, 50);
						return;
					}
					if (SPA.SPAattribute.currentGameInstance && typeof SPA.SPAattribute.currentGameInstance.destroy === 'function')
					{
						SPA.SPAattribute.currentGameInstance.destroy();
						console.log("Game instance destroyed");
					}
					try
					{
						let difficulty = localStorage.getItem('aiDifficulty') || 'EASY';
						let diffEnum = 1;
						if (difficulty === 'MEDIUM')
							diffEnum = 2;
						else if (difficulty === 'HARD')
							diffEnum = 3;
						const game = new Game(diffEnum);
						SPA.SPAattribute.currentGameInstance = game;
						if (SPA.SPAattribute.currentGameInstance === null)
						{
							throw new Error("current game didn't load");
							return;
						}
						requestAnimationFrame(() => SPA.SPAattribute.currentGameInstance.gameLoop());
					}
					catch (e)
					{
						console.error('Game init failed:', e);
					}
				}
				tryInitGameAI();
			}
		},

	'/1v1': {
			title: 'Pong 1v1',
			content: 'pages/game1v1.html',
			routeScript: function ()
			{
				function tryInitGame1v1() {
					const canvas = document.getElementById('game-canvas');
					const p1Score = document.getElementById('player1-score');
					const p2Score = document.getElementById('player2-score');
					if (!canvas || !p1Score || !p2Score) {
						setTimeout(tryInitGame1v1, 50);
						return;
					}
					if (SPA.SPAattribute.currentGameInstance && typeof SPA.SPAattribute.currentGameInstance.destroy === 'function')
					{
						SPA.SPAattribute.currentGameInstance.destroy();
						console.log("Game instance destroyed");
					}
					try
					{
						let difficulty = localStorage.getItem('Difficulty') || 'EASY';
						let diffEnum = 1;
						if (difficulty === 'MEDIUM')
							diffEnum = 2;
						else if (difficulty === 'HARD')
							diffEnum = 3;
						const game = new Game1v1(diffEnum);
						SPA.SPAattribute.currentGameInstance = game;
						if (SPA.SPAattribute.currentGameInstance === null)
						{
							throw new Error("current game didn't load");
							return;
						}
						requestAnimationFrame(() => SPA.SPAattribute.currentGameInstance.gameLoop());
					}
					catch (e)
					{
						console.error('Game init failed:', e);
					}
				}
				tryInitGame1v1();
			}
		},

    '/ai-landing': {
      title: 'Choix de la difficulté',
      content: 'pages/pong-landing.html',
      routeScript: function () {
        // Attach event listeners to difficulty buttons
        setTimeout(() => {
          document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const difficulty = (e.target as HTMLElement).getAttribute('data-difficulty');
              // Save difficulty to localStorage or SPA attribute
              localStorage.setItem('aiDifficulty', difficulty || 'EASY');
              SPA.navigateTo('/gameAI');
            });
          });
        }, 0);
      }
    },
	 
    '/1v1-landing': {
      title: 'Choix de la difficulté',
      content: 'pages/pong-landing.html',
      routeScript: function () {
        // Attach event listeners to difficulty buttons
        setTimeout(() => {
          document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const difficulty = (e.target as HTMLElement).getAttribute('data-difficulty');
              // Save difficulty to localStorage or SPA attribute
              localStorage.setItem('Difficulty', difficulty || 'EASY');
              SPA.navigateTo('/1v1');
            });
          });
        }, 0);
      }
    },

    '/profile': {
      title: 'profile',
      content: 'pages/profile.html',
      routeScript: function(): void {
        setTimeout(() => {
          displayUserProfile();
          changeUsername();
          changeAvatar();
          activate2fa();
        }, 50);
      }
    }
  } as Record<string, RouteConfig>,

  init: function(): void {
    document.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement;
      
      if (target.tagName === 'A' && target.hasAttribute('data-route')) {
        event.preventDefault();
        const route: string | null = target.getAttribute('data-route');
        if (route) {
          this.navigateTo(route);
        }
      }
    });
    
    window.addEventListener('popstate', () => {
      this.loadRoute(window.location.pathname);
    });

    const currentPath: string = window.location.pathname;
    this.navigateTo(currentPath);
  },

  navigateTo: function(route: string): void {
    history.pushState("", "", route);
    this.loadRoute(route);
    this.setCurrentPageToActive(route);
  },

loadRoute: async function(route: string): Promise<void> {
  try {
    // Vérifier si la route existe
    if (!(route in this.routes)) {
      this.error404();
      return;
    }

    const routeConfig = this.routes[route];
    
    // Set the page title with translation if needed
    if (routeConfig.title && routeConfig.title.includes('.') && window.i18n) {
      document.title = window.i18n.t(routeConfig.title) || "ft_transcendence";
    } else {
      document.title = routeConfig.title || "ft_transcendence";
    }
    
    // Appliquer la mise en page
    this.handleLayout(route);
    
    try {
      // Tenter de charger le contenu HTML
      const contentPath = routeConfig.content;
      
      const response = await fetch(contentPath);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const html = await response.text();
      
      // Injecter le HTML dans le conteneur de contenu
      const contentElement = document.querySelector(this.SPAattribute.contentDiv);
      if (!contentElement) {
        throw new Error("Élément de contenu non trouvé");
      }
      
      contentElement.innerHTML = html;
      
      // Initialize language switcher on first load
      if (route === '/' && !document.querySelector('.language-switcher')) {
        const languageSwitcherContainer = document.getElementById('language-switcher-container');
        if (languageSwitcherContainer && window.i18n) {
          languageSwitcherContainer.appendChild(window.i18n.createLanguageSwitcher());
        }
      }
      
      // Apply translations after content is loaded
      if (window.i18n) {
        setTimeout(() => {
          window.i18n.initializePageTranslations();
        }, 100);
      }
      
      // Exécuter le script de route s'il existe
      if (typeof routeConfig.routeScript === "function") {
        routeConfig.routeScript();
      }
      
    } catch (error) {
      // Afficher un message d'erreur dans le conteneur
      const contentElement = document.querySelector(this.SPAattribute.contentDiv);
      if (contentElement) {
        contentElement.innerHTML = `
          <div style="background: #ffdddd; color: #990000; padding: 20px; border-radius: 5px; margin: 20px;">
            <h2>Erreur de chargement</h2>
            <p>Impossible de charger le contenu de la page: ${route}</p>
            <p>Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}</p>
          </div>
        `;
      }
    }
  } catch (error) {
    // Une erreur est survenue
  }
},

  setCurrentPageToActive: function(currentPath: string): void {
    // Reset all active links
    const links: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('a[data-route]');
    links.forEach((link: HTMLAnchorElement) => {
      link.classList.remove('active');
    });
    
    // Find and set the current active link
    const activeLink: HTMLAnchorElement | null = document.querySelector(`a[data-route="${currentPath}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  },

  error404: function(): void {
    console.error('error 404 - page not found');
    const contentDiv: HTMLElement | null = document.querySelector(this.SPAattribute.contentDiv);
    if (contentDiv) {
      contentDiv.innerHTML = `
        <div class="vhs-transition">
          <img src="media/error404.gif" class="vhs-gif" alt="Transition VHS">
        </div>
      `;
    }
    document.title = 'Error 404 - Page Not Found';
  }
};

document.addEventListener('DOMContentLoaded', function(): void {
  SPA.init();
  
  // Initialize language system
  if (window.i18n) {
    // Initialize language switcher
    const languageSwitcherContainer = document.getElementById('language-switcher-container');
    if (languageSwitcherContainer && !document.querySelector('.language-switcher')) {
      languageSwitcherContainer.appendChild(window.i18n.createLanguageSwitcher());
    }
    
    // Initialize translations
    window.i18n.initializePageTranslations();
    
    // Listen for language changes to update content
    window.addEventListener('languageChanged', function(event: CustomEvent) {
      console.log('Language changed to:', event.detail.language);
      // Update document language attribute
      document.documentElement.lang = event.detail.language;
    } as EventListener);
  }
  
  // Initialiser les effets VHS/CRT après le chargement du SPA
  import('./vhs-effects').then(module => {
    if (module && module.initVHSEffects) {
      module.initVHSEffects();
    }
  }).catch(err => {
    console.error('Erreur lors du chargement des effets VHS:', err);
  });
});

export { SPA };

declare global {
  interface Window {
    SPA: typeof SPA;
    getUserDataFromBackend: () => Promise<void>;
    handleGoogleAuth: (response: any) => void;
    displayUserInfo: (userData: any) => void;
    login: () => void; 
    register: () => void;
    displayFriendsList: () => void;
    addPseudoForGoogleLogin: (userData: UserData) => Promise<void>;
    changePassword: () => Promise<void>;
    displayUserProfile: () => Promise<void>;
    changeUsername: () => Promise<void>;
    changeAvatar: () => Promise<void>;
    otpSubmit: (email: string) => Promise<void>;
    displayTournamentList: () => void;
    [key: string]: any; 
  }
}

window.SPA = SPA;