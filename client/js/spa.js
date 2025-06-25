const SPA = {
    SPAattribute: {
        defaultRoute: '/', // page par défaut
        contentDiv: '#content' // id de l'html où le contenu sera chargé
    },

    // cache pour stocker les pages déjà chargées et éviter de les recharger
    cache: new Map(),

    // Ajout d'une propriété pour suivre l'état de la TV
    isTvOn: false,

    // Fonction pour masquer la navigation et adapter le layout pour la landing page
    hideStyleForLandingPage: function () {
        // Vérifie si la balise nav existe avant d'essayer d'y accéder
        const navElement = document.querySelector('nav');
        if (navElement) {
            navElement.style.display = 'none';
        }

        const tvContainer = document.querySelector('.container');
        if (tvContainer) {
            tvContainer.style.display = 'none';
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
        main.style.background = 'white';
        main.style.boxShadow = 'none';
        main.style.borderRadius = '0';
        main.style.minHeight = '100vh';
        main.style.padding = '0';
    },

    // Fonction pour restaurer la navigation et le layout normal
    mainDivCSS: function () {
          // Style pour les pages normales (non landing page)
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
        document.body.style.background = 'transparent'; 

        const tvContainer = document.querySelector('.container');
        if (tvContainer) {
            tvContainer.classList.remove('tv-off');
            tvContainer.style.display = 'flex';
            tvContainer.style.position = 'fixed';
            tvContainer.style.top = '0';
            tvContainer.style.left = '0';
            tvContainer.style.width = '100%';
            tvContainer.style.height = '100%';
            tvContainer.style.zIndex = '1';
        }

        const main = document.querySelector('main');
        
        main.style.margin = '0';
        // main.style.maxWidth = 'none';
        // main.style.width = '100%';
        main.style.padding = '0';
        // main.style.height = '100vh';
        main.style.background = 'lightpink'; 
        main.style.boxShadow = 'none';
        main.style.borderRadius = '0';
        main.style.display = 'flex';
        main.style.justifyContent = 'center';
        main.style.alignItems = 'center';
        // main.style.position = 'relative';
        main.style.zIndex = '10'; // S'assurer que le contenu principal est au-dessus de la TV
        main.style.scrollbarColor = "red blue"
    },

    // Fonction pour afficher la transition VHS
    showVhsTransition: function () {
        const app = document.querySelector('#content');
        app.innerHTML = `
            <div class="vhs-transition">
                <img src="gif/vhs.gif" class="vhs-gif" alt="Transition VHS">
            </div>
        `;

        setTimeout(() => {
            this.navigateTo('/home');
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
            content: 'pages/landing.html',
            routeScript: function () {
                SPA.hideStyleForLandingPage();
            }
        },

        '/home': {
            title: 'Accueil',
            content: 'pages/home.html',
            routeScript: function () {
                SPA.mainDivCSS();
            }
        },

        '/about': {
            title: 'Qui sommes-nous ?',
            content: 'pages/about.html',
            routeScript: function () {
                SPA.mainDivCSS();
                console.log('Page À propos chargée !');
            }
        },

        '/tournoi': {
            title: 'tournoi',
            content: 'pages/tournoi.html',
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
            content: 'pages/dashboard.html',
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
            content: 'pages/login.html',
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
            content: 'pages/register.html',
            routeScript: function () {
                SPA.mainDivCSS();

                register();
            }
        },

        '/changePassword': {
            title: 'changePassword',
            content: 'pages/changePassword.html',
            routeScript: function () {
                SPA.mainDivCSS();

                changePassword();
            }
        },

        '/profile': {
            title: 'profile',
            content: 'pages/profile.html',
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
        }
    };

// Initialize the SPA when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    SPA.init();
    // La télécommande sera ajoutée par les pages individuelles au besoin
});
