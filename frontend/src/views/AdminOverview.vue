<template>
  <div class="admin-overview">
    <admin-navbar />
    <h1>All Activities</h1>
    <button class="plus-button" @click="prepareNewActivity">+</button>
    <ActivityModal :isVisible="showModal" :editingActivity="editingActivity" @close="handleModalClose" @activityAdded="handleActivityAdded" @activityUpdated="fetchActivities" />
    <div class="activities">
      <h2>Activities</h2>
      <div class="activity-cards">
        <div v-for="activity in activities" :key="activity._id" class="activity-card" @click="goToActivityDetail(activity._id)">
          <card-component :onClick="() => goToActivityDetail(activity._id)">
            <template v-slot:icons>
              <img :src="trashIcon" class="delete-icon" @click.stop="confirmDelete(activity._id)">
              <img :src="editIcon" class="edit-icon" @click.stop="editActivity(activity)">
            </template>
            <h3>{{ activity.name }}</h3>
            <p>{{ activity.description }}</p>
            <p><strong>Start Date:</strong> {{ new Date(activity.startDate).toLocaleDateString() }}</p>
            <p><strong>End Date:</strong> {{ new Date(activity.endDate).toLocaleDateString() }}</p>
            <div v-for="(slot, index) in activity.timeSlots" :key="index">
              <p>{{ slot.dayOfWeek }}: {{ slot.startTime }} - {{ slot.endTime }}</p>
            </div>
          </card-component>
        </div>
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
    goToActivityDetail(activityId) {
    this.$router.push({ name: 'ActivityDetail', params: { activityId } });
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
}

.plus-button {
  font-size: 24px;
  inline-size: 50px;
  block-size: 50px;
  line-height: 50px;
  border-radius: 50%;
  border: 2px solid #000;
  background-color: #fff;
  cursor: pointer;
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
  background-color: #f9f9f9;
  cursor: pointer;
}

.activity-card:hover {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.delete-icon, .edit-icon {
  position: absolute;
  inset-block-start: 10px;
  inset-inline-end: 10px;
  inline-size: 20px;
  block-size: 20px;
  cursor: pointer;
}

.edit-icon {
  inset-inline-end: 40px;
}

.activity-link {
  text-decoration: none;
  color: inherit;
}
</style>