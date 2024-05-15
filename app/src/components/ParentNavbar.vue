<template>
  <nav class="navbar">  
    <div @click="toggleNav" class="burger">
      &#9776; 
    </div>
    <ul :class="{ 'nav-active': navOpen }">
      <li><router-link to="/parent-overview" @click="closeNav">All Activities</router-link></li>
      <li><router-link to="/parent-booked-overview" @click="closeNav">Booked Activities</router-link></li>
      <li><router-link to="/parents-calendar" @click="closeNav">Calendar View</router-link></li>
    </ul>
    <user-avatar :userId="userId"></user-avatar>
  </nav>
</template>

<script>
import UserAvatar from '@/components/UserAvatar';
import '@/styles/navbar-styles.css'; // Ensure this path is correct

export default {
  name: 'ParentNavbar',
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
    toggleNav() {
      this.navOpen = !this.navOpen;
    },
    closeNav() {
      if (this.navOpen) {
        this.navOpen = false;
      }
    }
  }
};
</script>



