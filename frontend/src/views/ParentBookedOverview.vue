<template>
  <div>
    <parent-navbar></parent-navbar>
    <h2>Booked Activities</h2>
    <div v-for="booking in bookingsGroupedByChild" :key="booking.childId" class="child-activities-section">
      <button class="accordion" @click="toggleAccordion(booking.childId)">
        <h3>{{ booking.childName }}</h3>
      </button>
      <div class="panel" :id="'panel-' + booking.childId">
        <div class="activity-cards">
          <card-component
            v-for="activity in booking.activities"
            :key="activity._id"
            @click="goToActivityDetails(activity._id, booking.childId)"
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
    </div>
  </div>
</template>
  
<script>
import API from '@/services/api';
import ParentNavbar from '@/components/ParentNavbar.vue';
import CardComponent from '@/components/CardComponent.vue';

export default {
  name: "ParentBookedOverview",
  components: {
    ParentNavbar,
    CardComponent,
  },
  data() {
    return {
      bookingsGroupedByChild: [],
      openPanels: [],
    };
  },
  methods: {
    async fetchBookings() {
      try {
        const parentId = localStorage.getItem('parent-id');
        if (!parentId) {
          console.error("Parent ID is undefined.");
          return;
        }
        const response = await API.get(`parent/${parentId}/bookings`);
        this.bookingsGroupedByChild = this.groupBookingsByChild(response.data);
      } catch (error) {
        console.error("There was an error fetching the bookings:", error);
      }
    },
    groupBookingsByChild(bookings) {
      const grouped = bookings.reduce((acc, booking) => {
        const { childId, activityId } = booking;

        if (!acc[childId._id]) {
          acc[childId._id] = {
            childId: childId._id,
            childName: childId.username,
            activities: [],
          };
        }

        if (activityId) {
          acc[childId._id].activities.push({
            _id: activityId._id,
            name: activityId.name,
            description: activityId.description,
            startDate: activityId.startDate,
            endDate: activityId.endDate,
            timeSlots: activityId.timeSlots,
          });
        } else {
          // Handling a missing or null activityId
          acc[childId._id].activities.push({
            _id: null,
            name: "Activity not available",
            description: "This activity is currently not available.",
            startDate: null,
            endDate: null,
            timeSlots: [],
          });
        }

        return acc;
      }, {});

      return Object.values(grouped);
    },
    goToActivityDetails(activityId, childId) {
        if (activityId && childId) {
            this.$router.push({ name: 'ActivityDetailParents', params: { activityId }, query: { childId } });
        } else {
            console.error('Invalid activity or child ID');
        }
    },
    toggleAccordion(childId) {
      const panelId = `panel-${childId}`;
      const panel = this.$el.querySelector('#' + panelId);
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
      // Toggle panel id in the openPanels array
      if (this.openPanels.includes(childId)) {
        this.openPanels = this.openPanels.filter(id => id !== childId);
      } else {
        this.openPanels.push(childId);
      }
    }
  },
  created() {
    this.fetchBookings();
  }
};
</script>

  
  <style scoped>
  /* Add your styles here, ensuring consistency with ParentOverview.vue for the card elements */
  .activity-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }
  
  .accordion {
  background-color: #eee;
  color: #444;
  cursor: pointer;
  padding: 18px;
  inline-size: 100%;
  border: none;
  text-align: start;
  outline: none;
  transition: 0.4s;
  border-radius: 5px;
  margin-block-start: 10px;
}

.active, .accordion:hover {
  background-color: #ccc; 
}

.panel {
  padding: 0 18px;
  background-color: white;
  max-block-size: 0;
  overflow: hidden;
  transition: max-height 0.2s ease-out;
  border: 1px solid #ddd;
  border-block-start: none;
}

.child-activities-section {
  margin-block-end: 10px;
}

.activity-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
  </style>
  