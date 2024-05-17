<template>
  <admin-navbar :userId="currentUserId" />
  <div class="admin-overview">
    <h1>Location Administration</h1>
    <div class="controls">
      <button class="add-btn" @click="showAddLocationModal = true">Add Location</button>

      <!-- Add Location Modal -->
      <div v-if="showAddLocationModal" class="modal">
        <div class="modal-content">
          <span class="close" @click="showAddLocationModal = false">&times;</span>
          <h2>Add Location</h2>
          <form @submit.prevent="addLocation">
            <div class="form-group">
              <label for="name">Name</label>
              <input type="text" id="name" v-model="newLocation.name" required>
            </div>
            <div class="form-group">
              <label for="address">Address</label>
              <input type="text" id="address" v-model="newLocation.address" required>
            </div>
            <div class="form-group">
              <label for="capacity">Capacity</label>
              <input type="number" id="capacity" v-model="newLocation.capacity" required>
            </div>
            <button type="submit" class="submit-btn">Add Location</button>
          </form>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th @click="sort('name')">Name {{ currentSort === 'name' && currentSortDir === 'asc' ? '▲' : '▼' }}</th>
          <th @click="sort('address')">Address {{ currentSort === 'address' && currentSortDir === 'asc' ? '▲' : '▼' }}</th>
          <th @click="sort('capacity')">Capacity {{ currentSort === 'capacity' && currentSortDir === 'asc' ? '▲' : '▼' }}</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="location in locations" :key="location._id">
          <td>{{ location.name }}</td>
          <td>{{ location.address }}</td>
          <td>{{ location.capacity }}</td>
          <td>
            <q-icon name="edit" @click.stop="openEditLocationModal(location)" class="edit-icon"></q-icon>
            <q-icon name="delete" @click.stop="deleteLocation(location._id)" class="delete-icon"></q-icon>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Edit Location Modal -->
  <div v-if="showEditLocationModal" class="modal">
    <div class="modal-content">
      <span class="close" @click="showEditLocationModal = false">&times;</span>
      <h2>Edit Location</h2>
      <form @submit.prevent="updateLocation">
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" id="name" v-model="editedLocation.name" required>
        </div>
        <div class="form-group">
          <label for="address">Address</label>
          <input type="text" id="address" v-model="editedLocation.address" required>
        </div>
        <div class="form-group">
          <label for="capacity">Capacity</label>
          <input type="number" id="capacity" v-model="editedLocation.capacity" required>
        </div>
        <button type="submit" class="submit-btn">Update Location</button>
      </form>
    </div>
  </div>
</template>

<script>
import AdminNavbar from '@/components/AdminNavbar.vue';
import { QIcon } from 'quasar';
import API from '@/services/api';
import '@/styles/MainColorSchema.css'

export default {
  name: "AdminLocationOverview",
  components: {
    AdminNavbar,
    QIcon
  },
  data() {
    return {
      currentUserId: '',
      locations: [],
      newLocation: {
        name: '',
        address: '',
        capacity: 0
      },
      editedLocation: {},
      showAddLocationModal: false,
      showEditLocationModal: false,
      currentSort: 'name',
      currentSortDir: 'asc'
    };
  },
  created() {
    this.currentUserId = localStorage.getItem('user-id');  
  },
  mounted() {
    this.fetchLocations();
  },

  methods: {
    async fetchLocations() {
      try {
        const response = await API.get('locations');
        this.locations = response.data;
      } catch (error) {
        console.error("There was an error fetching the locations:", error.message);
      }
    },
    async addLocation() {
      try {
        const response = await API.post('locations', this.newLocation);
        this.locations.push(response.data);
        this.showAddLocationModal = false;
        this.newLocation = { name: '', address: '', capacity: 0 };
      } catch (error) {
        console.error("Error adding location:", error.message);
      }
    },
    openEditLocationModal(location) {
      this.editedLocation = { ...location };
      this.showEditLocationModal = true;
    },
    async updateLocation() {
      try {
        const response = await API.put(`locations/${this.editedLocation._id}`, this.editedLocation);
        const index = this.locations.findIndex(loc => loc._id === this.editedLocation._id);
        this.locations.splice(index, 1, response.data);
        this.showEditLocationModal = false;
      } catch (error) {
        console.error("Error updating location:", error.message);
      }
    },
    async deleteLocation(locationId) {
      if (!confirm("Are you sure you want to delete this location?")) {
        return;
      }

      try {
        await API.delete(`locations/${locationId}`);
        this.locations = this.locations.filter(location => location._id !== locationId);
      } catch (error) {
        console.error("Error deleting location:", error.message);
      }
    },
    sort(s) {
      if(s === this.currentSort) {
        this.currentSortDir = this.currentSortDir === 'asc' ? 'desc' : 'asc';
      } else {
        this.currentSort = s;
        this.currentSortDir = 'asc';
      }
      this.locations.sort((a, b) => {
        let modifier = 1;
        if(this.currentSortDir === 'desc') modifier = -1;
        if(a[this.currentSort] < b[this.currentSort]) return -1 * modifier;
        if(a[this.currentSort] > b[this.currentSort]) return 1 * modifier;
        return 0;
      });
    }
  }
};
</script>

<style scoped>
.admin-overview {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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

table {
  width: 100%;
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
  margin-right: 5px;
}

.modal {
  display: block;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: var(--modal-background);
}

.modal-content {
  background-color: var(--modal-content-bg);
  margin: 10% auto;
  padding: 20px;
  border: 1px solid var(--border-color);
  width: 80%;
  max-width: 500px;
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
  color: var(--text-primary);
  text-decoration: none;
  cursor: pointer;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input[type="text"], input[type="number"] {
  width: 100%;
  padding: 8px;
  margin: 8px 0;
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.submit-btn {
  background-color: var(--button-active-bg);
  color: var(--button-text-color);
  padding: 12px 20px;
  margin: 8px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}

.submit-btn:hover {
  background-color: var(--hover-dark);
}

.edit-icon, .delete-icon {
  width: 16px;
  height: 16px;
  margin-right: 10px;
  cursor: pointer;
  vertical-align: middle;
}
</style>
