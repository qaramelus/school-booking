<template>
  <nav class="parent-nav">
    <div @click="toggleNav" class="burger">
      &#9776; <!-- Burger menu icon -->
    </div>
    <ul :class="{ 'nav-active': navOpen }">
      <li><router-link to="/parent-overview" @click="closeNav">All Activities</router-link></li>
      <li><router-link to="/parent-booked-overview" @click="closeNav">Booked Activities</router-link></li>
      <li><router-link to="/parents-calendar" @click="closeNav">Calendar View</router-link></li>
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
import { logout } from '@/services/logout';
import axios from 'axios';

export default {
  name: 'ParentNavbar',
  data() {
    return {
      navOpen: false,
      dropdownOpen: false,
      user: null
    };
  },
  computed: {
    getUserInitials() {
    return this.user && this.user.initials ? this.user.initials : '';
  }
  },
  created() {
    this.fetchUserDetails();
  },
  methods: {
    fetchUserDetails() {
      const userId = localStorage.getItem('user-id');
      if (!userId) {
        console.error('User ID is undefined.');
        return;
      }
      axios.get(`http://localhost:5005/api/users/${userId}/initials`)
        .then(response => {
          this.user = {
            ...this.user,
            initials: response.data.initials
          };
        })
        .catch(error => {
          console.error('Error fetching user initials:', error);
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
.parent-nav {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  transition: transform 0.3s ease-in-out;
}

.parent-nav li {
  margin-inline-end: 20px;
}

.parent-nav a {
  color: #333;
  text-decoration: none;
  font-size: 1.2rem;
  font-weight: bold;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.parent-nav a.router-link-active {
  color: #1a252f;
}

.parent-nav a:hover:not(.router-link-active) {
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

  .parent-nav ul {
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

  .parent-nav .nav-active {
    display: flex; /* Show when active */
  }

  .user-dropdown {
    position: absolute;
    inset-block-start: 18px;
    inset-inline-end: 2rem;
  }
}
</style>
