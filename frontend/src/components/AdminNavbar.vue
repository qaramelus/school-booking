<template>
  <nav class="admin-nav">
    <ul>
      <li><router-link to="/admin-overview">All Activities</router-link></li>
      <li><router-link to="/admin-user-overview">User Management</router-link></li>
      <li><router-link to="/admin-calendar">Calendar View</router-link></li>
    </ul>
    <button @click="performLogout" class="logout-button">Logout</button>
  </nav>
</template>

<script>
import { logout } from '@/services/logout'; 

export default {
  name: 'AdminNavbar',
  methods: {
    performLogout() {
      logout(this.$router);
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
}

.admin-nav li {
  margin-inline-end: 20px;
}

.admin-nav a {
  color: #ecf0f1;
  text-decoration: none;
  font-size: 1.2rem;
  transition: color 0.3s ease;
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
</style>
