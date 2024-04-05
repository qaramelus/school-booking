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
      const currentView = ref('dayGridMonth'); 
      const calendarInstance = ref(null);
  
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
            const parentId = localStorage.getItem('parent-id'); 
            if (!parentId) {
              throw new Error("Parent ID is undefined.");
            }
            // Correcting the URL and adding log to see what's being requested
            const url = `/parent/${parentId}/child/${selectedChildId.value}/bookings`;
            console.log(`Fetching bookings for child ${selectedChildId.value} of parent ${parentId}`);
            console.log(`Request URL: ${url}`);
            const { data } = await API.get(url);
            const events = [];
            
            data.forEach(booking => {
                if (booking.activityId && booking.activityId.timeSlots) {
                booking.activityId.timeSlots.forEach(slot => {
                    const daysOfWeek = [
                    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
                    ].map((day, index) => day === slot.dayOfWeek ? index : null).filter(n => n !== null);
  
                    if (daysOfWeek.length > 0) {
                    events.push({
                        title: booking.activityId.name,
                        startRecur: booking.activityId.startDate,
                        endRecur: booking.activityId.endDate,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        daysOfWeek: daysOfWeek,
                        classNames: ['custom-class-for-event'],
                    });
                    }
                });
                }
            });
  
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
      });
  
      watch(currentView, (newValue) => {
        if (calendarInstance.value) {
          calendarInstance.value.changeView(newValue);
        }
      });
  
      watch(selectedChildId, (newVal, oldVal) => {
        console.log(`Child selection changed from ${oldVal} to ${newVal}`);
        fetchBookingsForChild();
      });
  
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
    inline-size: 75%; /* Increase width */
    block-size: auto; /* Adjust height as needed, or keep it auto */
    transform-origin: top left; /* Ensures the scaling is relative to the top left corner */
    margin: auto; /* Keeps the calendar centered */
  }
  </style>
  