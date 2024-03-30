<template>
    <div class="parent-overview">
      <h1>You logged on successfully</h1>
      <button @click="logout">Logout</button>
    </div>
  </template>
  
  <script>
  export default {
    name: "ParentOverview",
    methods: {
        logout() {
            localStorage.removeItem('user-token'); // Clear the token
            this.$router.push({ name: 'LoginPage' }); // Redirect to login
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
  