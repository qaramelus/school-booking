<template>
  <div class="activity-detail-container">
    <TeacherNavbar />
    <div v-if="activity" class="activity-detail-tabs">
      <button @click="currentTab = 'about'" :class="{'active-tab': currentTab === 'about'}">About</button>
      <button @click="currentTab = 'participants'" :class="{'active-tab': currentTab === 'participants'}">Participants</button>
      <div class="tab-content">
        <div v-if="currentTab === 'about'" class="activity-detail">
          <h1>{{ activity.name }}</h1>
          <p>{{ activity.description }}</p>
          <p>Date: {{ new Date(activity.startDate).toLocaleDateString() }} to {{ new Date(activity.endDate).toLocaleDateString() }}</p>
        </div>
        <div v-if="currentTab === 'participants'">
          <h2>Session Participation</h2>
          <ul class="session-list">
            <li v-for="(session, index) in sessionInfo" :key="index">
              <div class="session-header" @click="toggleParticipantList(index)">
                {{ session.date }}: {{ session.startTime }} - {{ session.endTime }} ({{ session.participants.length }} participants)
                <button @click.stop="startRescheduleSession(session)" class="reschedule-btn">Reschedule</button>
              </div>
              <ul v-if="expandedSlots.includes(index)" class="participant-list">
                <li v-for="participant in session.participants" :key="participant.childId" class="participant-item">
                  {{ participant.childName }} ({{ participant.email }})
                  <span v-if="participant.attended === 'attended'" class="checkmark">✔️</span>
                  <button v-else @click.stop="markAttendance(participant.childId, session, index)" class="mark-attendance-btn">Mark Attended</button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div v-if="showRescheduleModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showRescheduleModal = false">&times;</span>
        <h3>Reschedule Session</h3>
        <form @submit.prevent="confirmReschedule">
          <label for="newDate">New Date:</label>
          <input type="date" v-model="rescheduleData.newDate" required>

          <label for="newStartTime">New Start Time:</label>
          <input type="time" v-model="rescheduleData.newStartTime" required>

          <label for="newEndTime">New End Time:</label>
          <input type="time" v-model="rescheduleData.newEndTime" required>

          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
    <div v-else class="loading">Loading activity details...</div>
  </div>
</template>

<script>
import API from '@/services/api';
import TeacherNavbar from '@/components/TeacherNavbar.vue';

export default {
  name: 'ActivityDetailTeacher',
  components: {
    TeacherNavbar,
  },
  data() {
    return {
      activity: null,
      currentTab: 'about',
      expandedSlots: [],
      sessionInfo: [],
      rescheduleData: {
        session: null,
        newDate: '',
        newStartTime: '',
        newEndTime: ''
      },
      showRescheduleModal: false
    };
  },
  created() {
    this.fetchActivity();
    this.fetchSessionInfo();
  },
  methods: {
    fetchActivity() {
      const activityId = this.$route.params.activityId;
      API.get(`/activities/${activityId}`)
        .then(response => {
          this.activity = response.data;
        })
        .catch(error => {
          console.error("Error fetching the activity details:", error);
        });
    },
    fetchSessionInfo() {
      const activityId = this.$route.params.activityId;
      API.get(`http://localhost:5005/api/attendance/${activityId}/enhanced-sessions`)
        .then(response => {
          this.sessionInfo = response.data;
        })
        .catch(error => {
          console.error("Error fetching session information:", error);
        });
    },
    toggleParticipantList(index) {
      const position = this.expandedSlots.indexOf(index);
      if (position !== -1) {
        this.expandedSlots.splice(position, 1);
      } else {
        this.expandedSlots.push(index);
      }
    },
    markAttendance(childId, session, index) {
      const payload = {
        activityId: this.$route.params.activityId,
        childId: childId,
        timeSlot: {
          startDate: session.date,
          startTime: session.startTime,
          endTime: session.endTime
        },
        attended: true
      };
      API.post('http://localhost:5005/api/attendance/', payload)
        .then(() => {
          this.sessionInfo[index].participants.find(p => p.childId === childId).attended = 'attended';
          alert('Attendance marked successfully.');
        })
        .catch(error => {
          console.error('Error marking attendance:', error);
          alert('Failed to mark attendance.');
        });
    },
    startRescheduleSession(session) {
      this.rescheduleData.session = session;
      this.rescheduleData.newDate = session.date;
      this.rescheduleData.newStartTime = session.startTime;
      this.rescheduleData.newEndTime = session.endTime;
      this.showRescheduleModal = true;
    },
    confirmReschedule() {
  const { session, newDate, newStartTime, newEndTime } = this.rescheduleData;
  const activityId = this.$route.params.activityId;

  const payload = {
    activityId: activityId,
    currentDate: session.date,
    startTime: session.startTime,
    endTime: session.endTime,
    newDate,
    newStartTime,
    newEndTime
  };

  API.post(`http://localhost:5005/api/activity-sessions/${activityId}/reschedule`, payload)
    .then(() => {
      alert('Session rescheduled successfully.');
      this.showRescheduleModal = false;
      this.fetchSessionInfo(); // Refresh the session data
    })
    .catch(error => {
      console.error('Error rescheduling session:', error);
      alert('Failed to reschedule session.');
    });
}

  }
};
</script>

<style scoped>
.activity-detail-tabs button.active-tab {
  background-color: #007BFF;
  color: white;
}

.session-list {
  list-style: none;
  padding: 0;
}

.session-header {
  background-color: #f7f7f7;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  border: 1px solid #ccc;
}

.participant-list {
  list-style: none;
  padding: 0;
  margin-block-start: 5px;
}

.participant-item {
  background-color: #fff;
  padding: 5px;
  border-block-end: 1px solid #eee;
}

.checkmark {
  color: green;
  font-size: 20px;
  margin-inline-start: 10px;
}

.mark-attendance-btn, .reschedule-btn {
  background-color: #4CAF50; /* Green */
  border: none;
  color: white;
  padding: 5px 10px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
  margin: 4px 2px;
  cursor: pointer;
}

.modal {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  width: 90%;
  max-width: 500px;
}

.close {
  float: right;
  cursor: pointer;
}

.loading {
  text-align: center;
}
</style>
