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
    <user-avatar :userId="userId"></user-avatar>
  </nav>
</template>

<script>
import UserAvatar from '@/components/UserAvatar';

export default {
  name: 'AdminNavbar',
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
      this.navOpen = false;
    }
  }
};
</script>

<style scoped>
.admin-nav {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  color: #333;
  text-decoration: none;
  font-size: 1.2rem;
  font-weight: bold;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.admin-nav a.router-link-active {
  color: #1a252f;
}

.admin-nav a.router-link-active:hover {
  background-color: transparent;
}

.admin-nav a:hover:not(.router-link-active) {
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

  .admin-nav ul {
    flex-direction: column;
    inline-size: 100%;
    position: absolute;
    inset-block-start: 58px;
    inset-inline-left: 0;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    align-items: center;
    display: none; /* Initially hidden */
  }

  .admin-nav .nav-active {
    display: flex; /* Show when active */
  }
}
</style>