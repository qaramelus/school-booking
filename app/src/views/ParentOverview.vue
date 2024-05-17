<template>
  <div>
    <parent-navbar :userId="currentUserId"></parent-navbar>
    <div class="overview-section">
      <div class="header">
        <h2 class="title">Activities</h2>
        <FilterButtons :filter="selectedFilter" @update:filter="selectedFilter = $event" />
      </div>
      <div class="activities">
        <div v-if="bookableActivities.length === 0" class="no-activities">
          <p>No activities available for booking at this time.</p>
        </div>
        <div class="activity-cards">
          <router-link
            v-for="activity in bookableActivities"
            :key="activity._id"
            :to="`/activities/${activity._id}`"
            custom
          >
            <template v-slot:default="{ navigate }">
              <CardComponent @click="navigate">
                <template v-slot>
                  <ActivityCard :activity="activity" @book-click="handleBookClick" />
                </template>
              </CardComponent>
            </template>
          </router-link>
        </div>
      </div>
      <!-- Booking Modal -->
      <BookModal
        :showBookingModal="showBookingModal"
        :activities="bookableActivities"
        :children="children"
        @close="showBookingModal = false"
        @book-activity="bookActivity"
      />
    </div>
  </div>
</template>

<script>
import ParentNavbar from '@/components/ParentNavbar.vue';
import CardComponent from '@/components/CardComponent.vue';
import BookModal from '@/components/BookModal.vue';
import FilterButtons from '@/components/FilterButtons.vue';
import ActivityCard from '@/components/ActivityCard.vue';
import { fetchActivities, fetchChildren, bookActivity } from '@/services/apiService';
import '@/styles/overview-style.css';
import '@/styles/MainColorSchema.css';

export default {
  name: "ParentOverview",
  components: {
    ParentNavbar,
    CardComponent,
    BookModal,
    FilterButtons,
    ActivityCard
  },
  data() {
    return {
      currentUserId: '',
      activities: [],
      showBookingModal: false,
      children: [],
      selectedChild: '',
      selectedActivity: '',
      selectedFilter: 'open',
    };
  },
  computed: {
    bookableActivities() {
      const now = new Date();
      return this.activities.filter(activity => {
        const signupStart = new Date(activity.signupStartDate);
        const signupEnd = new Date(activity.signupEndDate);
        const isOpen = now >= signupStart && now <= signupEnd;
        const isCurrent = now >= new Date(activity.startDate) && now <= new Date(activity.endDate);

        switch (this.selectedFilter) {
          case 'open':
            return isOpen;
          case 'current':
            return isCurrent;
          case 'all':
            return true;
          default:
            return false;
        }
      });
    }
  },
  methods: {
    loadActivities() {
      fetchActivities()
        .then(response => {
          this.activities = response.data;
        })
        .catch(error => {
          console.error("There was an error fetching the activities:", error);
        });
    },
    loadChildren() {
      const parentId = localStorage.getItem('parent-id');
      if (!parentId) {
        console.error("Parent ID is undefined.");
        return;
      }
      fetchChildren(parentId)
        .then(response => {
          this.children = response.data.map(child => ({
            id: child._id,
            name: child.username 
          }));
        })
        .catch(error => {
          console.error("There was an error fetching the children:", error);
        });
    },
    handleBookClick(activity) {
      this.selectedActivity = activity._id;
      this.showBookingModal = true;
    },
    bookActivity(bookingInfo) {
      const token = localStorage.getItem('user-token');
      bookActivity(bookingInfo, token)
      .then(() => {
        alert('Activity booked successfully');
        this.showBookingModal = false;
        this.loadActivities(); // Optionally refresh the activities list
      })
      .catch(error => {
        console.error("There was an error booking the activity:", error);
      });
    },
  },
  created() {
    this.currentUserId = localStorage.getItem('user-id');
    this.loadActivities();
    this.loadChildren();
  }
};
</script>

<style scoped>
.overview-section {
  margin: 0 auto;
  max-width: 90%;
  padding: 20px;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
}

.title {
  font-size: 2rem; 
}

.activities {
  width: 100%;
}

.activity-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  justify-content: center;
  padding: 0 20px;
}

.no-activities {
  text-align: center;
  color: var(--text-primary);
}
</style>
