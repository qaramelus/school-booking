<template>
    <div>
      <TeacherNavbar />
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
import TeacherNavbar from '@/components/TeacherNavbar';

export default {
  name: 'TeacherCalendar',
  components: {
    TeacherNavbar,
  },
  setup() {
    const calendarEl = ref(null);
    const currentView = ref('dayGridMonth');
    const calendarInstance = ref(null);

    // Retrieve the teacher ID from local storage safely
    const teacherId = localStorage.getItem('user-id'); // Ensure this matches the key set in authService

    const fetchSessions = async () => {
    if (!teacherId) {
      console.error("No teacher ID found in local storage.");
      return; // Exit the function if no teacher ID is found
    }

    try {
      const { data: sessions } = await API.get(`/sessions/teacher/${teacherId}`);
      const events = sessions.map(session => ({
        id: session.id,
        title: `${session.activity} - ${session.numParticipants} participants`,
        start: new Date(session.date), // Convert date string to Date object
        end: new Date(session.date),   // Convert date string to Date object
        classNames: ['custom-class-for-event'],
      }));

      if (calendarInstance.value) {
        calendarInstance.value.removeAllEvents();
        calendarInstance.value.addEventSource(events);
      }
    } catch (error) {
      console.error("There was an error fetching the sessions:", error);
    }
  };


    onMounted(() => {
      calendarInstance.value = new Calendar(calendarEl.value, {
        plugins: [dayGridPlugin, timeGridPlugin],
        initialView: currentView.value,
        slotMinTime: "08:00:00",
        slotMaxTime: "19:00:00",
        eventClick: function(info) {
          console.log('Session ID:', info.event.id);
        },
      });
      fetchSessions();
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


  