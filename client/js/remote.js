/*        // Ajouter la télécommande globale sur la page d'erreur
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
};*/
