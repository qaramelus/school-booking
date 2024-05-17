<template>
  <div class="card" @click="cardClicked">
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
  methods: {
    cardClicked() {
      this.$emit('click');
    }
  }
};
</script>

<style scoped>
.card {
  cursor: pointer;
  position: relative;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  transition: box-shadow 0.3s;
  flex: 1 1 auto; /* Flex properties to make cards responsive */
}

.card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

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
