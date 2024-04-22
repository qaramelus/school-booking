<template>
  <div class="teacher-overview">
    <teacher-navbar></teacher-navbar>
    <h1>Your Activities</h1>
    <div class="activity-cards">
      <div v-for="activity in activities" :key="activity._id" class="activity-card" @click="goToActivityDetail(activity._id)">
        <div class="card-content">
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
  </div>
</template>

<script>
import API from '@/services/api';
import TeacherNavbar from '@/components/TeacherNavbar';

export default {
  name: "TeacherOverview",
  components: {
    TeacherNavbar
  },
  data() {
    return {
      activities: []
    };
  },
  methods: {
    fetchActivitiesForTeacher() {
      const teacherId = localStorage.getItem('user-id');
      API.get(`/activity-participants/forteacher/${teacherId}`)
        .then(response => {
          this.activities = response.data;
        })
        .catch(error => {
          console.error("There was an error fetching activities for the teacher:", error);
        });
    },
    goToActivityDetail(activityId) {
      this.$router.push({ name: 'ActivityDetailTeacher', params: { activityId } });
    }
  },
  created() {
    this.fetchActivitiesForTeacher();
  }
};
</script>

<style scoped>
.teacher-overview {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-inline-size: 100%;
  margin: 0 auto;
  text-align: center;
}

.activity-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-block-start: 20px;
}

.activity-card {
  flex-basis: calc(50% - 20px); /* Adjust basis for responsive design */
  margin: 10px;
  padding: 20px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: box-shadow 0.3s;
}

.activity-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* Add hover effect for visual feedback */
}

.card-content {
  padding: 16px;
}
</style>
