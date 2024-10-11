<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">API Settings</h2>
    <form @submit.prevent="handleSubmit">
      <div class="mb-4">
        <label for="apiUrl" class="block text-sm font-medium text-gray-700">
          API URL
        </label>
        <input
          type="text"
          id="apiUrl"
          v-model="tempApiUrl"
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="https://api.example.com"
        />
      </div>
      <div class="mb-4">
        <label for="productName" class="block text-sm font-medium text-gray-700">
          Default Product Name
        </label>
        <input
          type="text"
          id="productName"
          v-model="tempProductName"
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter default product name"
        />
      </div>
      <button
        type="submit"
        class="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Save
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const tempApiUrl = ref(localStorage.getItem('apiUrl') || '');
const tempProductName = ref(localStorage.getItem('defaultProductName') || '');

const handleSubmit = () => {
  localStorage.setItem('apiUrl', tempApiUrl.value);
  localStorage.setItem('defaultProductName', tempProductName.value);
  router.push('/');
};
</script>