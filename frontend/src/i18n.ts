import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from './locales/en/translation.json';
import frTranslation from './locales/fr/translation.json';
import esTranslation from './locales/es/translation.json';

i18n
    .use(LanguageDetector)
    .init({
        resources: {
            en: { translation: enTranslation },
            fr: { translation: frTranslation },
            es: { translation: esTranslation },
        },
        fallbackLng: 'en',
        lng: 'fr',
        interpolation: {
            escapeValue: false,
        }
    }, (err) => {
        if (err) console.error(err);
        updateTexts();
    });

export function getCurrentLanguage(): string {
    return i18n.language.split('-')[0];
}

export function getText(key: string): string {
    return i18n.t(key);
}

export function updateTexts() {
    document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n!;
        el.innerText = i18n.t(key);
    });
    document.querySelectorAll<HTMLInputElement>('[data-i18n-placeholder]').forEach(el => {
        const key = el.dataset.i18nPlaceholder!;
        el.placeholder = i18n.t(key);
    });
    document.querySelectorAll<HTMLInputElement>('[data-i18n-value]').forEach(el => {
        const key = el.dataset.i18nValue!;
        el.value = i18n.t(key);
    });
}

export function initializeLanguageSwitcher() {
    const switcher = document.getElementById('language-switcher') as HTMLSelectElement | null;
    if (switcher) {
        const currentLang = i18n.language.split('-')[0];
    
        switcher.value = ['en', 'fr', 'es'].includes(currentLang) ? currentLang : 'fr';
        
        const newSwitcher = switcher.cloneNode(true) as HTMLSelectElement;
        switcher.parentNode?.replaceChild(newSwitcher, switcher);
        
        newSwitcher.value = ['en', 'fr', 'es'].includes(currentLang) ? currentLang : 'fr';
        
        newSwitcher.addEventListener('change', (e) => {
            const selectedLang = (e.target as HTMLSelectElement).value;
            i18n.changeLanguage(selectedLang);
        });
    }
}

i18n.on('languageChanged', updateTexts);

document.addEventListener('DOMContentLoaded', () => {
    initializeLanguageSwitcher();
});

export default i18n;