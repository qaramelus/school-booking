<template>
  <nav class="navbar"> 
    <div @click="toggleNav" class="burger">
      &#9776; 
    </div>
    <ul :class="{ 'nav-active': navOpen }">
      <li><router-link to="/teacher-overview" @click="closeNav">Overview</router-link></li>
      <li><router-link to="/teacher-calendar" @click="closeNav">My Calendar</router-link></li>
    </ul>
    <div class="avatar-container">
      <user-avatar :userId="userId"></user-avatar>
    </div>
  </nav>
</template>

<script>
import { logout } from '@/services/logout';
import UserAvatar from '@/components/UserAvatar';
import '@/styles/navbar-styles.css'; 

export default {
  name: 'TeacherNavbar',
  components: {
    UserAvatar
  },
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      navOpen: false
    };
  },
  methods: {
    performLogout() {
      logout(this.$router);
    },
    toggleNav() {
      this.navOpen = !this.navOpen;
    },
    closeNav() {
      this.navOpen = false;
    }
  }
};
</script>