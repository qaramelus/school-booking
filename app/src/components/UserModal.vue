<template>
    <div class="modal">
      <div class="modal-content">
        <span class="close" @click="$emit('close')">&times;</span>
        <h2>{{ title }}</h2>
        <form @submit.prevent="onSubmit">
          <div class="form-group" v-for="(field, index) in fields" :key="index">
            <label :for="field.id">{{ field.label }}</label>
            <input
              :type="field.type"
              :id="field.id"
              v-model="localForm[field.model]"
              :required="field.required"
            />
          </div>
          <button type="submit" class="submit-btn">{{ buttonText }}</button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      title: String,
      fields: Array,
      buttonText: String,
      form: Object
    },
    data() {
      return {
        localForm: { ...this.form }
      };
    },
    methods: {
      onSubmit() {
        this.$emit('submit', this.localForm);
      }
    }
  };
  </script>
  
  <style scoped>
  .modal {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
  }
  
  .modal-content {
    background: white;
    padding: 20px;
    border-radius: 5px;
    max-width: 500px;
    width: 100%;
    position: relative;
  }
  
  .close {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 20px;
    cursor: pointer;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
  }
  
  .form-group input {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
  }
  
  .submit-btn {
    background-color: var(--primary-color);
    color: var(--button-text-color);
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    cursor: pointer;
  }
  
  .submit-btn:hover {
    background-color: var(--hover-dark);
  }
  </style>
  