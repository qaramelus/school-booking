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
          <!-- Booking status for Parents -->
        <div v-if="!isAdmin && children.length > 0">
          <h3>Booking Details:</h3>
          <ul>
            <li v-for="child in children" :key="child.id">
              <span>{{ child.name }}:</span>
              <button v-if="child.isBooked" @click="cancelBooking(child.id, child.bookingId)" class="cancel-button">
                Cancel Booking
              </button>
            </li>
          </ul>
        </div>
        <!-- Book Activity Button for Parents -->
        <button v-if="!isAdmin && !allChildrenBooked" class="book-activity-button" @click="showBookingModal = true">Book This Activity</button>
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

    <!-- Booking Modal -->
    <div v-if="showBookingModal" class="modal">
      <div class="modal-content">
        <span @click="showBookingModal = false" class="close">&times;</span>
        <h3>Book This Activity</h3>
        <select v-model="selectedChild" v-if="children.length > 1">
          <option disabled value="">Select Child</option>
          <option v-for="child in children" :value="child.id" :key="child.id">{{ child.name }}</option>
        </select>
        <button @click="bookActivity">Book Activity</button>
      </div>
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
      showBookingModal: false,
      children: [],
      selectedChild: '',
      currentTab: 'about',
      bookingStatus: '', 
      allChildrenBooked: true,
    };
  },
  created() {
    this.isAdmin = localStorage.getItem('user-role') === 'admin';
    this.fetchActivity();
    if (this.isAdmin) {
      this.fetchParticipants();
    } else {
      this.fetchChildren(); // Fetch children if not admin
      this.fetchBookingStatus(); // Fetch booking status if not admin
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
    fetchChildren() {
      const parentId = localStorage.getItem('parent-id');
      API.get(`users/${parentId}/children`)
        .then(response => {
          this.children = response.data.map(child => ({
            id: child._id,
            name: child.username 
          }));
          // Preselect the child if only one child is available
          if (this.children.length === 1) {
            this.selectedChild = this.children[0].id;
          }
        })
        .catch(error => {
          console.error("There was an error fetching the children:", error);
        });
    },
    fetchBookingStatus() {
      const parentId = localStorage.getItem('parent-id');
      const activityId = this.$route.params.activityId;
      API.get(`activity/${activityId}/parent/${parentId}/booking-status`)
        .then(response => {
          let allChildrenBooked = true;
          this.children = this.children.map(child => {
            const booking = response.data.find(booking => booking.childName === child.name && booking.status === 'Booked');
            const isBooked = booking !== undefined;
            if (!isBooked) allChildrenBooked = false;
            return {
              ...child,
              isBooked,
              bookingId: booking ? booking.bookingId : null // Include bookingId if available
            };
          });
          this.allChildrenBooked = allChildrenBooked;
        })
        .catch(error => {
          console.error("There was an error fetching the booking status:", error);
          this.bookingStatus = "Error fetching booking status";
        });
    },
    bookActivity() {
      if (!this.selectedChild) {
        alert('Please select a child');
        return;
      }

      const bookingInfo = {
        childId: this.selectedChild,
        activityId: this.activity._id,
      };
      API.post('/bookActivity', bookingInfo, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('user-token')}`
        }
      })
      .then(() => {
        alert('Activity booked successfully');
        this.showBookingModal = false;
        this.fetchBookingStatus(); // Refresh booking status after booking
      })
      .catch(error => {
        console.error("There was an error booking the activity:", error);
      });
    },
    cancelBooking(childId, bookingId) {
      // Use DELETE method and include bookingId in the URL
      API.delete(`/deleteBooking/${bookingId}`, {
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
      });
    }
  }
};
</script>

<style scoped>
.book-activity-button, .cancel-button {
  font-size: 16px;
  padding: 10px 20px;
  border-radius: 8px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  outline: none;
  display: block; /* Makes the button block level for better layout control */
  margin-block-start: 20px; 
}
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
  margin-inline-start: auto;
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
