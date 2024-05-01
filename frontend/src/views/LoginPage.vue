<template>
  <div class="login-container">
    <div class="language-switcher">
      <button v-for="lang in languages" :key="lang" @click="changeLanguage(lang)">{{ lang }}</button>
    </div>

    <h1>{{ $t("login") }}</h1>
    <form @submit.prevent="login">
      <input-component :key="currentLang" v-model="email" type="email" :placeholder="$t('emailAddress')"></input-component>
      <input-component :key="currentLang" v-model="password" type="password" :placeholder="$t('password')"></input-component>
      <button-component type="submit" btn-type="primary">{{ $t("signIn") }}</button-component>
    </form>
    <p v-if="errorMessage" class="error-message">{{ $t("invalidCredentials") }}</p>
  </div>
  <div v-if="isAdmin">
      <h2>{{ $t("createAdmin") }}</h2>
      <form @submit.prevent="createAdmin">
        <input-component v-model="newAdmin.username" placeholder="Username"></input-component>
        <input-component v-model="newAdmin.email" type="email" placeholder="Email"></input-component>
        <input-component v-model="newAdmin.password" type="password" placeholder="Password"></input-component>
        <button-component btn-type="secondary">{{ $t("create") }}</button-component>
      </form>
    </div>
</template>

<script>
import InputComponent from './InputComponent.vue';
import ButtonComponent from './ButtonComponent.vue';
import AuthService from '../services/authService';

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
      languages: ['en', 'de', 'lv']
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
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 400px;
  margin: 5% auto;
  padding: 20px;
  border-radius: 10px;
  background-color: #ffffff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.language-switcher {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.language-switcher button {
  background-color: #ffffff;
  border: 2px solid #d1d1d1;
  border-radius: 20px;
  padding: 5px 15px;
  margin: 0 10px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.language-switcher button:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}

input-component, button-component {
  margin: 10px 0;
  width: 200%;
}

.error-message {
  color: #ff6b6b;
}

h1 {
  color: #333;
  font-size: 24px;
  margin-bottom: 20px;
}
</style>
