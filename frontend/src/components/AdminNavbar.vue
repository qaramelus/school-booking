<template>
  <nav class="navbar"> 
    <div @click="toggleNav" class="burger">
      &#9776; 
    </div>
    <ul :class="{ 'nav-active': navOpen }">
      <li><router-link to="/admin-overview" @click="closeNav">All Activities</router-link></li>
      <li><router-link to="/admin-user-overview" @click="closeNav">User Management</router-link></li>
      <li><router-link to="/admin-location-overview" @click="closeNav">Location Management</router-link></li>
      <li><router-link to="/admin-calendar" @click="closeNav">Calendar View</router-link></li>
    </ul>
    <user-avatar :userId="userId"></user-avatar>
  </nav>
</template>


<script>
import UserAvatar from '@/components/UserAvatar';
import '@/styles/navbar-styles.css';

export default {
  name: 'AdminNavbar',
  components: {
    UserAvatar
  },
  props: {
    userId: {
      type: String
    }
  },
  data() {
    return {
      navOpen: false
    };
  },
  methods: {
    toggleNav() {
      this.navOpen = !this.navOpen;
    },
    closeNav() {
      this.navOpen = false;
    }
  }
};
</script>