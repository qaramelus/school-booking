<template>
      <admin-navbar />
<div class="admin-user-overview">
    <h1>User Administration</h1>
    <div class="controls">
        <button class="add-btn" @click="showAddParentModal = true">Add Parent</button>
        <button class="add-btn" @click="showAddTeacherModal = true">Add Teacher</button>

        <div class="filter-section">
            <select v-model="filterRole">
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="parent">Parent</option>
                <option value="teacher">Teacher</option>
            </select>
        </div>
    </div>

    <!-- Add Parent Modal -->
    <div v-if="showAddParentModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showAddParentModal = false">&times;</span>
        <h2>Add Parent</h2>
        <form @submit.prevent="addParent">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input type="text" id="firstName" v-model="parent.firstName" required>
          </div>
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input type="text" id="lastName" v-model="parent.lastName" required>
          </div>
          <div class="form-group">
            <label for="address.street">Street</label>
            <input type="text" id="address.street" v-model="parent.address.street" required>
          </div>
          <div class="form-group">
            <label for="address.city">City</label>
            <input type="text" id="address.city" v-model="parent.address.city" required>
          </div>
          <div class="form-group">
            <label for="address.zipCode">Zip Code</label>
            <input type="text" id="address.zipCode" v-model="parent.address.zipCode" required>
          </div>
          <div class="form-group">
            <label for="phone">Phone</label>
            <input type="text" id="phone" v-model="parent.phone" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="parent.email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" v-model="parent.password" required>
          </div>
          <button type="submit" class="submit-btn">Add Parent</button>
        </form>
      </div>
    </div>

    <!-- Add Teacher Modal -->
    <div v-if="showAddTeacherModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showAddTeacherModal = false">&times;</span>
        <h2>Add Teacher</h2>
        <form @submit.prevent="addTeacher">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input type="text" id="firstName" v-model="teacher.firstName" required>
          </div>
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input type="text" id="lastName" v-model="teacher.lastName" required>
          </div>
          <div class="form-group">
            <label for="address.street">Street</label>
            <input type="text" id="address.street" v-model="teacher.address.street" required>
          </div>
          <div class="form-group">
            <label for="address.city">City</label>
            <input type="text" id="address.city" v-model="teacher.address.city" required>
          </div>
          <div class="form-group">
            <label for="address.zipCode">Zip Code</label>
            <input type="text" id="address.zipCode" v-model="teacher.address.zipCode" required>
          </div>
          <div class="form-group">
            <label for="phone">Phone</label>
            <input type="text" id="phone" v-model="teacher.phone" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="teacher.email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" v-model="teacher.password" required>
          </div>
          <button type="submit" class="submit-btn">Add Teacher</button>
        </form>
      </div>
    </div>

    <!-- Edit Parent Modal showEditModal-->
    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showEditModal = false">&times;</span>
        <h2>Edit Parent</h2>
        <form @submit.prevent="updateParent">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input type="text" id="firstName" v-model="editedParent.firstName" required>
          </div>
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input type="text" id="lastName" v-model="editedParent.lastName" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="editedParent.email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" v-model="editedParent.password" required>
          </div>
          <button type="submit" class="submit-btn">Update Parent</button>
        </form>
      </div>
    </div>

    <!-- Edit Teacher Modal -->
    <div v-if="showEditTeacherModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showEditTeacherModal = false">&times;</span>
        <h2>Edit Teacher</h2>
        <form @submit.prevent="updateTeacher">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input type="text" id="firstName" v-model="editedTeacher.firstName" required>
          </div>
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input type="text" id="lastName" v-model="editedTeacher.lastName" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="editedTeacher.email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" v-model="editedTeacher.password" required>
          </div>
          <button type="submit" class="submit-btn">Update Teacher</button>
        </form>
      </div>
    </div>

    <!-- Edit Admin Modal -->
    <div v-if="showEditAdminModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showEditAdminModal = false">&times;</span>
        <h2>Edit Admin</h2>
        <form @submit.prevent="updateAdmin">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input type="text" id="firstName" v-model="editedAdmin.firstName" required>
          </div>
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input type="text" id="lastName" v-model="editedAdmin.lastName" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="editedAdmin.email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" v-model="editedAdmin.password" required>
          </div>
          <button type="submit" class="submit-btn">Update Admin</button>
        </form>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in filteredUsers" :key="user._id" @click="navigateToUser(user._id)" style="cursor: pointer;">
          <td>{{ user.firstName }} {{ user.lastName }}</td>
          <td>{{ user.role }}</td>
          <td>
            <q-icon v-if="['parent', 'teacher', 'admin'].includes(user.role)" name="edit" @click.stop="openEditModal(user)" class="edit-icon"></q-icon>
            <q-icon v-if="isAdmin" name="delete" @click.stop="deleteUser(user._id)" class="delete-icon"></q-icon>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import AdminNavbar from '@/components/AdminNavbar.vue';
import { QIcon } from 'quasar'; 
import API from '@/services/api';

export default {
  name: "AdminUserOverview",
  components: {
    AdminNavbar,
    QIcon
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
      teacher: {   
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
        role: 'teacher'  
      },
      filterRole: '',
      editedParent: {},
      editedTeacher: {},
      editedAdmin: {},
      showEditTeacherModal: false,
      showEditAdminModal: false,
      showAddParentModal: false,
      showAddTeacherModal: false,
      showEditModal: false,
      isAdmin: false
    };
  },

  computed: {
    filteredUsers() {
      if (!this.filterRole) {
        return this.users;
      }
      return this.users.filter(user => user.role === this.filterRole);
    }
  },

  mounted() {
    this.fetchUsers();
    this.checkAdminStatus();
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
    checkAdminStatus() {
      // You would typically check this based on user authentication status
      // For example, using Vuex or a global auth state
      this.isAdmin = true; // Placeholder for actual admin check
    },
    navigateToUser(userId) {
      this.$router.push({ name: 'UserDetail', params: { userId } });
    },
    async addParent() {
      try {
        const response = await API.post('users/parents', this.parent);
        console.log('New parent added:', response.data);
        this.users.push(response.data);
        this.resetParentForm();
        this.showAddParentModal = false;
        this.fetchUsers();
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
    },
    async addTeacher() {
      try {
        // Ensure that the role is set to 'teacher' in the teacher object
        this.teacher.role = 'teacher';

        const response = await API.post('users/teachers', this.teacher);
        console.log('New teacher added:', response.data);
        this.users.push(response.data);
        this.resetTeacherForm();
        this.showAddTeacherModal = false;
        this.fetchUsers();
      } catch (error) {
        console.error("Error adding teacher:", error.message);
      }
    },
    resetTeacherForm() {
      this.teacher = {
        firstName: '',
        lastName: '',
        email: '',
        password: ''
      };
    },
    openEditModal(user) {
      switch(user.role) {
        case 'parent':
          this.editedParent = { ...user };
          this.showEditModal = true;
          break;
        case 'teacher':
          this.editedTeacher = { ...user };
          this.showEditTeacherModal = true;
          break;
        case 'admin':
          this.editedAdmin = { ...user };
          this.showEditAdminModal = true;
          break;
      }
    },
    async updateAdmin() {
      try {
        const response = await API.put(`users/admins/${this.editedAdmin._id}`, this.editedAdmin);
        console.log('Admin updated:', response.data);
        this.showEditAdminModal = false;
        this.fetchUsers();
      } catch (error) {
        console.error("Error updating admin:", error.message);
      }
    },
    async updateParent() {
      try {
        const response = await API.put(`users/parents/${this.editedParent._id}`, this.editedParent);
        console.log('Parent updated:', response.data);
        this.showEditModal = false;
        this.fetchUsers();
      } catch (error) {
        console.error("Error updating parent:", error.message);
      }
    },
    async updateTeacher() {
      try {
        const response = await API.put(`users/teachers/${this.editedTeacher._id}`, this.editedTeacher);
        console.log('Teacher updated:', response.data);
        this.showEditTeacherModal = false;
        this.fetchUsers();
      } catch (error) {
        console.error("Error updating teacher:", error.message);
      }
    },
    async deleteUser(userId) {
    // Assuming this.isAdmin reflects the current user's admin status
        if (!this.isAdmin) {
            alert('You are not authorized to delete users.');
            return;
        }

        if (!confirm("Are you sure you want to delete this user?")) {
            return;
        }

        try {
            // Correct endpoint as per the provided Express route
            await API.delete(`users/user/${userId}`);

            // Update the local state to reflect the deletion
            this.users = this.users.filter(user => user._id !== userId);

            alert("User deleted successfully");
        } catch (error) {
            console.error("Error deleting user:", error.message);
            alert("Failed to delete user.");
        }
    }
  }
};
</script>


<style scoped>

.add-btn {
  background-color: #2c3e50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-inline-end: 10px;
}

.add-btn:hover {
  background-color: #1a252f;
}

.admin-user-overview {
  margin: 0 auto;
  text-align: center;
  max-inline-size: 90%;
  padding: 20px;
}

.controls {
  display: flex;
  justify-content: start;
  align-items: center;
  margin-block-end: 20px;
}

.filter-section {
  margin-inline-start: auto;
  display: flex;
  align-items: center;
}

.filter-section select {
  padding: 8px 15px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: white;
  cursor: pointer;
}

table {
  inline-size: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: start;
  border-block-end: 1px solid #ddd;
}

tr:hover {
  background-color: #f5f5f5;
}

th {
  background-color: #2c3e50;
  color: white;
}

.modal {
  display: block;
  position: fixed;
  z-index: 1;
  inset-inline-start: 0;
  inset-block-start: 0;
  inline-size: 100%;
  block-size: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
  background-color: #fefefe;
  margin: 10% auto;
  padding: 20px;
  border: 1px solid #888;
  inline-size: 80%;
  max-inline-size: 500px;
  border-radius: 5px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
}

.close {
  color: #aaa;
  float: inline-end;
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
  margin-block-end: 20px;
}

label {
  display: block;
  margin-block-end: 5px;
}

input[type="text"],
input[type="email"],
input[type="password"],
select {
  inline-size: 100%;
  padding: 8px;
  margin: 8px 0;
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.submit-btn {
  background-color: #4CAF50;
  color: white;
  padding: 12px 20px;
  margin: 8px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  inline-size: 100%;
}

.submit-btn:hover {
  background-color: #45a049;
}

.edit-icon, .delete-icon {
  inline-size: 16px;  /* Sets the icon width to 16 pixels */
  block-size: 16px; /* Sets the icon height to 16 pixels */
  margin-inline-start: 10px;
  cursor: pointer;
  vertical-align: middle;
}


</style>
