<template>
  <div class="modal-overlay" v-if="isVisible">
    <div class="modal-content">
      <span class="close" @click="closeModal">&times;</span>
      <h2>Add New Activity</h2>
      <form @submit.prevent="submitActivity" class="activity-form">
        <!-- Title field -->
        <div class="form-group">
          <label for="activity-name">Title:</label>
          <input type="text" id="activity-name" v-model="activity.name" required>
        </div>
        
        <!-- Teacher field -->
        <div class="form-group">
          <label for="activity-teachers">Teachers:</label>
          <select id="activity-teachers" v-model="activity.teachers" multiple required>
          <option disabled value="">Select Teachers</option>
          <option v-for="teacher in teachers" :value="teacher._id" :key="teacher._id">
          {{ teacher.username }}
          </option>
          </select>
        </div>

        <!-- Detail field -->
        <div class="form-group">
          <label for="activity-description">Detail:</label>
          <textarea id="activity-description" v-model="activity.description" required></textarea>
        </div>

        <!-- Start Date field -->
        <div class="form-group">
          <label for="activity-start-date">Start Date:</label>
          <input type="date" id="activity-start-date" v-model="activity.startDate" required>
        </div>

        <!-- End Date field -->
        <div class="form-group">
          <label for="activity-end-date">End Date:</label>
          <input type="date" id="activity-end-date" v-model="activity.endDate" required>
        </div>

        <!-- Time Slot Section -->
        <div class="time-slot-section">
          <div class="form-group" v-for="(slot, index) in activity.timeSlots" :key="index">
            <label>Day of the Week:</label>
            <select v-model="slot.dayOfWeek" required>
              <option disabled value="">Select a Day</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
            <label>Start Time:</label>
            <input type="time" v-model="slot.startTime" required>
            <label>End Time:</label>
            <input type="time" v-model="slot.endTime" required>
            <button type="button" @click.prevent="removeTimeSlot(index)">Remove Time Slot</button>
          </div>
          <div class="add-slot-button-container">
            <button type="button" @click="addTimeSlot" class="add-time-slot-button">Add Time Slot</button>
          </div>
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
    props: ['isVisible', 'editingActivity'],
    data() {
      return {
        activity: {
          name: '',
          description: '',
          startDate: '',
          endDate: '',
          timeSlots: [{ dayOfWeek: '', startTime: '', endTime: '' }],
          teachers: []
        },
        teachers: [] // Initialize the teachers array to hold the fetched teacher data
      };
    },
    watch: {
      editingActivity: {
        handler(newVal) {
          if (newVal) {
            this.activity = {
              ...newVal,
              startDate: newVal.startDate.split('T')[0],
              endDate: newVal.endDate.split('T')[0],
              timeSlots: newVal.timeSlots.length > 0 ? newVal.timeSlots : [{ dayOfWeek: '', startTime: '', endTime: '' }]
            };
          } else {
            this.resetActivity();
          }
        },
        deep: true,
        immediate: true
      }
    },
    methods: {
      addTimeSlot() {
        this.activity.timeSlots.push({ dayOfWeek: '', startTime: '', endTime: '' });
      },
      removeTimeSlot(index) {
        this.activity.timeSlots.splice(index, 1);
      },
      closeModal() {
        this.resetActivity();
        this.$emit('close');
      },
      submitActivity() {
        const userId = localStorage.getItem('user-id');
        if (!userId) {
          console.error('User ID not found. Please log in.');
          return; 
        }
        
        const selectedTeacherIds = this.activity.teachers.filter(teacherId => teacherId !== null);

        const activityData = {
          ...this.activity,
          createdBy: userId,
          teachers: selectedTeacherIds,
        }

        const apiCall = this.editingActivity
          ? API.put(`/activities/${this.editingActivity._id}`, activityData)
          : API.post('/activities', activityData);

        apiCall.then(() => {
          this.$emit(this.editingActivity ? 'activityUpdated' : 'activityAdded');
          this.closeModal();
        }).catch(error => {
          console.error('Error updating or adding activity:', error);
        });
      },
      resetActivity() {
        this.activity = {
          name: '',
          description: '',
          startDate: '',
          endDate: '',
          timeSlots: [{ dayOfWeek: '', startTime: '', endTime: '' }],
          teachers: [],
        };
      },
      fetchTeachers() {
        API.get('/users/teachers')
          .then(response => {
            this.teachers = response.data.map(teacher => ({
              _id: teacher._id,
              username: teacher.username,
            }));
          })
          .catch(error => {
            console.error('Error fetching teachers:', error);
          });
      },
    },
    created() {
      this.fetchTeachers(); // Fetch teachers when the component is created
    },
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
  overflow-y: auto;
}

.modal-content {
  background-color: white;
  padding: 40px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  inline-size: 90%;
  max-inline-size: 600px; 
  max-block-size: 80vh; 
  overflow-y: auto; 
  z-index: 2;
}

.activity-form {
  display: flex;
  flex-direction: column;
}

.form-group-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px; /* Ensure there's space between columns */
}

.form-group {
  flex: 1; /* Allows form groups to expand and fill the row */
  min-inline-size: 250px; /* Minimum width before wrapping */
  margin-block-end: 20px;
}

.form-group label {
  display: block;
  margin-block-end: 5px;
}

.form-group input[type="text"],
.form-group input[type="date"],
.form-group input[type="time"],
.form-group textarea,
.form-group select {
  inline-size: 100%;
  padding: 10px;
  margin-block-start: 5px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.time-slot-section {
  max-block-size: 300px; 
  overflow-y: auto; 
  margin-block-end: 20px;
  border: 1px solid #ccc; 
  padding: 10px; 
}

.add-slot-button-container {
  display: flex;
  justify-content: flex-start;
  margin-block-start: 15px;
}

.add-time-slot-button,
.submit-button {
  background-color: #007bff;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.add-time-slot-button:hover,
.submit-button:hover {
  background-color: #0056b3;
}

.submit-button {
  background-color: #4CAF50;
  padding: 16px 24px;
  margin-block-start: 10px;
  align-self: flex-start;
}

.close {
  align-self: flex-end;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}
</style>
