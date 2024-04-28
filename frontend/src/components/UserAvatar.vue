<template>
    <div class="user-dropdown" @click="toggleDropdown">
      <q-avatar color="primary" text-color="white">
        {{ getUserInitials }}
      </q-avatar>
      <div class="dropdown-menu" v-if="dropdownOpen">
        <a href="#" @click.prevent="performLogout">Logout</a>
        <a href="#" @click.prevent="goToSettings">Settings</a>
      </div>
    </div>
  </template>
  
  <script>
  import { QAvatar } from 'quasar';
  import axios from 'axios';
  import { logout } from '@/services/logout';
  
  export default {
    name: 'UserAvatar',
    components: {
      QAvatar
    },
    props: {
      userId: {
        type: String,
        required: true
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
    align-items: center; /* Ensure alignment of all items */
  }
  
  .q-avatar {
    margin-right: 8px; /* Space between avatar and dropdown icon */
    background-color: #E0F7FA; /* Light blue background */
    color: #333; /* Text color */
    border-radius: 50%; /* Makes the avatar circular */
    width: 40px; /* Sets the width of the avatar */
    height: 40px; /* Sets the height of the avatar */
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