// Make sure to import profile and password modules before the SPA
// This ensures their functions are registered on the window object first
import './ts/api';
import './ts/password';   // Import earlier to ensure it's loaded before SPA
import './ts/profile';    // Import earlier to ensure it's loaded before SPA
import './ts/friends';
import './ts/loginOrRegister';
import './ts/tv-controls';
// import './ts/google-auth';
import './ts/dashboard';
import './ts/spa';        // Import last to ensure all functions are available