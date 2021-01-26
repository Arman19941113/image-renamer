import i18next from 'i18next';

const zh = require('./lang/zh');
const en = require('./lang/en');

i18next.init({
  lng: navigator.language.slice(0, 2) === 'zh' ? 'zh' : 'en',
  debug: process.env.NODE_ENV === 'development',
  resources: {
    zh: {
      translation: zh,
    },
    en: {
      translation: en,
    },
  },
});

const t = i18next.t.bind(i18next);
export { t as default, i18next };
