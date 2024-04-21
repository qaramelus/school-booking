<template>
    <div class="session-card" @click="toggle">
      <div class="session-summary">
        {{ session.date }}: {{ session.startTime }} - {{ session.endTime }} ({{ session.participants.length }} participants)
      </div>
      <div v-if="expanded" class="participant-details">
        <ul>
          <li v-for="participant in session.participants" :key="participant.childId">
            {{ participant.childName }} ({{ participant.email }})
            <span v-if="participant.attended === 'attended'" class="checkmark">✔️</span>
            <button v-else @click.stop="markAttendance(participant.childId)" class="mark-attendance-btn">Mark Attended</button>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      session: Object
    },
    data() {
      return {
        expanded: false
      };
    },
    methods: {
      toggle() {
        this.expanded = !this.expanded;
      },
      markAttendance(childId) {
        this.$emit('mark-attendance', childId, this.session);
      }
    }
  };
  </script>
  
  <style scoped>
  .session-card {
    background-color: #f7f7f7;
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
    border: 1px solid #ccc;
  }
  .participant-details {
    margin-block-start: 5px;
  }
  .checkmark {
    color: green;
    font-size: 20px;
    margin-inline-start: 10px;
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
  