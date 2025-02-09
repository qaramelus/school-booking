<template>
    <div>
      <admin-navbar :userId="currentUserId" />
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
  import { useRouter } from 'vue-router';
  import '@/styles/MainColorSchema.css'

  
  export default {
    name: 'AdminCalendar',
    components: {
      AdminNavbar,
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
      const calendarEl = ref(null);
      const currentView = ref('dayGridMonth');
      const calendarInstance = ref(null);
      const router = useRouter();
  
      const fetchActivities = async () => {
      try {
        // First, fetch all activities without participant counts
        const { data: activities } = await API.get('/activities');

        // Map over activities and fetch participant count for each
        const eventsPromises = activities.map(async (activity) => {
          try {
            const { data: activityWithParticipants } = await API.get(`/activity-participants/${activity._id}/with-participants`);
            return (activityWithParticipants.timeSlots || []).map((slot) => {
              const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                .map((day, index) => (day === slot.dayOfWeek ? index : null))
                .filter((n) => n !== null);
              return {
                id: activity._id,
                title: `${activityWithParticipants.name} (${activityWithParticipants.participantCount} participants)`,
                startRecur: activityWithParticipants.startDate,
                endRecur: activityWithParticipants.endDate,
                startTime: slot.startTime,
                endTime: slot.endTime,
                daysOfWeek,
                classNames: ['custom-class-for-event'],
              };
            }).flat();
          } catch (error) {
            console.error(`Error fetching participants for activity ${activity._id}:`, error);
            return []; // Return an empty array in case of an error
          }
        });

        // Await all the promises from the map to resolve
        const eventsNestedArray = await Promise.all(eventsPromises);
        const events = eventsNestedArray.flat();

        if (calendarInstance.value) {
          calendarInstance.value.removeAllEvents();
          calendarInstance.value.addEventSource(events);
        }
      } catch (error) {
        console.error("There was an error fetching the activities:", error);
      }
    };

    onMounted(() => {
      calendarInstance.value = new Calendar(calendarEl.value, {
        plugins: [dayGridPlugin, timeGridPlugin],
        initialView: currentView.value,
        slotMinTime: "08:00:00",
        slotMaxTime: "19:00:00",
        eventClick: function(info) {
          console.log('Event ID:', info.event.id);
          router.push({ name: 'ActivityDetail', params: { activityId: info.event.id } });
        },
        // Your other calendar options here...
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
  