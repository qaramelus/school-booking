<template>
    <div class="child-overview">
      <h1>You logged on successfully</h1>
      <button @click="performLogout">Logout</button>
    </div>
</template>
  
<script>
import { logout } from '@/services/logout'; 

export default {
  name: "ChildOverview",
  methods: {
    performLogout() {
      logout(this.$router);
    }
  }
};
</script>

<style scoped>
.child-overview {
  max-inline-size: 600px;
  margin: 0 auto;
  text-align: center;
}

/* Additional styles here if needed */
</style>
