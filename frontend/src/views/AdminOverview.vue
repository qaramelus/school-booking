<template>
  <div class="admin-overview">
    <h1>Admin Dashboard</h1>
    <button class="plus-button" @click="showModal = true">+</button>
    <button @click="performLogout">Logout</button>
    <ActivityModal :isVisible="showModal" @close="showModal = false" @activityAdded="handleActivityAdded" />
  </div>
</template>

<script>
import { logout } from '@/services/logout';
import ActivityModal from './ActivityModal.vue'; // Adjust the import path as necessary

export default {
  name: "AdminOverview",
  components: {
    ActivityModal
  },
  data() {
    return {
      showModal: false,
    };
  },
  methods: {
    handleActivityAdded(activity) {
      console.log('Activity added:', activity);
      // Implement the logic to add the new activity to the list or refresh the activities list
      this.showModal = false;
    },
    performLogout() {
      logout(this.$router);
    }
  }
};
</script>

<style scoped>
.admin-overview {
  max-inline-size: 600px;
  margin: 0 auto;
  text-align: center;
}

.plus-button {
  font-size: 24px;
  line-height: 50px;
  margin: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #000;
  cursor: pointer;
}

/* Add more styles as needed, including modal styling if not included in ActivityModal.vue */
</style>
