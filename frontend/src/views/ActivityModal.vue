<template>
  <div class="modal-overlay" v-if="isVisible">
    <div class="modal-content">
      <span class="close" @click="closeModal">&times;</span>
      <h2>{{ editingActivity ? 'Edit Activity' : 'Add New Activity' }}</h2>
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
          <ckeditor :editor="editor" v-model="activity.description" :config="editorConfig"></ckeditor>
        </div>


        <!-- Max Participants field -->
        <div class="form-group">
          <label for="activity-max-participants">Max Participants:</label>
          <input type="number" id="activity-max-participants" v-model="activity.maxParticipants" required min="1">
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

        <!-- Signup Start Date field -->
        <div class="form-group">
          <label for="activity-signup-start-date">Signup Start Date:</label>
          <input type="date" id="activity-signup-start-date" v-model="activity.signupStartDate" required>
        </div>

        <!-- Signup End Date field -->
        <div class="form-group">
          <label for="activity-signup-end-date">Signup End Date:</label>
          <input type="date" id="activity-signup-end-date" v-model="activity.signupEndDate" required>
        </div>

        <!-- Time Slot Section -->
        <div class="time-slot-section">
          <div class="time-slot" v-for="(slot, index) in activity.timeSlots" :key="index">
            <h3>Time Slot {{ index + 1 }}</h3>
            <div class="form-group">
              <label>Location:</label>
              <select v-model="slot.location" required>
                <option disabled value="">Select Location</option>
                <option v-for="location in locations" :value="location._id" :key="location._id">
                  {{ location.name }} - {{ location.address }}
                </option>
              </select>
            </div>
            <div class="form-group">
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
            </div>
            <div class="form-group">
              <label>Start Time:</label>
              <input type="time" v-model="slot.startTime" required>
            </div>
            <div class="form-group">
              <label>End Time:</label>
              <input type="time" v-model="slot.endTime" required>
            </div>
            <button type="button" @click.prevent="removeTimeSlot(index)">Remove Time Slot</button>
          </div>
          <div class="add-slot-button-container">
            <button type="button" @click="addTimeSlot" class="add-time-slot-button">Add Time Slot</button>
          </div>
        </div>

        <button type="submit" class="submit-button">{{ editingActivity ? 'Update Activity' : 'Add Activity' }}</button>
      </form>
    </div>
  </div>
</template>

<script>
import API from '@/services/api';
import CKEditor from '@ckeditor/ckeditor5-vue';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default {
  name: "ActivityModal",
  components: {
    ckeditor: CKEditor.component
  },
  props: {
    isVisible: {
      type: Boolean,
      required: true
    },
    editingActivity: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      activity: {
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        signupStartDate: '',
        signupEndDate: '',
        timeSlots: [{ dayOfWeek: '', startTime: '', endTime: '', location: '' }],
        teachers: [],
        maxParticipants: 10
      },
      teachers: [],
      locations: [],
      editor: ClassicEditor,
      editorConfig: {
        toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote'],
        placeholder: 'Enter the activity details...'
      }
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
            signupStartDate: newVal.signupStartDate ? newVal.signupStartDate.split('T')[0] : '',
            signupEndDate: newVal.signupEndDate ? newVal.signupEndDate.split('T')[0] : '',
            timeSlots: newVal.timeSlots.length > 0 ? newVal.timeSlots : [{ dayOfWeek: '', startTime: '', endTime: '', location: '' }],
            maxParticipants: newVal.maxParticipants || 10
          };
        } else {
          this.resetActivity();
        }
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    console.log('ClassicEditor:', ClassicEditor);
  },
  methods: {
    addTimeSlot() {
      this.activity.timeSlots.push({ dayOfWeek: '', startTime: '', endTime: '', location: '' });
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
        signupStartDate: '',  
        signupEndDate: '', 
        timeSlots: [{ dayOfWeek: '', startTime: '', endTime: '', location: '' }],
        teachers: [],
        maxParticipants: 10 
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
    fetchLocations() {
      API.get('/locations')
        .then(response => {
          this.locations = response.data;
        })
        .catch(error => {
          console.error('Error fetching locations:', error);
        });
    },
  },
  created() {
    this.fetchTeachers();
    this.fetchLocations();
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
