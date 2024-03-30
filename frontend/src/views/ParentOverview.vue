<template>
    <div class="parent-overview">
      <h1>You logged on successfully</h1>
      <button @click="performLogout">Logout</button>
    </div>
</template>
  
  <script>
  import { logout } from '@/services/logout'; 
  
  export default {
    name: "ParentOverview",
    methods: {
      performLogout() {
        logout(this.$router);
      }
    }
  };
  </script>
  
  <style scoped>
  /* Add styles for your overview page here */
  .parent-overview {
    max-inline-size: 600px;
    margin: 0 auto;
    text-align: center;
  }
  </style>
  