<template>
  <div>
    <parent-navbar :userId="currentUserId"></parent-navbar>
    <div class="overview-section">
      <div class="filter-buttons">
        <button @click="selectedFilter = 'open'" :class="{ active: selectedFilter === 'open' }">Open</button>
        <button @click="selectedFilter = 'current'" :class="{ active: selectedFilter === 'current' }">Current</button>
        <button @click="selectedFilter = 'all'" :class="{ active: selectedFilter === 'all' }">All</button>
      </div>
      <div class="activities">
        <h2>Activities</h2>
        <div v-if="bookableActivities.length === 0" class="no-activities">
          <p>No activities available for booking at this time.</p>
        </div>
        <div class="activity-cards">
          <router-link v-for="activity in bookableActivities" :key="activity._id"
                      :to="`/activities/${activity._id}`" custom>
            <template v-slot:default="{ navigate }">
              <div class="activity-card" @click="navigate">
                <div class="card-content">
                  <h3>{{ activity.name }}</h3>
                  <p v-html="activity.description"></p>
                  <p><strong>Start Date:</strong> {{ new Date(activity.startDate).toLocaleDateString() }}</p>
                  <p><strong>End Date:</strong> {{ new Date(activity.endDate).toLocaleDateString() }}</p>
                  <div v-for="(slot, index) in activity.timeSlots" :key="index">
                    <p>{{ slot.dayOfWeek }}: {{ slot.startTime }} - {{ slot.endTime }}</p>
                  </div>
                  <button v-if="isWithinSignupPeriod(activity)" class="book-activity-button"
                          @click.stop="handleBookClick(activity)">Book Activity</button>
                </div>
              </div>
            </template>
          </router-link>
        </div>
      </div>
      <!-- Booking Modal -->
      <div v-if="showBookingModal" class="modal">
        <div class="modal-content">
          <span @click="showBookingModal = false" class="close">&times;</span>
          <h3>Book an Activity</h3>
          <select v-model="selectedActivity" class="select-style">
            <option disabled value="">Select Activity</option>
            <option v-for="activity in bookableActivities" :value="activity._id" :key="activity._id">
              {{ activity.name }}
            </option>
          </select>
          <select v-model="selectedChild" class="select-style">
            <option disabled value="">Select Child</option>
            <option v-for="child in children" :value="child.id" :key="child.id">
              {{ child.name }}
            </option>
          </select>
          <button @click="bookActivity" class="book-modal-button">Book Activity</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import API from '@/services/api';
import ParentNavbar from '@/components/ParentNavbar.vue';
import '@/styles/overview-style.css';
import '@/styles/MainColorSchema.css'

export default {
  name: "ParentOverview",
  components: {
    ParentNavbar,
  },
  data() {
    return {
      currentUserId: '',
      activities: [],
      showBookingModal: false,
      children: [],
      selectedChild: '',
      selectedActivity: '',
      selectedFilter: 'open',
    };
  },
  computed: {
    bookableActivities() {
      const now = new Date();
      return this.activities.filter(activity => {
        const signupStart = new Date(activity.signupStartDate);
        const signupEnd = new Date(activity.signupEndDate);
        const isOpen = now >= signupStart && now <= signupEnd;
        const isCurrent = now >= new Date(activity.startDate) && now <= new Date(activity.endDate);

        switch (this.selectedFilter) {
          case 'open':
            return isOpen;
          case 'current':
            return isCurrent;
          case 'all':
            return true;
          default:
            return false;
        }
      });
    }
  },
  methods: {
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
      const parentId = localStorage.getItem('parent-id');
      if (!parentId) {
        console.error("Parent ID is undefined.");
        return;
      }
      API.get(`users/${parentId}/children`)
        .then(response => {
          this.children = response.data.map(child => ({
            id: child._id,
            name: child.username 
          }));
        })
        .catch(error => {
          console.error("There was an error fetching the children:", error);
        });
    },
    isWithinSignupPeriod(activity) {
      const now = new Date();
      const signupStart = new Date(activity.signupStartDate);
      const signupEnd = new Date(activity.signupEndDate);
      return now >= signupStart && now <= signupEnd;
    },
    handleBookClick(activity) {
      this.selectedActivity = activity._id;
      this.showBookingModal = true;
    },
    bookActivity() {
      if (!this.selectedChild || !this.selectedActivity) {
        alert('Please select both a child and an activity');
        return;
      }

      const bookingInfo = {
        childId: this.selectedChild,
        activityId: this.selectedActivity,
      };
      API.post('/booking/bookActivity', bookingInfo, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('user-token')}`
        }
      })
      .then(() => {
        alert('Activity booked successfully');
        this.showBookingModal = false;
        this.fetchActivities(); // Optionally refresh the activities list
      })
      .catch(error => {
        console.error("There was an error booking the activity:", error);
      });
    },
  },
  created() {
    this.currentUserId = localStorage.getItem('user-id');
    this.fetchActivities();
    this.fetchChildren();
  }
};
</script>


