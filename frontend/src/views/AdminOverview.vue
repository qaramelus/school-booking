<template>
  <div class="admin-overview">
    <h1>Admin Dashboard</h1>
    <button class="plus-button" @click="showModal = true">+</button>
    <button @click="performLogout">Logout</button>
    <ActivityModal :isVisible="showModal" @close="showModal = false" @activityAdded="handleActivityAdded" />
    <div class="activities">
      <h2>Activities</h2>
      <div class="activity-cards">
        <card-component v-for="activity in activities" :key="activity._id" @onClick="() => handleCardClick(activity)">
          <template v-slot:delete-icon>
            <img :src="trashIcon" class="delete-icon" @click.stop="confirmDelete(activity._id)">
          </template>
          <h3>{{ activity.name }}</h3>
          <p>{{ activity.description }}</p>
          <p>Date: {{ new Date(activity.date).toLocaleDateString() }}</p>
        </card-component>
      </div>
    </div>
  </div>
</template>

<script>
import API from '@/services/api';
import { logout } from '@/services/logout';
import CardComponent from '@/components/CardComponent.vue';
import ActivityModal from './ActivityModal.vue';
import trashIcon from '@/assets/trashicon.jpeg'; 

export default {
  name: "AdminOverview",
  components: {
    CardComponent,
    ActivityModal
  },
  data() {
    return {
      activities: [],
      showModal: false,
      trashIcon,
    };
  },
  methods: {
    performLogout() {
      logout(this.$router);
    },
    fetchActivities() {
      API.get('activities')
        .then(response => {
          this.activities = response.data;
        })
        .catch(error => {
          console.error("There was an error fetching the activities:", error);
        });
    },
    handleActivityAdded(activity) {
      this.fetchActivities();
      console.log('Activity added:', activity);
      this.showModal = false;
    },
    handleCardClick(activity) {
      console.log('Card clicked:', activity);
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
  },
  created() {
    this.fetchActivities();
  }
};
</script>

<style scoped>
.admin-overview {
  max-inline-size: 600px;
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

.activity-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.delete-icon {
  cursor: pointer;
  position: absolute;
  top: 5px; 
  right: 5px; 
  width: 20px; 
  height: 20px; 
}

</style>
