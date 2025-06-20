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
        
        // Style pour la TV en arrière-plan en plein écran
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
        document.body.style.background = '#2a2119'; // Couleur de fond sombre autour de la TV
        
        const main = document.querySelector('main');
        main.style.margin = '0';
        main.style.maxWidth = 'none';
        main.style.width = '100%';
        main.style.padding = '0';
        main.style.height = '100vh';
        main.style.background = 'url("./nobg.png") no-repeat center center';
        main.style.backgroundSize = 'contain';
        main.style.boxShadow = 'none';
        main.style.borderRadius = '0';
        main.style.display = 'flex';
        main.style.justifyContent = 'center';
        main.style.alignItems = 'center';
        main.style.position = 'relative';
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
    },

    loadRoute: async function (route) { // Make function async
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
        }
    },

    error404: function() {
        // Appliquons le style de mise en page pour les pages qui ne sont pas la landing page
        this.mainDivCSS();
        
        const contentDiv = document.querySelector(this.SPAattribute.contentDiv);
        contentDiv.innerHTML = `
            <div class="error404-content">
                <h1 class="error-title">Page non trouvée</h1>
                <p class="error-message">La page que vous recherchez n'existe pas.</p>
                <img src="gif/error404.gif" class="error-gif" alt="Erreur 404" style="max-width:80%; max-height: 40vh;">
                <button class="btn" onclick="SPA.navigateTo('/home')" style="margin-top:20px;">Retour à l'accueil</button>
            </div>
        `;
        
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
            [9, { name: 'Change Password', route: '/changePassword' }]
        ]);
        
        let currentChannel = 4; // Default to dashboard

        // Créer un style pour la télécommande
        const style = document.createElement('style');
        style.id = 'remote-style-404';
        style.textContent = `
            .remote-control-404 {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(145deg, #8a7a62, #6d604d);
                border: 3px solid #5a5040;
                border-radius: 20px;
                padding: 15px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                width: 200px;
                transform: scale(0.8);
                transform-origin: bottom right;
                transition: all 0.3s ease;
            }

            .remote-control-404:hover {
                transform: scale(1);
            }

            .remote-body {
                background: linear-gradient(145deg, #706353, #5a4f42);
                border-radius: 15px;
                padding: 15px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .power-btn {
                width: 30px;
                height: 30px;
                background: radial-gradient(circle, #ff0000, #cc0000);
                border-radius: 50%;
                border: 2px solid #880000;
                margin-bottom: 15px;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }

            .power-btn:hover {
                background: radial-gradient(circle, #ff3333, #ee0000);
                box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
            }

            .nav-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                margin-bottom: 15px;
            }

            .nav-btn {
                width: 40px;
                height: 40px;
                background: linear-gradient(145deg, #5d4e3a, #4a3f32);
                border: 2px solid #3a3225;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Arial', sans-serif;
                font-size: 16px;
                font-weight: bold;
                color: #ecd8ac;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }

            .nav-btn:hover {
                background: linear-gradient(145deg, #6d5c45, #574a3c);
                box-shadow: 0 0 8px rgba(236, 216, 172, 0.3);
            }

            .directional-pad {
                width: 120px;
                height: 120px;
                position: relative;
                margin-bottom: 15px;
            }

            .dpad-container {
                position: relative;
                width: 100%;
                height: 100%;
            }

            .dpad-btn {
                position: absolute;
                background: linear-gradient(145deg, #5d4e3a, #4a3f32);
                border: 2px solid #3a3225;
                color: #ecd8ac;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }

            .dpad-up {
                top: 0;
                left: 40px;
                border-radius: 8px 8px 0 0;
            }

            .dpad-right {
                top: 40px;
                right: 0;
                border-radius: 0 8px 8px 0;
            }

            .dpad-down {
                bottom: 0;
                left: 40px;
                border-radius: 0 0 8px 8px;
            }

            .dpad-left {
                top: 40px;
                left: 0;
                border-radius: 8px 0 0 8px;
            }

            .dpad-center {
                position: absolute;
                top: 40px;
                left: 40px;
                width: 40px;
                height: 40px;
                background: linear-gradient(145deg, #706353, #5a4f42);
                border: 2px solid #3a3225;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ecd8ac;
                font-size: 12px;
                font-weight: bold;
                cursor: pointer;
            }

            .dpad-btn:hover, .dpad-center:hover {
                background: linear-gradient(145deg, #6d5c45, #574a3c);
                box-shadow: 0 0 8px rgba(236, 216, 172, 0.3);
            }

            .side-buttons {
                display: flex;
                justify-content: space-between;
                width: 100%;
                margin-bottom: 15px;
            }

            .side-btn {
                width: 20px;
                height: 50px;
                background: linear-gradient(145deg, #5d4e3a, #4a3f32);
                border: 2px solid #3a3225;
                border-radius: 10px;
                cursor: pointer;
            }

            .side-btn:hover {
                background: linear-gradient(145deg, #6d5c45, #574a3c);
                box-shadow: 0 0 8px rgba(236, 216, 172, 0.3);
            }

            .color-row {
                display: flex;
                justify-content: space-between;
                width: 100%;
                margin-bottom: 10px;
            }

            .color-btn {
                width: 25px;
                height: 25px;
                border-radius: 50%;
                border: 2px solid #3a3225;
                cursor: pointer;
            }

            .red { background-color: #ff0000; }
            .yellow { background-color: #ffff00; }
            .green { background-color: #00ff00; }

            .color-btn:hover {
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                transform: scale(1.1);
            }

            .remote-screen { width: 140px; height: 35px; background: #2c3e50; border: 2px solid #34495e; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px auto; }
            .channel-display { color: #00ff00; font-family: 'Courier New', monospace; font-size: 12px; font-weight: bold; }
        `;
        document.head.appendChild(style);

        // HTML de la télécommande cartoon
        const remoteHTML = `
            <div class="remote-control-404">
                <div class="remote-body">
                    <div class="remote-screen">
                        <span class="channel-display" id="channel-display-404">CH 4 - 404</span>
                    </div>
                    <div class="power-btn" onclick="SPA.navigateTo('/login')" title="Power"></div>
                    <div class="nav-grid">
                        <button class="nav-btn" onclick="remoteNavigate404('/')" title="Landing">1</button>
                        <button class="nav-btn" onclick="remoteNavigate404('/home')" title="Home">2</button>
                        <button class="nav-btn" onclick="remoteNavigate404('/about')" title="About">3</button>
                        <button class="nav-btn" onclick="remoteNavigate404('/dashboard')" title="Dashboard">4</button>
                        <button class="nav-btn" onclick="remoteNavigate404('/tournoi')" title="Tournoi">5</button>
                        <button class="nav-btn" onclick="remoteNavigate404('/profile')" title="Profil">6</button>
                        <button class="nav-btn" onclick="remoteNavigate404('/login')" title="Login">7</button>
                        <button class="nav-btn" onclick="remoteNavigate404('/register')" title="Register">8</button>
                        <button class="nav-btn" onclick="remoteNavigate404('/changePassword')" title="Password">9</button>
                    </div>
                    <div class="side-buttons">
                        <div class="side-btn" onclick="SPA.navigateTo('/profile')" title="Profil"></div>
                        <div class="side-btn" onclick="SPA.navigateTo('/tournoi')" title="Tournoi"></div>
                    </div>
                    <div class="directional-pad">
                        <div class="dpad-container">
                            <button class="dpad-btn dpad-up" onclick="changeChannel404(1)" title="Channel +">▲</button>
                            <button class="dpad-btn dpad-down" onclick="changeChannel404(-1)" title="Channel -">▼</button>
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
                    <div style="height: 20px;"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', remoteHTML);

        // Fonction pour la navigation entre les pages
        window.remoteNavigate404 = function(route) {
            SPA.navigateTo(route);
        };

        // Fonction pour changer de chaîne
        window.changeChannel404 = function(direction) {
            const channelKeys = Array.from(channels.keys());
            let currentIndex = channelKeys.indexOf(currentChannel);
            if (direction > 0) {
                currentIndex = (currentIndex + 1) % channelKeys.length;
            } else {
                currentIndex = currentIndex <= 0 ? channelKeys.length - 1 : currentIndex - 1;
            }
            currentChannel = channelKeys[currentIndex];
            const channel = channels.get(currentChannel);
            document.getElementById('channel-display-404').textContent = `CH ${currentChannel} - ${channel.name}`;
            SPA.navigateTo(channel.route);
        };
    },

    addGlobalRemoteControl: function() {
        // Supprimer l'ancienne télécommande si elle existe
        const existingRemote = document.querySelector('.remote-control-global');
        if (existingRemote) {
            existingRemote.remove();
        }
        
        // Supprimer l'ancien style si il existe
        const existingStyle = document.querySelector('#remote-style-global');
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
            [9, { name: 'Change Password', route: '/changePassword' }]
        ]);
        
        let currentChannel = 2; // Default to home
        
        // Créer un style pour la télécommande
        const style = document.createElement('style');
        style.id = 'remote-style-global';
        style.textContent = `
            .remote-control-global {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(145deg, #8a7a62, #6d604d);
                border: 3px solid #5a5040;
                border-radius: 20px;
                padding: 15px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                width: 200px;
                transform: scale(0.8);
                transform-origin: bottom right;
                transition: all 0.3s ease;
                opacity: 0.7;
            }
            
            .hover-zone-global {
                position: fixed;
                bottom: 0;
                right: 0;
                width: 100px; 
                height: 100px;
                z-index: 999;
            }

            .hover-zone-global:hover + .remote-control-global,
            .remote-control-global:hover {
                transform: scale(1);
                opacity: 1;
            }

            .remote-body {
                background: linear-gradient(145deg, #706353, #5a4f42);
                border-radius: 15px;
                padding: 15px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .power-btn {
                width: 30px;
                height: 30px;
                background: radial-gradient(circle, #ff0000, #cc0000);
                border-radius: 50%;
                border: 2px solid #880000;
                margin-bottom: 15px;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }

            .power-btn:hover {
                background: radial-gradient(circle, #ff3333, #ee0000);
                box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
            }

            .nav-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                margin-bottom: 15px;
            }

            .nav-btn {
                width: 40px;
                height: 40px;
                background: linear-gradient(145deg, #5d4e3a, #4a3f32);
                border: 2px solid #3a3225;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Arial', sans-serif;
                font-size: 16px;
                font-weight: bold;
                color: #ecd8ac;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }

            .nav-btn:hover {
                background: linear-gradient(145deg, #6d5c45, #574a3c);
                box-shadow: 0 0 8px rgba(236, 216, 172, 0.3);
            }

            .side-buttons {
                display: flex;
                justify-content: space-between;
                width: 100%;
                margin-bottom: 15px;
            }

            .side-btn {
                width: 20px;
                height: 50px;
                background: linear-gradient(145deg, #5d4e3a, #4a3f32);
                border: 2px solid #3a3225;
                border-radius: 10px;
                cursor: pointer;
            }

            .side-btn:hover {
                background: linear-gradient(145deg, #6d5c45, #574a3c);
                box-shadow: 0 0 8px rgba(236, 216, 172, 0.3);
            }

            .color-row {
                display: flex;
                justify-content: space-between;
                width: 100%;
                margin-bottom: 10px;
            }

            .color-btn {
                width: 25px;
                height: 25px;
                border-radius: 50%;
                border: 2px solid #3a3225;
                cursor: pointer;
            }

            .red { background-color: #ff0000; }
            .yellow { background-color: #ffff00; }
            .green { background-color: #00ff00; }

            .color-btn:hover {
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                transform: scale(1.1);
            }
            
            .remote-screen { width: 140px; height: 35px; background: #2c3e50; border: 2px solid #34495e; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px auto; }
            .channel-display { color: #00ff00; font-family: 'Courier New', monospace; font-size: 12px; font-weight: bold; }
        `;
        document.head.appendChild(style);

        // HTML de la télécommande cartoon avec zone de hover
        const remoteHTML = `
            <div class="hover-zone-global"></div>
            <div class="remote-control-global">
                <div class="remote-body">
                    <div class="remote-screen">
                        <span class="channel-display" id="channel-display-global">CH 2 - Home</span>
                    </div>
                    <div class="power-btn" onclick="SPA.navigateTo('/login')" title="Power"></div>
                    <div class="nav-grid">
                        <button class="nav-btn" onclick="remoteNavigateGlobal('/')" title="Landing">1</button>
                        <button class="nav-btn" onclick="remoteNavigateGlobal('/home')" title="Home">2</button>
                        <button class="nav-btn" onclick="remoteNavigateGlobal('/about')" title="About">3</button>
                        <button class="nav-btn" onclick="remoteNavigateGlobal('/dashboard')" title="Dashboard">4</button>
                        <button class="nav-btn" onclick="remoteNavigateGlobal('/tournoi')" title="Tournoi">5</button>
                        <button class="nav-btn" onclick="remoteNavigateGlobal('/profile')" title="Profil">6</button>
                        <button class="nav-btn" onclick="remoteNavigateGlobal('/login')" title="Login">7</button>
                        <button class="nav-btn" onclick="remoteNavigateGlobal('/register')" title="Register">8</button>
                        <button class="nav-btn" onclick="remoteNavigateGlobal('/changePassword')" title="Password">9</button>
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
                    <div style="height: 20px;"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', remoteHTML);

        // Fonctions JavaScript globales
        window.remoteNavigateGlobal = function(route) {
            SPA.navigateTo(route);
        };
        window.changeChannelGlobal = function(direction) {
            const channelKeys = Array.from(channels.keys());
            let currentIndex = channelKeys.indexOf(currentChannel);
            if (direction > 0) {
                currentIndex = (currentIndex + 1) % channelKeys.length;
            } else {
                currentIndex = currentIndex <= 0 ? channelKeys.length - 1 : currentIndex - 1;
            }
            currentChannel = channelKeys[currentIndex];
            const channel = channels.get(currentChannel);
            document.getElementById('channel-display-global').textContent = `CH ${currentChannel} - ${channel.name}`;
            SPA.navigateTo(channel.route);
        };
    }
};

// Initialize the SPA when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    SPA.init();
    // La télécommande sera ajoutée par les pages individuelles au besoin
});
