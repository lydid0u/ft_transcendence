import { activate2fa, updateLanguage } from "./profile";
/// <reference types="vite/client" />


interface RouteConfig {
  title: string;
  content: string;
  routeScript?: () => void;
}

interface SPAAttributes {
  defaultRoute: string;
  contentDiv: string;
  contentParent?: Node | null;
  currentGameInstance?: Game | Game1v1 | Game1v1v1v1 | SnakeGame | null;

}

interface GoogleAuthConfig {
  client_id: string;
  callback: (response: any) => void;
}

interface GoogleAccounts {
  id: {
    initialize: (config: GoogleAuthConfig) => void;
    renderButton: (element: Element | null, options: any) => void;
    disableAutoSelect: () => void;
  };
}

import { Game } from './gameAI';
import { Game1v1 } from './game1v1';
import { Game1v1v1v1 } from './game1v1v1v1';
import { SnakeGame } from './snake';

import { UserData } from "./google-auth";

declare global {
  interface Window {
    google?: {
      accounts: GoogleAccounts;
    };
    i18n: {
      translate: (key: string) => string;
      setLanguage: (lang: string) => void;
      getLanguage: () => string;
      initializePageTranslations: () => void;
    };
  }
}

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

    const loginBtn = document.getElementById('nav-login-btn');
    
    const profileDropdownToggle = document.getElementById('profile-dropdown-toggle');

    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const hasValidToken = localStorage.getItem('jwtToken') !== null;
    const isLoggedIn = isAuthenticated && hasValidToken;

    console.log('Navbar auth state:', { isAuthenticated, hasValidToken, isLoggedIn });

    if (loginBtn) {
      this.updateNavLoginBtn(route);
    }
    if (profileDropdownToggle) {
      console.log('Setting profile dropdown visibility:', isLoggedIn ? 'visible' : 'hidden');
      profileDropdownToggle.style.display = isLoggedIn ? 'flex' : 'none';
    }
    else
      content.style.cssText = 'position: static; margin: 0; max-width: none; background: transparent; box-shadow: none; border-radius: 0; min-height: 100vh; padding: 0;';

    if (content) {
      if (!this.SPAattribute.contentParent) {
        this.SPAattribute.contentParent = content.parentNode;
      }
    }
  },

  updateNavLoginBtn: function(route?: string): void {
    const loginBtn = document.getElementById('nav-login-btn');
    if (!loginBtn) return;
    const currentRoute = route || window.location.pathname;
    const isLanding = currentRoute === '/';
    let pageTitle = '';
    if (currentRoute in this.routes) {
      pageTitle = this.routes[currentRoute].title;
    }
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const hasValidToken = localStorage.getItem('jwtToken') !== null;
    const isLoggedIn = isAuthenticated && hasValidToken;
    if (isLanding || !pageTitle) {
      loginBtn.setAttribute('data-i18n', isLoggedIn ? 'common.profile' : 'common.login');
      loginBtn.onclick = () => {
        this.navigateTo(isLoggedIn ? '/home' : '/login');
      };
    } else {
      loginBtn.setAttribute('data-i18n', pageTitle);
      loginBtn.onclick = null;
    }
    if (window.i18n && typeof window.i18n.initializePageTranslations === 'function') {
      window.i18n.initializePageTranslations();
    }
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
            }).catch(err => console.error('Failed to load tournament module:', err));
          }
        }, 100);
      }
    },

    '/tournamenthome': {
      title: 'tournament.create',
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

    '/login': {
      title: 'common.login',
      content: 'pages/login.html',
  routeScript: function(): void {
      if (typeof window.google !== 'undefined' && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
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
      title: 'otp.title',
      content: 'pages/otp.html',
      routeScript: function(): void {
        const otpInput: HTMLInputElement | null = document.querySelector('#otp-input');
        const email = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').email : '';
        console.log('email', email);
        if (!email) {
          console.error('No user found');
          return;
        }
        if (otpInput) {
          otpInput.focus(); // ca met le curseur directement dans le champ de saisie
        }
        otpSubmit(email);
      }
    },

    '/otp-password': {
      title: 'otp.title',
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
      title: 'resetPassword.new_password',
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
      title: 'login.title',
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
      title: 'register.title',
      content: 'pages/register.html',
      routeScript: function(): void {
        register();
      }
    },

    '/friends': {
      title: 'common.friends',
      content: 'pages/friends.html',
      routeScript: function(): void {
        displayFriendsList();
      }
    },

      '/match-history': {
    title: 'matchHistory.title',
    content: 'pages/match-history.html',
    routeScript: function(): void {
      setTimeout(() => {
        if (typeof window.displayMatchHistory === 'function') {
          window.displayMatchHistory();
        } else {
          import('./match-history').then(module => {
            if (module && module.displayMatchHistory) {
              module.displayMatchHistory();
              window.displayMatchHistory = module.displayMatchHistory;
            }
          });
        }
      }, 100);
    }
  },

	'/snake': {
	title: 'game.snake',
	content: 'pages/snake.html',
	routeScript: function (): void {
	function tryInitSnakeGame() {
		const canvas = document.getElementById('gameCanvas');
		if (!canvas)
		{
			console.error('gameCanvas not found');
			setTimeout(tryInitSnakeGame, 50);
			return;
		}

		if (SPA.SPAattribute.currentGameInstance && typeof SPA.SPAattribute.currentGameInstance.destroy === 'function')
		{
			SPA.SPAattribute.currentGameInstance.destroy();
			console.log("Previous Snake instance destroyed");
		}

		try
		{
			const snakeGame = new SnakeGame();
			SPA.SPAattribute.currentGameInstance = snakeGame;
		}
		catch (e)
		{
			console.error('Snake Game init failed:', e);
		}
	}

	tryInitSnakeGame();
	},
},

  '/gameAI': {
      title: 'game.pong_ai',
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
            if (SPA.SPAattribute.currentGameInstance && typeof (SPA.SPAattribute.currentGameInstance as any).gameLoop === 'function') {
              requestAnimationFrame(() => (SPA.SPAattribute.currentGameInstance as any).gameLoop());
            }
          }
          catch (e)
          {
            console.error('Game init failed:', e);
          }
        }
        tryInitGameAI();
      }
    },

    '/game1v1Tournament': {
  title: 'game.pong_1v1_tournament',
  content: 'pages/game1v1Tournament.html',
  routeScript: function (): void {
    setTimeout(() => {
      import('./game1v1Tournament').then(module => {
        if (typeof module.startTournamentFlow === 'function') {
          module.startTournamentFlow();
        } else {
          console.error("startTournamentFlow function not found in module");
        }
      }).catch(err => {
        console.error("Failed to load game1v1Tournament module:", err);
      });
    }, 50);
  }
},

  '/1v1': {
      title: 'game.pong_1v1',
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
            Game1v1.startNewGame(diffEnum);
            SPA.SPAattribute.currentGameInstance = Game1v1['currentInstance'];
          }
          catch (e)
          {
            console.error('Game init failed:', e);
          }
        }
        tryInitGame1v1();
      }
    },

	  '/1v1v1v1': {
      title: 'game.pong_1v1v1v1',
      content: 'pages/game1v1v1v1.html',
      routeScript: function () {
        function tryInitGame1v1v1v1() {
          const canvas = document.getElementById('game-canvas');
          const p1Score = document.getElementById('player1-score');
          const p2Score = document.getElementById('player2-score');
          const p3Score = document.getElementById('player3-score');
          const p4Score = document.getElementById('player4-score');
          
          if (!canvas || !p1Score || !p2Score || !p3Score || !p4Score) {
            setTimeout(tryInitGame1v1v1v1, 50);
            return;
          }
          
          // Make sure Game1v1v1v1 class is available
          if (typeof Game1v1v1v1 === 'undefined') {
            console.error('Game1v1v1v1 class not found');
            return;
          }
          
          try {
            let difficulty = localStorage.getItem('Difficulty') || 'EASY';
            let diffEnum = 1;
            if (difficulty === 'MEDIUM') diffEnum = 2;
            else if (difficulty === 'HARD') diffEnum = 3;
            
            Game1v1v1v1.startNewGame(diffEnum);
            console.log('4-player game initialized successfully');
          } catch (e) {
            console.error('4-player game init failed:', e);
          }
        }
    tryInitGame1v1v1v1();
  }
},

    '/ai-landing': {
      title: 'game.difficulty_choice',
      content: 'pages/pong-landing.html',
      routeScript: function () {
        setTimeout(() => {
          document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const difficulty = (e.target as HTMLElement).getAttribute('data-difficulty');
              localStorage.setItem('aiDifficulty', difficulty || 'EASY');
              SPA.navigateTo('/gameAI');
            });
          });
        }, 0);
      }
    },

    '/1v1-landing': {
      title: 'game.difficulty_choice',
      content: 'pages/pong-landing.html',
      routeScript: function () {
        setTimeout(() => {
          document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const difficulty = (e.target as HTMLElement).getAttribute('data-difficulty');
              localStorage.setItem('Difficulty', difficulty || 'EASY');
              SPA.navigateTo('/1v1');
            });
          });
        }, 0);
      }
    },

    '/1v1v1v1-landing': {
      title: 'game.difficulty_choice',
      content: 'pages/1v1v1v1-landing.html', // Make sure this matches your file name
      routeScript: function () {
        setTimeout(() => {
          document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const difficulty = (e.target as HTMLElement).getAttribute('data-difficulty');
              localStorage.setItem('Difficulty', difficulty || 'EASY');
              SPA.navigateTo('/1v1v1v1'); // This should navigate to the actual game
            });
          });
        }, 100); // Give time for elements to load
      }
    },

    '/profile': {
      title: 'common.profile',
      content: 'pages/profile.html',
      routeScript: function(): void {
        setTimeout(() => {
          displayUserProfile();
          changeUsername();
          changePassword();
          changeAvatar();
          activate2fa();
          updateLanguage();
        }, 50);
      }
    }, 

    '/404': {
      title: '404',
      content: 'pages/404.html',
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
    if (!(route in this.routes)) {
      this.error404();
      return;
    }

    const routeConfig = this.routes[route];

    if (routeConfig.title) {
      if (routeConfig.title.includes('.') && window.i18n && typeof window.i18n.translate === 'function') {
        document.title = window.i18n.translate(routeConfig.title) || "ft_transcendence";
      } else {
        document.title = routeConfig.title || "ft_transcendence";
      }
    }

    this.handleLayout(route);

    try {
      const contentPath = routeConfig.content;

      const response = await fetch(contentPath);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const html = await response.text();

      const contentElement = document.querySelector(this.SPAattribute.contentDiv);
      if (!contentElement) {
        throw new Error("Élément de contenu non trouvé");
      }

      contentElement.innerHTML = html;

      if (window.i18n && typeof window.i18n.initializePageTranslations === 'function') {
        window.i18n.initializePageTranslations();
      }
      if (window.i18n) {
        setTimeout(() => {
          window.i18n.initializePageTranslations();
        }, 100);
      }

      if (typeof routeConfig.routeScript === "function") {
        routeConfig.routeScript();
      }

    } catch (error) {
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
    console.error('Erreur critique dans loadRoute:', error);
    this.error404();
  }
},

  setCurrentPageToActive: function(currentPath: string): void {
    const links: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('a[data-route]');
    links.forEach((link: HTMLAnchorElement) => {
      link.classList.remove('active');
    });

    const activeLink: HTMLAnchorElement | null = document.querySelector(`a[data-route="${currentPath}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  },

    checkAuthAndNavigate: function() : void {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const hasValidToken = localStorage.getItem('jwtToken') !== null;

        if (isAuthenticated && hasValidToken) {
            SPA.navigateTo('/home');
        } else {
            SPA.navigateTo('/login');
        }
    },

  async checkJwtValidity(): Promise<boolean> {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      console.error('checkJwtValidity: No token found');
      this.clearAuthAndRedirect();
      return false;
    }

    try {
      const response = await fetch('https://localhost:3000/check-jwt', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        console.error('checkJwtValidity: Invalid token');
        this.clearAuthAndRedirect();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking JWT:', error);
      this.clearAuthAndRedirect();
      return false;
    }
  },

  clearAuthAndRedirect(): void {
    localStorage.removeItem('googleUser');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('jwtToken'); 
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('username');
    localStorage.removeItem('2fa_enabled');


    this.navigateTo('/login');
  },

  signOut: async function(): Promise<void> {
    try {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        await fetch('https://localhost:3000/user/connection-status', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: false }),  // 1 = connecté et 0 = déconnecté
        });
        console.log('Connection status updated to offline');
      }
    } catch (error) {
      console.error('Failed to update connection status:', error);
    }
    
    localStorage.removeItem('googleUser');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('username');
    localStorage.removeItem('2fa_enabled');



    if (typeof window.google !== 'undefined' && window.google.accounts) {
      console.log('Google accounts found, disabling auto-select');
      window.google.accounts.id.disableAutoSelect();
    }

    const userSection = document.getElementById('user-section');
    if (userSection) {
        userSection.style.display = 'none';
    }

    const signinSection = document.getElementById('signin-section');
    const loginWithAccountSection = document.getElementById('loginWithAccountSection');

    if (signinSection) {
        signinSection.style.display = 'block';
    }
    if (loginWithAccountSection) {
        loginWithAccountSection.style.display = 'block';
    }

    console.log('User logged out successfully');

    this.handleLayout(window.location.pathname);
  },

  error404: function(): void {
    console.error('error 404 - page not found');
    this.navigateTo('/404');
  }
};

document.addEventListener('DOMContentLoaded', function(): void {
  SPA.init();

  if (window.i18n) {
    window.i18n.initializePageTranslations();

    setTimeout(() => {
      SPA.updateNavLoginBtn(window.location.pathname);
    }, 0);

    window.addEventListener('languageChanged', function(event: CustomEvent) {
      console.log('Language changed to:', event.detail.language);
      document.documentElement.lang = event.detail.language;
      const currentRoute = window.location.pathname;
      if (currentRoute in SPA.routes) {
        const routeTitle = SPA.routes[currentRoute].title;
        if (routeTitle && routeTitle.includes('.') && window.i18n && typeof window.i18n.translate === 'function') {
          document.title = window.i18n.translate(routeTitle) || "ft_transcendence";
        }
      }
      
      SPA.updateNavLoginBtn(window.location.pathname);
    } as EventListener);

    window.addEventListener('translationsReady', function() {
      SPA.updateNavLoginBtn(window.location.pathname);
    });
  }
});

export { SPA };

declare global {
  interface Window {
    SPA?: any;
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
    signOut: () => void;
    checkJwtValidity: () => Promise<boolean>;
    [key: string]: any;
  }
}

window.SPA = SPA;
window.signOut = SPA.signOut.bind(SPA);
window.checkJwtValidity = SPA.checkJwtValidity.bind(SPA);
