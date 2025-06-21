// TV Controls JavaScript
document.addEventListener('DOMContentLoaded', function() {
  console.log('TV Controls: DOM chargé');
  
  // Fonction pour initialiser les contrôles de la TV
  function initTVControls() {
    console.log('Initialisation des contrôles TV');
    const tv = document.querySelector(".tv");
    if (!tv) {
      console.error('TV non trouvée dans le DOM');
      return;
    }
    console.log('TV trouvée dans le DOM');
    
    const channelButton = document.querySelector(".dial.channel-button");
    const volumeButton = document.querySelector(".dial.volume-button");
    const powerButton = document.querySelector(".button:last-child");
    const unknownButton = document.querySelector(".button:first-child");

    if (channelButton && volumeButton) {
      const moveSelector = (button, direction = 1, event) => {
        if (event) event.preventDefault();
        const oldValue = parseInt(button.style.getPropertyValue("--value") || "0");
        const newValue = oldValue + 30 * direction;
        button.style.setProperty("--value", `${newValue}deg`);
      };

      channelButton.addEventListener("click", (ev) => moveSelector(channelButton, 1, ev));
      channelButton.addEventListener("contextmenu", (ev) => moveSelector(channelButton, -1, ev));
      volumeButton.addEventListener("click", (ev) => moveSelector(volumeButton, 1, ev));
      volumeButton.addEventListener("contextmenu", (ev) => moveSelector(volumeButton, -1, ev));
    }

    if (powerButton) {
      powerButton.addEventListener("click", () => {
        tv.classList.toggle("on");
      });
    }
  }

  // Initialiser les contrôles
  initTVControls();
  // Si nous sommes dans une SPA, nous devons gérer aussi les changements de page
  if (typeof SPA !== 'undefined') {
    console.log('SPA détectée, configuration des gestionnaires de changement de page');
    
    // Essayer de déterminer si nous sommes sur la landing page
    function handlePageChange() {
      console.log('Changement de page détecté');// Masquer la TV sur la landing page
      const container = document.querySelector('.container');
      const created = document.querySelector('.created');
      
      // Tester tous les cas de route vers la landing page
      const isLandingPage = window.location.hash === '#/' || 
                            window.location.hash === '' || 
                            window.location.pathname === '/' || 
                            window.location.pathname === '/landing';
      
      console.log('Page actuelle:', window.location.pathname, 'isLandingPage:', isLandingPage);
      
      if (isLandingPage) {
        if (container) container.style.display = 'none';
        if (created) created.style.display = 'none';
        console.log('TV masquée (landing page)');
      } else {
        if (container) {
          container.style.display = 'flex';
          container.style.position = 'fixed';
          container.style.top = '0';
          container.style.left = '0'; 
          container.style.width = '100%';
          container.style.height = '100%';
          container.style.zIndex = '1';
          console.log('TV visible (page normale)');
        }
        if (created) created.style.display = 'flex';
      }
      
      // Réinitialiser les contrôles de la TV au cas où ils se sont déconnectés
      initTVControls();
    }
    
    // S'exécuter au chargement initial et lors des changements de hash
    handlePageChange();
    window.addEventListener('hashchange', handlePageChange);
    
    // Tenter de s'intégrer avec les événements SPA si disponibles
    if (typeof SPA.onPageLoad === 'function') {
      const originalOnPageLoad = SPA.onPageLoad;
      SPA.onPageLoad = function(route) {
        originalOnPageLoad(route);
        handlePageChange();
      };
    }
  }
});
