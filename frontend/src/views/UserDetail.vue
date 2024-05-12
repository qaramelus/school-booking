<template>
       <admin-navbar :userId="currentUserId" />
  <div class="user-detail-page">
    <div class="user-detail">
      <h1>User Detail</h1>
      <p><strong>First Name:</strong> {{ user.firstName }}</p>
      <p><strong>Last Name:</strong> {{ user.lastName }}</p>
      <p v-if="user.address"><strong>Address:</strong></p>
      <ul v-if="user.address">
        <li>Street: {{ user.address.street }}</li>
        <li>City: {{ user.address.city }}</li>
        <li>Zip Code: {{ user.address.zipCode }}</li>
      </ul>
      <p><strong>Phone:</strong> {{ user.phone }}</p>
      <p><strong>Username:</strong> {{ user.username }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>Role:</strong> {{ user.role }}</p>
      <p v-if="user.parent"><strong>Parent:</strong> {{ user.parent.username }}</p>

      <div v-if="user.children && user.children.length > 0">
        <h2>Children</h2>
        <ul>
          <li v-for="child in user.children" :key="child._id">
            <p><strong>Username:</strong> {{ child.username }}</p>
            <p><strong>Email:</strong> {{ child.email }}</p>
            <p><strong>Role:</strong> {{ child.role }}</p>
            <child-user-update-form :child="child" @childUpdated="fetchUserDetails" />
          </li>
        </ul>
      </div>

      <!-- Form to add a child -->
      <div v-if="user.role === 'parent'">
        <h2>Add Child</h2>
        <form @submit.prevent="addChild">
          <input type="text" v-model="newChild.username" placeholder="Username" required>
          <input type="email" v-model="newChild.email" placeholder="Email" required>
          <input type="password" v-model="newChild.password" placeholder="Password" required>
          <input type="hidden" v-model="newChild.role" value="child">
          <button type="submit">Add Child</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import API from '@/services/api';
import AdminNavbar from '@/components/AdminNavbar.vue';
import ChildUserUpdateForm from '@/components/ChildUserUpdateForm.vue';
import '@/styles/MainColorSchema.css'

export default {
  name: "UserDetail",
  components: {
    AdminNavbar,
    ChildUserUpdateForm,
  },
  data() {
    return {
      currentUserId: '',
      user: {},
      newChild: {
        username: '',
        email: '',
        password: '',
        role: 'child',
      },
    };
  },
  async created() {
    this.fetchUserDetails();
    this.currentUserId = localStorage.getItem('user-id'); 
  },
  methods: {
    async fetchUserDetails() {
      const userId = this.$route.params.userId;
      try {
        const response = await API.get(`users/${userId}`);
        this.user = response.data;
      } catch (error) {
        console.error("There was an error fetching the user details:", error.message);
        // Handle error (e.g., redirecting to an error page or login)
      }
    },
    async addChild() {
      try {
        await API.post(`users/${this.user._id}/children`, this.newChild);
        alert('Child added successfully!');
        // Clear form
        this.newChild.username = '';
        this.newChild.email = '';
        this.newChild.password = '';
        // Refresh user details to show the newly added child
        this.fetchUserDetails();
      } catch (error) {
        console.error("There was an error adding the child:", error.message);
        // Handle error appropriately
      }
    }
  }
};
</script>

<style scoped>
.user-detail-page {
  max-inline-size: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.user-detail {
  margin-block-start: 40px;
  background-color: var(--background-light);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

h1 {
  font-size: 28px;
  font-weight: bold;
  margin-block-end: 20px;
}

p {
  margin-block-end: 10px;
}

strong {
  font-weight: bold;
}

ul {
  list-style-type: none;
  padding: 0;
  margin-block-end: 20px;
}

ul li {
  background-color: var(--hover-light);
  border-radius: 4px;
  margin-block-end: 10px;
  padding: 15px;
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

form input[type="text"], form input[type="email"], form input[type="password"] {
  inline-size: 100%;
  max-inline-size: 300px;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  margin-block-end: 15px;
}

form button[type="submit"] {
  background-color: var(--primary-color);
  color: var(--button-text-color);
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
}

form button[type="submit"]:hover {
  background-color: var(--hover-dark);
}
</style>
