<template>
  <nav class="teacher-nav">
    <div @click="toggleNav" class="burger">
      &#9776; <!-- Burger menu icon -->
    </div>
    <ul :class="{ 'nav-active': navOpen }">
      <li><router-link to="/teacher-overview" @click="closeNav">Overview</router-link></li>
      <li><router-link to="/teacher-calendar" @click="closeNav">My Calendar</router-link></li>
      <!-- Additional links can be added here -->
    </ul>
    <div class="avatar-container">
      <user-avatar :userId="userId"></user-avatar>
    </div>
  </nav>
</template>

 
<script>
import { logout } from '@/services/logout';
import UserAvatar from '@/components/UserAvatar';

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
  
<style scoped>
.teacher-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.teacher-nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  transition: transform 0.3s ease-in-out;
}

.teacher-nav li {
  margin-inline-end: 20px;
}

.teacher-nav a {
  color: #333;
  text-decoration: none;
  font-size: 1.2rem;
  font-weight: bold;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.teacher-nav a:hover {
  background-color: #f2f2f2;
}

.burger {
  display: none;
  cursor: pointer;
  font-size: 2rem;
  color: #333;
}

@media (max-width: 768px) {
  .burger {
    display: block;
  }

  .teacher-nav ul {
    flex-direction: column;
    width: 100%;
    position: absolute;
    top: 58px;
    left: 0;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    align-items: center;
    display: none; /* Initially hidden */
  }

  .teacher-nav .nav-active {
    display: flex; /* Show when active */
  }

  .avatar-container {
    position: absolute;
    top: 18px;
    right: 1rem;
  }

  .logout-button {
    display: none; /* Hide logout button on mobile if needed */
  }
}

.avatar-container {
  display: flex;
  align-items: center;
}

.logout-button {
  margin-left: 1rem;
}
</style>


