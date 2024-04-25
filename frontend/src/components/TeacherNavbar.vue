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
    <button @click="performLogout" class="logout-button">Logout</button>
  </nav>
</template>
  
<script>
import { logout } from '@/services/logout';

export default {
  name: 'TeacherNavbar',
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
  background-color: #34495e;
  padding: 1rem 0; /* Remove horizontal padding */
  inline-size: 100%; /* Ensure the nav is full-width */
  margin: 0; /* Remove any default margin */
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box; /* Include padding and border in the element's total width */
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
  color: #ffffff;
  text-decoration: none;
  font-size: 1.2rem;
}

.teacher-nav a:hover, .router-link-active {
  color: #95a5a6;
}

.logout-button {
  background-color: transparent;
  border: none;
  color: #ffffff;
  font-size: 1rem;
  cursor: pointer;
}

.logout-button:hover {
  color: #e74c3c;
}

.burger {
  display: none;
  cursor: pointer;
  font-size: 2rem;
  color: #bdc3c7;
}

@media (max-inline-size: 768px) {
  .burger {
    display: block;
  }

  .teacher-nav ul {
    flex-direction: column;
    inline-size: 100%;
    position: absolute;
    inset-block-start: 58px;
    inset-inline-start: 0;
    background-color: #34495e;
    padding: 1rem;
    align-items: center;
    display: none; /* Initially hidden */
  }

  .teacher-nav .nav-active {
    display: flex; /* Show when active */
  }

  .logout-button {
    position: absolute;
    inset-block-start: 18px;
    inset-inline-end: 2rem;
  }
}
</style>
