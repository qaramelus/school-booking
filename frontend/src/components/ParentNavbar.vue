<template>
  <nav class="parent-nav">
    <div @click="toggleNav" class="burger">
      &#9776; <!-- Represents burger icon -->
    </div>
    <ul :class="{ 'nav-active': navOpen }">
      <li><router-link to="/parent-overview" @click="closeNav">All Activities</router-link></li>
      <li><router-link to="/parent-booked-overview" @click="closeNav">Booked Activities</router-link></li>
      <li><router-link to="/parents-calendar" @click="closeNav">Calendar View</router-link></li>
    </ul>
    <button @click="performLogout" class="logout-button">Logout</button>
  </nav>
</template>

<script>
import { logout } from '@/services/logout';

export default {
  name: 'ParentNavbar',
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
      this.navOpen = !this.navOpen; // Toggle the visibility of the nav
    },
    closeNav() {
      this.navOpen = false; // Ensure nav closes when a link is clicked
    }
  }
};
</script>

<style scoped>
.parent-nav {
  background-color: #2c3e50;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.parent-nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.parent-nav li {
  margin-inline-end: 20px;
}

.parent-nav a {
  color: #ecf0f1;
  text-decoration: none;
  font-size: 1.2rem;
}

.parent-nav a:hover, .router-link-active {
  color: #3498db;
}

.logout-button {
  background-color: transparent;
  border: none;
  color: #ecf0f1;
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
  color: #ecf0f1;
}

@media (max-width: 768px) {
  .burger {
    display: block;
  }

  .parent-nav ul {
    flex-direction: column;
    width: 100%;
    position: absolute;
    top: 58px;
    left: 0;
    background-color: #2c3e50;
    padding: 1rem;
    align-items: center;
    display: none; /* Initially hidden */
  }

  .parent-nav .nav-active {
    display: flex; /* Show when active */
  }

  .logout-button {
    position: absolute;
    top: 18px;
    right: 2rem;
  }
}
</style>
