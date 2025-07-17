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

// Declare external functions that should be available
declare function getUserDataFromBackend(): void;
declare function handleGoogleAuth(response: any): void;
declare function displayUserInfo(userData: any): void;
declare function alreadyLoggedIn(): void;
declare function login(): void;
declare function register(): void;
declare function displayFriendsList(): void;
declare function changePassword(): Promise<void>;
declare function displayUserProfile(): Promise<void>;
declare function changeUsername(): Promise<void>;
declare function changeAvatar(): Promise<void>;
declare function initializeStatusSystem(): void;

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

          // afficher le bouton de connexion
          const signInElement: Element | null = document.querySelector('.g_id_signin');
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
        
        // Vérifier si l'utilisateur est déjà connecté
        const savedUser: string | null = localStorage.getItem('googleUser');
        if (savedUser) {
          try {
            const userData: any = JSON.parse(savedUser);
            displayUserInfo(userData);
          } catch (error) {
            console.error('Erreur lors du parsing des données utilisateur:', error);
            localStorage.removeItem('googleUser');
          }
        }
        
        alreadyLoggedIn();
        login();
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

    '/profile': {
      title: 'profile',
      content: 'pages/profile.html',
      routeScript: function(): void {
        setTimeout(() => {
          displayUserProfile();
          initializeStatusSystem(); // Ajout de cette ligne pour initialiser le système de statut
          changeUsername();
          changeAvatar();
        }, 1000);
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
    const isAuthenticated: string | null = localStorage.getItem('isAuthenticated');
    const publicRoutes: string[] = ['/', '/login', '/register'];

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

// Import the actual implementations from modules
// These are already imported at the main.ts level so the functions should be available

document.addEventListener('DOMContentLoaded', function(): void {
  SPA.init();
});

export { SPA };

declare global {
  interface Window {
    SPA: typeof SPA;
    getUserDataFromBackend: () => void;
    handleGoogleAuth: (response: any) => void;
    displayUserInfo: (userData: any) => void;
    alreadyLoggedIn: () => void;
    login: () => void; 
    register: () => void;
    displayFriendsList: () => void;
    changePassword: () => Promise<void>;
    displayUserProfile: () => Promise<void>;
    changeUsername: () => Promise<void>;
    changeAvatar: () => Promise<void>;
    initializeStatusSystem: () => void;
    [key: string]: any; // Allow dynamic access for other properties
  }
}

// Moved to the end of the file

// Ensure these functions are actually defined somewhere in your codebase
// or assign empty functions if you're still developing them:

// Wait for the functions to be defined properly by other modules
// The functions should be registered from their respective modules
// This is just a safety measure in case they're not defined yet
if (typeof window.displayUserProfile !== 'function') {
  console.warn('Warning: displayUserProfile function not found, using placeholder implementation');
  window.displayUserProfile = function(): Promise<void> {
    console.log('displayUserProfile function called but not yet implemented');
    return Promise.resolve();
  };
}

if (typeof window.changeUsername !== 'function') {
  console.warn('Warning: changeUsername function not found, using placeholder implementation');
  window.changeUsername = function(): Promise<void> {
    console.log('changeUsername function called but not yet implemented');
    return Promise.resolve();
  };
}

if (typeof window.changeAvatar !== 'function') {
  console.warn('Warning: changeAvatar function not found, using placeholder implementation');
  window.changeAvatar = function(): Promise<void> {
    console.log('changeAvatar function called but not yet implemented');
    return Promise.resolve();
  };
}

if (typeof window.changePassword !== 'function') {
  console.warn('Warning: changePassword function not found, using placeholder implementation');
  window.changePassword = function(): Promise<void> {
    console.log('changePassword function called but not yet implemented');
    return Promise.resolve();
  };
}

// Add fallbacks for any other functions that might be missing
// Create a type that matches the window interface for our functions
interface FunctionMap {
  getUserDataFromBackend: () => void;
  handleGoogleAuth: (response: any) => void;
  displayUserInfo: (userData: any) => void;
  alreadyLoggedIn: () => void;
  login: () => void;
  register: () => void;
  displayFriendsList: () => void;
}

// Define default implementations for each function
if (typeof window.getUserDataFromBackend !== 'function') {
  window.getUserDataFromBackend = function() {
    console.log('getUserDataFromBackend function called but not yet implemented');
  };
}

if (typeof window.handleGoogleAuth !== 'function') {
  window.handleGoogleAuth = function(response) {
    console.log('handleGoogleAuth function called but not yet implemented', response);
  };
}

if (typeof window.displayUserInfo !== 'function') {
  window.displayUserInfo = function(userData) {
    console.log('displayUserInfo function called but not yet implemented', userData);
  };
}

if (typeof window.alreadyLoggedIn !== 'function') {
  window.alreadyLoggedIn = function() {
    console.log('alreadyLoggedIn function called but not yet implemented');
  };
}

if (typeof window.login !== 'function') {
  window.login = function() {
    console.log('login function called but not yet implemented');
    return Promise.resolve();
  };
}

if (typeof window.register !== 'function') {
  window.register = function() {
    console.log('register function called but not yet implemented');
    return Promise.resolve();
  };
}

if (typeof window.displayFriendsList !== 'function') {
  console.warn('Warning: displayFriendsList function not found, using placeholder implementation');
  window.displayFriendsList = function() {
    console.log('displayFriendsList function called but not yet implemented');
  };
}

// Expose SPA globally after all other functions are defined
window.SPA = SPA;