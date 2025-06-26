document.addEventListener('DOMContentLoaded', function() {
  // Fonction pour initialiser les contrôles de la TV
  function initTVControls() {
    const tv = document.querySelector(".tv");
    if (!tv) {
      console.error('TV non trouvée dans le DOM');
      return;
    }
    
    const powerButton = document.getElementById("button-2");
    const homeButton = document.getElementById("button-1");

    // Trouve le bon bouton nav (nav-dial) et la barre (nav-selector)
    const navDial = document.getElementById('nav-dial');
    const navSelector = navDial ? navDial.querySelector('#nav-selector') : null;

    if (navDial && navSelector) {
      // Mapping explicite labelId -> route
      const labelRouteMap = {
        'nav-data-1': '/home',           // Accueil
        'nav-data-3': '/changePassword', // Changer mot de passe
        'nav-data-5': '/tournoi',        // Tournoi
        'nav-data-7': '/dashboard',      // Dashboard
        'nav-data-9': '/profile',        // Profil
        'nav-data-11': '/about',         // A propos
      };
      const labelIds = Object.keys(labelRouteMap);
      const routes = Object.values(labelRouteMap);
      let currentIndex = 0;
      const maxIndex = routes.length;
      
      // Met à jour la rotation et le point noir
      const updateRotation = () => {
        navDial.style.setProperty('--value', `${currentIndex * 60}deg`);
        const oldDot = navSelector.querySelector('.nav-dot');
        if (oldDot) oldDot.remove();
        const dot = document.createElement('span');
        dot.className = 'nav-dot absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-black shadow';
        navSelector.appendChild(dot);
      };
      updateRotation();
      
      // Quand on clique sur un label, on synchronise la barre et on navigue
      labelIds.forEach((id) => {
        const label = document.getElementById(id);
        if (label) {
          label.onclick = null;
          label.style.cursor = 'pointer';
          label.addEventListener('click', (ev) => {
            ev.preventDefault();
            // Toujours remonter jusqu'au label parent (cas du span .nav-dot)
            let target = ev.target;
            while (target && !labelIds.includes(target.id)) {
              target = target.parentElement;
            }
            if (!target) return;
            const realId = target.id;
            
            const targetRoute = labelRouteMap[realId];
            
            if (typeof SPA !== 'undefined' && typeof SPA.navigateTo === 'function') {
              SPA.navigateTo(targetRoute);
            }
          });
        }
      });
      
      // Quand on clique sur la barre, on avance d'un cran et on navigue
      navSelector.addEventListener('click', (ev) => {
        currentIndex = (currentIndex + 1) % maxIndex;
        updateRotation();
        const nextLabelId = labelIds[currentIndex];
        if (typeof SPA !== 'undefined' && typeof SPA.navigateTo === 'function') {
          SPA.navigateTo(labelRouteMap[nextLabelId]);
        }
      });
      
      // Synchronise la barre sur la page courante au chargement (ou navigation SPA)
      const syncBarWithCurrentPage = () => {
        let path = window.location.pathname;
        if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
        // Recherche la clé (labelId) correspondant à la route courante
        const labelId = Object.keys(labelRouteMap).find(id => labelRouteMap[id] === path);
        if (labelId) {
          const newIndex = labelIds.indexOf(labelId);
          if (newIndex !== currentIndex) {
            currentIndex = newIndex;
            updateRotation();
          }
        }
      };
      
      // Synchronise au chargement
      syncBarWithCurrentPage();
      // Synchronise à chaque navigation SPA (écoute popstate)
      window.addEventListener('popstate', syncBarWithCurrentPage);
      
      // Patch SPA.loadRoute pour synchroniser la barre à chaque navigation
      if (typeof SPA !== 'undefined' && typeof SPA.loadRoute === 'function') {
        const originalLoadRoute = SPA.loadRoute;
        SPA.loadRoute = async function(route) {
          await originalLoadRoute.call(this, route);
          setTimeout(syncBarWithCurrentPage, 100);
        };
      }
    }

    if (powerButton) {
      powerButton.addEventListener("click", (e) => {
        turnOffTheTv()
      });
    }
    if (homeButton) {
      homeButton.addEventListener("click", (e) => {
       SPA.navigateTo('/home');
      });
    } 
  }

  initTVControls();
  if (typeof SPA !== 'undefined') {
    // Essayer de déterminer si nous sommes sur la landing page
    function handlePageChange() {
      const container = document.querySelector('.container');
      
      // Tester tous les cas de route vers la landing page
      const isLandingPage = window.location.hash === '#/' || 
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
      
      // Réinitialiser les contrôles de la TV au cas où ils se sont déconnectés
      initTVControls();
    }
    
    // S'exécuter au chargement initial et lors des changements de hash
    handlePageChange();
    window.addEventListener('hashchange', handlePageChange);
    
    // Tenter de s'intégrer avec les événements SPA si disponibles
    if (typeof SPA !== 'undefined' && typeof SPA.onPageLoad === 'function') {
      const originalOnPageLoad = SPA.onPageLoad;
      SPA.onPageLoad = function(route) {
        originalOnPageLoad(route);
        handlePageChange();
      };
    }
  }
});

function turnOffTheTv() {
  alert("test")
  tv.classList.toggle("off");
}