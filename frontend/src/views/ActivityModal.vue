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
import API from '@/services/api'; 

export default {
  name: "ActivityModal",
  props: ['isVisible'],
  data() {
    return {
      activity: {
        name: '',
        description: '',
        date: ''
      }
    };
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    submitActivity() {
      API.post('/activities', this.activity)
        .then(response => {
          console.log('Activity added:', response.data);
          this.$emit('activityAdded', response.data);
          this.closeModal();
        })
        .catch(error => {
          console.error('Error adding activity:', error);
          // Handle the error (e.g., show an error message)
        });
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  width: 80%;
  max-width: 500px;
}

.close {
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.form-group {
  margin-bottom: 10px;
}

.form-group label {
  display: block;
}

.form-group input[type="text"],
.form-group input[type="date"],
.form-group textarea {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
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
