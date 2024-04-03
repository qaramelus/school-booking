<template>
  <div class="admin-overview">
    <admin-navbar />
    <h1>All Activities</h1>
    <button class="plus-button" @click="prepareNewActivity">+</button>
    <ActivityModal :isVisible="showModal" :editingActivity="editingActivity" @close="handleModalClose" @activityAdded="handleActivityAdded" @activityUpdated="fetchActivities" />
    <div class="activities">
      <h2>Activities</h2>
      <div class="activity-cards">
        <router-link v-for="activity in activities" :key="activity._id" :to="{ name: 'ActivityDetail', params: { activityId: activity._id }}" class="activity-link activity-card">
          <card-component>
            <template v-slot:delete-icon>
              <img :src="trashIcon" class="delete-icon" @click.stop="confirmDelete(activity._id)">
              <img :src="editIcon" class="edit-icon" @click.stop="editActivity(activity)">
            </template>
            <h3>{{ activity.name }}</h3>
            <p>{{ activity.description }}</p>
            <p>Start Date: {{ new Date(activity.startDate).toLocaleDateString() }}</p>
            <p>End Date: {{ new Date(activity.endDate).toLocaleDateString() }}</p>
            <div v-for="(slot, index) in activity.timeSlots" :key="index">
              <p>{{ slot.dayOfWeek }}: {{ slot.startTime }} - {{ slot.endTime }}</p>
            </div>
          </card-component>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import API from '@/services/api';
import CardComponent from '@/components/CardComponent.vue';
import ActivityModal from './ActivityModal.vue';
import trashIcon from '@/assets/trashicon.jpeg';
import editIcon from '@/assets/editicon.png';
import AdminNavbar from '@/components/AdminNavbar.vue';

export default {
  name: "AdminOverview",
  components: {
    AdminNavbar,
    CardComponent,
    ActivityModal
  },
  data() {
    return {
      activities: [],
      showModal: false,
      editingActivity: null,
      trashIcon,
      editIcon,
    };
  },
  methods: {
    fetchActivities() {
      API.get('activities')
        .then(response => {
          this.activities = response.data.map(activity => ({
            ...activity,
            startDate: activity.startDate || new Date(),
            endDate: activity.endDate || new Date(),
            timeSlots: activity.timeSlots || []
          }));
        })
        .catch(error => {
          console.error("There was an error fetching the activities:", error);
        });
    },
    handleActivityAdded() {
      this.fetchActivities();
      this.showModal = false;
      this.editingActivity = null;
    },
    handleModalClose() {
      this.showModal = false;
      this.editingActivity = null; // Reset the editing activity
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
    prepareNewActivity() {
      this.editingActivity = null; 
      this.showModal = true;
    }
  },
  created() {
    this.fetchActivities();
  }
};
</script>

<style scoped>
.admin-overview {
  margin: 0 auto;
  text-align: center;
}

.plus-button {
  font-size: 24px;
  line-height: 50px;
  margin: 20px;
  inline-size: 50px;
  block-size: 50px;
  border-radius: 50%;
  border: 2px solid #000;
  cursor: pointer;
}

.activities {
  margin-block-start: 20px;
}

.activity-card {
  flex-basis: calc(50% - 20px); 
  margin: 10px; 
  box-sizing: border-box; 
}

.delete-icon, .edit-icon {
  cursor: pointer;
  position: absolute;
  inset-block-start: 5px;
  inset-inline-end: 5px;
  inline-size: 20px;
  block-size: 20px;
}

.edit-icon {
  inset-inline-end: 35px;
}

.activity-link {
  text-decoration: none;
  color: inherit; 
}
</style>
