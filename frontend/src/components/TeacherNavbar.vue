<template>
    <nav class="teacher-nav">
      <ul>
        <li><router-link to="/teacher-overview">Overview</router-link></li>
      </ul>
      <button @click="performLogout" class="logout-button">Logout</button>
    </nav>
  </template>
  
  <script>
  import { logout } from '@/services/logout';
  
  export default {
    name: 'TeacherNavbar',
    methods: {
      performLogout() {
        logout(this.$router);
      }
    }
  };
  </script>
  
  <style scoped>
  .teacher-nav {
    background-color: #34495e;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .teacher-nav ul {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  .teacher-nav li {
    margin-right: 20px;
  }
  
  .teacher-nav a {
    color: #bdc3c7;
    text-decoration: none;
    font-size: 1.2rem;
    transition: color 0.3s ease;
  }
  
  .teacher-nav a:hover, .router-link-active {
    color: #95a5a6;
  }
  
  .logout-button {
    background-color: transparent;
    border: none;
    color: #bdc3c7;
    font-size: 1rem;
    cursor: pointer;
  }
  
  .logout-button:hover {
    color: #e74c3c;
  }
  </style>
  