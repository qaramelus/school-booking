<template>
  <div class="parent-overview">
    <h1>You logged on successfully</h1>
    <button @click="performLogout">Logout</button>
    <div class="activities">
      <h2>Activities</h2>
      <div class="activity-cards">
        <!-- Iterate over activities and display them as cards -->
        <div class="activity-card" v-for="activity in activities" :key="activity._id">
          <h3>{{ activity.name }}</h3>
          <p>{{ activity.description }}</p>
          <p>Date: {{ new Date(activity.date).toLocaleDateString() }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import API from '@/services/api'; // Import the API instance from your services
import { logout } from '@/services/logout';

export default {
  name: "ParentOverview",
  data() {
    return {
      activities: [], // Initialize activities array to store fetched activities
    };
  },
  methods: {
    performLogout() {
      logout(this.$router);
    },
    fetchActivities() {
      // Fetch activities from the backend using the centralized API instance
      API.get('activities')
        .then(response => {
          this.activities = response.data;
        })
        .catch(error => {
          console.error("There was an error fetching the activities:", error);
        });
    },
  },
  created() {
    this.fetchActivities(); // Fetch activities when component is created
  }
};
</script>

<style scoped>
/* Styling for your overview page */
.parent-overview {
  max-inline-size: 600px;
  margin: 0 auto;
  text-align: center;
}

.activities {
  margin-top: 20px;
}

.activity-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.activity-card {
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
  transition: 0.3s;
  width: 30%;
  margin-bottom: 20px;
  border-radius: 5px;
  padding: 2px 16px;
  background-color: white;
}

.activity-card:hover {
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
}

@media (max-width: 768px) {
  .activity-card {
    width: 100%;
  }
}
</style>
