<template>
  <div>
    <parent-navbar :userId="currentUserId"></parent-navbar>
    <div class="calendar-container">
      <div class="controls">
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
  data() {
    return {
      currentUserId: '',
    };
  },
  created() {
    this.currentUserId = localStorage.getItem('user-id');  
  },
  setup() {
    const selectedChildId = ref('');
    const children = ref([]);
    const calendarEl = ref(null);
    const currentView = ref('dayGridMonth');
    let calendarInstance = null;

    const fetchChildren = async () => {
      try {
        const parentId = localStorage.getItem('parent-id');
        if (!parentId) {
          throw new Error("Parent ID is undefined.");
        }
        const { data } = await API.get(`/users/${parentId}/children`);
        children.value = data;
      } catch (error) {
        console.error("Error fetching children:", error.message);
      }
    };

    const fetchNonCancelledSessions = async () => {
  if (selectedChildId.value) {
    try {
      const { data } = await API.get(`/sessions/participant/${selectedChildId.value}`);
      const events = data.map(session => {
        // Extract just the date part from the ISO string
        const datePart = session.date.split('T')[0];
        const startTime = datePart + 'T' + session.startTime;
        const endTime = datePart + 'T' + session.endTime;

        // Validate the dates to avoid adding invalid entries
        if (isNaN(new Date(startTime).getTime()) || isNaN(new Date(endTime).getTime())) {
          console.error(`Invalid date found: start: ${startTime}, end: ${endTime}`);
          return null;
        }

        return {
          title: `${session.activityName} - ${session.locationName}`,
          start: startTime,
          end: endTime,
          classNames: ['custom-class-for-event']
        };
      }).filter(event => event !== null); // Filter out invalid events

      if (calendarInstance) {
        calendarInstance.removeAllEvents();
        calendarInstance.addEventSource(events);
      }
    } catch (error) {
      console.error("Error fetching non-cancelled sessions:", error.message);
    }
  }
};

    const initializeCalendar = () => {
      calendarInstance = new Calendar(calendarEl.value, {
        plugins: [dayGridPlugin, timeGridPlugin],
        initialView: currentView.value,
        eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
        slotMinTime: "09:00:00",
        slotMaxTime: "18:00:00",
        events: [] // Start with an empty array of events
      });
      calendarInstance.render();
    };

    onMounted(() => {
      fetchChildren();
      if (calendarEl.value) {
        initializeCalendar();
      }
    });

    watch(currentView, (newValue) => {
      if (calendarInstance) {
        calendarInstance.changeView(newValue);
      }
    });

    return {
      selectedChildId,
      children,
      calendarEl,
      currentView,
      fetchNonCancelledSessions,
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
