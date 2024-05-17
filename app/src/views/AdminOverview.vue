<template>
  <admin-navbar :userId="currentUserId" />
  <div class="admin-overview">
    <div class="header">
      <h2>Activities</h2>
      <div class="button-container filter-dropdown">
        <select @change="handleFilterChange">
          <option value="all">All Activities</option>
          <option value="current">Current Activities</option>
          <option value="future">Upcoming Activities</option>
        </select>
      </div>
    </div>
    <ActivityModal
      :isVisible="showModal"
      :editingActivity="editingActivity"
      @close="handleModalClose"
      @activityAdded="handleActivityAdded"
      @activityUpdated="handleActivityUpdated"
    />
    <div class="activities">
      <div class="activity-cards">
        <div
          v-for="activity in activities"
          :key="activity._id"
          class="activity-card"
          @click="goToActivityDetail(activity._id)"
        >
          <div class="card-content">
            <h3>{{ activity.name }}</h3>
            <p v-html="activity.description"></p>
            <p><strong>Start Date:</strong> {{ new Date(activity.startDate).toLocaleDateString() }}</p>
            <p><strong>End Date:</strong> {{ new Date(activity.endDate).toLocaleDateString() }}</p>
            <div v-for="(slot, index) in activity.timeSlots" :key="index">
              <p><strong>{{ slot.dayOfWeek }}:</strong> {{ slot.startTime }} - {{ slot.endTime }}</p>
              <p><strong>Location:</strong> {{ getLocationName(slot.location) }}</p>
            </div>
          </div>
          <div class="card-icons">
            <q-icon name="delete" class="delete-icon" @click.stop="confirmDelete(activity._id)" />
            <q-icon name="edit" class="edit-icon" @click.stop="editActivity(activity)" />
          </div>
        </div>
      </div>
    </div>
    <button class="add-activity-button" @click="prepareNewActivity">Add Activity</button>
  </div>
</template>

<script>
import '@/styles/MainColorSchema.css';
import '@/styles/overview-style.css';
import API from '@/services/api';
import ActivityModal from '@/components/ActivityModal.vue';
import AdminNavbar from '@/components/AdminNavbar.vue';

export default {
  name: "AdminOverview",
  components: {
    AdminNavbar,
    ActivityModal
  },
  data() {
    return {
      activities: [],
      showModal: false,
      editingActivity: null,
      locations: [],
      currentUserId: ''  
    };
  },
  methods: {
    fetchActivities(type = 'all') {
      let endpoint = '/activities/'; 
      if (type === 'current') {
        endpoint = '/activities/current/';
      } else if (type === 'future') {
        endpoint = '/activities/future/';
      }

      API.get(endpoint)
        .then(response => {
          this.activities = response.data.map(activity => ({
            ...activity,
            startDate: activity.startDate || new Date(),
            endDate: activity.endDate || new Date(),
            timeSlots: activity.timeSlots || []
          }));
        })
        .catch(error => {
          console.error(`There was an error fetching the ${type} activities:`, error);
        });
    },
    handleFilterChange(event) {
      this.fetchActivities(event.target.value);
    },
    handleActivityAdded() {
      this.fetchActivities();
      this.showModal = false;
      this.editingActivity = null;
    },
    handleModalClose() {
      this.showModal = false;
      this.editingActivity = null;
    },
    confirmDelete(activityId) {
      if (window.confirm("Are you sure you want to delete this activity?")) {
        this.deleteActivity(activityId);
      }
    },
    deleteActivity(activityId) {
      API.delete(`/activities/${activityId}`)
        .then(() => {
          this.activities = this.activities.filter(activity => activity._id !== activityId);
          alert("Activity deleted successfully.");
        })
        .catch(error => {
          console.error("There was an error deleting the activity:", error);
        });
    },
    editActivity(activity) {
      this.editingActivity = activity;
      this.showModal = true;
    },
    goToActivityDetail(activityId) {
      this.$router.push({ name: 'ActivityDetail', params: { activityId } });
    },
    prepareNewActivity() {
      this.editingActivity = null;
      this.showModal = true;
    },
    getLocationName(locationId) {
      const location = this.locations.find(loc => loc._id === locationId);
      return location ? location.name : 'Unknown'; // Return 'Unknown' if location not found
    },
    fetchLocations() {
      API.get('/locations')
        .then(response => {
          this.locations = response.data;
        })
        .catch(error => {
          console.error('Error fetching locations:', error);
        });
    },
    handleActivityUpdated() {
      this.fetchActivities();
    }
  },
  created() {
    this.fetchActivities();
    this.fetchLocations();
    this.currentUserId = localStorage.getItem('user-id');
  }
};
</script>

<style scoped>
.admin-overview {
    margin: 0 auto;
    text-align: center;
    max-inline-size: 90%;
    padding: 20px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.button-container {
    text-align: right;
}

.add-activity-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    font-size: 16px;
    padding: 15px 30px;
    border-radius: 50px;
    background-color: var(--primary-color);
    color: var(--button-text-color);
    border: none;
    cursor: pointer;
    outline: none;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transition: background-color 0.3s, transform 0.3s;
}

.add-activity-button:hover {
    background-color: var(--primary-color-dark); /* Add a darker primary color for hover state */
    transform: scale(1.05);
}

.activity-cards {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}

.activity-card {
    flex-basis: calc(50% - 20px);
    margin: 10px;
    padding: 20px;
    box-sizing: border-box;
    position: relative;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--background-light);
    cursor: pointer;
    transition: box-shadow 0.3s;
}

.activity-card:hover {
    box-shadow: 0 2px 8px var(--hover-dark);
}

.card-content {
    padding: 16px;
}

.card-icons {
    position: absolute;
    inset-block-start: 10px;
    inset-inline-end: 10px;
    display: flex;
    gap: 10px;
}

.delete-icon, .edit-icon {
    inline-size: 20px;
    block-size: 20px;
    cursor: pointer;
}
</style>
