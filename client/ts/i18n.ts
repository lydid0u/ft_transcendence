// Enhanced internationalization (i18n) module

interface Translations {
  [key: string]: {
    [key: string]: string | any;
  };
}

// Default translations (fallback)
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
let currentLanguage = localStorage.getItem('preferredLanguage') || 'fr';

// Load translations from JSON file
async function loadTranslations(): Promise<void> {
  try {
    const response = await fetch('/translations.json');
    if (response.ok) {
      const data = await response.json();
      translations = { ...translations, ...data };
      console.log('Translations loaded successfully');
    } else {
      console.error('Failed to load translations:', response.statusText);
    }
  } catch (error) {
    console.error('Error loading translations:', error);
  }
  
  // Initialize page translations after loading
  initializePageTranslations();
}

// Get a translated string
function translate(key: string): string {
  if (!key) return '';
  
  const keyParts = key.split('.');
  let result = translations[currentLanguage];
  
  // Handle nested keys like "common.welcome"
  for (const part of keyParts) {
    if (result && result[part]) {
      result = result[part];
    } else {
      // Key not found in current language
      break;
    }
  }
  
  if (typeof result === 'string') {
    return result;
  }
  
  // Fallback to English
  result = translations.en;
  for (const part of keyParts) {
    if (result && result[part]) {
      result = result[part];
    } else {
      // Key not found in fallback language
      return key; // Return the key as is
    }
  }
  
  return typeof result === 'string' ? result : key;
}

// Set the current language
function setLanguage(lang: string): void {
  if (translations[lang]) {
    currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    
    // Update the document's language attribute
    document.documentElement.setAttribute('lang', lang);
    
    // Translate all elements with data-i18n attribute
    initializePageTranslations();
    
    // Dispatch event for other components to react to language change
    const event = new CustomEvent('languageChanged', { 
      detail: { language: lang } 
    });
    window.dispatchEvent(event);
  }
}

// Get the current language
function getLanguage(): string {
  return currentLanguage;
}

// Translate all elements with data-i18n attribute
function initializePageTranslations(): void {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (key) {
      element.textContent = translate(key);
    }
  });
  
  // Also handle placeholder translations
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (key && element instanceof HTMLInputElement) {
      element.placeholder = translate(key);
    }
  });
}

// Initialize the module
document.addEventListener('DOMContentLoaded', () => {
  loadTranslations();
});

// Export functions
export { translate, setLanguage, getLanguage, initializePageTranslations };
// Add default export for backward compatibility
export default { translate, setLanguage, getLanguage, initializePageTranslations };
