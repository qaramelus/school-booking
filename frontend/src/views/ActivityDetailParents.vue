<template>
  <div class="activity-detail-wrapper">
    <ParentNavbar />
    <div v-if="activity" class="activity-detail-container">
      <div class="activity-tabs">
        <button @click="currentTab = 'about'" :class="{ active: currentTab === 'about' }">About</button>
        <button @click="currentTab = 'schedule'" :class="{ active: currentTab === 'schedule' }">Schedule</button>
      </div>
      <div class="tab-content">
        <div v-if="currentTab === 'about'" class="about-section">
          <h1>{{ activity.name }}</h1>
          <p v-html="activity.description"></p> 
          <p>Date: {{ formatDate(activity.startDate) }} to {{ formatDate(activity.endDate) }}</p>
          <div v-if="activity.teachers && activity.teachers.length" class="teachers-section">
            <h3>Teachers</h3>
            <ul>
              <li v-for="teacher in activity.teachers" :key="teacher._id">
                {{ teacher.username }}
              </li>
            </ul>
          </div>
        </div>
        <div v-if="currentTab === 'schedule'" class="schedule-section">
          <h2>Schedule:</h2>
          <ul>
            <li v-for="session in activity.sessions" :key="session._id" class="session-item">
              {{ formatDate(session.date) }}: {{ session.startTime }} - {{ session.endTime }}
              <button :class="{'absent-button': !session.absentees.includes(childId), 'present-button': session.absentees.includes(childId)}"
                      @click="toggleAbsence(session)">
                {{ session.absentees.includes(childId) ? 'Unmark As Absent' : 'Mark As Absent' }}
              </button>
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
import ParentNavbar from '@/components/ParentNavbar.vue';

export default {
  name: 'ActivityDetailParents',
  components: { ParentNavbar },
  data() {
    return {
      activity: null,
      currentTab: 'about',
      childId: null,
    };
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    fetchActivity() {
      const activityId = this.$route.params.activityId;
      const childId = this.$route.query.childId;
      if (!childId) {
        alert('Error: No child ID specified. Please ensure the URL is correct.');
        return;
      }
      this.childId = childId;
      API.get(`/activities/${activityId}`)
        .then(response => {
          this.activity = response.data;
          this.fetchSessions(activityId);
        })
        .catch(error => {
          console.error("Error fetching the activity details:", error);
        });
    },
    fetchSessions(activityId) {
      API.get(`/sessions/${activityId}`)
        .then(response => {
          this.activity.sessions = response.data;
          console.log("Session data fetched:", this.activity.sessions);
        })
        .catch(error => {
          console.error("Error fetching session details:", error);
        });
    },
    toggleAbsence(session) {
      if (session.absentees.includes(this.childId)) {
        this.unmarkAsAbsent(session._id);
      } else {
        this.markAsAbsent(session._id);
      }
    },
    markAsAbsent(sessionId) {
      API.post(`/sessions/mark-absent/${sessionId}/${this.childId}`)
        .then(() => {
          alert('Absence marked successfully.');
          this.fetchSessions(this.activity._id);
        })
        .catch(error => {
          console.error('Error marking absence:', error);
        });
    },
    unmarkAsAbsent(sessionId) {
      API.post(`/sessions/unmark-absent/${sessionId}/${this.childId}`)
        .then(() => {
          alert('Absence unmarked successfully.');
          this.fetchSessions(this.activity._id);
        })
        .catch(error => {
          console.error('Error unmarking absence:', error);
        });
    }
  },
  created() {
    this.fetchActivity();
  }
};
</script>



<style scoped>
.activity-detail-wrapper {
  display: flex;
  flex-direction: column;
}

.activity-tabs {
  display: flex;
  justify-content: space-around;
  background-color: #f5f5f5;
  padding: 10px 0;
}

.about-section, .schedule-section, .teachers-section, .loading {
  color: #333;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  margin: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

ul {
  list-style-type: none;
  padding: 0;
}

li.session-item {
  background: #e9ecef;
  margin: 5px 0;
  padding: 10px;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.absent-button, .present-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.absent-button:hover {
  background-color: #0056b3;
}

.present-button {
  background-color: #28a745;
}

.present-button:hover {
  background-color: #218838;
}

.active {
  background-color: #007bff;
  color: white;
}
</style>