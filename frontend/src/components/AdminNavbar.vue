<template>
  <nav class="admin-nav">
    <div @click="toggleNav" class="burger">
      &#9776; <!-- Burger menu icon -->
    </div>
    <ul :class="{ 'nav-active': navOpen }">
      <li><router-link to="/admin-overview" @click="closeNav">All Activities</router-link></li>
      <li><router-link to="/admin-user-overview" @click="closeNav">User Management</router-link></li>
      <li><router-link to="/admin-calendar" @click="closeNav">Calendar View</router-link></li>
    </ul>
    <button @click="performLogout" class="logout-button">Logout</button>
  </nav>
</template>

<script>
import { logout } from '@/services/logout';

export default {
  name: 'AdminNavbar',
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
.admin-nav {
  background-color: #2c3e50;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.admin-nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  transition: transform 0.3s ease-in-out;
}

.admin-nav li {
  margin-inline-end: 20px;
}

.admin-nav a {
  color: #ecf0f1;
  text-decoration: none;
  font-size: 1.2rem;
}

.admin-nav a:hover, .router-link-active {
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

  .admin-nav ul {
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

  .admin-nav .nav-active {
    display: flex; /* Show when active */
  }

  .logout-button {
    position: absolute;
    top: 18px;
    right: 2rem;
  }
}
</style>
