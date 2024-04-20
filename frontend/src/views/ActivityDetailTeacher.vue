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
          <ul>
            <li v-for="(session, index) in sessionInfo" :key="index" @click="toggleParticipantList(index)">
              <div>
                {{ session.date }}: {{ session.startTime }} - {{ session.endTime }} ({{ session.count }} participants)
              </div>
              <ul v-if="expandedSlots.includes(index)">
                <li v-for="participant in session.participants" :key="participant.childId">
                  {{ participant.username }} ({{ participant.email }})
                  <!-- Conditionally render button or checkmark -->
                  <span v-if="isAttended(participant.childId, index)" class="checkmark">✔️</span>
                  <button v-else @click.stop="markAttendance(participant.childId, session, index)" class="mark-attendance-btn">Mark Attended</button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div v-else class="loading">
      Loading activity details...
    </div>
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
      attendedSessions: {}  // Changed to track session and participant
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
      API.get(`http://localhost:5005/api/activities/${activityId}/sessions-info`)
        .then(response => {
          this.sessionInfo = Object.values(response.data)[0];
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
                if (!this.attendedSessions[index]) {
                    this.attendedSessions[index] = [];
                }
                this.attendedSessions[index].push(childId);  // Track by session index and childId
                alert('Attendance marked successfully.');
            })
            .catch(error => {
                console.error('Error marking attendance:', error);
                alert('Failed to mark attendance.');
            });
    },
    isAttended(childId, sessionIndex) {
      return this.attendedSessions[sessionIndex] && this.attendedSessions[sessionIndex].includes(childId);
    }
  }
};
</script>

<style scoped>
.checkmark {
  color: green;
  font-size: 20px;
  margin-left: 10px;
}
.mark-attendance-btn {
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
</style>
