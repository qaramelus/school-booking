// InputComponent.vue
<template>
  <div class="input-wrapper">
    <input :type="type" :placeholder="placeholder" :value="modelValue" @input="updateValue">
  </div>
</template>

<script>
import '@/styles/MainColorSchema.css'
export default {
  props: {
    type: String,
    placeholder: String,
    modelValue: [String, Number]
  },
  methods: {
    updateValue(event) {
      this.$emit('update:modelValue', event.target.value);
    }
  }
};
</script>

<style scoped>
.input-wrapper input {
  inline-size: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  margin: 5px 0;
}
</style>

