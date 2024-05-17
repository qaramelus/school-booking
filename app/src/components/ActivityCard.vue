<template>
    <div class="card-content">
      <h3 class="card-title">{{ activity.name }}</h3>
      <p v-html="activity.description"></p>
      <p><strong>Start Date:</strong> {{ new Date(activity.startDate).toLocaleDateString() }}</p>
      <p><strong>End Date:</strong> {{ new Date(activity.endDate).toLocaleDateString() }}</p>
      <div v-for="(slot, index) in activity.timeSlots" :key="index">
        <p>{{ slot.dayOfWeek }}: {{ slot.startTime }} - {{ slot.endTime }}</p>
      </div>
      <button
        v-if="isWithinSignupPeriod"
        class="book-activity-button"
        @click.stop="$emit('book-click', activity)"
      >
        Book Activity
      </button>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ActivityCard',
    props: {
      activity: {
        type: Object,
        required: true
      }
    },
    computed: {
      isWithinSignupPeriod() {
        const now = new Date();
        const signupStart = new Date(this.activity.signupStartDate);
        const signupEnd = new Date(this.activity.signupEndDate);
        return now >= signupStart && now <= signupEnd;
      }
    }
  };
  </script>
  
  <style scoped>
  .card-title {
    font-size: 1.5rem;
  }
  
  .book-activity-button {
    background-color: var(--primary-color);
    color: var(--button-text-color);
    border: none;
    padding: 10px 15px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.3s ease;
  }
  
  .book-activity-button:hover {
    background-color: var(--primary-color-dark);
  }
  </style>
  