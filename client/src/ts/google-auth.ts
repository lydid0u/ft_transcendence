// // Types and interfaces
// interface GoogleAuthResponse {
//   credential: string;
// }

// interface GoogleJwtPayload {
//   sub: string; // Google ID
//   name: string;
//   email: string;
//   picture: string;
//   iss: string; // issuer
//   aud: string; // audience
//   exp: number; // expiration time
//   iat: number; // issued at time
//   [key: string]: any;
// }

// interface UserData {
//   googleId: string;
//   name: string;
//   email: string;
//   picture: string;
//   token: string;
// }

// // Global Google API interface
// declare global {
//   interface Window {
//     google?: {
//       accounts: {
//         id: {
//           disableAutoSelect: () => void;
//         };
//       };
//     };
//   }
// }

// // Declare external function
// declare function sendUserDataToBackend(userData: UserData): void;

// function handleGoogleAuth(response: GoogleAuthResponse): void {
//   try {
//     console.log("Encoded JWT ID token: " + response.credential);
    
//     // Decode the JWT token to get user info
//     const objUserData: GoogleJwtPayload = decodeJwtResponse(response.credential);
    
//     const userData: UserData = {
//       googleId: objUserData.sub,
//       name: objUserData.name,
//       email: objUserData.email,
//       picture: objUserData.picture,
//       token: response.credential
//     };
    
//     sendUserDataToBackend(userData);
//   } catch (error) {
//     console.error('Erreur lors de la gestion de l\'authentification Google:', error);
//   }
// }

// // Decode JWT token: take the payload, convert base64Url to base64 to JSON, then return JSON as JS object
// function decodeJwtResponse(token: string): GoogleJwtPayload {
//   try {
//     const parts: string[] = token.split('.');
    
//     if (parts.length !== 3) {
//       throw new Error('Token JWT invalide - format incorrect');
//     }
    
//     const base64Url: string = parts[1];
//     const base64: string = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
//     const jsonPayload: string = decodeURIComponent(
//       atob(base64)
//         .split('')
//         .map(function(c: string): string {
//           return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//         })
//         .join('')
//     );
    
//     const payload: GoogleJwtPayload = JSON.parse(jsonPayload);
    
//     // Validate required fields
//     if (!payload.sub || !payload.name || !payload.email) {
//       throw new Error('Token JWT invalide - données utilisateur manquantes');
//     }
    
//     return payload;
//   } catch (error) {
//     console.error('Erreur lors du décodage du token JWT:', error);
//     throw new Error('Impossible de décoder le token JWT');
//   }
// }

// function displayUserInfo(userData: UserData): void {
//   try {
//     // Hide the login button
//     const signinSection: HTMLElement | null = document.getElementById('signin-section');
//     const loginWithAccountSection: HTMLElement | null = document.getElementById('loginWithAccountSection');
    
//     if (signinSection) {
//       signinSection.style.display = 'none';
//     }
//     if (loginWithAccountSection) {
//       loginWithAccountSection.style.display = 'none';
//     }
    
//     // Show user section
//     const userSection: HTMLElement | null = document.getElementById('user-section');
//     if (userSection) {
//       userSection.style.display = 'block';

//       const userPhoto: HTMLImageElement | null = document.getElementById('user-photo') as HTMLImageElement;
//       const userName: HTMLElement | null = document.getElementById('user-name');
//       const userEmail: HTMLElement | null = document.getElementById('user-email');
      
//       if (userPhoto && userData.picture) {
//         userPhoto.src = userData.picture;
//         userPhoto.alt = `Photo de profil de ${userData.name}`;
//       }
//       if (userName) {
//         userName.textContent = userData.name;
//       }
//       if (userEmail) {
//         userEmail.textContent = userData.email;
//       }
//     }
    
//     // Store user data in localStorage
//     localStorage.setItem('googleUser', JSON.stringify(userData));
//     localStorage.setItem('isAuthenticated', 'true');
//     localStorage.setItem('jwtToken', userData.token);
    
//   } catch (error) {
//     console.error('Erreur lors de l\'affichage des informations utilisateur:', error);
//   }
// }

// function signOut(): void {
//   try {
//     // Remove stored data
//     localStorage.removeItem('googleUser');
//     localStorage.removeItem('isAuthenticated');
//     localStorage.removeItem('jwtToken');
//     localStorage.removeItem('user');
//     localStorage.removeItem('email');
    
//     // Disable Google auto-select
//     if (typeof window.google !== 'undefined' && window.google.accounts) {
//       window.google.accounts.id.disableAutoSelect();
//     }
    
//     // Hide user info section
//     const userSection: HTMLElement | null = document.getElementById('user-section');
//     if (userSection) {
//       userSection.style.display = 'none';
//     }
    
//     // Show login sections
//     const signinSection: HTMLElement | null = document.getElementById('signin-section');
//     const loginWithAccountSection: HTMLElement | null = document.getElementById('loginWithAccountSection');

//     if (signinSection) {
//       signinSection.style.display = 'block';
//     }
//     if (loginWithAccountSection) {
//       loginWithAccountSection.style.display = 'block';
//     }

//     console.log('Utilisateur déconnecté');
    
//     // Navigate to login page if SPA is available
//     if (window.SPA && typeof window.SPA.navigateTo === 'function') {
//       window.SPA.navigateTo('/login');
//     }
    
//   } catch (error) {
//     console.error('Erreur lors de la déconnexion:', error);
//   }
// }

// // Helper function to check if user is authenticated
// function isUserAuthenticated(): boolean {
//   const isAuthenticated: string | null = localStorage.getItem('isAuthenticated');
//   const jwtToken: string | null = localStorage.getItem('jwtToken');
  
//   return isAuthenticated === 'true' && !!jwtToken;
// }

// // Helper function to get current user data
// function getCurrentUserData(): UserData | null {
//   try {
//     const userData: string | null = localStorage.getItem('googleUser');
//     if (userData) {
//       return JSON.parse(userData) as UserData;
//     }
//     return null;
//   } catch (error) {
//     console.error('Erreur lors de la récupération des données utilisateur:', error);
//     return null;
//   }
// }