<template>
    <div class="teacher-overview">
      <h1>Your Activities</h1>
      <div class="activities-list">
        <div v-for="activity in activities" :key="activity._id" class="activity">
          <h3>{{ activity.name }}</h3>
          <p>{{ activity.description }}</p>
          <p><strong>Start Date:</strong> {{ new Date(activity.startDate).toLocaleDateString() }}</p>
          <p><strong>End Date:</strong> {{ new Date(activity.endDate).toLocaleDateString() }}</p>
          <div v-for="(slot, index) in activity.timeSlots" :key="index">
            <p>{{ slot.dayOfWeek }}: {{ slot.startTime }} - {{ slot.endTime }}</p>
          </div>
          <p><strong>Co-Teachers:</strong> {{ activity.teachers.map(teacher => teacher.username).join(', ') }}</p>
        </div>
      </div>
      <button @click="performLogout">Logout</button>
    </div>
  </template>
    
    <script>
    import API from '@/services/api';
    
    export default {
      name: "TeacherOverview",
      data() {
        return {
          activities: []
        };
      },
      methods: {
        fetchActivitiesForTeacher() {
          const teacherId = localStorage.getItem('user-id'); // Assuming the teacher's ID is stored here upon login
          API.get(`/activities/forteacher/${teacherId}`)
            .then(response => {
              this.activities = response.data;
            })
            .catch(error => {
              console.error("There was an error fetching activities for the teacher:", error);
            });
        },
        performLogout() {
          // Clear user information from localStorage
          localStorage.removeItem('user-token');
          localStorage.removeItem('user-role');
          localStorage.removeItem('user-id');
    
          // Redirect the user to the login page
          this.$router.push('/login');
        }
      },
      created() {
        this.fetchActivitiesForTeacher();
      }
    };
    </script>
    
  
<style scoped>
  .teacher-overview {
    max-inline-size: 600px;
    margin: 0 auto;
    text-align: center;
  }
  
  .activities-list {
    margin-block-start: 20px;
  }
  
  .activity {
    border: 1px solid #ccc;
    padding: 10px;
    margin-block-end: 10px;
  }
</style>
  