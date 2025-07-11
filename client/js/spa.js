const SPA = {
    SPAattribute: {
        defaultRoute: '/', // page par défaut
        contentDiv: '#content' // id de l'html où le contenu sera chargé
    },

    handleLayout: function(route) {
        const tvContainer = document.querySelector('#tv-container');
        const content = document.querySelector(this.SPAattribute.contentDiv);
        const isLanding = route === '/';

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

    VhsTransition: function () {
        const app = document.querySelector('#content');
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
            routeScript: function () {
                getUserDataFromBackend();
            }
        },

        '/login': {
            title: 'login',
            content: 'pages/login.html',
            routeScript: function () {
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
                
                alreadyLoggedIn();
                login();
            }
        },

        '/register': {
            title: 'register',
            content: 'pages/register.html',
            routeScript: function () {
                register();
            }
        },

        '/friends': {
            title: 'friends',
            content: 'pages/friends.html',
            routeScript: function () {
                displayFriendsList();
            }
        },

        '/changePassword': {
            title: 'changePassword',
            content: 'pages/changePassword.html',
            routeScript: function () {
                changePassword();
            }
        },

        '/profile': {
            title: 'profile',
            content: 'pages/profile.html',
            routeScript: function () {
                displayUserProfile();
                changeUsername();
                changeAvatar();
            }
        }
    },

    init: function() {
        document.addEventListener('click', event => {
            const target = event.target;
            
            if (target.tagName === 'A' && target.hasAttribute('data-route')) {
                event.preventDefault();
                const route = target.getAttribute('data-route');
                this.navigateTo(route);
            }
        });
        
        window.addEventListener('popstate', () => {
            this.loadRoute(window.location.pathname);
        });

        const currentPath = window.location.pathname;
        this.navigateTo(currentPath);
    },

    navigateTo: function (route) {
        history.pushState(null, null, route);
        this.loadRoute(route);
        this.setCurrentPageToActive(route);
    },

    loadRoute: async function (route) {
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        const publicRoutes = ['/', '/login', '/register'];

        if (!isAuthenticated && !publicRoutes.includes(route)) {
            this.navigateTo('/login');
            return;
        }

        if (isAuthenticated && (route === '/login' || route === '/register')) {
            this.navigateTo('/home');
            return;
        }

        this.handleLayout(route);

        const routeToLoad = this.routes[route];
        if (!routeToLoad) {
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
        console.error('error 404 - page not found');
        const contentDiv = document.querySelector(this.SPAattribute.contentDiv);
        contentDiv.innerHTML = `
            <div class="vhs-transition">
                <img src="media/error404.gif" class="vhs-gif" alt="Transition VHS">
            </div>
        `;
        document.title = 'Error 404 - Page Not Found';
    }
    };

document.addEventListener('DOMContentLoaded', function() {
    SPA.init();
});
