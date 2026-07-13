import { useEffect } from 'react';

const GOOGLE_TRANSLATE_SCRIPT = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';

let scriptLoaded = false;

// Inject CSS to hide Google Translate banner
function injectHideBannerCSS() {
  if (document.getElementById('hide-google-translate-banner')) return;

  const style = document.createElement('style');
  style.id = 'hide-google-translate-banner';
  style.textContent = `
    /* Hide Google Translate banner */
    .goog-te-banner-frame {
      display: none !important;
    }
    
    /* Reset body positioning */
    body {
      top: 0 !important;
      margin-top: 0 !important;
      padding-top: 0 !important;
    }
    
    /* Hide the google translate widget element */
    .goog-te-gadget {
      display: none !important;
    }
    
    /* Hide any translate notifications */
    .goog-te-gadget-simple {
      display: none !important;
    }
    
    /* Reset html positioning */
    html {
      margin-top: 0 !important;
      padding-top: 0 !important;
    }
  `;
  document.head.appendChild(style);
}

export function loadGoogleTranslate() {
  if (scriptLoaded) return;
  if (document.getElementById('google-translate-script')) {
    scriptLoaded = true;
    return;
  }

  // Inject hide CSS before loading the script
  injectHideBannerCSS();

  window.googleTranslateElementInit = () => {
    if (window.google?.translate?.TranslateElement) {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          autoDisplay: false,
          includedLanguages: 'en,hi,es,fr,de,pt,ar,zh-CN,ru,ja,ko,it,tr,nl,pl,sv,da,fi,no,cs,hu,ro,bn,ta,te,ml,gu,kn,mr,pa,ur,fa,th,vi,id,ms,tl',
        },
        'google_translate_element'
      );
      // Re-inject CSS after translate loads to ensure it stays hidden
      setTimeout(injectHideBannerCSS, 500);
    }
  };

  const script = document.createElement('script');
  script.id = 'google-translate-script';
  script.src = GOOGLE_TRANSLATE_SCRIPT;
  script.async = true;
  document.body.appendChild(script);
  scriptLoaded = true;
}

export function changeLanguage(lang) {
  const select = document.querySelector('.goog-te-combo');
  if (select) {
    select.value = lang;
    select.dispatchEvent(new Event('change'));
  }
}

export function getCurrentLanguage() {
  const match = document.cookie.match(/googtrans=\/[a-z]{2}\/([a-zA-Z-]+)/);
  return match ? match[1] : 'en';
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'es', label: 'Español (Spanish)' },
  { code: 'fr', label: 'Français (French)' },
  { code: 'de', label: 'Deutsch (German)' },
  { code: 'pt', label: 'Português (Portuguese)' },
  { code: 'ar', label: 'العربية (Arabic)' },
  { code: 'zh-CN', label: '中文 (Chinese)' },
  { code: 'ru', label: 'Русский (Russian)' },
  { code: 'ja', label: '日本語 (Japanese)' },
  { code: 'ko', label: '한국어 (Korean)' },
  { code: 'it', label: 'Italiano (Italian)' },
  { code: 'tr', label: 'Türkçe (Turkish)' },
  { code: 'nl', label: 'Nederlands (Dutch)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'ur', label: 'اردو (Urdu)' },
  { code: 'th', label: 'ไทย (Thai)' },
  { code: 'vi', label: 'Tiếng Việt (Vietnamese)' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'ms', label: 'Bahasa Melayu (Malay)' },
];

export { LANGUAGES };