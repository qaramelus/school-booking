<template>
    <div class="user-detail-page">
      <admin-navbar />
      <div class="user-detail">
        <h1>User Detail</h1>
        <p><strong>Username:</strong> {{ user.username }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Role:</strong> {{ user.role }}</p>
  
        <div v-if="user.children && user.children.length > 0">
          <h2>Children</h2>
          <ul>
            <li v-for="child in user.children" :key="child._id">
              <p><strong>Username:</strong> {{ child.username }}</p>
              <p><strong>Email:</strong> {{ child.email }}</p>
              <p><strong>Role:</strong> {{ child.role }}</p>
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
  
  export default {
    name: "UserDetail",
    components: {
      AdminNavbar,
    },
    data() {
      return {
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
    margin: 0 auto;
    text-align: center;
  }
  
  .user-detail {
    margin-block-start: 20px;
  }
  
  ul {
    list-style-type: none;
    padding: 0;
  }
  
  ul li {
    background-color: #f0f0f0;
    margin: 10px 0;
    padding: 10px;
  }
  
  form input[type="text"], form input[type="email"], form input[type="password"] {
    margin-block-end: 10px;
  }
  </style>
  