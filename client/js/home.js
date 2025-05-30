//  function handleCredentialResponse(response) {
//             console.log("🎉 Google vient de m'envoyer ceci:", response);
//             const userInfo = parseJwt(response.credential);
//             console.log("👤 Informations utilisateur décodées:", userInfo);
            
//             /*
//             💾 SAUVEGARDE DANS LOCALSTORAGE
            
//             Ici, je vais sauvegarder les infos utilisateur dans le localStorage.
//             C'est comme mettre les données dans un coffre-fort du navigateur
//             qui survit aux rechargements de page.
            
//             localStorage.setItem(clé, valeur) = "Sauvegarde cette valeur avec ce nom"
//             JSON.stringify() = transforme un objet JavaScript en texte
//             (localStorage ne peut stocker que du texte, pas des objets)
//             */
//             localStorage.setItem('googleUserInfo', JSON.stringify(userInfo));
//             localStorage.setItem('isLoggedIn', 'true');
//             console.log("💾 Données sauvegardées dans localStorage");
            
//             // Maintenant j'affiche les informations (j'utilise une fonction séparée)
//             displayUserInfo(userInfo);
//         }

//         /*
//         🖼️ FONCTION D'AFFICHAGE: displayUserInfo
        
//         J'ai séparé l'affichage dans sa propre fonction car elle sera utilisée
//         à deux endroits:
//         1. Après connexion Google (données fraîches)
//         2. Au chargement de page (données du localStorage)
        
//         C'est un principe important en programmation: si tu fais la même chose
//         à plusieurs endroits, crée une fonction !
//         */
//         function displayUserInfo(userInfo) {
//             console.log("🖼️ Affichage des informations utilisateur:", userInfo);
            
//             /*
//             📝 REMPLISSAGE DES ÉLÉMENTS HTML
            
//             document.getElementById = "Va chercher l'élément HTML avec cet ID"
//             .textContent = "Change le texte à l'intérieur"
//             .src = "Change l'attribut src (pour les images)"
            
//             L'opérateur || signifie "ou alors". Si userInfo.name est vide,
//             utilise "Nom non disponible" à la place.
//             */
//             document.getElementById('user-name').textContent = userInfo.name || "Nom non disponible";
//             document.getElementById('user-email').textContent = userInfo.email || "Email non disponible";
//             document.getElementById('user-id').textContent = userInfo.sub || "ID non disponible";
            
//             // Pour la photo de profil, on vérifie qu'elle existe avant de l'afficher
//             if (userInfo.picture) {
//                 document.getElementById('user-picture').src = userInfo.picture;
//             }
            
//             /*
//             👁️ GESTION DE L'AFFICHAGE
            
//             Maintenant je dois:
//             1. Cacher le bouton de connexion (plus besoin, il est connecté!)
//             2. Montrer les infos utilisateur
//             */
            
//             // Je cache le bouton Google
//             document.getElementById('g_id_onload').style.display = 'none';
            
//             // J'affiche les infos utilisateur
//             document.getElementById('user-info').style.display = 'block';
//         }

//         /*
//         🔓 FONCTION DE DÉCODAGE JWT: parseJwt
        
//         Cette fonction prend un token JWT encodé et le transforme en objet JavaScript lisible.
//         C'est comme avoir un décodeur secret pour lire un message chiffré.
        
//         Pourquoi c'est compliqué? Parce que Google encode les données en "Base64" 
//         pour la sécurité et pour qu'elles passent bien sur internet.
//         */
//         function parseJwt(token) {
//             console.log("🔍 Token JWT brut reçu:", token);
            
//             /*
//             ✂️ DÉCOUPAGE DU TOKEN
//             Un JWT a 3 parties séparées par des points: "header.payload.signature"
//             split('.') = découpe le texte à chaque point
//             [1] = prend la 2ème partie (l'index 1, car on compte à partir de 0)
//             */
//             const base64Url = token.split('.')[1];
//             console.log("📦 Partie payload extraite:", base64Url);
            
//             /*
//             🔄 CONVERSION BASE64URL → BASE64
//             Google utilise "Base64URL" (variante de Base64) qui remplace:
//             - les tirets (-) par des plus (+)
//             - les underscores (_) par des slashes (/)
            
//             C'est comme convertir un dialecte vers la langue standard.
//             */
//             const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//             console.log("🔄 Converti en Base64 standard:", base64);
            
//             /*
//             📖 DÉCODAGE BASE64
//             atob() = fonction du navigateur qui décode le Base64
//             Mais le résultat peut contenir des caractères spéciaux, 
//             donc on les encode proprement avec decodeURIComponent
            
//             Cette partie est technique, retiens juste que ça transforme 
//             du charabia en texte JSON lisible.
//             */
//             const jsonPayload = decodeURIComponent(
//                 atob(base64)
//                     .split('')
//                     .map(function(c) {
//                         return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//                     })
//                     .join('')
//             );
//             console.log("📝 JSON décodé:", jsonPayload);
            
//             /*
//             🎯 TRANSFORMATION EN OBJET JAVASCRIPT
//             JSON.parse() transforme le texte JSON en vrai objet JavaScript
//             qu'on peut utiliser facilement avec user.name, user.email, etc.
//             */
//             const userObject = JSON.parse(jsonPayload);
//             console.log("✅ Objet utilisateur final:", userObject);
            
//             return userObject;
//         }

//         /*
//         🚪 FONCTION DE DÉCONNEXION
        
//         Cette fonction nettoie tout quand l'utilisateur veut se déconnecter.
//         Elle remet la page dans son état initial ET supprime les données sauvegardées.
//         */
//         function signOut() {
//             console.log("👋 Déconnexion en cours...");
            
//             /*
//             🗑️ NETTOYAGE DU LOCALSTORAGE
            
//             localStorage.removeItem() = "Supprime cette donnée sauvegardée"
//             C'est crucial de nettoyer, sinon l'utilisateur resterait connecté
//             même après déconnexion !
//             */
//             localStorage.removeItem('googleUserInfo');
//             localStorage.removeItem('isLoggedIn');
//             console.log("🗑️ Données supprimées du localStorage");
            
//             /*
//             🧹 NETTOYAGE DE L'INTERFACE
//             On fait l'inverse de la connexion:
//             1. Cacher les infos utilisateur
//             2. Réafficher le bouton Google
//             */
//             document.getElementById('user-info').style.display = 'none';
//             document.getElementById('g_id_onload').style.display = 'block';
            
//             /*
//             ✨ PAS BESOIN DE RECHARGER !
            
//             Avant, on rechargeait la page avec location.reload().
//             Maintenant qu'on gère la persistance proprement, 
//             on peut juste changer l'affichage sans recharger.
//             C'est plus fluide pour l'utilisateur !
//             */
//             console.log("✅ Déconnexion terminée");
//         }

//         /*
//         🔄 FONCTION DE VÉRIFICATION AU CHARGEMENT: checkExistingLogin
        
//         Cette fonction est appelée quand la page se charge.
//         Elle vérifie s'il y a déjà des données de connexion sauvegardées.
        
//         C'est comme vérifier s'il y a déjà un ticket de caisse dans ta poche
//         quand tu entres dans un magasin.
//         */
//         function checkExistingLogin() {
//             console.log("🔍 Vérification d'une session existante...");
            
//             /*
//             📖 LECTURE DU LOCALSTORAGE
            
//             localStorage.getItem() = "Donne-moi la valeur sauvegardée avec ce nom"
//             Si rien n'est sauvegardé, ça renvoie null (rien).
//             */
//             const isLoggedIn = localStorage.getItem('isLoggedIn');
//             const savedUserInfo = localStorage.getItem('googleUserInfo');
            
//             console.log("📖 Statut de connexion sauvegardé:", isLoggedIn);
//             console.log("📖 Données utilisateur sauvegardées:", savedUserInfo);
            
//             /*
//             ✅ VÉRIFICATION ET RESTAURATION
            
//             Je vérifie deux choses:
//             1. Est-ce que l'utilisateur était connecté ? (isLoggedIn === 'true')
//             2. Est-ce que j'ai ses informations ? (savedUserInfo existe)
            
//             L'opérateur && signifie "ET". Les deux conditions doivent être vraies.
//             */
//             if (isLoggedIn === 'true' && savedUserInfo) {
//                 /*
//                 🔄 TRANSFORMATION TEXTE → OBJET
                
//                 JSON.parse() fait l'inverse de JSON.stringify():
//                 Il transforme du texte JSON en objet JavaScript utilisable.
                
//                 Rappel: localStorage ne stocke que du texte, donc on doit
//                 reconvertir en objet pour l'utiliser.
//                 */
//                 const userInfo = JSON.parse(savedUserInfo);
//                 console.log("🔄 Restauration de la session:", userInfo);
                
//                 // J'affiche les infos comme si l'utilisateur venait de se connecter
//                 displayUserInfo(userInfo);
//             } else {
//                 console.log("❌ Aucune session trouvée, affichage du bouton de connexion");
//                 // L'utilisateur n'était pas connecté, on montre le bouton Google
//                 document.getElementById('g_id_onload').style.display = 'block';
//                 document.getElementById('user-info').style.display = 'none';
//             }
//         }

//         /*
//         🚀 ÉVÉNEMENT DE CHARGEMENT DE PAGE  
//         window.addEventListener('load', ...) dit au navigateur:
//         "Quand la page est complètement chargée, exécute cette fonction"
        
//         C'est crucial car si on essaie de lire le localStorage avant que
//         la page soit chargée, les éléments HTML n'existent pas encore !
//         */
//         window.addEventListener('load', function() {
//             console.log("🚀 Page complètement chargée, vérification de la session...");
//             checkExistingLogin();
//         });
