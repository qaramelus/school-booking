<template>
  <div class="login-container">
    <div class="login-left">
      <img :src="loginImage" alt="Login Image" class="login-image" />
      <div class="login-info">
        <h2>{{ $t("findActivity") }}</h2>
        <p>{{ $t("bookActivity") }}</p>
      </div>
    </div>
    <div class="login-right">
      <div class="language-switcher">
        <button v-for="lang in languages" :key="lang" @click="changeLanguage(lang)">{{ lang }}</button>
      </div>
      <h1>{{ $t("welcome") }}</h1>
      <form @submit.prevent="login" class="login-form">
        <input-component :key="currentLang" v-model="email" type="email" :placeholder="$t('userNameEmail')"></input-component>
        <input-component :key="currentLang" v-model="password" type="password" :placeholder="$t('password')"></input-component>
        <div class="login-actions">
          <button-component type="submit" btn-type="primary">{{ $t("signIn") }}</button-component>
        </div>
      </form>
      <p v-if="errorMessage" class="error-message">{{ $t("invalidCredentials") }}</p>
    </div>
  </div>
  <div v-if="isAdmin" class="admin-section">
    <h2>{{ $t("createAdmin") }}</h2>
    <form @submit.prevent="createAdmin" class="admin-form">
      <input-component v-model="newAdmin.username" :placeholder="$t('username')"></input-component>
      <input-component v-model="newAdmin.email" type="email" :placeholder="$t('email')"></input-component>
      <input-component v-model="newAdmin.password" type="password" :placeholder="$t('password')"></input-component>
      <button-component btn-type="secondary">{{ $t("create") }}</button-component>
    </form>
  </div>
</template>

<script>
import InputComponent from './InputComponent.vue';
import ButtonComponent from './ButtonComponent.vue';
import AuthService from '../services/authService';
import loginImage from '@/assets/login.jpeg';
import '@/styles/MainColorSchema.css'

export default {
  components: {
    InputComponent,
    ButtonComponent
  },
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '',
      languages: ['en', 'de', 'lv'],
      currentLang: this.$i18n.locale,
      isAdmin: false,
      loginImage // Add the login image here
    };
  },
  methods: {
    async login() {
      try {
        const role = await AuthService.login(this.email, this.password);
        this.redirectUser(role);
      } catch (error) {
        this.errorMessage = error.message;
        console.error(error);
      }
    },
    redirectUser(role) {
      const routes = {
        parent: 'ParentOverview',
        child: 'ChildOverview',
        admin: 'AdminOverview',
        teacher: 'TeacherOverview'
      };
      const routeName = routes[role];
      if (routeName) {
        this.$router.push({ name: routeName });
      } else {
        console.error('User role is not recognized or missing');
      }
    },
    changeLanguage(lang) {
      this.$i18n.locale = lang;
      // Update currentLang when the language changes
      this.currentLang = lang;
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  max-inline-size: 800px;
  margin: 5% auto;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.login-left {
  flex: 1;
  background-color: #f0f0f0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-image {
  max-inline-size: 100%;
  border-radius: 10px;
}

.login-info {
  text-align: center;
  margin-block-start: 20px;
}

.login-info h2 {
  font-size: 20px;
  color: #333;
  margin-block-end: 5px; /* Reduce the margin-bottom */
  line-height: 1.2; /* Adjust the line height */
}

.login-info p {
  font-size: 14px;
  color: #666;
}

.login-right {
  flex: 1;
  background-color: #ffffff;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.language-switcher {
  display: flex;
  justify-content: flex-end;
  margin-block-end: 20px;
}

.language-switcher button {
  background-color: var(--button-active-bg);
  color: var(--button-text-color);
  border: 2px solid var(--border-color);
  border-radius: 20px;
  padding: 8px 20px;
  margin: 0 5px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  font-weight: 600; /* Make the language buttons stand out more */
}

.language-switcher button:hover {
  background-color: var(--hover-color);
  color: var(--button-text-color);
  transform: translateY(-2px);
}

h1 {
  color: var(--text-primary);
  font-size: 24px;
  margin-block-end: 10px; /* Reduce the margin-bottom */
  line-height: 1.2; /* Adjust the line height to make the lines closer together */
  text-align: center;
}

h2 {
  margin-block-start: 0; /* Reduce the margin-top */
  line-height: 1.2; /* Adjust the line height for h2 as well, if needed */
}

.login-form {
  inline-size: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

input-component, button-component {
  margin: 10px 0;
  inline-size: 100%;
}

button-component {
  max-inline-size: 150px;
}

.error-message {
  color: #ff6b6b;
  margin-block-start: 10px;
}

.admin-section {
  margin-block-start: 40px;
  inline-size: 100%;
}

.admin-form {
  display: flex;
  flex-direction: column;
}
</style>
