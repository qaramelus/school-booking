<template>
  <div class="parent-overview">
    <button @click="performLogout">Logout</button>
    <!-- Button to trigger booking modal -->
    <button @click="showBookingModal = true">Book activity</button>
    <div class="activities">
      <h2>Activities</h2>
      <div class="activity-cards">
        <card-component
          v-for="activity in activities"
          :key="activity._id"
          @onClick="() => handleCardClick(activity)"
        >
          <h3>{{ activity.name }}</h3>
          <p>{{ activity.description }}</p>
          <p>Date: {{ new Date(activity.date).toLocaleDateString() }}</p>
        </card-component>
      </div>
    </div>
    <!-- Booking Modal -->
    <div v-if="showBookingModal" class="modal">
      <div class="modal-content">
        <span @click="showBookingModal = false" class="close">&times;</span>
        <h3>Book an Activity</h3>
        <select v-model="selectedChild">
          <option disabled value="">Select Child</option>
          <option v-for="child in children" :value="child.id" :key="child.id">{{ child.name }}</option>
        </select>
        <select v-model="selectedActivity">
          <option disabled value="">Select Activity</option>
          <option v-for="activity in activities" :value="activity._id" :key="activity._id">{{ activity.name }}</option>
        </select>
        <button @click="bookActivity">Book Activity</button>
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
      activities: [],
      showBookingModal: false,
      children: [], // Placeholder for children data
      selectedChild: '',
      selectedActivity: '',
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
    fetchChildren() {
      const parentId = localStorage.getItem('parent-id'); // Assume the parent's ID is stored with this key
      if (!parentId) {
        console.error("Parent ID is undefined.");
        return;
      }
      API.get(`users/${parentId}`, {
      })
      .then(response => {
        // Assuming the response structure matches your expectations
        this.children = response.data.children ? response.data.children.map(child => ({
          id: child._id,
          name: child.username 
        })) : [];
      })
      .catch(error => {
        console.error("There was an error fetching the children:", error);
      });
    },
    bookActivity() {
      if (this.selectedChild && this.selectedActivity) {
        const bookingInfo = {
          childId: this.selectedChild,
          activityId: this.selectedActivity,
        };
        API.post('/bookActivity', bookingInfo, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('user-token')}`
          }
        })
        .then(() => {
          alert('Activity booked successfully');
          this.showBookingModal = false;
        })
        .catch(error => {
          console.error("There was an error booking the activity:", error);
        });
      } else {
        alert('Please select both a child and an activity');
      }
    },
  },
  created() {
    this.fetchActivities();
    // Now, we don't call fetchChildren() here without ensuring we have a parentId
    const parentId = localStorage.getItem('parent-id');
    if (parentId) {
      this.fetchChildren(); // This method now internally gets parentId
    } else {
      console.error('No parent ID found for fetching children.');
    }
  }
};
</script>



<style scoped>
/* Styles for your booking modal */
.modal {
  display: block; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 1; /* Sit on top */
  inset-inline-start: 0;
  inset-block-start: 0;
  inline-size: 100%; /* Full width */
  block-size: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0,0,0); /* Fallback color */
  background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
}

.modal-content {
  background-color: #fefefe;
  margin: 15% auto; /* 15% from the top and centered */
  padding: 20px;
  border: 1px solid #888;
  inline-size: 80%; /* Could be more or less, depending on screen size */
}

.close {
  color: #aaa;
  float: inline-end;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
</style>
