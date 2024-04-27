<template>
    <div class="child-user-update-form">
      <h2>Update Child</h2>
      <form @submit.prevent="updateChild">
        <input type="text" v-model="updatedChild.firstName" placeholder="First Name" required>
        <input type="text" v-model="updatedChild.lastName" placeholder="Last Name" required>
        <input type="text" v-model="updatedChild.username" placeholder="Username" required>
        <input type="email" v-model="updatedChild.email" placeholder="Email" required>
        <button type="submit">Update Child</button>
      </form>
    </div>
  </template>
  
  <script>
  import API from '@/services/api';
  
  export default {
    name: "ChildUserUpdateForm",
    props: {
      child: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        updatedChild: { ...this.child }
      };
    },
    methods: {
      async updateChild() {
        try {
          const parentId = this.$route.params.userId;
          const childId = this.child._id;
          await API.put(`users/${parentId}/children/${childId}`, this.updatedChild);
          alert('Child user updated successfully!');
          // Emit an event to notify the parent component about the update
          this.$emit('childUpdated');
        } catch (error) {
          console.error("There was an error updating the child:", error.message);
          // Handle error appropriately
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .child-user-update-form {
    background-color: #f0f0f0;
    padding: 20px;
    margin-top: 20px;
  }
  
  form input[type="text"], form input[type="email"] {
    margin-block-end: 10px;
  }
  </style>