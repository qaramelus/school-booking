<template>
    <div>
      <ParentNavbar />
      <div class="calendar-container">
        <div class="controls">
          <select v-model="selectedChildId" @change="fetchBookingsForChild">
            <option value="" disabled>Select Child</option>
            <option v-for="child in children" :key="child._id" :value="child._id">{{ child.username }}</option>
          </select>
          <select v-model="currentView">
            <option value="dayGridMonth">Month View</option>
            <option value="timeGridWeek">Week View</option>
          </select>
        </div>
        <div ref="calendarEl" class="calendar"></div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, watch } from 'vue';
  import { Calendar } from '@fullcalendar/core';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import timeGridPlugin from '@fullcalendar/timegrid';
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
      const currentView = ref('dayGridMonth'); // Default view
      const calendarInstance = ref(null); // To store the calendar instance
  
      const fetchChildren = async () => {
        try {
          const parentId = localStorage.getItem('parent-id');
          if (!parentId) {
            throw new Error("Parent ID is undefined.");
          }
  
          const { data } = await API.get(`/users/${parentId}/children`);
          children.value = data;
        } catch (error) {
          console.error("There was an error fetching the children:", error.message);
        }
      };
  
      const fetchBookingsForChild = async () => {
        if (selectedChildId.value && calendarInstance.value) {
          try {
            const { data } = await API.get(`/parent/${selectedChildId.value}/bookings`);
            const events = data.map(booking => ({
              title: booking.activityId.name,
              start: booking.activityId.startDate,
              end: booking.activityId.endDate,
            }));
            calendarInstance.value.removeAllEvents();
            calendarInstance.value.addEventSource(events);
          } catch (error) {
            console.error("There was an error fetching the bookings for child:", error.message);
          }
        }
      };
  
      onMounted(() => {
        fetchChildren();
        calendarInstance.value = new Calendar(calendarEl.value, {
          plugins: [dayGridPlugin, timeGridPlugin],
          initialView: currentView.value,
            slotMinTime: "09:00:00", 
            slotMaxTime: "18:00:00",
        });
        calendarInstance.value.render();
        // Optionally, fetch bookings for the initial child if applicable
      });
  
      watch(currentView, (newValue) => {
        if (calendarInstance.value) {
          calendarInstance.value.changeView(newValue);
        }
      });
  
      watch(selectedChildId, fetchBookingsForChild);
  
      return {
        selectedChildId,
        children,
        calendarEl,
        currentView,
      };
    },
  };
  </script>
  
  <style scoped>
  .calendar-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
  }
  
  .controls {
    margin-block-end: 20px;
  }
  
  .calendar {
    width: 75%; /* Increase width */
    height: auto; /* Adjust height as needed, or keep it auto */
    transform-origin: top left; /* Ensures the scaling is relative to the top left corner */
    margin: auto; /* Keeps the calendar centered */
  }
  </style>
  
  