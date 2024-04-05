<template>
  <div>
    <parent-navbar></parent-navbar>
    <h2>Booked Activities</h2>
    <div v-for="booking in bookingsGroupedByChild" :key="booking.childId">
      <h3>{{ booking.childName }}</h3>
      <div class="activity-cards">
        <card-component
          v-for="activity in booking.activities"
          :key="activity._id"
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

        // Check if activityId is not null before pushing to activities array
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
          // Handle the case where activityId is null, possibly by pushing a placeholder or omitting the activity
          // Example placeholder for activity with null activityId
          acc[childId._id].activities.push({
            _id: null, // or a unique identifier
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
  
  /* You can customize further based on your design preferences */
  </style>
  