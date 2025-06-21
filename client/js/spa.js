const SPA = {
    SPAattribute: {
        defaultRoute: '/', // page par défaut
        contentDiv: '#content' // id de l'html où le contenu sera chargé
    },

    // cache pour stocker les pages déjà chargées et éviter de les recharger
    cache: new Map(),

    // Fonction pour masquer la navigation et adapter le layout pour la landing page
    hideStyleForLandingPage: function () {
        // Vérifie si la balise nav existe avant d'essayer d'y accéder
        const navElement = document.querySelector('nav');
        if (navElement) {
            navElement.style.display = 'none';
        }
        
        // Réinitialiser les styles du body pour la landing page
        document.body.style.margin = '';
        document.body.style.padding = '';
        document.body.style.overflow = '';
        document.body.style.height = '';
        document.body.style.background = '';
        
        const main = document.querySelector('main');
        main.style.margin = '0';
        main.style.maxWidth = 'none';
        main.style.background = 'transparent';
        main.style.boxShadow = 'none';
        main.style.borderRadius = '0';
        main.style.minHeight = '100vh';
        main.style.padding = '0';
    },

    // Fonction pour restaurer la navigation et le layout normal
    mainDivCSS: function () {
        // Vérifie si la balise nav existe avant d'essayer d'y accéder
        const navElement = document.querySelector('nav');
        if (navElement) {
            navElement.style.display = 'block';
        }
          // Style pour les pages normales (non landing page)
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
        document.body.style.background = '#000'; // Fond noir pour la nouvelle TV
          const main = document.querySelector('main');
        main.style.margin = '0';
        main.style.maxWidth = 'none';
        main.style.width = '100%';
        main.style.padding = '0';
        main.style.height = '100vh';
        main.style.background = 'transparent'; // Suppression de la référence à nobg.png
        main.style.boxShadow = 'none';
        main.style.borderRadius = '0';
        main.style.display = 'flex';
        main.style.justifyContent = 'center';
        main.style.alignItems = 'center';
        main.style.position = 'relative';
        main.style.zIndex = '10'; // S'assurer que le contenu principal est au-dessus de la TV
    },

    // Fonction pour afficher la transition VHS
    showVhsTransition: function () {
        const app = document.querySelector('#content');
        app.innerHTML = `
            <div class="vhs-transition">
                <img src="gif/vhs.gif" class="vhs-gif" alt="Transition VHS">
            </div>
        `;

        // Après 3 secondes (ajustez selon la durée de votre GIF), rediriger vers /home
        setTimeout(() => {
            this.navigateTo('/home');
            setTimeout(() => { this.addGlobalRemoteControl(); }, 200); // Affiche la télécommande juste après l'arrivée sur /home
        }, 2000);
    },

    notAuthenticated: function () {
        const contentDiv = document.querySelector(this.SPAattribute.contentDiv);
        contentDiv.innerHTML = `
            <div class="page-content">
                <h2>Vous n'êtes pas connecté</h2>
                <p>Veuillez vous connecter pour accéder à cette page.</p>
                <button class="btn" onclick="SPA.navigateTo('/login')">Se connecter</button>
            </div>
        `;
    },

    routes: {
        '/': {
            title: 'ft_transcendence',
            content: 'pages/landing.html', // Path to HTML file
            routeScript: function () {
                SPA.hideStyleForLandingPage();
                console.log('🎬 Landing page chargée');
            }
        },

        '/home': {
            title: 'Accueil',
            content: 'pages/home.html', // Path to HTML file
            routeScript: function () {
                SPA.mainDivCSS();
                setTimeout(() => { SPA.addGlobalRemoteControl(); }, 100); // Affiche la télécommande après le chargement de la page home
            }
        },

        '/about': {
            title: 'Qui sommes-nous ?',
            content: 'pages/about.html', // Path to HTML file
            routeScript: function () {
                SPA.mainDivCSS();
                console.log('Page À propos chargée !');
            }
        },

        '/tournoi': {
            title: 'tournoi',
            content: 'pages/tournoi.html', // Path to HTML file
            routeScript: function () {
                SPA.mainDivCSS();

                const isAuthenticated = localStorage.getItem('isAuthenticated');
                if (!isAuthenticated) {
                    SPA.notAuthenticated();
                } else {
                    const user = JSON.parse(localStorage.getItem('user'));
                    const contentDiv = document.querySelector(SPA.SPAattribute.contentDiv);
                    contentDiv.innerHTML += `
                        <div class="page-content">
                            <p>tournoi log</p>
                        </div>
                    `;
                }
            }
        },

        '/dashboard': {
            title: 'dashboard',
            content: 'pages/dashboard.html', // Path to HTML file
            routeScript: function () {
                SPA.mainDivCSS();

                const isAuthenticated = localStorage.getItem('isAuthenticated');
                if (!isAuthenticated) {
                    SPA.notAuthenticated();
                } else {
                    const user = JSON.parse(localStorage.getItem('user'));
                    const contentDiv = document.querySelector(SPA.SPAattribute.contentDiv);

                    contentDiv.innerHTML += `
                        <div class="page-content">
                            <p>dashboard je suis log et je suis</p>
                        </div>
                    `;
                }
            }
        },

        '/login': {
            title: 'login',
            content: 'pages/login.html', // Path to HTML file
            routeScript: function () {
                SPA.mainDivCSS();

                if (typeof google !== 'undefined' && google.accounts) {
                    google.accounts.id.initialize({
                        client_id: "632484486903-vm1hfg66enqfkffsmlhih0au506obuch.apps.googleusercontent.com",
                        callback: handleGoogleAuth
                    });

                    // afficher le bouton de connexion
                    google.accounts.id.renderButton(
                        document.querySelector('.g_id_signin'),
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
                const savedUser = localStorage.getItem('googleUser');
                if (savedUser) {
                    const userData = JSON.parse(savedUser);
                    displayUserInfo(userData);
                }

                // Gérer la déconnexion
                const signoutBtn = document.getElementById('signout-btn');
                if (signoutBtn) {
                    signoutBtn.addEventListener('click', signOut);
                }

                login();
            }
        },

        '/register': {
            title: 'register',
            content: 'pages/register.html', // Path to HTML file
            routeScript: function () {
                SPA.mainDivCSS();

                register();
            }
        },

        '/changePassword': {
            title: 'changePassword',
            content: 'pages/changePassword.html', // Path to HTML file
            routeScript: function () {
                SPA.mainDivCSS();

                changePassword();
            }
        },

        '/profile': {
            title: 'profile',
            content: 'pages/profile.html', // Path to HTML file
            routeScript: function () {
                SPA.mainDivCSS();

                const isAuthenticated = localStorage.getItem('isAuthenticated');
                if (!isAuthenticated) {
                    SPA.notAuthenticated();
                } else {
                    const user = JSON.parse(localStorage.getItem('user'));
                    displayUserProfile(user);
                }
            }
        }
    },

    init: function() {
        console.log('🚀 Initialisation de la SPA...');
        
        // pour intercepter les clics sur les liens contenant l'attribut data-route
        document.addEventListener('click', event => {
            const target = event.target;
            
            // Si c'est un lien avec data-route, intercepter la navigation
            if (target.tagName === 'A' && target.hasAttribute('data-route')) {
                event.preventDefault();
                const route = target.getAttribute('data-route');
                this.navigateTo(route);
            }
        });
        
        // Detection de la route courante et chargement initial
        window.addEventListener('popstate', () => {
            this.loadRoute(window.location.pathname);
        });

        // Chargement initial de la route en fonction de l'URL actuelle
        const currentPath = window.location.pathname;
        this.navigateTo(currentPath);
        
        console.log('✅ SPA initialisée avec succès !');
    },

    navigateTo: function (route) {
        // fonction membre qui vient de l'API History et qui change l'url sans recharger la page
        history.pushState(null, null, route);

        this.loadRoute(route);

        this.setCurrentPageToActive(route);
    },    loadRoute: async function (route) { // Make function async
        console.log(`📄 Chargement de la route: ${route}`);

        const routeToLoad = this.routes[route];
        if (!routeToLoad) {
            console.error(`❌ Route non trouvée: ${route}`);
            this.error404();
            return;
        }

        document.title = routeToLoad.title;
        const contentDiv = document.querySelector(this.SPAattribute.contentDiv);

        // Check if content is a path to an .html file
        if (typeof routeToLoad.content === 'string' && routeToLoad.content.endsWith('.html')) {
            try {
                const response = await fetch(routeToLoad.content);
                if (!response.ok) {
                    throw new Error(`Erreur lors du chargement de ${routeToLoad.content}: ${response.statusText}`);
                }
                const html = await response.text();
                contentDiv.innerHTML = html;
            } catch (error) {
                console.error(`Erreur lors du chargement du contenu HTML pour ${route}:`, error);
                contentDiv.innerHTML = '<p>Erreur de chargement du contenu.</p>';
                this.error404();
                return;
            }
        } else if (typeof routeToLoad.content === 'string') {
            // Fallback for direct HTML string content (if any are left)
            contentDiv.innerHTML = routeToLoad.content;
        } else {
            console.error(`❌ Contenu de route invalide pour: ${route}`);
            this.error404();
            return;
        }

        // Execute the route's script if it exists
        if (routeToLoad.routeScript && typeof routeToLoad.routeScript === 'function') {
            routeToLoad.routeScript();
        }
        
        // Ajouter la télécommande aux pages autres que la landing page
        if (route !== '/') {
            // Petit délai pour s'assurer que la page est chargée
            setTimeout(() => {
                this.addGlobalRemoteControl();
            }, 100);
        }
    },

    setCurrentPageToActive: function(currentPath) {
        // Reset all active links
        const links = document.querySelectorAll('a[data-route]');
        links.forEach(link => {
            link.classList.remove('active');
        });
        
        // Find and set the current active link
        const activeLink = document.querySelector(`a[data-route="${currentPath}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }    },      error404: function() {
        // Appliquons le style de mise en page pour les pages qui ne sont pas la landing page
        this.mainDivCSS();
        
        const contentDiv = document.querySelector(this.SPAattribute.contentDiv);
        contentDiv.innerHTML = `
            <div class="vhs-transition">
                <img src="test2.png" class="vhs-gif" alt="Transition VHS">
            </div>
            <div class="error404-content">
                <h1 class="error-title">Page non trouvée</h1>
                <p class="error-message">La page que vous recherchez n'existe pas.</p>
                <img src="gif/error404.gif" class="error-gif" alt="Erreur 404" style="max-width:80%; max-height: 40vh;">
                <button class="btn" onclick="SPA.navigateTo('/home')" style="margin-top:20px;">Retour à l'accueil</button>
            </div>
        `;
        
        document.title = 'Error 404 - Chaîne introuvable';
        
        // Ajouter la télécommande globale sur la page d'erreur
        this.addGlobalRemoteControl();      },addGlobalRemoteControl: function() {
        // Ne pas ajouter de télécommande sur la landing page
        if (window.location.hash === '#/') {
            return;
        }

        // Supprimer l'ancienne télécommande si elle existe
        const existingRemote = document.querySelector('.remote-control-404');
        if (existingRemote) {
            existingRemote.remove();
        }
        
        // Supprimer l'ancien style si il existe
        const existingStyle = document.querySelector('#remote-style-404');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // Map des chaînes/pages pour navigation
        const channels = new Map([
            [1, { name: 'Landing', route: '/' }],
            [2, { name: 'Home', route: '/home' }],
            [3, { name: 'About', route: '/about' }],
            [4, { name: 'Dashboard', route: '/dashboard' }],
            [5, { name: 'Tournoi', route: '/tournoi' }],
            [6, { name: 'Profile', route: '/profile' }],
            [7, { name: 'Login', route: '/login' }],
            [8, { name: 'Register', route: '/register' }],
            [9, { name: 'Password', route: '/changePassword' }]
        ]);
        
        // Déterminer la chaîne actuelle basée sur l'URL
        let currentPath = window.location.hash.substring(1); // Enlève le #
        let currentChannel = 2; // Home par défaut
        
        // Trouver la chaîne qui correspond à l'URL actuelle
        for (const [key, value] of channels.entries()) {
            if (value.route === currentPath) {
                currentChannel = key;
                break;
            }
        }
        
        // CSS style télécommande cartoon
        const style = document.createElement('style');        style.id = 'remote-style-404';
        style.textContent = `            /* Zone de détection hover invisible en bas à droite */
            .hover-zone-404 {
                position: fixed !important;
                bottom: 0 !important;
                right: 0 !important;
                width: 220px !important;
                height: 50px !important;
                z-index: 999998 !important;
                background: transparent !important;
                cursor: default !important;
            }/* Hover zone sans icône ni texte */
            .hover-zone-404::before {
                content: '';
                position: absolute;
                bottom: 5px;
                right: 20px;
            }              .remote-control-404 {
                position: fixed !important;
                bottom: 20px !important; /* Position en bas de l'écran */
                right: 20px !important;
                transform: translateY(100%) !important; /* Cachée sous l'écran */
                z-index: 999999 !important;
                transition: transform 0.4s ease !important;
            }
            
            /* Quand on hover la zone OU la télécommande */
            .hover-zone-404:hover + .remote-control-404,
            .remote-control-404:hover {
                transform: translateY(0) !important; /* Visible complètement */
                bottom: 20px !important; /* Maintient la position en bas */
            }
            
            .remote-body {
                width: 180px;
                height: 440px;
                background: #7dd3c0;
                border: 4px solid #f4d03f;
                border-radius: 25px;
                box-shadow: 
                    0 10px 30px rgba(0,0,0,0.3),
                    inset 0 2px 0 rgba(255,255,255,0.3);
                padding: 20px;
                position: relative;
            }
            
            /* Un seul bouton power rouge en haut à gauche */
            .power-btn {
                width: 35px;
                height: 35px;
                background: #e74c3c;
                border: 3px solid #2c3e50;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 4px 0 #c0392b;
                transition: all 0.1s ease;
                margin-bottom: 20px;
            }
            
            .power-btn:hover {
                background: #ec7063;
            }
            
            .power-btn:active {
                transform: translateY(2px);
                box-shadow: 0 2px 0 #c0392b;
            }
            
            /* Grille 3x3 boutons blancs */
            .nav-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                grid-template-rows: repeat(3, 1fr);
                gap: 8px;
                margin-bottom: 20px;
            }
            
            .nav-btn {
                width: 40px;
                height: 25px;
                background: #ffffff;
                border: 3px solid #2c3e50;
                border-radius: 15px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                color: #2c3e50;
                box-shadow: 0 3px 0 #34495e;
                transition: all 0.1s ease;
            }
            
            .nav-btn:hover {
                background: #ecf0f1;
            }
            
            .nav-btn:active {
                transform: translateY(2px);
                box-shadow: 0 1px 0 #34495e;
            }
            
            /* Boutons jaunes sur les côtés */
            .side-buttons {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
            }
            
            .side-btn {
                width: 30px;
                height: 30px;
                background: #f1c40f;
                border: 3px solid #2c3e50;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 3px 0 #f39c12;
                transition: all 0.1s ease;
            }
            
            .side-btn:hover {
                background: #f7dc6f;
            }
            
            .side-btn:active {
                transform: translateY(2px);
                box-shadow: 0 1px 0 #f39c12;
            }
            
            /* Pad directionnel central */
            .directional-pad {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .dpad-container {
                position: relative;
                width: 100px;
                height: 100px;
                background: #f1c40f;
                border: 4px solid #2c3e50;
                border-radius: 15px;
                box-shadow: 0 4px 0 #f39c12;
            }
            
            .dpad-btn {
                position: absolute;
                background: transparent;
                border: none;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
                color: #2c3e50;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .dpad-up {
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
            }
            
            .dpad-down {
                bottom: 10px;
                left: 50%;
                transform: translateX(-50%);
            }
            
            .dpad-left {
                left: 10px;
                top: 50%;
                transform: translateY(-50%);
            }
            
            .dpad-right {
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
            }
            
            .dpad-center {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 30px;
                height: 30px;
                background: #2c3e50;
                border: 2px solid #fff;
                border-radius: 50%;
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                cursor: pointer;
            }
            
            .dpad-center:hover {
                background: #34495e;
            }
            
            /* Boutons colorés en bas */
            .color-row {
                display: flex;
                justify-content: space-around;
                margin-bottom: 20px;
            }
            
            .color-btn {
                width: 35px;
                height: 15px;
                border: 3px solid #2c3e50;
                border-radius: 10px;
                cursor: pointer;
                box-shadow: 0 3px 0 rgba(0,0,0,0.2);
                transition: all 0.1s ease;
            }
            
            .color-btn.red {
                background: #e74c3c;
            }
            
            .color-btn.yellow {
                background: #f1c40f;
            }
            
            .color-btn.green {
                background: #27ae60;
            }
            
            .color-btn:hover {
                filter: brightness(1.1);
            }
            
            .color-btn:active {
                transform: translateY(2px);
                box-shadow: 0 1px 0 rgba(0,0,0,0.2);
            }
            
            /* Écran en haut */
            .remote-screen {
                width: 140px;
                height: 35px;
                background: #2c3e50;
                border: 2px solid #34495e;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 15px auto;
            }
            
            .channel-display {
                color: #00ff00;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);        // HTML de la télécommande cartoon avec zone de hover
        const remoteHTML = `
            <div class="hover-zone-404"></div>
            <div class="remote-control-404">
                <div class="remote-body">
                    <div class="remote-screen">
                        <span class="channel-display" id="channel-display">CH ${currentChannel} - ${channels.get(currentChannel).name}</span>
                    </div>
                    
                    <div class="power-btn" onclick="SPA.navigateTo('/login')" title="Power"></div>
                    
                    <div class="nav-grid">
                        <button class="nav-btn" onclick="remoteNavigate('/')" title="Landing">1</button>
                        <button class="nav-btn" onclick="remoteNavigate('/home')" title="Home">2</button>
                        <button class="nav-btn" onclick="remoteNavigate('/about')" title="About">3</button>
                        <button class="nav-btn" onclick="remoteNavigate('/dashboard')" title="Dashboard">4</button>
                        <button class="nav-btn" onclick="remoteNavigate('/tournoi')" title="Tournoi">5</button>
                        <button class="nav-btn" onclick="remoteNavigate('/profile')" title="Profil">6</button>
                        <button class="nav-btn" onclick="remoteNavigate('/login')" title="Login">7</button>
                        <button class="nav-btn" onclick="remoteNavigate('/register')" title="Register">8</button>
                        <button class="nav-btn" onclick="remoteNavigate('/changePassword')" title="Password">9</button>
                    </div>
                    
                    <div class="side-buttons">
                        <div class="side-btn" onclick="SPA.navigateTo('/profile')" title="Profil"></div>
                        <div class="side-btn" onclick="SPA.navigateTo('/tournoi')" title="Tournoi"></div>
                    </div>
                    
                    <div class="directional-pad">
                        <div class="dpad-container">
                            <button class="dpad-btn dpad-up" onclick="changeChannelGlobal(1)" title="Channel +">▲</button>
                            <button class="dpad-btn dpad-down" onclick="changeChannelGlobal(-1)" title="Channel -">▼</button>
                            <button class="dpad-btn dpad-left" onclick="history.back()" title="Back">◀</button>
                            <button class="dpad-btn dpad-right" onclick="history.forward()" title="Forward">▶</button>
                            <button class="dpad-center" onclick="location.reload()" title="OK">OK</button>
                        </div>
                    </div>
                    
                    <div class="color-row">
                        <div class="color-btn red" onclick="SPA.navigateTo('/profile')" title="Rouge"></div>
                        <div class="color-btn yellow" onclick="SPA.navigateTo('/dashboard')" title="Jaune"></div>
                        <div class="color-btn green" onclick="SPA.navigateTo('/home')" title="Vert"></div>
                    </div>
                    
                    <!-- Marge vide en bas -->
                    <div style="height: 20px;"></div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', remoteHTML);
          // Fonctions JavaScript globales
        window.remoteNavigate = function(route) {
            SPA.navigateTo(route);
        };
        
        window.changeChannel = function(direction) {
            const channelKeys = Array.from(channels.keys());
            let currentIndex = channelKeys.indexOf(currentChannel);
            
            if (direction > 0) {
                currentIndex = (currentIndex + 1) % channelKeys.length;
            } else {
                currentIndex = currentIndex <= 0 ? channelKeys.length - 1 : currentIndex - 1;
            }
            
            currentChannel = channelKeys[currentIndex];
            const channel = channels.get(currentChannel);
            
            document.getElementById('channel-display').textContent = `CH ${currentChannel} - ${channel.name}`;
            SPA.navigateTo(channel.route);
        };
        
        console.log('🎮 Télécommande top-hover ajoutée !');
    }
};

// Initialize the SPA when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    SPA.init();
    // La télécommande sera ajoutée par les pages individuelles au besoin
});
