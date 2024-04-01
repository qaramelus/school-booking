<template>
  <div class="card" @click="onClick">
    <slot></slot>
    <slot name="delete-icon"></slot>
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
.card {
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
  transition: 0.3s;
  inline-size: 60%; 
  margin-block-end: 20px;
  border-radius: 5px;
  padding: 2px 16px;
  background-color: white;
  cursor: pointer;
  position: relative; 
  text-align: start; 
}

.card:hover {
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
}

@media (max-inline-size: 768px) {
  .card {
    inline-size: 100%; 
  }
}
</style>

