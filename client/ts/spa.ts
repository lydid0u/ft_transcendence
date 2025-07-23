import { activate2fa } from "./profile";

interface RouteConfig {
  title: string;
  content: string;
  routeScript?: () => void;
}

interface SPAAttributes {
  defaultRoute: string;
  contentDiv: string;
  contentParent?: Node | null;
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
declare function otpSubmit(email: string): Promise<void>;

const SPA = {
  SPAattribute: {
    defaultRoute: '/', // page par défaut
    contentDiv: '#content', // id de l'html où le contenu sera chargé
    contentParent: null as Node | null
  } as SPAAttributes,

  handleLayout: function(route: string): void {
    const tvContainer: HTMLElement | null = document.querySelector('#tv-container');
    const content: HTMLElement | null = document.querySelector(this.SPAattribute.contentDiv);
    const isLanding: boolean = route === '/';

    if (isLanding) {
      if (tvContainer) tvContainer.style.display = 'none';
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
      if (tvContainer) tvContainer.style.display = 'flex';
      document.body.style.cssText = 'overflow: hidden; height: 100vh; background: #c3c1a8;';

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
      title: 'Accueil',
      content: 'pages/home.html'
    },

    '/about': {
      title: 'Qui sommes-nous ?',
      content: 'pages/about.html'
    },

    '/tournoi': {
      title: 'tournoi',
      content: 'pages/tournoi.html'
    },

    '/dashboard': {
      title: 'dashboard',
      content: 'pages/dashboard.html',
      routeScript: function(): void {
        getUserDataFromBackend();
      }
    },

    '/login': {
  title: 'login',
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

    '/otp': {
      title: 'Double Authentification',
      content: 'pages/otp.html',
      routeScript: function(): void {
        const otpInput: HTMLInputElement | null = document.querySelector('#otp-input');
        const email = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').email : '';
        console.log('email', email);
        if (!email) {
          console.error('Aucun utilisateur trouvé dans le localStorage.');
          return;
        }
        if (otpInput) {
          otpInput.focus(); // ca met le curseur directement dans le champ de saisie
        }
        otpSubmit(email);
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
    const isAuthenticated: boolean = localStorage.getItem('jwtToken') != null;
    const publicRoutes: string[] = ['/', '/login', '/register', '/about', '/otp', '/googleLogin'];

    if (!isAuthenticated && !publicRoutes.includes(route)) {
      this.navigateTo('/login');
      return;
    }

    if (isAuthenticated && (route === '/login' || route === '/register')) {
      this.navigateTo('/home');
      return;
    }

    this.handleLayout(route);

    const routeToLoad: RouteConfig | undefined = this.routes[route];
    if (!routeToLoad) {
      this.error404();
      return;
    }
 
    document.title = routeToLoad.title;
    const contentDiv: HTMLElement | null = document.querySelector(this.SPAattribute.contentDiv);
    
    if (!contentDiv) {
      console.error('Content div not found');
      return;
    }

    // Check if content is a path to an .html file
    if (typeof routeToLoad.content === 'string' && routeToLoad.content.endsWith('.html')) {
      try {
        const response: Response = await fetch(routeToLoad.content);
        if (!response.ok) {
          throw new Error(`Erreur lors du chargement de ${routeToLoad.content}: ${response.statusText}`);
        }
        const html: string = await response.text();
        contentDiv.innerHTML = html;
      } catch (error) {
        console.error('Erreur de chargement:', error);
        contentDiv.innerHTML = '<p>Erreur de chargement du contenu.</p>';
        this.error404();
        return;
      }
    } else if (typeof routeToLoad.content === 'string') {
      contentDiv.innerHTML = routeToLoad.content;
    } else {
      this.error404();
      return;
    }

    if (routeToLoad.routeScript && typeof routeToLoad.routeScript === 'function') {
      try {
        routeToLoad.routeScript();
      } catch (error) {
        console.error('Erreur lors de l\'exécution du script de route:', error);
      }
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
    [key: string]: any; 
  }
}

window.SPA = SPA;