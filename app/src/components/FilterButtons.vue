<template>
    <div class="button-container">
      <button @click="$emit('update:filter', 'open')" :class="['filter-button', { active: filter === 'open' }]">Open</button>
      <button @click="$emit('update:filter', 'current')" :class="['filter-button', { active: filter === 'current' }]">Current</button>
      <button @click="$emit('update:filter', 'all')" :class="['filter-button', { active: filter === 'all' }]">All</button>
    </div>
  </template>
  
  <script>
  export default {
    name: 'FilterButtons',
    props: {
      filter: {
        type: String,
        required: true
      }
    }
  };
  </script>
  
  <style scoped>
  .button-container {
    display: flex;
    gap: 10px;
  }
  
  .filter-button {
    padding: 10px 20px;
    border: none;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.3s ease;
  }
  
  .filter-button.active {
    background-color: var(--primary-color);
    color: var(--button-text-color);
  }
  
  .filter-button:hover {
    background-color: var(--primary-color-dark);
    color: var(--button-text-color);
  }
  </style>
  