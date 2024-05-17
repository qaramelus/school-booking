<template>
  <div class="user-dropdown" @click="toggleDropdown">
    <q-avatar color="secondary" text-color="white">
      {{ getUserInitials }}
    </q-avatar>
    <div class="dropdown-menu" v-if="dropdownOpen">
      <a href="#" @click.prevent="performLogout">Logout</a>
      <a href="#" @click.prevent="goToSettings">Settings</a>
    </div>
  </div>
</template>

<script>
import API from '@/services/api';
import { QAvatar } from 'quasar';
import { logout } from '@/services/logout';

export default {
  name: 'UserAvatar',
  components: {
    QAvatar
  },
  props: {
    userId: {
      type: String
    }
  },
  data() {
    return {
      dropdownOpen: false,
      user: null
    };
  },
  computed: {
    getUserInitials() {
      return this.user ? this.user.initials : '';
    }
  },
  created() {
    this.fetchUserDetails();
  },
  methods: {
    fetchUserDetails() {
      const token = localStorage.getItem('user-token');
      if (!this.userId || !token) {
        console.error('User ID or token is undefined.');
        return;
      }
      return API.get(`/users/${this.userId}/initials`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        this.user = {
          ...this.user,
          initials: response.data.initials
        };
      })
      .catch(error => {
        console.error('Error fetching user initials:', error.response ? error.response.data.message : error.message);
      });
    },
    performLogout() {
      logout(this.$router);
    },
    goToSettings() {
      this.$router.push('/settings');
    },
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    }
  }
};
</script>

<style scoped>
.user-dropdown {
  position: relative;
  display: inline-block;
  cursor: pointer;
  align-items: center; 
}

.q-avatar {
  margin-inline-end: 8px;
  background-color: var(--secondary-color);
  color: var(--text-color-light);
  border-radius: 50%; 
  inline-size: 40px; 
  block-size: 40px; 
  display: flex;
  justify-content: center;
  align-items: center;
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
</style>
