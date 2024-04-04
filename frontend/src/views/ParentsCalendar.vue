<template>
    <div>
      <ParentNavbar />
      <div class="parents-calendar">
        <select v-model="selectedChildId" @change="fetchBookingsForChild">
          <option value="" disabled>Select Child</option>
          <option v-for="child in children" :key="child._id" :value="child._id">{{ child.username }}</option>
        </select>
        <div ref="calendarEl"></div>
      </div>
    </div>
  </template>
  
  <script>
import { ref, onMounted } from 'vue';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import API from '@/services/api';
import ParentNavbar from '@/components/ParentNavbar.vue';

export default {
  name: 'ParentsCalendar',
  components: {
    ParentNavbar,
  },
  setup() {
    const selectedChildId = ref('');
    const children = ref([]);
    const calendarEl = ref(null);

    const fetchChildren = async () => {
      try {
        const parentId = localStorage.getItem('parent-id');
        if (!parentId) throw new Error("Parent ID is undefined.");

        const { data } = await API.get(`/users/${parentId}/children`);
        children.value = data; // Adjust based on actual data structure
      } catch (error) {
        console.error("There was an error fetching the children:", error.message);
      }
    };

    const fetchBookingsForParent = async () => {
      try {
        const parentId = localStorage.getItem('parent-id');
        if (!parentId) throw new Error("Parent ID is undefined.");

        const { data } = await API.get(`/parent/${parentId}/bookings`);

        const events = data.map(booking => ({
          title: booking.activityId.name,
          start: booking.activityId.startDate,
          end: booking.activityId.endDate,
        }));

        if (calendarEl.value) {
          let calendar = new Calendar(calendarEl.value, {
            plugins: [dayGridPlugin],
            initialView: 'dayGridMonth',
          });
          calendar.removeAllEvents(); 
          calendar.addEventSource(events); 
          calendar.render();
        }
      } catch (error) {
        console.error("There was an error fetching the bookings:", error.message);
      }
    };

    onMounted(() => {
      fetchChildren();
      fetchBookingsForParent(); // Call it here if you want to load all bookings on component mount
    });

    return { selectedChildId, children, calendarEl };
  }
};
</script>

  
  <style scoped>
  .parents-calendar {
    /* Add your styles here */
  }
  </style>
  