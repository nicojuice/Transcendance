// import i18n from 'i18next';
// import LanguageDetector from 'i18next-browser-languagedetector';
// import enTranslation from './locales/en/translation.json';
// import frTranslation from './locales/fr/translation.json';

// i18n
//   .use(LanguageDetector)
//   .init({
//     resources: {
//       en: { translation: enTranslation },
//       fr: { translation: frTranslation },
//     },
//     fallbackLng: 'en',
//     interpolation: {
//       escapeValue: false,
//     }
//   });

// // -- DOM update logic here --
// function updateTexts() {
//   const elements = document.querySelectorAll<HTMLElement>('[data-i18n]');
//   elements.forEach((el) => {
//     const key = el.dataset.i18n!;
//     el.innerText = i18n.t(key);
//   });
// }

// i18n.on('languageChanged', updateTexts);

// document.addEventListener('DOMContentLoaded', () => {
//   updateTexts();

//   const switcher = document.getElementById('language-switcher') as HTMLSelectElement | null;
//   if (switcher) {
//     switcher.value = i18n.language;
//     switcher.addEventListener('change', (e) => {
//       const lang = (e.target as HTMLSelectElement).value;
//       i18n.changeLanguage(lang);
//     });
//   }
// });

// export default i18n;
