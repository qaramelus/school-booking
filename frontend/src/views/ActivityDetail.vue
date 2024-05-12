<template>
  <div>
    <!-- Conditional rendering of Navbars -->
    <AdminNavbar v-if="isAdmin" />
    <ParentNavbar v-else />

    <div v-if="activity" class="activity-detail-container">
      <div class="activity-detail-tabs">
        <button @click="currentTab = 'about'" :class="{'active-tab': currentTab === 'about'}">About</button>
        <button v-if="isAdmin" @click="currentTab = 'participants'" :class="{'active-tab': currentTab === 'participants'}">Participants</button>
      </div>
      <!-- Tab Content -->
      <div class="tab-content">
        <div v-if="currentTab === 'about'" class="activity-detail">
          <h1>{{ activity.name }}</h1>
          <p v-html="activity.description"></p> 
          <p>Date: {{ new Date(activity.startDate).toLocaleDateString() }} to {{ new Date(activity.endDate).toLocaleDateString() }}</p>
          <p>Maximum Participants: {{ activity.maxParticipants }}</p>
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
          <!-- Booking status for Parents -->
          <div v-if="!isAdmin && children.length > 0">
            <h3>Booking Details:</h3>
            <ul>
              <li v-for="child in children" :key="child.id">
                <span>{{ child.name }}: {{ child.status }}</span>
                <button v-if="child.isBooked" @click="cancelBooking(child.id, child.bookingId)" class="cancel-button">
                  Cancel Booking
                </button>
                <button v-else @click="bookActivity(child.id)" class="book-activity-button">
                  Book Activity
                </button>
              </li>
            </ul>
            <p v-if="allChildrenBooked" class="full-capacity-message">
              The activity is booked out, new bookings will be placed on the waitlist.
            </p>
          </div>
        </div>
        <div v-if="currentTab === 'participants' && isAdmin">
          <h2>Confirmed Participants ({{ confirmedParticipants.length }}):</h2>
          <ul class="participant-list">
            <li v-for="participant in confirmedParticipants" :key="participant.id">
              <span>{{ participant.username }}</span>
              <button class="remove-button" @click="removeBooking(participant.id, participant.bookingId)">Remove</button>
            </li>
          </ul>
          <h2>Waitlisted Participants ({{ waitlistedParticipants.length }}):</h2>
          <ul class="participant-list">
            <li v-for="participant in waitlistedParticipants" :key="participant.id">
              <span>{{ participant.username }}</span>
              <!-- Additional controls for waitlisted participants can go here -->
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div v-else class="loading">
      Loading activity details...
    </div>

    <!-- Booking Modal -->
    <div v-if="showBookingModal" class="modal">
      <div class="modal-content">
        <span @click="showBookingModal = false" class="close">&times;</span>
        <h3>Book This Activity</h3>
        <select v-model="selectedChild" v-if="children.length > 1" class="select-child">
          <option disabled value="">Select Child</option>
          <option v-for="child in children" :value="child.id" :key="child.id">{{ child.name }}</option>
        </select>
        <button @click="bookActivity(selectedChild)" class="book-button">Book Activity</button>
      </div>
    </div>
  </div>
</template>

<script>
import API from '@/services/api';
import '@/styles/MainColorSchema.css'
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
      showBookingModal: false,
      children: [],
      selectedChild: '',
      currentTab: 'about',
      allChildrenBooked: false,
      confirmedParticipants: [],
      waitlistedParticipants: []
    };
  },
  created() {
    this.isAdmin = localStorage.getItem('user-role') === 'admin';
    this.fetchActivity()
      .then(() => {
        if (this.isAdmin) {
          this.fetchParticipants();
        } else {
          this.fetchChildren();
          this.fetchBookingStatus();
        }
      })
      .catch(error => {
        console.error("Error fetching activity:", error);
      });
  },
  methods: {
    fetchActivity() {
      const activityId = this.$route.params.activityId;
      return API.get(`activities/${activityId}`)
        .then(response => {
          this.activity = response.data;
        })
        .catch(error => {
          console.error("Error fetching activity details:", error);
          throw error; // Rethrow the error to propagate it to the caller
        });
    },
    fetchParticipants() {
      const activityId = this.activity._id;
      API.get(`booking/activity/${activityId}/bookings`)
        .then(response => {
          this.confirmedParticipants = response.data.filter(booking => booking.status === 'confirmed').map(booking => ({
            id: booking.childId._id,
            username: booking.childId.username,
            bookingId: booking._id
          }));
          this.waitlistedParticipants = response.data.filter(booking => booking.status === 'waitlisted').map(booking => ({
            id: booking.childId._id,
            username: booking.childId.username,
            bookingId: booking._id
          }));
        })
        .catch(error => {
          console.error("Error fetching participants:", error);
        });
    },
    fetchChildren() {
      const parentId = localStorage.getItem('parent-id');
      API.get(`users/${parentId}/children`)
        .then(response => {
          this.children = response.data.map(child => ({
            id: child._id,
            name: child.username 
          }));
          if (this.children.length === 1) {
            this.selectedChild = this.children[0].id;
          }
        })
        .catch(error => {
          console.error("Error fetching children:", error);
        });
    },
    fetchBookingStatus() {
      const parentId = localStorage.getItem('parent-id');
      const activityId = this.$route.params.activityId;
      API.get(`booking/activity/${activityId}/parent/${parentId}/booking-status`)
        .then(response => {
          let allChildrenBookedOrWaitlisted = true;
          this.children = this.children.map(child => {
            const booking = response.data.find(booking => booking.childName === child.name);
            const isBooked = booking !== undefined && booking.status === 'confirmed';
            const isWaitlisted = booking !== undefined && booking.status === 'waitlisted';
            if (!isBooked && !isWaitlisted) allChildrenBookedOrWaitlisted = false;
            return {
              ...child,
              isBooked,
              isWaitlisted,
              status: booking ? booking.status : 'Not booked', // Include booking status if available
              bookingId: booking ? booking.bookingId : null // Include bookingId if available
            };
          });
          this.allChildrenBooked = allChildrenBookedOrWaitlisted;
        })
        .catch(error => {
          console.error("There was an error fetching the booking status:", error);
          this.bookingStatus = "Error fetching booking status";
        });
    },
    bookActivity(childId) {
      if (!childId) {
        alert('Please select a child');
        return;
      }

      const bookingInfo = {
        childId: childId,
        activityId: this.activity._id,
      };
      const requestBody = { ...bookingInfo }; // Spread the bookingInfo object directly
      API.post('/booking/bookActivity', requestBody, { 
        headers: {
          Authorization: `Bearer ${localStorage.getItem('user-token')}`
        }
      })
      .then(response => {
        if (response.data.status === 'waitlisted') {
          alert('The activity is booked out, you have been put on the waitlist.');
        } else {
          alert('Activity booked successfully');
        }
        this.showBookingModal = false;
        this.fetchBookingStatus(); // Refresh booking status after booking
      })
      .catch(error => {
        console.error("There was an error booking the activity:", error);
        alert('Failed to book activity. Please try again.');
      });
    },
    cancelBooking(childId, bookingId) {
      API.delete(`/booking/deleteBooking/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('user-token')}`
        }
      })
      .then(() => {
        alert('Booking cancelled successfully.');
        this.fetchBookingStatus(); // Refresh the booking status
      })
      .catch(error => {
        console.error("There was an error cancelling the booking:", error);
        if (error.response && error.response.data.message === 'Cannot cancel booking after signup end date') {
          alert('Cannot cancel this booking as it is outside the cancellation period.');
        } else {
          alert('Failed to cancel booking. Please try again.');
        }
      });
    },
    removeBooking(participantId, bookingId) {
      API.delete(`/booking/deleteBooking/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('user-token')}`
        }
      })
      .then(() => {
        alert('Booking removed successfully.');
        this.fetchParticipants(); // Refresh the participants list
        this.fetchBookingStatus(); // Optionally refresh the booking status
      })
      .catch(error => {
        console.error("There was an error removing the booking:", error);
      });
    }
  }
};
</script>

<style scoped>
.book-activity-button, .cancel-button, .waitlisted-status {
  font-size: 16px;
  padding: 12px 24px;
  border-radius: 8px;
  background-color: var(--button-active-bg);
  color: var(--button-text-color);
  border: none;
  cursor: pointer;
  outline: none;
  display: block;
  margin-block-start: 20px;
  transition: background-color 0.3s ease;
}

.cancel-button, .waitlisted-status {
  background-color: var(--button-active-bg); /* Using variable for active button background */
}

.book-activity-button:hover, .cancel-button:hover {
  background-color: var(--hover-dark); /* Darker shade for hover state */
}

.activity-detail-container {
  display: flex;
  flex-direction: column;
  max-block-size: 90vh;
  padding: 20px;
  background: var(--background-light);
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.activity-detail-tabs {
  display: flex;
  justify-content: space-around;
  background-color: var(--background-light);
  padding: 10px 0;
  position: sticky;
  inset-block-start: 0;
  z-index: 1000;
  border-block-end: 2px solid var(--border-color);
}

.activity-detail h1, .activity-detail h2, .activity-detail h3, .loading {
  color: var(--text-primary);
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  background: var(--hover-light);
  margin: 5px 0;
  padding: 10px;
  border-radius: 5px;
}
.remove-button {
  background-color: var(--hover-dark);
  color: var(--button-text-color);
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-inline-start: auto;
}
.remove-button:hover {
  background-color: var(--hover-dark);
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
  background-color: var(--primary-color);
  color: var(--button-text-color);
}
.tab-content {
  margin-block-start: 20px;
}
.modal {
  position: fixed;
  inset-inline-start: 0;
  inset-block-start: 0;
  inline-size: 100%;
  block-size: 100%;
  background-color: var(--modal-background);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s;
}

.modal-content {
  background: var(--modal-content-bg);
  padding: 20px;
  border-radius: 8px;
  inline-size: 90%;
  max-inline-size: 500px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  position:relative;
}

.close {
  position: absolute;
  inset-block-start: 10px;
  inset-inline-end: 10px;
  font-size: 24px;
  cursor:pointer;
}

h3 {
  margin-block-start: 0;
  color: var(--text-primary);
  font-size: 22px;
}

.select-child {
  inline-size: 100%;
  padding: 8px;
  margin-block-start: 20px;
  margin-block-end: 20px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--background-light);
}

.book-button {
  inline-size: 100%;
  background-color: var(--button-active-bg);
  color: var(--button-text-color);
  border: none;
  padding: 10px;
  font-size: 16px;
  border-radius: 4px;
  cursor:pointer;
  transition: background-color 0.3s;
}

.book-button:hover {
  background-color: var(--hover-dark);
}

@keyframes fadeIn {
  from {opacity: 0;}
  to {opacity: 1;}
}

</style>


