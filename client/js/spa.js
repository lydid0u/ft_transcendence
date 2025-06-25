const SPA = {
    SPAattribute: {
        defaultRoute: '/', // page par défaut
        contentDiv: '#content' // id de l'html où le contenu sera chargé
        ,contentParent: null
    },

    hideStyleForLandingPage: function () {
        const content = document.querySelector(this.SPAattribute.contentDiv);
        const tvContainer = document.querySelector('#tv-container');

        if (content && tvContainer) {
            // Sauvegarder le parent original s'il n'est pas déjà sauvegardé
            if (!this.SPAattribute.contentParent) {
                this.SPAattribute.contentParent = content.parentNode;
            }
            // Déplacer #content pour qu'il soit un enfant direct de <body>
            // pour qu'il ne soit pas caché quand on cache #tv-container
            if (content.parentNode !== document.body) {
                document.body.appendChild(content);
            }
        }

        if (tvContainer) {
            tvContainer.style.display = 'none';
        }
        
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflow = 'auto';
        document.body.style.height = 'auto';
        document.body.style.background = 'white';
        
        if(content) {
            content.style.position = 'static';
            content.style.margin = '0';
            content.style.maxWidth = 'none';
            content.style.background = 'white';
            content.style.boxShadow = 'none';
            content.style.borderRadius = '0';
            content.style.minHeight = '100vh';
            content.style.padding = '0';
        }
    },

    // Fonction pour restaurer la navigation et le layout normal
    mainDivCSS: function () {
        const content = document.querySelector(this.SPAattribute.contentDiv);
        const tvContainer = document.querySelector('#tv-container');

        // Replacer #content dans son conteneur original (dans la TV)
        if (content && this.SPAattribute.contentParent && content.parentNode !== this.SPAattribute.contentParent) {
            this.SPAattribute.contentParent.appendChild(content);
        }

        if (tvContainer) {
            tvContainer.style.display = 'flex';
        }

        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
        document.body.style.background = '#c3c1a8'; // Couleur de fond originale

        // Réinitialiser les styles de #content pour qu'il s'affiche correctement dans la TV
        if (content) {
            content.style.position = '';
            content.style.margin = '';
            content.style.maxWidth = '';
            content.style.background = '';
            content.style.boxShadow = '';
            content.style.borderRadius = '';
            content.style.minHeight = '';
            content.style.padding = '';
        }
    },

    VhsTransition: function () {
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
    },

    loadRoute: async function (route) { // Make function async
        console.log(`📄 Chargement de la route: ${route}`);

        const routeToLoad = this.routes[route];
        if (!routeToLoad) {
            console.error(`❌ Route non trouvée: ${route}`);
            this.error404();
            return;
        }

        // Execute the route's script if it exists
        if (routeToLoad.routeScript && typeof routeToLoad.routeScript === 'function') {
            routeToLoad.routeScript();
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
            console.error(`Contenu de route invalide pour: ${route}`);
            this.error404();
            return;
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
        console.error('error 404 - page not found');
        const contentDiv = document.querySelector(this.SPAattribute.contentDiv);
        contentDiv.innerHTML = `
            <div class="vhs-transition">
                <img src="gif/error404.gif" class="vhs-gif" alt="Transition VHS">
            </div>
        `;
        document.title = 'Error 404 - Page Not Found';
    }
    };

document.addEventListener('DOMContentLoaded', function() {
    SPA.init();
});
