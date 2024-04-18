<template>
  <div>
    <ParentNavbar />
    <div class="calendar-container">
      <div class="controls">
        <!-- @change event will call fetchNonCancelledSessions function -->
        <select v-model="selectedChildId" @change="fetchNonCancelledSessions">
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

    // Ensuring function is within the setup() scope and used
    const fetchNonCancelledSessions = async () => {
      if (selectedChildId.value) {
        try {
          const url = `/activities/children/${selectedChildId.value}/non-cancelled-sessions`;
          const { data } = await API.get(url);
          const events = data.map(session => ({
            title: session.activityName,
            start: `${session.date}T${session.startTime}`,
            end: `${session.date}T${session.endTime}`,
            classNames: ['custom-class-for-event']
          }));
          calendarInstance.value.removeAllEvents();
          calendarInstance.value.addEventSource(events);
        } catch (error) {
          console.error("There was an error fetching the non-cancelled sessions for the child:", error.message);
        }
      }
    };

    onMounted(() => {
      fetchChildren();
      calendarInstance.value = new Calendar(calendarEl.value, {
        plugins: [dayGridPlugin, timeGridPlugin],
        initialView: currentView.value,
        eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
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

    return {
      selectedChildId,
      children,
      calendarEl,
      currentView,
      fetchNonCancelledSessions, // Make sure to return the function if it's going to be used in the template
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
