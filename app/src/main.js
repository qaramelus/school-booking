import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createI18n } from 'vue-i18n';
import './assets/styles/global.css';
import { Quasar, QChip } from 'quasar';

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

app.use(Quasar, {
  components: {
    QChip
  }
});

app.mount('#app');
