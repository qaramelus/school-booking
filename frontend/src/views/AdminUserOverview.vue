<template>
  <div class="admin-user-overview">
    <admin-navbar />
    <h1>User List</h1>
    <div v-for="user in users" :key="user._id" class="user">
      <p>{{ user.username }} ({{ user.role }})</p>
    </div>
  </div>
</template>

<script>
import AdminNavbar from '@/components/AdminNavbar.vue';
import API from '@/services/api'; // Import the API instance

export default {
  name: "AdminUserOverview",
  components: {
    AdminNavbar,
  },
  data() {
    return {
      users: []
    };
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await API.get('users'); // Use the API instance for the request
        this.users = response.data;
      } catch (error) {
        console.error("There was an error fetching the users:", error.message);
        // Optionally redirect to login or show an error message
      }
    }
  }
};
</script>

<style scoped>
.admin-user-overview {
  margin: 0 auto;
  text-align: center;
}

.user {
  margin-block-start: 10px;
}
</style>
