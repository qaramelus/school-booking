<template>
    <div class="user-detail-page">
      <admin-navbar />
      <div class="user-detail">
        <h1>User Detail</h1>
        <p><strong>Username:</strong> {{ user.username }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Role:</strong> {{ user.role }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import API from '@/services/api'; // Ensure API is correctly imported
  import AdminNavbar from '@/components/AdminNavbar.vue';
  
  export default {
    name: "UserDetail",
    components: {
      AdminNavbar,
    },
    data() {
      return {
        user: {}
      };
    },
    async created() {
      const userId = this.$route.params.userId;
      try {
        const response = await API.get(`users/${userId}`);
        this.user = response.data;
      } catch (error) {
        console.error("There was an error fetching the user details:", error.message);
        // Handle error (e.g., redirecting to an error page or login)
      }
    }
  };
  </script>
  
  <style scoped>
  .user-detail-page {
    margin: 0 auto;
    text-align: center;
  }
  
  .user-detail {
    margin-top: 20px;
  }
  </style>
  