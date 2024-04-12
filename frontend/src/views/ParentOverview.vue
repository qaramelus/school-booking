<template>
  <div>
    <parent-navbar></parent-navbar>
    <div class="parent-overview">
      <button @click="showBookingModal = true">Book activity</button>
      <div class="activities">
        <h2>Activities</h2>
        <div class="activity-cards">
          <card-component
            v-for="activity in activities"
            :key="activity._id"
            @click="() => handleCardClick(activity)"
          >
            <h3>{{ activity.name }}</h3>
            <p>{{ activity.description }}</p>
            <p>Start Date: {{ new Date(activity.startDate).toLocaleDateString() }}</p>
            <p>End Date: {{ new Date(activity.endDate).toLocaleDateString() }}</p>
            <div v-for="(slot, index) in activity.timeSlots" :key="index">
              <p>{{ slot.dayOfWeek }}: {{ slot.startTime }} - {{ slot.endTime }}</p>
            </div>
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
  </div>
</template>

<script>
import API from '@/services/api';
import CardComponent from '@/components/CardComponent.vue';
import ParentNavbar from '@/components/ParentNavbar.vue';

export default {
  name: "ParentOverview",
  components: {
    CardComponent,
    ParentNavbar,
  },
  data() {
    return {
      activities: [],
      showBookingModal: false,
      children: [],
      selectedChild: '',
      selectedActivity: '',
    };
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
    bookActivity() {
      if (!this.selectedChild || !this.selectedActivity) {
        alert('Please select both a child and an activity');
        return;
      }

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
        this.fetchActivities(); // Optionally refresh the activities list
      })
      .catch(error => {
        console.error("There was an error booking the activity:", error);
      });
    },
    handleCardClick(activity) {
      // Update to point to the new detail page for parents
      this.$router.push({ name: 'ActivityDetailParents', params: { activityId: activity._id } });
    },
  },
  created() {
    this.fetchActivities();
    this.fetchChildren();
  }
};
</script>


<style scoped>
.modal {
  display: block; 
  position: fixed; 
  z-index: 1; 
  inset-inline-start: 0;
  inset-block-start: 0;
  inline-size: 100%; 
  block-size: 100%; 
  overflow: auto; 
  background-color: rgb(0,0,0); 
  background-color: rgba(0,0,0,0.4); 
}

.modal-content {
  background-color: #fefefe;
  margin: 15% auto; 
  padding: 20px;
  border: 1px solid #888;
  inline-size: 80%; 
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
