<template>
  <div class="card" @click="onClick">
    <div class="card-content">
      <slot></slot>
    </div>
    <div class="card-icons">
      <slot name="icons"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "CardComponent",
  props: {
    onClick: {
      type: Function,
      default: null,
    },
  },
};
</script>

<style scoped>

.card-content {
  padding: 16px;
}

.card-icons {
  position: absolute;
  inset-block-start: 10px;
  inset-inline-end: 10px;
}

@media (max-inline-size: 768px) {
  .card {
    max-inline-size: 100%;
  }
}
</style>
