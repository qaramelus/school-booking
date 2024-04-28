<template>
  <div class="admin-overview">
    <admin-navbar :userId="currentUserId" />
    <div class="button-container">
      <button @click="fetchActivities('all')">All Activities</button>
      <button @click="fetchActivities('current')">Current Activities</button>
      <button @click="fetchActivities('future')">Upcoming Activities</button>
    </div>
    <div class="button-container">
      <button class="add-activity-button" @click="prepareNewActivity">Add Activity</button>
    </div>
    <ActivityModal
      :isVisible="showModal"
      :editingActivity="editingActivity"
      @close="handleModalClose"
      @activityAdded="handleActivityAdded"
      @activityUpdated="handleActivityUpdated"
    />
    <div class="activities">
      <h2>Activities</h2>
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
            <img :src="trashIcon" class="delete-icon" @click.stop="confirmDelete(activity._id)">
            <img :src="editIcon" class="edit-icon" @click.stop="editActivity(activity)">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import API from '@/services/api';
import ActivityModal from './ActivityModal.vue';
import trashIcon from '@/assets/trashicon.jpeg';
import editIcon from '@/assets/editicon.png';
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
      trashIcon,
      editIcon,
      locations: [] 
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
  },
  created() {
    this.fetchActivities();
    this.fetchLocations(); // Fetch locations when the component is created
  }
};
</script>

<style scoped>
.admin-overview {
  margin: 0 auto;
}

.button-container {
  margin-block-start: 10px;
  text-align: center;
  inline-size: 100%;
}

.add-activity-button {
  font-size: 16px;
  padding: 10px 20px;
  border-radius: 8px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  outline: none;
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
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #ffffff;
  cursor: pointer;
  transition: box-shadow 0.3s;
}

.activity-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-content {
  padding: 16px;
}

.card-icons {
  position: absolute;
  inset-block-start: 10px;
  inset-inline-end: 10px;
}

.delete-icon, .edit-icon {
  inline-size: 20px;
  block-size: 20px;
  cursor: pointer;
}

.edit-icon {
  inset-inline-end: 40px;
}
</style>
