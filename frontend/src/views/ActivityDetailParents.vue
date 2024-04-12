<template>
    <div>
      <ParentNavbar />
      <div v-if="activity" class="activity-detail-container">
        <div class="activity-detail-tabs">
          <!-- Tab Headers -->
          <button @click="currentTab = 'about'" :class="{'active-tab': currentTab === 'about'}">About</button>
          <button @click="currentTab = 'schedule'" :class="{'active-tab': currentTab === 'schedule'}">Schedule</button>
        </div>
        <!-- Tab Content -->
        <div class="tab-content">
          <div v-if="currentTab === 'about'" class="activity-detail">
            <h1>{{ activity.name }}</h1>
            <p>{{ activity.description }}</p>
            <p>Date: {{ new Date(activity.startDate).toLocaleDateString() }} to {{ new Date(activity.endDate).toLocaleDateString() }}</p>
            <!-- Teachers Information -->
            <div v-if="activity.teachers && activity.teachers.length">
              <h3>Teachers</h3>
              <ul>
                <li v-for="teacher in activity.teachers" :key="teacher._id">
                  {{ teacher.username }}
                </li>
              </ul>
            </div>
          </div>
          <div v-if="currentTab === 'schedule'" class="activity-schedule">
            <h2>Schedule:</h2>
            <ul>
              <li v-for="(slot, index) in activity.timeSlots" :key="index">
                {{ slot.dayOfWeek }}: {{ slot.startTime }} - {{ slot.endTime }}
                <button class="cancel-button" @click="cancelClass(slot._id)">Cancel</button>
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
  import ParentNavbar from '@/components/ParentNavbar.vue';
  
  export default {
    name: 'ActivityDetailParents',
    components: {
      ParentNavbar,
    },
    data() {
      return {
        activity: null,
        currentTab: 'about', // Default tab
      };
    },
    created() {
      this.fetchActivity();
    },
    methods: {
      fetchActivity() {
        const activityId = this.$route.params.activityId;
        API.get(`activities/${activityId}`)
          .then(response => {
            this.activity = response.data;
          })
          .catch(error => {
            console.error("There was an error fetching the activity details:", error);
          });
      },
      cancelClass(slotId) {
        if (confirm("Are you sure you want to cancel this class?")) {
          API.delete(`/cancelClass/${slotId}`)
            .then(() => {
              alert("Class cancelled successfully.");
              this.fetchActivity(); // Refresh the data
            })
            .catch(error => {
              console.error('Error cancelling the class:', error);
            });
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .activity-detail-container {
    display: flex;
    flex-direction: column;
  }
  
  .activity-detail-tabs {
    display: flex;
    justify-content: space-around;
    background-color: #f5f5f5;
    padding: 10px 0;
    position: sticky;
    top: 0;
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
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .cancel-button {
    background-color: #ff4d4d;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .cancel-button:hover {
    background-color: #ff3333;
  }
  
  .active-tab {
    background-color: #007bff;
    color: white;
  }
  
  .tab-content {
    margin-top: 20px;
  }
  </style>
  