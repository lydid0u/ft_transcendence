import * as i18n from './ts/i18n';

declare global {
  interface Window {
    i18n: typeof i18n;
  }
}

window.i18n = i18n;

import './ts/password';
import './ts/profile'; 
import './ts/friends';
import './ts/loginOrRegister';
import './ts/dashboard';
import './ts/google-auth';
import './ts/spa';
import './ts/reset-password';
import './ts/tournament';
import './ts/gameAI';
import './ts/game1v1';
import './ts/tournamenthome';