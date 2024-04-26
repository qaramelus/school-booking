<template>
  <div class="admin-user-overview">
    <admin-navbar />
    <h1>User Administration</h1>
    <button @click="showModal = true">Add Parent</button>

    <!-- Modal -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showModal = false">&times;</span>
        <h2>Add Parent</h2>
        <form @submit.prevent="addParent">
          <label for="firstName">First Name</label>
          <input type="text" id="firstName" v-model="parent.firstName" required>
          <label for="lastName">Last Name</label>
          <input type="text" id="lastName" v-model="parent.lastName" required>
          <label for="street">Street</label>
          <input type="text" id="street" v-model="parent.address.street" required>
          <label for="city">City</label>
          <input type="text" id="city" v-model="parent.address.city" required>
          <label for="zipCode">Zip Code</label>
          <input type="text" id="zipCode" v-model="parent.address.zipCode" required>
          <label for="phone">Phone</label>
          <input type="text" id="phone" v-model="parent.phone" required>
          <label for="email">Email</label>
          <input type="email" id="email" v-model="parent.email" required>
          <label for="password">Password</label>
          <input type="password" id="password" v-model="parent.password" required>
          <button type="submit">Add Parent</button>
        </form>
      </div>
    </div>

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
import API from '@/services/api';

export default {
  name: "AdminUserOverview",
  components: {
    AdminNavbar,
  },
  data() {
    return {
      users: [],
      parent: {
        firstName: '',
        lastName: '',
        address: {
          street: '',
          city: '',
          zipCode: ''
        },
        phone: '',
        email: '',
        password: '',
        role: 'parent'
      },
      showModal: false
    };
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await API.get('users');
        this.users = response.data;
      } catch (error) {
        console.error("There was an error fetching the users:", error.message);
      }
    },
    navigateToUser(userId) {
      this.$router.push({ name: 'UserDetail', params: { userId } });
    },
    async addParent() {
      try {
        const response = await API.post('users/parent', this.parent);
        console.log('New parent added:', response.data);
        this.users.push(response.data);
        this.resetParentForm();
        this.showModal = false;
      } catch (error) {
        console.error("Error adding parent:", error.message);
      }
    },
    resetParentForm() {
      this.parent = {
        firstName: '',
        lastName: '',
        address: {
          street: '',
          city: '',
          zipCode: ''
        },
        phone: '',
        email: '',
        password: '',
        role: 'parent'
      };
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

/* Modal styles */
.modal {
  display: block;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 30%;
  border-radius: 5px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.submit-btn {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:hover {
  background-color: #45a049;
}

.add-parent-btn {
  background-color: #2c3e50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
}

.add-parent-btn:hover {
  background-color: #1a252f;
}
</style>