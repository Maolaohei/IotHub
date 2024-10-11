<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">Devices</h2>
    <div v-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
      <div class="flex items-center">
        <AlertCircle class="mr-2" />
        <p>{{ error }}</p>
      </div>
    </div>
    <div class="mb-4 flex">
      <input
        v-model="newDeviceName"
        type="text"
        placeholder="Enter device name"
        class="flex-grow border rounded-l px-2 py-1"
      />
      <button
        @click="createDevice"
        class="bg-blue-500 text-white px-3 py-1 rounded-r hover:bg-blue-600"
      >
        <Plus :size="20" />
      </button>
    </div>
    <ul class="space-y-2">
      <li
        v-for="device in devices"
        :key="`${device.product_name}-${device.device_name}`"
        class="flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer"
        @click="$emit('select-device', device)"
      >
        <span class="flex items-center">
          <Wifi v-if="device.status === 'active'" class="text-green-500 mr-2" :size="16" />
          <WifiOff v-else class="text-red-500 mr-2" :size="16" />
          {{ device.device_name }}
        </span>
        <span class="text-sm text-gray-500">{{ device.product_name }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Wifi, WifiOff, Plus, AlertCircle } from 'lucide-vue-next';

const props = defineProps<{
  devices: Array<{
    product_name: string;
    device_name: string;
    status: 'active' | 'suspended';
  }>;
  apiUrl: string;
  defaultProductName: string;
}>();

const emit = defineEmits(['select-device', 'device-created']);

const newDeviceName = ref('');
const error = ref<string | null>(null);

const createDevice = async () => {
  try {
    const response = await fetch(`${props.apiUrl}/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_name: props.defaultProductName, device_name: newDeviceName.value }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const newDevice = await response.json();
    emit('select-device', newDevice);
    newDeviceName.value = '';
    error.value = null;
    emit('device-created');
  } catch (err) {
    console.error('Error creating device:', err);
    error.value = 'Failed to create device. Please try again.';
  }
};
</script>