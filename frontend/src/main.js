import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createI18n } from 'vue-i18n';
import './assets/styles/global.css';

import en from '@/locales/en.json';
import de from '@/locales/de.json';
import lv from '@/locales/lv.json';


const i18n = createI18n({
  legacy: false,
  locale: 'en', 
  fallbackLocale: 'en', 
  messages: {
    en,
    de,
    lv,
  },
});

const app = createApp(App);

// Use the router and i18n instances
app.use(router);
app.use(i18n);

// Mount the app
app.mount('#app');
