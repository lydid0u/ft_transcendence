const SPA = {
    SPAattribute: {
        defaultRoute: '/', //page par défaut
        contentDiv: '#content' //id de l'html où le contenu sera chargé
    },

    // cache pour stocker les pages déjà chargées et eviter de les recharger
    cache: new Map(),

    // Fonction pour masquer la navigation et adapter le layout pour la landing page
    hideStyleForLandingPage: function() {
        document.querySelector('nav').style.display = 'none';
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
    mainDivCSS: function() {
        document.querySelector('nav').style.display = 'block';
        const main = document.querySelector('main');
        main.style.margin = '2rem auto';
        main.style.maxWidth = '1200px';
        main.style.background = 'white';
        main.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        main.style.borderRadius = '8px';
        main.style.minHeight = '500px';
        main.style.padding = '0 2rem';
    },

    // Fonction pour afficher la transition VHS
    showVhsTransition: function() {
        const app = document.querySelector('#content');
        app.innerHTML = `
            <div class="vhs-transition">
                <img src="gif/vhs.gif" class="vhs-gif" alt="Transition VHS">
            </div>
        `;
        
        // Après 3 secondes (ajustez selon la durée de votre GIF), rediriger vers /home
        setTimeout(() => {
            this.navigateTo('/home');
        }, 2000);
    },

    notAuthenticated: function() {
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
            routeScript: function() {
                SPA.hideStyleForLandingPage();
                console.log('🎬 Landing page chargée');
            }
        },

        '/home': {
            title: 'Accueil',
            content: 'pages/home.html', // Path to HTML file
            routeScript: function() {
                SPA.mainDivCSS();
            }
        },    
               
        '/about': {
            title: 'Qui sommes-nous ?',
            content: 'pages/about.html', // Path to HTML file
            routeScript: function() {
                SPA.mainDivCSS();
                console.log('Page À propos chargée !');
            }
        },

        '/tournoi': {
            title: 'tournoi',
            content: 'pages/tournoi.html', // Path to HTML file
            routeScript: function() {
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
            routeScript: function() {
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
            routeScript: function() {
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

                login()
            }
        }, 

        '/register': {
            title: 'register',
            content: 'pages/register.html', // Path to HTML file
            routeScript: function() {
                SPA.mainDivCSS();

                register();
            }
        },

        '/changePassword': {
            title: 'changePassword',
            content: 'pages/changePassword.html', // Path to HTML file
            routeScript: function() {
                SPA.mainDivCSS();

                changePassword();
            }
        },        

        '/profile': {
            title: 'profile',
            content: 'pages/profile.html', // Path to HTML file
            routeScript: function() {
                SPA.mainDivCSS();

                const isAuthenticated = localStorage.getItem('isAuthenticated');
                if (!isAuthenticated) {
                    SPA.notAuthenticated();
                } else {
                    const user = JSON.parse(localStorage.getItem('user'));
                    const contentDiv = document.querySelector(SPA.SPAattribute.contentDiv);
                    contentDiv.innerHTML += `
                        <div class="page-content">
                            <p>Bienvenue, ${user.email} !</p>
                            <p><a href="/changePassword" data-route="/changePassword" style="color: #007bff;" > Changer </a>de mot de passe ?<p>
                            
                        </div>
                    `;
                   
                    getUserDataFromBackend();
                }
            }
        }
    },

    //cette fonction demarre la SPA, elle est appelée quand le DOM est chargé et charge la 1e page
    initSPA: function() {
        console.log('🚀 Initialisation de la SPA...');
        
        this.handleClick();
        this.handlePreviousNextButtons();
        this.loadCurrentPage();
        
        console.log('✅ SPA initialisée avec succès !');
    },

    //gere les clics sur les liens de navigation et empeche le rechargement de la page
    handleClick: function() {
      document.addEventListener('click', (e) => {
          
            const link = e.target.closest('[data-route]'); // on recup l'element clique avec e.target et .closest cherche dans le DOM l'element le plus proche qui a l'attribut 'data-route'
            //si ca a ete trouve, on stop le comportement par defaut (rechargement de la page) et on change l'url et le contenu sur la page sans recharger la page
            if (link) {
                e.preventDefault();
                const route = link.getAttribute('data-route');
                this.navigateTo(route);
            }
        });
    },

    handlePreviousNextButtons: function() {
        window.addEventListener('popstate', () => { //popstate est un evenement web qui sactive apres qu'on ai clique suivant/precedent et previent du changement d'url
            this.loadCurrentPage(); //cette fonction est alors appelee pour charger la page correspondante a l'url actuelle
        });
    },

    navigateTo: function(route) {
      // fonction membre qui vient de l'API History et qui change l'url sans recharger la page
        history.pushState(null, null, route);
        
        this.loadRoute(route);
        
        this.setCurrentPageToActive(route);
    },

    loadRoute: async function(route) { // Make function async
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

        contentDiv.classList.remove('fade-in');
        contentDiv.offsetHeight; // Force reflow for animation
        contentDiv.classList.add('fade-in');

        if (routeToLoad.routeScript && typeof routeToLoad.routeScript === 'function') {
            setTimeout(() => { 
                routeToLoad.routeScript();
            }, 10);
        }
    },

    loadCurrentPage: function() {
        const currentPath = window.location.pathname;
        this.loadRoute(currentPath);
        this.setCurrentPageToActive(currentPath);
    },

    // supprime le css active de l'ancienne page et ajoute le nouveau css
    setCurrentPageToActive: function(currentRoute) {
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[data-route="${currentRoute}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    },

    error404: function() {
        const contentDiv = document.querySelector(this.SPAattribute.contentDiv);
        contentDiv.innerHTML = `
            </div>
            <div class="vhs-transition">
                <img src="gif/error404.gif" class="vhs-gif" alt="Transition VHS">

        `;
        document.title = 'Error 404';
    }
};
