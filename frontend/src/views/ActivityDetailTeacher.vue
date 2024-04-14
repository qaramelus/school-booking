<template>
    <div class="activity-detail-container">
      <TeacherNavbar />
      <div v-if="activity" class="activity-detail-tabs">
        <!-- Tab Headers -->
        <button @click="currentTab = 'about'" :class="{'active-tab': currentTab === 'about'}">About</button>
        <button @click="currentTab = 'participants'" :class="{'active-tab': currentTab === 'participants'}">Participants</button>
        <!-- Tab Content -->
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
      currentTab: 'about', // Default tab
      expandedSlots: [], // Tracks which slots are expanded
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
      API.get(`http://localhost:5005/api/activities/${activityId}/sessions-info`)
        .then(response => {
          this.sessionInfo = Object.values(response.data)[0]; // Assuming the response data is the object shown above
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
    }
  }
};
</script>

<style scoped>
.activity-detail-container, .activity-detail-tabs, .tab-content {
  display: flex;
  flex-direction: column;
}
.activity-detail-tabs {
  justify-content: space-around;
  background-color: #f5f5f5;
  padding: 10px 0;
  position: sticky;
  inset-block-start: 0;
  z-index: 1000;
}
.activity-detail h1, .activity-detail h2, .activity-detail h3, .loading {
  color: #333;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  background: #e9ecef;
  margin: 5px 0;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
}
.active-tab {
  background-color: #007bff;
  color: white;
}
</style>
