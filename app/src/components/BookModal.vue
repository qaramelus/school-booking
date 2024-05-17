<template>
    <div v-if="showBookingModal" class="modal">
      <div class="modal-content">
        <span @click="closeModal" class="close">&times;</span>
        <h3>Book an Activity</h3>
        <select v-model="selectedActivity" class="select-style">
          <option disabled value="">Select Activity</option>
          <option v-for="activity in activities" :value="activity._id" :key="activity._id">
            {{ activity.name }}
          </option>
        </select>
        <select v-model="selectedChild" class="select-style">
          <option disabled value="">Select Child</option>
          <option v-for="child in children" :value="child.id" :key="child.id">
            {{ child.name }}
          </option>
        </select>
        <button @click="bookActivity" class="book-modal-button">Book Activity</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'BookModal',
    props: {
      showBookingModal: {
        type: Boolean,
        required: true
      },
      activities: {
        type: Array,
        required: true
      },
      children: {
        type: Array,
        required: true
      }
    },
    data() {
      return {
        selectedActivity: '',
        selectedChild: ''
      };
    },
    methods: {
      closeModal() {
        this.$emit('close');
      },
      bookActivity() {
        if (!this.selectedChild || !this.selectedActivity) {
          alert('Please select both a child and an activity');
          return;
        }
  
        const bookingInfo = {
          childId: this.selectedChild,
          activityId: this.selectedActivity,
        };
  
        this.$emit('book-activity', bookingInfo);
      }
    }
  };
  </script>
  
  <style scoped>
  .modal {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: var(--modal-background);
  }
  
  .modal-content {
    background-color: var(--modal-content-bg);
    padding: 20px;
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
  }
  
  .close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
  }
  
  .close:hover,
  .close:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
  }
  
  .select-style {
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .book-modal-button {
    background-color: var(--primary-color);
    color: var(--button-text-color);
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    border-radius: 8px;
    transition: background-color 0.3s ease;
  }
  
  .book-modal-button:hover {
    background-color: var(--primary-color-dark);
  }
  </style>
  