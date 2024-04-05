<template>
  <div class="login-container">
    <div class="language-switcher">
      <button @click="changeLanguage('en')">English</button>
      <button @click="changeLanguage('de')">Deutsch</button>
      <button @click="changeLanguage('lv')">Latvian</button>
    </div>

    <h1>{{ $t("login") }}</h1>
    <form @submit.prevent="login">
      <input-component :key="currentLang" v-model="email" type="email" :placeholder="$t('emailAddress')"></input-component>
      <input-component :key="currentLang" v-model="password" type="password" :placeholder="$t('password')"></input-component>
      <button-component type="submit" btn-type="primary">{{ $t("signIn") }}</button-component>
    </form>
    <p v-if="errorMessage" class="error-message">{{ $t("invalidCredentials") }}</p>
  </div>
</template>


<script>
import InputComponent from './InputComponent.vue'; 
import ButtonComponent from './ButtonComponent.vue'; 
import AuthService from '@/services/authService'; 

export default {
  components: {
    InputComponent,
    ButtonComponent
  },
  data() {
    return {
      email: '',
      password: '',
      errorMessage: ''
    };
  },
  methods: {
    async login() {
      try {
        const role = await AuthService.login(this.email, this.password);

        // Redirect based on the user's role
        switch (role) {
          case 'parent':
            this.$router.push({ name: 'ParentOverview' });
            break;
          case 'child':
            this.$router.push({ name: 'ChildOverview' });
            break;
          case 'admin':
            this.$router.push({ name: 'AdminOverview' });
            break;
          default:
            console.error('User role is not recognized or missing');
        }
      } catch (error) {
        this.errorMessage = error.message;
        console.error(error);
      }
    },
    changeLanguage(lang) {
      this.$i18n.locale = lang;
    }
  }
};
</script>


<style scoped>
.page-background {
  block-size: 100vh;
  background: linear-gradient(to top left, #0F2027, #203A43, #2C5364);
}

.login-container {
  max-inline-size: 460px;
  margin: 40px auto; 
  padding: 20px;
  box-shadow: 0px 0px 10px rgba(0,0,0,0.1);
  border-radius: 8px;
  text-align: center;
  background-color: white;
}

.input-component {
  margin: 20px; 
}

h1 {
  margin-block-end: 20px;
}

.error-message {
  color: red;
  margin-block-start: 10px;
}

.language-switcher button {
  margin: 0 5px;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #f0f0f0;
}

.language-switcher button:hover {
  background-color: #e0e0e0;
}
</style>