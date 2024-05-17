import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createI18n } from 'vue-i18n';
import { Quasar } from 'quasar';
import '@quasar/extras/material-icons/material-icons.css'; 
import 'quasar/dist/quasar.css';
import './styles/quasar.scss'; // Import your custom Quasar styles
import quasarUserOptions from './quasar-user-options';

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
app.use(router);
app.use(i18n);
app.use(Quasar, quasarUserOptions);
app.mount('#app');
