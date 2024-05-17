<template>
  <admin-navbar :userId="currentUserId" />
  <div class="admin-overview">
    <div class="header">
      <h2>Activities</h2>
      <div class="button-container filter-dropdown">
        <q-select
          outlined
          dense
          :options="filterOptions"
          v-model="selectedFilter"
          @update:model-value="handleFilterChange"
          label="Filter Activities"
        />
      </div>
    </div>
    <ActivityModal
      :isVisible="showModal"
      :editingActivity="editingActivity"
      @close="handleModalClose"
      @activityAdded="handleActivityAdded"
      @activityUpdated="handleActivityUpdated"
    />
    <div class="activities">
      <div class="activity-cards">
        <CardComponent
          v-for="activity in activities"
          :key="activity._id"
          @click="goToActivityDetail(activity._id)"
        >
          <template v-slot>
            <div class="card-content">
              <h3>{{ activity.name }}</h3>
              <p v-html="activity.description"></p>
              <p><strong>Start Date:</strong> {{ new Date(activity.startDate).toLocaleDateString() }}</p>
              <p><strong>End Date:</strong> {{ new Date(activity.endDate).toLocaleDateString() }}</p>
              <div v-for="(slot, index) in activity.timeSlots" :key="index">
                <p><strong>{{ slot.dayOfWeek }}:</strong> {{ slot.startTime }} - {{ slot.endTime }}</p>
                <p><strong>Location:</strong> {{ getLocationName(slot.location) }}</p>
              </div>
            </div>
          </template>
          <template v-slot:icons>
            <q-icon name="delete" class="delete-icon" @click.stop="confirmDelete(activity._id)" />
            <q-icon name="edit" class="edit-icon" @click.stop="editActivity(activity)" />
          </template>
        </CardComponent>
      </div>
    </div>
    <q-btn
      label="Add Activity"
      color="primary"
      class="add-activity-button"
      @click="prepareNewActivity"
      icon="add"
      push
    />
  </div>
</template>

<script>
import { QIcon, QBtn, QSelect } from 'quasar';
import '@/styles/MainColorSchema.css';
import '@/styles/overview-style.css';
import API from '@/services/api';
import ActivityModal from '@/components/ActivityModal.vue';
import AdminNavbar from '@/components/AdminNavbar.vue';
import CardComponent from '@/components/CardComponent.vue';

export default {
  name: "AdminOverview",
  components: {
    AdminNavbar,
    ActivityModal,
    QIcon,
    QBtn,
    QSelect,
    CardComponent
  },
  data() {
    return {
      activities: [],
      showModal: false,
      editingActivity: null,
      locations: [],
      currentUserId: '',
      selectedFilter: 'all',
      filterOptions: [
        { label: 'All Activities', value: 'all' },
        { label: 'Current Activities', value: 'current' },
        { label: 'Upcoming Activities', value: 'future' }
      ]
    };
  },
  watch: {
    selectedFilter(newFilter) {
      this.fetchActivities(newFilter);
    }
  },
  methods: {
    async fetchActivities(type = 'all') {
      console.log("Fetching activities with filter:", type); // Debugging statement
      let endpoint = '/activities';
      if (type === 'current') {
        endpoint = '/activities/current';
      } else if (type === 'future') {
        endpoint = '/activities/future';
      }

      try {
        const response = await API.get(endpoint);
        this.activities = response.data.map(activity => ({
          ...activity,
          startDate: activity.startDate || new Date(),
          endDate: activity.endDate || new Date(),
          timeSlots: activity.timeSlots || []
        }));
      } catch (error) {
        console.error(`There was an error fetching the ${type} activities:`, error);
      }
    },
    handleFilterChange() {
      console.log("Filter changed to:", this.selectedFilter); // Debugging statement
      this.fetchActivities(this.selectedFilter);
    },
    handleActivityAdded() {
      this.fetchActivities(this.selectedFilter);
      this.showModal = false;
      this.editingActivity = null;
    },
    handleModalClose() {
      this.showModal = false;
      this.editingActivity = null;
    },
    confirmDelete(activityId) {
      if (window.confirm("Are you sure you want to delete this activity?")) {
        this.deleteActivity(activityId);
      }
    },
    async deleteActivity(activityId) {
      try {
        await API.delete(`/activities/${activityId}`);
        this.activities = this.activities.filter(activity => activity._id !== activityId);
        alert("Activity deleted successfully.");
      } catch (error) {
        console.error("There was an error deleting the activity:", error);
      }
    },
    editActivity(activity) {
      this.editingActivity = activity;
      this.showModal = true;
    },
    goToActivityDetail(activityId) {
      this.$router.push({ name: 'ActivityDetail', params: { activityId } });
    },
    prepareNewActivity() {
      this.editingActivity = null;
      this.showModal = true;
    },
    getLocationName(locationId) {
      const location = this.locations.find(loc => loc._id === locationId);
      return location ? location.name : 'Unknown'; // Return 'Unknown' if location not found
    },
    async fetchLocations() {
      try {
        const response = await API.get('/locations');
        this.locations = response.data;
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    },
    handleActivityUpdated() {
      this.fetchActivities(this.selectedFilter);
    }
  },
  async created() {
    this.currentUserId = localStorage.getItem('user-id');
    await this.fetchActivities(this.selectedFilter);
    await this.fetchLocations();
  }
};
</script>

<style scoped>
.admin-overview {
  margin: 0 auto;
  text-align: center;
  max-inline-size: 90%;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  inline-size: 100%;
  padding-block-end: 20px;
}

.button-container {
  text-align: end;
}

.activities {
  inline-size: 100%;
}

.activity-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  justify-content: center;
  padding: 0 20px;
}

@media (min-inline-size: 768px) {
  .activity-cards {
    grid-template-columns: repeat(2, 1fr); /* Two cards side by side */
  }
}

@media (min-inline-size: 1200px) {
  .activity-cards {
    grid-template-columns: repeat(3, 1fr); /* Three cards side by side */
  }
}

.add-activity-button {
  position: fixed;
  inset-block-end: 20px;
  inset-inline-end: 20px;
}
</style>
