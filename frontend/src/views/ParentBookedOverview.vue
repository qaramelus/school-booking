<template>
    <div>
      <parent-navbar></parent-navbar>
      <h2>Booked Activities</h2>
      <div v-for="booking in bookingsGroupedByChild" :key="booking.childId">
        <h3>{{ booking.childName }}</h3>
        <ul>
          <li v-for="activity in booking.activities" :key="activity._id">
            {{ activity.name }} - {{ new Date(activity.date).toLocaleDateString() }}
            <p>{{ activity.description }}</p>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  import API from '@/services/api';
  import ParentNavbar from '@/components/ParentNavbar.vue'; // Ensure this path is correct
  
  export default {
    name: "ParentBookedOverview",
    components: {
      ParentNavbar,
    },
    data() {
      return {
        bookingsGroupedByChild: [],
      };
    },
    methods: {
      async fetchBookings() {
        try {
          const parentId = localStorage.getItem('parent-id'); // Ensure this is how you've stored it
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
                activities: []
            };
            }

            acc[childId._id].activities.push({
            _id: activityId._id,
            name: activityId.name,
            date: activityId.date,
            description: activityId.description
            });

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
  /* Add your styles here */
  </style>
  