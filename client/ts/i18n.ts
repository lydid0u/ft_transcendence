
interface Translations {
  [key: string]: {
    [key: string]: string | any;
  };
}

let translations: Translations = {
  en: {
    welcome: "Welcome",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
  },
  fr: {
    welcome: "Bienvenue",
    profile: "Profil",
    settings: "Paramètres",
    logout: "Déconnexion",
  },
  es: {
    welcome: "Bienvenido",
    profile: "Perfil",
    settings: "Ajustes",
    logout: "Cerrar sesión",
  }
};

// Default language
let currentLanguage = JSON.parse(localStorage.getItem('user') || '{}').language || localStorage.getItem('preferredLanguage') || 'fr';

// Load translations from JSON file
async function loadTranslations(): Promise<void> {
  try {
    const response = await fetch('/translations.json');
    if (response.ok) {
      const data = await response.json();
      translations = { ...translations, ...data };
      // console.log('Translations loaded successfully');
    } else {
      // console.error('Failed to load translations:', response.statusText);
    }
  } catch (error) {
    // console.error('Error loading translations:', error);
  }
  
  // Initialize page translations after loading
  initializePageTranslations();
}

// Get a translated string
function translate(key: string): string {
  if (!key) return '';
  
  const keyParts = key.split('.');
  let result = translations[currentLanguage];
  
  for (const part of keyParts) {
    if (result && result[part]) {
      result = result[part];
    } else {
      break;
    }
  }
  
  if (typeof result === 'string') {
    return result;
  }
  
  result = translations.en;
  for (const part of keyParts) {
    if (result && result[part]) {
      result = result[part];
    } else {
      return key;
    }
  }
  
  return typeof result === 'string' ? result : key;
}

function setLanguage(lang: string): void {
  const loadLanguage = JSON.parse(localStorage.getItem('user') || '{}').language || localStorage.getItem('preferredLanguage') || 'fr';
  // console.log("Setting language to:", lang, "Current language:", loadLanguage);
  // console.log("user language:", JSON.parse(localStorage.getItem('user') || '{}').language);
  if (translations[lang]) {
    currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    
    document.documentElement.setAttribute('lang', lang);
    
    initializePageTranslations();
    
    const event = new CustomEvent('languageChanged', { 
      detail: { language: lang } 
    });
    window.dispatchEvent(event);
  }
}

function getLanguage(): string {
  return currentLanguage;
}

function initializePageTranslations(): void {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (key) {
      element.textContent = translate(key);
    }
  });
  
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (key && element instanceof HTMLInputElement) {
      element.placeholder = translate(key);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadTranslations();
});

export { translate, setLanguage, getLanguage, initializePageTranslations };
export default { translate, setLanguage, getLanguage, initializePageTranslations };
