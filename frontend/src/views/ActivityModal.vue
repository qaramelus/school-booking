<template>
  <div class="modal-overlay" v-if="isVisible">
    <div class="modal-content">
      <span class="close" @click="closeModal">&times;</span>
      <h2>Add New Activity</h2>
      <form @submit.prevent="submitActivity">
        <div class="form-group">
          <label for="name">Activity Name:</label>
          <input type="text" id="name" v-model="activity.name" required>
        </div>
        <div class="form-group">
          <label for="description">Description:</label>
          <textarea id="description" v-model="activity.description"></textarea>
        </div>
        <div class="form-group">
          <label for="date">Date:</label>
          <input type="date" id="date" v-model="activity.date" required>
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
        date: ''
      }
    };
  },
  watch: {
    editingActivity: {
      immediate: true,
      handler(activity) {
        if (activity) {
          // If editing an activity, fill the form with its data
          this.activity = { ...activity };
        } else {
          // Reset the form if not editing (i.e., adding a new activity)
          this.activity = {
            name: '',
            description: '',
            date: ''
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
      if (this.editingActivity) {
        API.put(`/activities/${this.editingActivity._id}`, this.activity)
          .then(() => { 
            this.$emit('activityUpdated');
            this.closeModal();
          })
          .catch(error => {
            console.error('Error updating activity:', error);
          });
      } else {
        API.post('/activities', this.activity)
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
  inset-block-start: 0;
  inset-inline-start: 0;
  inset-inline-end: 0;
  inset-block-end: 0;
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
  inline-size: 80%;
  max-inline-size: 500px;
  z-index: 2; 
}

.close {
  float: inline-end;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.form-group {
  margin-block-end: 10px;
}

.form-group label {
  display: block;
}

.form-group input[type="text"],
.form-group input[type="date"],
.form-group textarea {
  inline-size: 100%;
  padding: 8px;
  margin-block-start: 5px;
  box-sizing: border-box;
}

.submit-button {
  background-color: #4CAF50; /* Green */
  color: white;
  padding: 14px 20px;
  margin: 8px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-button:hover {
  background-color: #45a049;
}
</style>
