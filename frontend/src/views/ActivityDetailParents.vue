<template>
  <div>
    <ParentNavbar />
    <div v-if="activity" class="activity-detail-container">
      <div class="activity-detail-tabs">
        <!-- Tab Headers -->
        <button @click="currentTab = 'about'" :class="{'active-tab': currentTab === 'about'}">About</button>
        <button @click="currentTab = 'schedule'" :class="{'active-tab': currentTab === 'schedule'}">Schedule</button>
      </div>
      <!-- Tab Content -->
      <div class="tab-content">
        <div v-if="currentTab === 'about'" class="activity-detail">
          <h1>{{ activity.name }}</h1>
          <p>{{ activity.description }}</p>
          <p>Date: {{ new Date(activity.startDate).toLocaleDateString() }} to {{ new Date(activity.endDate).toLocaleDateString() }}</p>
          <!-- Teachers Information -->
          <div v-if="activity.teachers && activity.teachers.length">
            <h3>Teachers</h3>
            <ul>
              <li v-for="teacher in activity.teachers" :key="teacher._id">
                {{ teacher.username }}
              </li>
            </ul>
          </div>
        </div>
        <div v-if="currentTab === 'schedule'" class="activity-schedule">
          <h2>Schedule:</h2>
          <ul>
            <li v-for="(slot, index) in scheduledTimeSlots" :key="index">
              {{ slot.dayOfWeek }} {{ slot.date }}: {{ slot.startTime }} - {{ slot.endTime }}
              <button v-if="!slot.cancelled" class="cancel-button" @click="cancelClass(slot)">Cancel</button>
              <button v-else class="revert-button" @click="revertCancellation(slot)">Revert Cancellation</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div v-else class="loading">
      Loading activity details...
    </div>
  </div>
</template>

<script>
import API from '@/services/api';
import ParentNavbar from '@/components/ParentNavbar.vue';

export default {
  name: 'ActivityDetailParents',
  components: { ParentNavbar },
  data() {
    return {
      activity: null,
      currentTab: 'about',
      childId: null,
    };
  },
  computed: {
    scheduledTimeSlots() {
        let occurrences = [];
        if (this.activity && this.activity.startDate && this.activity.endDate && this.activity.timeSlots) {
        const startDate = new Date(this.activity.startDate);
        const endDate = new Date(this.activity.endDate);

        this.activity.timeSlots.forEach(slot => {
            let currentDate = new Date(startDate.getTime());
            while (currentDate.getDay() !== this.dayOfWeekToNumber(slot.dayOfWeek)) {
            currentDate.setDate(currentDate.getDate() + 1);
            }
            while (currentDate <= endDate) {
            const cancellations = this.activity.cancellations || [];
            const cancelled = cancellations.some(cancellation =>
                new Date(cancellation.date).toISOString().slice(0, 10) === currentDate.toISOString().slice(0, 10)
            );
            occurrences.push({
                dayOfWeek: slot.dayOfWeek,
                date: currentDate.toISOString().slice(0, 10),
                startTime: slot.startTime,
                endTime: slot.endTime,
                cancelled: cancelled
            });
            currentDate.setDate(currentDate.getDate() + 7);
            }
        });
        occurrences.sort((a, b) => new Date(a.date) - new Date(b.date) || a.startTime.localeCompare(b.startTime));
        }
        console.log("Scheduled Time Slots Computed:", occurrences);
        return occurrences;
    }
    },
  methods: {
    fetchActivity() {
      const activityId = this.$route.params.activityId;
      const childId = this.$route.query.childId;
      if (!childId) {
        alert('Error: No child ID specified. Please ensure the URL is correct.');
        return;
      }
      this.childId = childId;
      API.get(`/activities/${activityId}`, { params: { childId } })
        .then(response => {
          this.activity = response.data;
          console.log("Activity data fetched:", this.activity);
          this.fetchCancellations(); 
        })
        .catch(error => {
          console.error("Error fetching the activity details:", error);
        });
    },
    fetchCancellations() {
      const url = `/cancellations/${this.childId}/${this.activity._id}`;
      API.get(url)
        .then(response => {
        this.activity = { ...this.activity, cancellations: response.data.map(booking => booking.cancellations).flat() };
        console.log("Cancellations fetched and applied:", this.activity.cancellations);
        this.$forceUpdate(); 
        })
        .catch(error => {
          console.error('Error fetching updated cancellations:', error);
        });
    },
    updateSlotStatus(slot, cancelled) {
      const index = this.scheduledTimeSlots.findIndex(s => 
        s.date === slot.date && s.startTime === slot.startTime);

      if (index !== -1) {
        this.scheduledTimeSlots[index].cancelled = cancelled;
        console.log(`Slot status updated: ${slot.date} at ${slot.startTime} now cancelled: ${cancelled}`);
        this.fetchCancellations(); // Re-fetch cancellations to sync with backend
      }
    },
    cancelClass(slot) {
      if (!this.childId) {
        alert('Error: No child ID specified.');
        return;
      }
      if (confirm(`Are you sure you want to cancel ${slot.dayOfWeek}'s class on ${slot.date}?`)) {
        API.post(`/cancelClass`, {
          childId: this.childId,
          activityId: this.activity._id,
          slotDate: slot.date,
          startTime: slot.startTime
        })
        .then(() => {
          alert('Class cancelled successfully.');
          this.updateSlotStatus(slot, true);
        })
        .catch(error => {
          console.error('Error cancelling class:', error);
        });
      }
    },
    revertCancellation(slot) {
        if (!this.childId) {
            alert('Error: No child ID specified.');
            return;
        }
        API.post(`/revertCancellation`, {
            childId: this.childId,
            activityId: this.activity._id,
            slotDate: slot.date,
            startTime: slot.startTime
        })
        .then(() => {
            alert('Cancellation reverted successfully.');
            this.updateSlotStatus(slot, false);
            this.fetchCancellations(); // Refetch cancellations to update all data
        })
        .catch(error => {
            console.error('Error reverting cancellation:', error);
        });
        },
    dayOfWeekToNumber(day) {
        return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day);
    }
  },
  created() {
    this.fetchActivity();
  }
};
</script>



<style scoped>
.activity-detail-container {
  display: flex;
  flex-direction: column;
}

.activity-detail-tabs {
  display: flex;
  justify-content: space-around;
  background-color: #f5f5f5;
  padding: 10px 0;
  position: sticky;
  inset-block-start: 0;
  z-index: 1000;
}

.activity-detail h1, .activity-detail h2, .activity-detail h3, .loading {
  color: #333;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  background: #e9ecef;
  margin: 5px 0;
  padding: 10px;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cancel-button {
  background-color: #ff4d4d;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-button:hover {
  background-color: #ff3333;
}

.active-tab {
  background-color: #007bff;
  color: white;
}
.tab-content {
  margin-block-start: 20px;
}
</style>
