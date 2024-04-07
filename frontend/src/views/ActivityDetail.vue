<template>
  <div>
    <AdminNavbar />
    <div v-if="activity" class="activity-detail-container">
      <div class="activity-detail">
        <h1>{{ activity.name }}</h1>
        <p>{{ activity.description }}</p>
        <p>Date: {{ new Date(activity.startDate).toLocaleDateString() }} to {{ new Date(activity.endDate).toLocaleDateString() }}</p>
        <div v-if="activity.timeSlots">
          <h3>Time Slots</h3>
          <ul>
            <li v-for="(slot, index) in activity.timeSlots" :key="index">
              {{ slot.dayOfWeek }}: {{ slot.startTime }} - {{ slot.endTime }}
            </li>
          </ul>
        </div>
        <div v-if="isAdmin">
          <h2>Participants ({{ participants.length }}):</h2>
          <ul>
            <li v-for="participant in participants" :key="participant.id">
              {{ participant.username }}
              <button class="remove-button" @click="removeUserFromActivity(participant.bookingId)">Remove</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div v-else class="loading">
      <!-- This div is directly related to the v-if above, ensuring the v-else works correctly -->
      Loading activity details...
    </div>
  </div>
</template>


<script>
import API from '@/services/api';
import AdminNavbar from '@/components/AdminNavbar.vue';

export default {
  name: 'ActivityDetail',
  components: {
    AdminNavbar, 
  },
  data() {
    return {
      activity: null,
      participants: [],
      isAdmin: false,
    };
  },
  created() {
    this.isAdmin = localStorage.getItem('user-role') === 'admin';
    this.fetchActivity();
    if (this.isAdmin) {
      this.fetchParticipants();
    }
  },
  methods: {
    fetchActivity() {
      const activityId = this.$route.params.activityId;
      API.get(`activities/${activityId}`)
        .then(response => {
          this.activity = response.data;
        })
        .catch(error => {
          console.error("There was an error fetching the activity details:", error);
        });
    },
    fetchParticipants() {
      const activityId = this.$route.params.activityId;
      API.get(`activity/${activityId}/participants`)
        .then(response => {
          this.participants = response.data;
          console.log(this.participants); // Debug: Ensure participants include bookingId
        })
        .catch(error => {
          console.error("There was an error fetching the participants:", error);
        });
    },
    removeUserFromActivity(bookingId) {
      // Confirm before deleting
      if (confirm("Are you sure you want to remove the child from the booking?")) {
        if (!bookingId) {
          console.error('Booking ID is undefined');
          return; // Prevent the API call if bookingId is undefined
        }
        API.delete(`/deleteBooking/${bookingId}`)
          .then(() => {
            this.participants = this.participants.filter(p => p.bookingId !== bookingId);
          })
          .catch(error => {
            console.error('Error removing user from activity:', error);
          });
      } else {
        // If the user clicks "Cancel", do nothing
        console.log("Deletion cancelled by user.");
      }
    }
  }
};
</script>

<style scoped>
.activity-detail {
  max-inline-size: 600px;
  margin: auto;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.activity-detail h1, .activity-detail h2, .activity-detail h3 {
  color: #333;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  background: #e9ecef;
  margin: 5px 0;
  padding: 10px;
  border-radius: 5px;
}

.loading {
  text-align: center;
  font-size: 20px;
  margin-block-start: 20px;
}

.remove-button {
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-inline-start: 10px;
}

.remove-button:hover {
  background-color: #ff3333;
}

.activity-detail-container {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.activity-detail {
  max-inline-size: 1200px;
  background: #f5f5f5;
  border-radius: 8px;
}

</style>
