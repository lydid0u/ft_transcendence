// Types and interfaces
interface LabelRouteMap {
  [key: string]: string;
}

// Global SPA interface
declare global {
  interface Window {
    SPA?: {
      navigateTo: (route: string) => void;
      loadRoute: (route: string) => Promise<void>;
      onPageLoad?: (route: string) => void;
    };
  }
}

document.addEventListener('DOMContentLoaded', function(): void {
  // Function to initialize TV controls
  function initTVControls(): void {
    const tv: HTMLElement | null = document.querySelector(".tv");
    if (!tv) {
      console.error('TV non trouvée dans le DOM');
      return;
    }
    
    const powerButton: HTMLElement | null = document.getElementById("button-2");
    const homeButton: HTMLElement | null = document.getElementById("button-1");

    // Find the nav dial and selector
    const navDial: HTMLElement | null = document.getElementById('nav-dial');
    const navSelector: HTMLElement | null = navDial ? navDial.querySelector('#nav-selector') : null;

    if (navDial && navSelector) {
      // Explicit mapping labelId -> route
      const labelRouteMap: LabelRouteMap = {
        'nav-data-1': '/home',           // Accueil
        'nav-data-3': '/pong',           // Pong
        'nav-data-5': '/tournoi',        // Tournoi
        'nav-data-7': '/dashboard',      // Dashboard
        'nav-data-9': '/profile',        // Profil
        'nav-data-11': '/about',         // A propos
      };
      
      const labelIds: string[] = Object.keys(labelRouteMap);
      const routes: string[] = Object.values(labelRouteMap);
      let currentIndex: number = 0;
      const maxIndex: number = routes.length;
      
      // Update rotation and black dot
      const updateRotation = (): void => {
        navDial.style.setProperty('--value', `${currentIndex * 60}deg`);
        const oldDot: HTMLElement | null = navSelector.querySelector('.nav-dot');
        if (oldDot) oldDot.remove();
        
        const dot: HTMLSpanElement = document.createElement('span');
        dot.className = 'nav-dot absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-black shadow';
        navSelector.appendChild(dot);
      };
      updateRotation();
      
      // When clicking on a label, synchronize the bar and navigate
      labelIds.forEach((id: string): void => {
        const label: HTMLElement | null = document.getElementById(id);
        if (label) {
          label.onclick = null;
          label.style.cursor = 'pointer';
          label.addEventListener('click', (ev: Event): void => {
            ev.preventDefault();
            // Always go up to the parent label (case of span .nav-dot)
            let target: HTMLElement | null = ev.target as HTMLElement;
            while (target && !labelIds.includes(target.id)) {
              target = target.parentElement;
            }
            if (!target) return;
            
            const realId: string = target.id;
            const targetRoute: string = labelRouteMap[realId];
            
            if (window.SPA && typeof window.SPA.navigateTo === 'function') {
              window.SPA.navigateTo(targetRoute);
            }
          });
        }
      });
      
      // When clicking on the bar, advance one step and navigate
      navSelector.addEventListener('click', (ev: Event): void => {
        currentIndex = (currentIndex + 1) % maxIndex;
        updateRotation();
        const nextLabelId: string = labelIds[currentIndex];
        if (window.SPA && typeof window.SPA.navigateTo === 'function') {
          window.SPA.navigateTo(labelRouteMap[nextLabelId]);
        }
      });
      
      // Synchronize bar with current page on load (or SPA navigation)
      const syncBarWithCurrentPage = (): void => {
        let path: string = window.location.pathname;
        if (path.length > 1 && path.endsWith('/')) {
          path = path.slice(0, -1);
        }
        
        // Find the key (labelId) corresponding to the current route
        const labelId: string | undefined = Object.keys(labelRouteMap).find(
          (id: string): boolean => labelRouteMap[id] === path
        );
        
        if (labelId) {
          const newIndex: number = labelIds.indexOf(labelId);
          if (newIndex !== -1 && newIndex !== currentIndex) {
            currentIndex = newIndex;
            updateRotation();
          }
        }
      };
      
      // Synchronize on load
      syncBarWithCurrentPage();
      // Synchronize on each SPA navigation (listen to popstate)
      window.addEventListener('popstate', syncBarWithCurrentPage);
      
      // Patch SPA.loadRoute to synchronize bar on each navigation
      if (window.SPA && typeof window.SPA.loadRoute === 'function') {
        const originalLoadRoute = window.SPA.loadRoute;
        window.SPA.loadRoute = async function(route: string): Promise<void> {
          await originalLoadRoute.call(this, route);
          setTimeout(syncBarWithCurrentPage, 100);
        };
      }
    }

    if (powerButton) {
      powerButton.addEventListener("click", (e: Event): void => {
        turnOffTheTv();
      });
    }
    
    if (homeButton) {
      homeButton.addEventListener("click", (e: Event): void => {
        if (window.SPA && typeof window.SPA.navigateTo === 'function') {
          window.SPA.navigateTo('/home');
        }
      });
    } 
  }

  initTVControls();
  
  if (window.SPA) {
    // Try to determine if we are on the landing page
    function handlePageChange(): void {
      const container: HTMLElement | null = document.querySelector('.container');
      
      // Test all route cases to the landing page
      const isLandingPage: boolean = window.location.hash === '#/' || 
                                    window.location.hash === '' || 
                                    window.location.pathname === '/' || 
                                    window.location.pathname === '/landing';
      
      if (isLandingPage) {
        if (container) container.style.display = 'none';
      } else {
        if (container) {
          container.style.display = 'flex';
          container.style.position = 'fixed';
          container.style.top = '0';
          container.style.left = '0'; 
          container.style.width = '100%';
          container.style.height = '100%';
          container.style.zIndex = '1';
        }
      }
      
      // Reinitialize TV controls in case they got disconnected
      initTVControls();
    }
    
    // Execute on initial load and on hash changes
    handlePageChange();
    window.addEventListener('hashchange', handlePageChange);
    
    // Try to integrate with SPA events if available
    if (window.SPA && typeof window.SPA.onPageLoad === 'function') {
      const originalOnPageLoad = window.SPA.onPageLoad;
      window.SPA.onPageLoad = function(route: string): void {
        originalOnPageLoad(route);
        handlePageChange();
      };
    }
  }
});

function turnOffTheTv(): void {
  try {
    const tv: HTMLElement | null = document.querySelector('.tv');
    if (tv) {
      tv.classList.toggle("off");
      console.log('TV toggled off/on');
    } else {
      console.error('TV element not found');
    }
  } catch (error) {
    console.error('Error toggling TV:', error);
  }
}

function logout(): void {
  try {
    // Remove all authentication-related data
    localStorage.removeItem("user");
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("googleUser");
    localStorage.removeItem("email");
    
    // Disable Google auto-select if available
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }
    
    console.log('User logged out successfully');
    
    // Navigate to login page using SPA if available
    if (window.SPA && typeof window.SPA.navigateTo === 'function') {
      window.SPA.navigateTo('/login');
    } else {
      // Fallback to direct navigation
      window.location.href = "/login.html";
    }
  } catch (error) {
    console.error('Error during logout:', error);
    // Fallback navigation even if logout fails
    window.location.href = "/login.html";
  }
}

// Bind the "Se deconnecter" button to the logout function
document.addEventListener('DOMContentLoaded', function(): void {
  const deconnectBtn: HTMLElement | null = document.getElementById("deconnect");
  if (deconnectBtn) {
    deconnectBtn.addEventListener("click", function(): void {
      logout();
    });
  }
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