<template>
  <div class="activity-detail-container">
    <TeacherNavbar />
    <div v-if="activity" class="activity-detail-header">
      <div class="activity-detail-tabs">
        <button @click="currentTab = 'about'" :class="{'active-tab': currentTab === 'about'}" class="tab-button">About</button>
        <button @click="currentTab = 'participants'" :class="{'active-tab': currentTab === 'participants'}" class="tab-button">Participants</button>
      </div>
      <div class="tab-content">
        <div v-if="currentTab === 'about'" class="activity-detail">
          <h1>{{ activity.name }}</h1>
          <p v-html="activity.description"></p> 
          <p>Date: {{ new Date(activity.startDate).toLocaleDateString() }} to {{ new Date(activity.endDate).toLocaleDateString() }}</p>
        </div>
        <div v-if="currentTab === 'participants'">
          <h2>Session Participation</h2>
          <ul class="session-list">
            <li v-for="(session, index) in sessionInfo" :key="index">
              <div class="session-header" @click="toggleParticipantList(index)">
                {{ formatDate(session.date) }}: {{ session.startTime }} - {{ session.endTime }} ({{ session.participants.length }} participants)
                <button @click.stop="startRescheduleSession(session)" class="reschedule-btn">Reschedule</button>
              </div>
              <ul v-if="expandedSlots.includes(index)" class="participant-list">
                <li v-for="participant in session.participants" :key="participant.participantId" class="participant-item">
                  {{ participant.name }}
                  <span v-if="participant.attended" class="checkmark">✔️</span>
                  <button v-if="!participant.attended" @click.stop="toggleAttendance(participant.participantId, session, index, true)" class="mark-attendance-btn">Mark Attended</button>
                  <button v-else @click.stop="toggleAttendance(participant.participantId, session, index, false)" class="mark-attendance-btn">Mark Unattended</button>
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
        <form @submit.prevent="confirmReschedule" class="reschedule-form">
          <div class="form-group">
            <label for="newDate">New Date:</label>
            <input type="date" v-model="rescheduleData.newDate" required>
          </div>
          <div class="form-group">
            <label for="newStartTime">New Start Time:</label>
            <input type="time" v-model="rescheduleData.newStartTime" required>
          </div>
          <div class="form-group">
            <label for="newEndTime">New End Time:</label>
            <input type="time" v-model="rescheduleData.newEndTime" required>
          </div>
          <button type="submit" class="submit-btn">Submit</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import API from '@/services/api';
import TeacherNavbar from '@/components/TeacherNavbar.vue';
import '@/styles/MainColorSchema.css'

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
    formatDate(dateString) {
      const date = new Date(dateString);
      return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
    },
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
      API.get(`/sessions/${activityId}/sessions-with-participants`)
        .then(response => {
          this.sessionInfo = response.data.map(session => ({
            ...session,
            participants: session.participants.map(participant => ({
              ...participant,
              attended: participant.attended // Directly using the fetched attended status
            }))
          }));
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
    toggleAttendance(childId, session, index, status) {
      const payload = {
        attended: status
      };
      const sessionId = session.sessionId;
      API.post(`/attendance/${sessionId}/${childId}`, payload)
        .then(() => {
          const participantIndex = this.sessionInfo[index].participants.findIndex(p => p.participantId === childId);
          if (participantIndex !== -1) {
            // Directly update the attended status in the participants array
            this.sessionInfo[index].participants[participantIndex].attended = status;
          }
          alert(`Attendance ${status ? 'marked' : 'unmarked'} successfully.`);
        })
        .catch(error => {
          console.error(`Error ${status ? 'marking' : 'unmarking'} attendance:`, error);
          alert(`Failed to ${status ? 'mark' : 'unmark'} attendance.`);
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

      API.patch(`/sessions/reschedule/${session.sessionId}`, payload)
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
.activity-detail-container {
  display: flex;
  flex-direction: column;
}

.activity-detail-header {
  display: flex;
  flex-direction: column; /* Align tabs at the top */
}

.activity-detail-tabs {
  display: flex;
  justify-content: center; /* Center tabs in the container */
  padding: 10px 0;
}

.activity-detail-tabs .tab-button {
  background-color: var(--hover-light);
  color: var(--text-primary);
  border: none;
  padding: 15px 30px; /* Increased size for easier interaction */
  margin: 0 10px;
  font-size: 18px; /* Larger font for better readability */
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.activity-detail-tabs .tab-button:hover {
  background-color: var(--hover-color); /* Subtle hover effect */
}

.activity-detail-tabs .tab-button.active-tab {
  background-color: var(--primary-color);
  color: var(--button-text-color);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* Added shadow for active state */
}

.tab-content {
  flex-grow: 1; /* Allow the content area to take up the rest of the space */
  padding: 20px;
  border-block-start: 1px solid var(--border-color);
}

.session-list, .participant-list {
  list-style: none;
  padding: 0;
}

.session-header, .participant-item {
  padding: 10px;
  background-color: var(--background-light);
  border: 1px solid var(--border-color);
  margin-block-end: 5px;
}

.checkmark {
  color: green;
  font-size: 20px;
  margin-inline-start: 10px;
}

.mark-attendance-btn, .reschedule-btn {
  background-color: var(--primary-color);
  color: var(--button-text-color);
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-inline-start: 5px;
}

.modal {
  position: fixed;
  inset-inline-start: 0;
  inset-block-start: 0;
  inline-size: 100%;
  block-size: 100%;
  background-color: var(--modal-background);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s;
}

.modal-content {
  background: var(--modal-content-bg);
  padding: 30px;
  border-radius: 8px;
  inline-size: 90%;
  max-inline-size: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s;
}

.close {
  float: inline-end;
  font-size: 1.5rem;
  cursor: pointer;
}

.form-group {
  margin-block-end: 20px;
}

label {
  display:block;
  margin-block-end: 5px;
  font-weight: 500;
}

input[type="date"],
input[type="time"] {
  inline-size: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.submit-btn {
  background-color: var(--primary-color);
  color: var(--button-text-color);
  padding: 10px 20px;
  border: none;
  inline-size: 100%;
  border-radius: 4px;
  cursor: pointer;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>

