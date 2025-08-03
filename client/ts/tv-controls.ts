import { initVHSEffects } from './vhs-effects';

interface LabelRouteMap {
  [key: string]: string;
}

document.addEventListener('DOMContentLoaded', function(): void {
  // Function to initialize TV controls
  function initTVControls(): void {
    const tv: HTMLElement | null = document.querySelector(".tv");
    if (!tv) {
      console.error('TV non trouvée dans le DOM');
      return;
    }
    
    // Boutons de contrôle principaux
    const powerButton: HTMLElement | null = document.getElementById("button-2");
    const homeButton: HTMLElement | null = document.getElementById("button-1");

    // Remplacer le cadran par des boutons de navigation
    const navButtonHome: HTMLElement | null = document.getElementById("nav-button-home");
    const navButtonPong: HTMLElement | null = document.getElementById("nav-button-pong");
    const navButtonTournoi: HTMLElement | null = document.getElementById("nav-button-tournoi");
    const navButtonDashboard: HTMLElement | null = document.getElementById("nav-button-dashboard");
    const navButtonProfile: HTMLElement | null = document.getElementById("nav-button-profile");
    const navButtonAbout: HTMLElement | null = document.getElementById("nav-button-about");

    // Ajouter des écouteurs d'événements pour chaque bouton de navigation
    if (navButtonHome) {
      navButtonHome.addEventListener('click', (e: Event): void => {
        e.preventDefault();
        clearActiveButtons();
        navButtonHome.classList.add('active-nav-button');
        safeNavigate('/home');
      });
    }

    if (navButtonPong) {
      navButtonPong.addEventListener('click', (e: Event): void => {
        e.preventDefault();
        clearActiveButtons();
        navButtonPong.classList.add('active-nav-button');
        safeNavigate('/pong');
      });
    }

    if (navButtonTournoi) {
      navButtonTournoi.addEventListener('click', (e: Event): void => {
        e.preventDefault();
        clearActiveButtons();
        navButtonTournoi.classList.add('active-nav-button');
        safeNavigate('/tournoi');
      });
    }

    if (navButtonDashboard) {
      navButtonDashboard.addEventListener('click', (e: Event): void => {
        e.preventDefault();
        clearActiveButtons();
        navButtonDashboard.classList.add('active-nav-button');
        safeNavigate('/dashboard');
      });
    }

    if (navButtonProfile) {
      navButtonProfile.addEventListener('click', (e: Event): void => {
        e.preventDefault();
        clearActiveButtons();
        navButtonProfile.classList.add('active-nav-button');
        safeNavigate('/profile');
      });
    }

    if (navButtonAbout) {
      navButtonAbout.addEventListener('click', (e: Event): void => {
        e.preventDefault();
        clearActiveButtons();
        navButtonAbout.classList.add('active-nav-button');
        safeNavigate('/about');
      });
    }

    // Fonction pour effacer la classe active de tous les boutons
    function clearActiveButtons(): void {
      const allButtons = [
        navButtonHome, 
        navButtonPong, 
        navButtonTournoi, 
        navButtonDashboard, 
        navButtonProfile, 
        navButtonAbout
      ];
      
      allButtons.forEach(button => {
        if (button) {
          button.classList.remove('active-nav-button');
        }
      });
    }

    // Synchroniser le bouton actif avec la route actuelle
    function syncActiveButton(): void {
      const route = getCurrentRoute();
      clearActiveButtons();
      
      if (route === '/home' && navButtonHome) {
        navButtonHome.classList.add('active-nav-button');
      } else if (route === '/pong' && navButtonPong) {
        navButtonPong.classList.add('active-nav-button');
      } else if (route === '/tournoi' && navButtonTournoi) {
        navButtonTournoi.classList.add('active-nav-button');
      } else if (route === '/dashboard' && navButtonDashboard) {
        navButtonDashboard.classList.add('active-nav-button');
      } else if (route === '/profile' && navButtonProfile) {
        navButtonProfile.classList.add('active-nav-button');
      } else if (route === '/about' && navButtonAbout) {
        navButtonAbout.classList.add('active-nav-button');
      }
    }

    // Exécuter syncActiveButton lorsque la page est chargée ou lorsque la route change
    syncActiveButton();
    window.addEventListener('popstate', syncActiveButton);
    
    // Boutons principaux
    if (powerButton) {
      powerButton.addEventListener("click", (e: Event): void => {
        turnOffTheTv();
      });
    }
    
    if (homeButton) {
      homeButton.addEventListener("click", (e: Event): void => {
        if (window.SPA && typeof window.SPA.navigateTo === 'function') {
          window.SPA.navigateTo('/home');
          syncActiveButton();
        }
      });
    } 
  }

  initTVControls();
  
  if (window.SPA) {
    // Try to determine if we are on the landing page
    function handlePageChange(): void {
      const isLanding = isOnLandingPage();
      const tv = document.querySelector('.tv');
      
      if (tv) {
        if (isLanding) {
          tv.classList.add('off');
        } else {
          tv.classList.remove('off');
        }
      }
    }
    
    // Execute on initial load and on hash changes
    handlePageChange();
    window.addEventListener('hashchange', handlePageChange);
    
    // Try to integrate with SPA events if available
    // On laisse cette partie vide car on utilise déjà hashchange
    // Les événements du SPA sont gérés par d'autres moyens
  }
});

function turnOffTheTv(): void {
  try {
    const tv: HTMLElement | null = document.querySelector('.tv');
    if (tv) {
      if (tv.classList.contains('off')) {
        tv.classList.remove('off');
        
        // Afficher l'écran d'attente (waiting screen)
        const waitingScreen = document.getElementById('waiting-screen');
        const screenOff = document.getElementById('screen-off');
        
        if (waitingScreen && screenOff) {
          screenOff.style.opacity = '0';
          waitingScreen.style.opacity = '1';
          waitingScreen.style.display = 'flex';
        }
        
        // Simuler la mise sous tension avec délai
        setTimeout(() => {
          if (waitingScreen) {
            waitingScreen.style.opacity = '0';
            setTimeout(() => {
              if (waitingScreen) {
                waitingScreen.style.display = 'none';
              }
            }, 500);
          }
        }, 2500);
      } else {
        // Éteindre la télévision
        tv.classList.add('off');
        logout();
      }
    } else {
      console.error('TV element not found');
    }
  } catch (error) {
    console.error('Error toggling TV:', error);
  }
}

async function logout(): Promise<void> {
  try {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }

    localStorage.removeItem("user");
    localStorage.removeItem("jwtToken");
    
    // Afficher l'écran d'attente avant de rediriger vers la page de login
    const screenOff = document.getElementById('screen-off');
    if (screenOff) {
      screenOff.style.opacity = '1';
    }
    
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
    
  } catch (error) {
    console.error('Error during logout process:', error);
  }
}

//logout button
document.addEventListener('DOMContentLoaded', function(): void {
  const deconnectBtn: HTMLElement | null = document.getElementById("button-2");
  if (deconnectBtn) {
    deconnectBtn.addEventListener('click', async () => {
      await logout();
    });
  }
});

// Fonction pour gérer l'affichage/masquage du menu de navigation
document.addEventListener('DOMContentLoaded', function(): void {
  const toggleNavMenu: HTMLElement | null = document.getElementById('toggle-nav-menu');
  const navMenu: HTMLElement | null = document.getElementById('dial-container');
  
  // Masquer le menu de navigation par défaut
  if (navMenu) {
    navMenu.style.display = 'none';
  }
  
  // Ajouter l'événement de clic sur le bouton de toggle
  if (toggleNavMenu && navMenu) {
    toggleNavMenu.addEventListener('click', () => {
      if (navMenu.style.display === 'none' || navMenu.style.display === '') {
        navMenu.style.display = 'flex';
      } else {
        navMenu.style.display = 'none';
      }
    });
  }
  
  // Masquer le menu si on clique en dehors
  document.addEventListener('click', (event: MouseEvent) => {
    if (navMenu && 
        navMenu.style.display !== 'none' && 
        event.target instanceof HTMLElement &&
        !navMenu.contains(event.target) && 
        event.target !== toggleNavMenu) {
      navMenu.style.display = 'none';
    }
  });
});

// Helper function to check if user is on landing page
function isOnLandingPage(): boolean {
  return window.location.hash === '#/' || 
         window.location.hash === '' || 
         window.location.pathname === '/' || 
         window.location.pathname === '/landing';
}

// Helper function to get current route
function getCurrentRoute(): string {
  let path: string = window.location.pathname;
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  return path;
}

// Helper function to safely navigate
function safeNavigate(route: string): void {
  if (window.SPA && typeof window.SPA.navigateTo === 'function') {
    window.SPA.navigateTo(route);
  } else {
    window.location.href = route;
  }
}