<template>
    <div class="simple-switcher">
      <select v-model="selectedOption" @change="handleChange">
        <option v-for="(option, index) in options" :key="index" :value="option.value">{{ option.label }}</option>
      </select>
    </div>
  </template>
  
  <script>
  export default {
    name: 'SimpleSwitcher',
    props: {
      options: {
        type: Array,
        required: true
      },
      value: {
        type: String,
        required: false
      }
    },
    data() {
      return {
        selectedOption: this.value || (this.options.length > 0 ? this.options[0].value : null)
      };
    },
    methods: {
      handleChange() {
        this.$emit('input', this.selectedOption);
      }
    }
  };
  </script>
  
  <style scoped>
  .simple-switcher {
    display: inline-block;
  }
  </style>
  