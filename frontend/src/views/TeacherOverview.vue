<template>
    <div class="teacher-overview">
      <teacher-navbar></teacher-navbar>
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
    </div>
</template>
  
<script>
import API from '@/services/api';
import TeacherNavbar from '@/components/TeacherNavbar'; // Import the TeacherNavbar component
  
export default {
    name: "TeacherOverview",
    components: {
      TeacherNavbar // Register the TeacherNavbar component
    },
    data() {
      return {
        activities: []
      };
    },
    methods: {
      fetchActivitiesForTeacher() {
        const teacherId = localStorage.getItem('user-id');
        API.get(`/activities/forteacher/${teacherId}`)
          .then(response => {
            this.activities = response.data;
          })
          .catch(error => {
            console.error("There was an error fetching activities for the teacher:", error);
          });
      },
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
  