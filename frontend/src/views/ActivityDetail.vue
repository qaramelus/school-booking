<template>
    <div class="activity-detail" v-if="activity">
      <h1>{{ activity.name }}</h1>
      <p>{{ activity.description }}</p>
      <p>Date: {{ new Date(activity.date).toLocaleDateString() }}</p>
    </div>
    <div v-else>
      Loading activity details...
    </div>
  </template>  
  
  <script>
  import API from '@/services/api';
  
  export default {
    name: 'ActivityDetail',
    data() {
      return {
        activity: null
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
      }
    }
  };
  </script>
  