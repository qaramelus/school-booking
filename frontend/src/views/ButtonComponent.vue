// ButtonComponent.vue
<template>
  <button :class="['btn', `btn-${type}`]" @click="onClick">
    <slot></slot>
  </button>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: 'primary'
    }
  },
  methods: {
    onClick() {
      this.$emit('click');
    }
  }
};
</script>

<style scoped>
.btn {
  padding: 10px 15px;
  border-radius: 4px;
  border: none;
  font-weight: bold;
  cursor: pointer;
}

.btn-primary {
  background-color: #4CAF50;
  color: #4CAF50;
}

/* Add more button styles as needed */
</style>
