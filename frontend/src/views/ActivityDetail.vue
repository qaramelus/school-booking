<template>
  <div>
    <!-- Conditional rendering of Navbars -->
    <AdminNavbar v-if="isAdmin" />
    <ParentNavbar v-else />

    <div v-if="activity" class="activity-detail-container">
      <div class="activity-detail-tabs">
        <!-- Tab Headers -->
        <button @click="currentTab = 'about'" :class="{'active-tab': currentTab === 'about'}">About</button>
        <button v-if="isAdmin" @click="currentTab = 'participants'" :class="{'active-tab': currentTab === 'participants'}">Participants</button>
      </div>
      <!-- Tab Content -->
      <div class="tab-content">
        <div v-if="currentTab === 'about'" class="activity-detail">
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
          <div v-if="activity.teachers && activity.teachers.length">
            <h3>Teachers</h3>
            <ul>
              <li v-for="teacher in activity.teachers" :key="teacher._id">
                {{ teacher.username }}
              </li>
            </ul>
          </div>
        </div>
        <div v-if="currentTab === 'participants' && isAdmin">
          <h2>Participants ({{ participants.length }}):</h2>
          <ul class="participant-list">
            <li v-for="participant in participants" :key="participant.id">
              <span>{{ participant.username }}</span>
              <button class="remove-button" @click="removeUserFromActivity(participant.bookingId)">Remove</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div v-else class="loading">
      Loading activity details...
    </div>
  </div>
</template>

<script>
import API from '@/services/api';
import AdminNavbar from '@/components/AdminNavbar.vue';
import ParentNavbar from '@/components/ParentNavbar.vue';

export default {
  name: 'ActivityDetail',
  components: {
    AdminNavbar,
    ParentNavbar
  },
  data() {
    return {
      activity: null,
      participants: [],
      isAdmin: false,
      currentTab: 'about', // Default tab
    };
  },
  created() {
    this.isAdmin = localStorage.getItem('user-role') === 'admin';  // Check admin status
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
        })
        .catch(error => {
          console.error("There was an error fetching the participants:", error);
        });
    },
    removeUserFromActivity(bookingId) {
      if (!bookingId) {
        console.error('Booking ID is undefined');
        return;
      }
      API.delete(`/deleteBooking/${bookingId}`)
        .then(() => {
          this.participants = this.participants.filter(p => p.bookingId !== bookingId);
        })
        .catch(error => {
          console.error('Error removing user from activity:', error);
        });
    }
  }
};
</script>

<style scoped>
.activity-detail-container {
  display: flex;
  flex-direction: column;
  max-block-size: 100vh; 
  overflow: hidden;
}

.activity-detail-tabs {
  display: flex;
  justify-content: space-around;
  background-color: #f5f5f5; 
  padding: 10px 0;
  position: sticky;
  inset-block-start: 0;
  z-index: 1000; 
}

.activity-detail h1, .activity-detail h2, .activity-detail h3, .loading {
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

.remove-button {
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-inline-start: auto;;
}

.remove-button:hover {
  background-color: #ff3333;
}

.tab-content {
  overflow-y: auto;
  flex-grow: 1; 
  padding: 20px;
}

.participant-list li {
  display: flex;
  justify-content: space-between; 
  align-items: center; 
}

.active-tab {
  background-color: #007bff;
  color: white;
}

.tab-content {
  margin-block-start: 20px;
}
</style>