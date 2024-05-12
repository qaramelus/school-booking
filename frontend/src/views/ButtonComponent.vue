// ButtonComponent.vue
<template>
  <button :class="['btn', `btn-${type}`]" @click="onClick">
    <slot></slot>
  </button>
</template>

<script>
import '@/styles/MainColorSchema.css'
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
  background-color: var(--primary-color);
  color: var(--button-text-color);
}

/* Add more button styles as needed */
</style>

