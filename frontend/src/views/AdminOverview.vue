<template>
    <div class="admin-overview">
      <h1>Admin Dashboard</h1>
      <button class="plus-button" @click="addActivity">+</button>
      <button @click="performLogout">Logout</button>
    </div>
</template>

<script>
import { logout } from '@/services/logout'; 

export default {
  name: "AdminOverview",
  methods: {
    addActivity() {
      // Placeholder for adding activity logic
      alert("Add new activity here.");
      // Here, you could open a modal, redirect to a form page, etc.
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

/* Add more styles as needed */
</style>
