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
    <div class="user-dropdown" @click="toggleDropdown">
      <span class="user-initials">{{ getUserInitials }}</span>
      <div class="dropdown-menu" v-if="dropdownOpen">
        <a href="#" @click.prevent="performLogout">Logout</a>
        <a href="#" @click.prevent="goToSettings">Settings</a>
      </div>
    </div>
  </nav>
</template>

<script>
import axios from 'axios';
import { logout } from '@/services/logout';

export default {
  name: 'AdminNavbar',
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      navOpen: false,
      dropdownOpen: false,
      user: null
    };
  },
  computed: {
    getUserInitials() {
      if (this.user) {
        const nameParts = this.user.name.split(' ');
        return nameParts.map(part => part.charAt(0).toUpperCase()).join('');
      }
      return '';
    }
  },
  created() {
    console.log('Component created with userId:', this.userId);
    this.fetchUserDetails();
  },
  methods: {
    fetchUserDetails() {
      if (!this.userId) {
        console.error('User ID is undefined.');
        return;
      }
      axios.get(`/api/users/${this.userId}`)
        .then(response => {
          this.user = response.data;
        })
        .catch(error => {
          console.error('Error fetching user details:', error);
        });
    },
    performLogout() {
      logout(this.$router);
    },
    goToSettings() {
      // Implement the logic to navigate to the settings page
      this.$router.push('/settings');
    },
    toggleNav() {
      this.navOpen = !this.navOpen;
    },
    closeNav() {
      this.navOpen = false;
    },
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
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

.user-dropdown {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.user-initials {
  background-color: #f2f2f2;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: bold;
}

.dropdown-menu {
  position: absolute;
  inset-block-start: 100%;
  inset-inline-end: 0;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  z-index: 1;
}

.dropdown-menu a {
  display: block;
  color: #333;
  text-decoration: none;
  padding: 0.5rem 0;
}

.dropdown-menu a:hover {
  color: #1a252f;
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

  .user-dropdown {
    position: absolute;
    inset-block-start: 18px;
    inset-inline-end: 2rem;
  }
}
</style>