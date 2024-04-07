<template>
    <div>
      <AdminNavbar />
      <div class="calendar-container">
        <div class="controls">
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
  import AdminNavbar from '@/components/AdminNavbar.vue';
  
  export default {
    name: 'AdminCalendar',
    components: {
      AdminNavbar,
    },
    setup() {
      const calendarEl = ref(null);
      const currentView = ref('dayGridMonth');
      const calendarInstance = ref(null);
  
      const fetchActivities = async () => {
        try {
          const { data } = await API.get('/activities');
          const events = data.map(activity => {
            return activity.timeSlots.map(slot => {
              const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                .map((day, index) => day === slot.dayOfWeek ? index : null).filter(n => n !== null);
  
              return {
                title: activity.name,
                startRecur: activity.startDate,
                endRecur: activity.endDate,
                startTime: slot.startTime,
                endTime: slot.endTime,
                daysOfWeek: daysOfWeek,
                classNames: ['custom-class-for-event'],
              };
            }).flat();
          }).flat();
  
          calendarInstance.value.removeAllEvents();
          calendarInstance.value.addEventSource(events);
        } catch (error) {
          console.error("There was an error fetching the activities:", error.message);
        }
      };
  
      onMounted(() => {
        calendarInstance.value = new Calendar(calendarEl.value, {
          plugins: [dayGridPlugin, timeGridPlugin],
          initialView: currentView.value,
          slotMinTime: "08:00:00",
          slotMaxTime: "19:00:00",
        });
        fetchActivities();
        calendarInstance.value.render();
      });
  
      watch(currentView, (newValue) => {
        if (calendarInstance.value) {
          calendarInstance.value.changeView(newValue);
        }
      });
  
      return {
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
    inline-size: 75%;
    block-size: auto;
    margin: auto;
  }
  </style>
  