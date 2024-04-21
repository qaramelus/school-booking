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
            <li v-for="(session, index) in sessionInfo" :key="index" @click="toggleParticipantList(index)">
              <div class="session-header">
                {{ session.date }}: {{ session.startTime }} - {{ session.endTime }} ({{ session.participants.length }} participants)
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
      sessionInfo: []
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
  margin-top: 5px;
}

.participant-item {
  background-color: #fff;
  padding: 5px;
  border-bottom: 1px solid #eee;
}

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

.loading {
  text-align: center;
}
</style>
