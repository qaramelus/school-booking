<template>
  <admin-navbar :userId="currentUserId" />
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

    <UserModal
      v-if="showAddParentModal"
      :title="'Add Parent'"
      :fields="parentFields"
      :form="parent"
      :buttonText="'Add Parent'"
      @close="showAddParentModal = false"
      @submit="addParent"
    />

    <UserModal
      v-if="showAddTeacherModal"
      :title="'Add Teacher'"
      :fields="teacherFields"
      :form="teacher"
      :buttonText="'Add Teacher'"
      @close="showAddTeacherModal = false"
      @submit="addTeacher"
    />

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
import UserModal from '@/components/UserModal.vue';
import { QIcon } from 'quasar';
import API from '@/services/api';
import '@/styles/MainColorSchema.css';

export default {
  name: 'AdminUserOverview',
  components: {
    AdminNavbar,
    UserModal,
    QIcon
  },
  data() {
    return {
      currentUserId: '',
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
      editedUser: {},
      showAddParentModal: false,
      showAddTeacherModal: false,
      showEditModal: false,
      isAdmin: false
    };
  },
  created() {
    this.currentUserId = localStorage.getItem('user-id');
  },
  computed: {
    filteredUsers() {
      if (!this.filterRole) {
        return this.users;
      }
      return this.users.filter(user => user.role === this.filterRole);
    },
    parentFields() {
      return [
        { id: 'firstName', label: 'First Name', type: 'text', model: 'firstName', required: true },
        { id: 'lastName', label: 'Last Name', type: 'text', model: 'lastName', required: true },
        { id: 'address.street', label: 'Street', type: 'text', model: 'address.street', required: true },
        { id: 'address.city', label: 'City', type: 'text', model: 'address.city', required: true },
        { id: 'address.zipCode', label: 'Zip Code', type: 'text', model: 'address.zipCode', required: true },
        { id: 'phone', label: 'Phone', type: 'text', model: 'phone', required: true },
        { id: 'email', label: 'Email', type: 'email', model: 'email', required: true },
        { id: 'password', label: 'Password', type: 'password', model: 'password', required: true }
      ];
    },
    teacherFields() {
      return [
        { id: 'firstName', label: 'First Name', type: 'text', model: 'firstName', required: true },
        { id: 'lastName', label: 'Last Name', type: 'text', model: 'lastName', required: true },
        { id: 'address.street', label: 'Street', type: 'text', model: 'address.street', required: true },
        { id: 'address.city', label: 'City', type: 'text', model: 'address.city', required: true },
        { id: 'address.zipCode', label: 'Zip Code', type: 'text', model: 'address.zipCode', required: true },
        { id: 'phone', label: 'Phone', type: 'text', model: 'phone', required: true },
        { id: 'email', label: 'Email', type: 'email', model: 'email', required: true },
        { id: 'password', label: 'Password', type: 'password', model: 'password', required: true }
      ];
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
        console.error('There was an error fetching the users:', error.message);
      }
    },
    checkAdminStatus() {
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
        console.error('Error adding parent:', error.message);
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
        this.teacher.role = 'teacher';
        const response = await API.post('users/teachers', this.teacher);
        console.log('New teacher added:', response.data);
        this.users.push(response.data);
        this.resetTeacherForm();
        this.showAddTeacherModal = false;
        this.fetchUsers();
      } catch (error) {
        console.error('Error adding teacher:', error.message);
      }
    },
    resetTeacherForm() {
      this.teacher = {
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
      };
    },
    openEditModal(user) {
      this.editedUser = { ...user };
      this.showEditModal = true;
    },
    async updateUser() {
      try {
        const response = await API.put(`users/${this.editedUser.role}s/${this.editedUser._id}`, this.editedUser);
        console.log('User updated:', response.data);
        this.showEditModal = false;
        this.fetchUsers();
      } catch (error) {
        console.error('Error updating user:', error.message);
      }
    },
    async deleteUser(userId) {
      if (!this.isAdmin) {
        alert('You are not authorized to delete users.');
        return;
      }

      if (!confirm('Are you sure you want to delete this user?')) {
        return;
      }

      try {
        await API.delete(`users/user/${userId}`);
        this.users = this.users.filter(user => user._id !== userId);
        alert('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error.message);
        alert('Failed to delete user.');
      }
    }
  }
};
</script>

<style scoped>
.admin-user-overview {
  max-inline-size: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  font-size: 28px;
  font-weight: bold;
  margin-block-end: 20px;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-block-end: 20px;
}

.add-btn {
  background-color: var(--primary-color);
  color: var(--button-text-color);
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
}

.add-btn:hover {
  background-color: var(--hover-dark);
}

.filter-section select {
  padding: 8px 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

table {
  inline-size: 100%;
  border-collapse: collapse;
}

thead th {
  background-color: var(--primary-color);
  color: var(--button-text-color);
  padding: 10px;
  text-align: start;
}

tbody tr:nth-child(even) {
  background-color: var(--hover-light);
}

tbody tr:hover {
  background-color: var(--hover-dark);
}

td, th {
  padding: 10px;
}

.edit-icon, .delete-icon {
  cursor: pointer;
  margin-inline-end: 5px;
}
</style>
