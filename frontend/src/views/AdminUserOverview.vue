<template>
  <div class="admin-user-overview">
    <admin-navbar />
    <h1>User List</h1>
    <table>
      <thead>
        <tr>
          <th>Username</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user._id" @click="navigateToUser(user._id)" style="cursor: pointer;">
          <td>{{ user.username }}</td>
          <td>{{ user.role }}</td>
        </tr>
      </tbody>
    </table>
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
    },
    navigateToUser(userId) {
    this.$router.push({ name: 'UserDetail', params: { userId } });
  }
  }
};
</script>

<style scoped>
.admin-user-overview {
  margin: 0 auto;
  text-align: center;
}

table {
  inline-size: 100%;
  border-collapse: collapse;
}

th, td {
  text-align: start;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
}

th {
  background-color: #2c3e50;
  color: white;
}
</style>

