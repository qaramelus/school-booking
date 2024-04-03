<template>
  <div class="modal-overlay" v-if="isVisible">
    <div class="modal-content">
      <span class="close" @click="closeModal">&times;</span>
      <h2>Add New Activity</h2>
      <form @submit.prevent="submitActivity" class="activity-form">
        <div class="form-column">
          <div class="form-group">
            <label for="name">Activity Name:</label>
            <input type="text" id="name" v-model="activity.name" required>
          </div>
          <div class="form-group">
            <label for="description">Description:</label>
            <textarea id="description" v-model="activity.description"></textarea>
          </div>
          <div class="form-group">
            <label for="startDate">Start Date:</label>
            <input type="date" id="startDate" v-model="activity.startDate" required>
          </div>
          <div class="form-group">
            <label for="endDate">End Date:</label>
            <input type="date" id="endDate" v-model="activity.endDate" required>
          </div>
        </div>
        <div class="form-column">
          <div class="form-group">
            <label for="dayOfWeek">Day of the Week:</label>
            <select id="dayOfWeek" v-model="activity.dayOfWeek" required>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>
          <div class="form-group">
            <label for="startTime">Start Time:</label>
            <input type="time" id="startTime" v-model="activity.startTime" required>
          </div>
          <div class="form-group">
            <label for="endTime">End Time:</label>
            <input type="time" id="endTime" v-model="activity.endTime" required>
          </div>
        </div>
        <button type="submit" class="submit-button">Add Activity</button>
      </form>
    </div>
  </div>
</template>


<script>
import API from '@/services/api'; // Ensure this path correctly points to your API service

export default {
  name: "ActivityModal",
  props: ['isVisible', 'editingActivity'],
  data() {
    return {
      activity: {
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        dayOfWeek: '',
        startTime: '',
        endTime: ''
      }
    };
  },
  watch: {
    editingActivity: {
      immediate: true,
      handler(activity) {
        if (activity) {
          // Adapt this based on how the activity's time slots are structured
          this.activity = { ...activity };
        } else {
          this.activity = {
            name: '',
            description: '',
            startDate: '',
            endDate: '',
            dayOfWeek: '',
            startTime: '',
            endTime: ''
          };
        }
      }
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    submitActivity() {
      // For a real application, convert the dayOfWeek, startTime, and endTime into a timeSlots array structure
      const submission = {
        ...this.activity,
        timeSlots: [{
          dayOfWeek: this.activity.dayOfWeek,
          startTime: this.activity.startTime,
          endTime: this.activity.endTime,
        }]
      };

      if (this.editingActivity) {
        API.put(`/activities/${this.editingActivity._id}`, submission)
          .then(() => { 
            this.$emit('activityUpdated');
            this.closeModal();
          })
          .catch(error => {
            console.error('Error updating activity:', error);
          });
      } else {
        API.post('/activities', submission)
          .then(() => { 
            this.$emit('activityAdded');
            this.closeModal();
          })
          .catch(error => {
            console.error('Error adding activity:', error);
          });
      }
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000; 
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  max-width: 800px; /* Adjust based on your preference */
  z-index: 2; 
}

.activity-form {
  display: flex;
  justify-content: space-between;
}

.form-column {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-right: 20px; /* Space between columns */
}

.form-column:last-child {
  margin-right: 0;
}

.form-group {
  margin-bottom: 10px;
}

.form-group label {
  display: block;
}

.form-group input[type="text"],
.form-group input[type="date"],
.form-group input[type="time"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  box-sizing: border-box;
}

.submit-button {
  background-color: #4CAF50; /* Green */
  color: white;
  padding: 14px 20px;
  margin-top: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  align-self: flex-start;
}

.submit-button:hover {
  background-color: #45a049;
}

.close {
  align-self: flex-end;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}
</style>
