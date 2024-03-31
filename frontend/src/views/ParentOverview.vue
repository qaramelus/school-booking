<template>
  <div class="parent-overview">
    <button @click="performLogout">Logout</button>
    <div class="activities">
      <h2>Activities</h2>
      <div class="activity-cards">
        <card-component v-for="activity in activities" :key="activity._id" @onClick="() => handleCardClick(activity)">
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

export default {
  name: "ParentOverview",
  components: {
    CardComponent,
  },
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
    handleCardClick(activity) {
      // Handle card click if necessary
      console.log('Card clicked:', activity);
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
  margin-block-start: 20px;
}

.activity-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}
</style>
