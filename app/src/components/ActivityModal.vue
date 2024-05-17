<template>
  <div class="modal-overlay" v-if="isVisible">
    <div class="modal-content">
      <span class="close" @click="closeModal">&times;</span>
      <h2>{{ editingActivity ? 'Edit Activity' : 'Add New Activity' }}</h2>
      <div class="tabs">
        <button :class="{ active: activeTab === 'general' }" @click="activeTab = 'general'">General Info</button>
        <button :class="{ active: activeTab === 'details' }" @click="activeTab = 'details'">Details</button>
        <button :class="{ active: activeTab === 'timeSlots' }" @click="activeTab = 'timeSlots'">Time Slots</button>
      </div>
      <form @submit.prevent="submitActivity" class="activity-form">
        <div v-show="activeTab === 'general'">
          <!-- General Info -->
          <div class="form-group">
            <label for="activity-name">Title:</label>
            <input type="text" id="activity-name" v-model="activity.name" required>
          </div>
          <div class="form-group">
            <label for="activity-teachers">Teachers:</label>
            <select id="activity-teachers" v-model="activity.teachers" multiple required>
              <option disabled value="">Select Teachers</option>
              <option v-for="teacher in teachers" :value="teacher._id" :key="teacher._id">
                {{ teacher.username }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="activity-max-participants">Max Participants:</label>
            <input type="number" id="activity-max-participants" v-model="activity.maxParticipants" required min="1">
          </div>
        </div>
        
        <div v-show="activeTab === 'details'">
          <!-- Details -->
          <div class="form-group">
            <label for="activity-description">Detail:</label>
            <ckeditor :editor="editor" v-model="activity.description" :config="editorConfig"></ckeditor>
          </div>
          <div class="form-group">
            <label for="activity-start-date">Start Date:</label>
            <input type="date" id="activity-start-date" v-model="activity.startDate" required>
          </div>
          <div class="form-group">
            <label for="activity-end-date">End Date:</label>
            <input type="date" id="activity-end-date" v-model="activity.endDate" required>
          </div>
          <div class="form-group">
            <label for="activity-signup-start-date">Signup Start Date:</label>
            <input type="date" id="activity-signup-start-date" v-model="activity.signupStartDate" required>
          </div>
          <div class="form-group">
            <label for="activity-signup-end-date">Signup End Date:</label>
            <input type="date" id="activity-signup-end-date" v-model="activity.signupEndDate" required>
          </div>
        </div>

        <div v-show="activeTab === 'timeSlots'" class="time-slot-section">
          <!-- Time Slots -->
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
            <button type="button" @click.prevent="removeTimeSlot(index)" class="remove-time-slot-button">Remove Time Slot</button>
          </div>
          <div class="add-slot-button-container">
            <button type="button" @click="addTimeSlot" class="add-time-slot-button">Add Time Slot</button>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-button">{{ editingActivity ? 'Update Activity' : 'Add Activity' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import API from '@/services/api';
import CKEditor from '@ckeditor/ckeditor5-vue';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import '@/styles/MainColorSchema.css'

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
      },
      activeTab: 'general'
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
    this.fetchTeachers();
    this.fetchLocations();
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
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: var(--modal-background);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow-y: auto;
}

.modal-content {
  background-color: var(--background-light);
  padding: 40px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  inline-size: 90%;
  max-inline-size: 800px; 
  max-block-size: 80vh; 
  overflow-y: auto; 
  z-index: 2;
}

.tabs {
  display: flex;
  justify-content: space-around;
  margin-block-end: 20px;
}

.tabs button {
  background: var(--primary-color);
  color: var(--button-text-color);
  padding: 10px 20px;
  border: none;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
}

.tabs button.active {
  background: var(--success-color);
}

.activity-form {
  display: flex;
  flex-direction: column;
}

.form-group-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px; 
}

.form-group {
  flex: 1; 
  min-inline-size: 250px; 
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
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.time-slot-section {
  max-block-size: 300px; 
  overflow-y: auto; 
  margin-block-end: 20px;
  border: 1px solid var(--border-color); 
  padding: 10px; 
}

.add-slot-button-container {
  display: flex;
  justify-content: flex-start;
  margin-block-start: 15px;
}

.add-time-slot-button,
.submit-button,
.remove-time-slot-button {
  background-color: var(--primary-color);
  color: var(--button-text-color);
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-block-start: 10px;
}

.add-time-slot-button:hover,
.submit-button:hover,
.remove-time-slot-button:hover {
  background-color: var(--hover-color);
}

.submit-button {
  background-color: var(--success-color);
  padding: 16px 24px;
  align-self: flex-start;
  position: sticky;
  inset-block-end: 10px;
}

.close {
  align-self: flex-end;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}
</style>
