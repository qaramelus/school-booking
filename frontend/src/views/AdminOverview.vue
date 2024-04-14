<template>
  <div class="admin-overview">
    <admin-navbar />
    <h1>All Activities</h1>
    <div class="button-container">
      <button class="add-activity-button" @click="prepareNewActivity">Add Activity</button>
    </div>
    <ActivityModal
      :isVisible="showModal"
      :editingActivity="editingActivity"
      @close="handleModalClose"
      @activityAdded="handleActivityAdded"
      @activityUpdated="fetchActivities"
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
            <p>{{ activity.description }}</p>
            <p><strong>Start Date:</strong> {{ new Date(activity.startDate).toLocaleDateString() }}</p>
            <p><strong>End Date:</strong> {{ new Date(activity.endDate).toLocaleDateString() }}</p>
            <div v-for="(slot, index) in activity.timeSlots" :key="index">
              <p>{{ slot.dayOfWeek }}: {{ slot.startTime }} - {{ slot.endTime }}</p>
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

.button-container {
  margin-top: 10px;
  text-align: center;
  width: 100%;
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
  background-color: #f9f9f9;
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
