<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">{{ device.device_name }}</h2>
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="flex items-center">
        <Cpu class="text-blue-500 mr-2" :size="20" />
        <span>Status: {{ device.status }}</span>
      </div>
      <div class="flex items-center">
        <Battery class="text-green-500 mr-2" :size="20" />
        <span>Product: {{ device.product_name }}</span>
      </div>
      <div v-if="device.secret" class="col-span-2 flex items-center">
        <Thermometer class="text-red-500 mr-2" :size="20" />
        <span>Secret: {{ device.secret }}</span>
      </div>
    </div>
    <div class="flex justify-end space-x-2">
      <button
        @click="toggleDeviceStatus"
        :class="`px-3 py-1 rounded ${
          device.status === 'active' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
        } text-white`"
      >
        <Pause v-if="device.status === 'active'" :size="20" />
        <Play v-else :size="20" />
      </button>
      <button
        @click="deleteDevice"
        class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
      >
        <Trash2 :size="20" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Cpu, Battery, Thermometer, Trash2, Play, Pause } from 'lucide-vue-next';

const props = defineProps<{
  device: {
    product_name: string;
    device_name: string;
    status: 'active' | 'suspended';
    secret?: string;
  };
  apiUrl: string;
}>();

const emit = defineEmits(['device-updated']);

const toggleDeviceStatus = async () => {
  const action = props.device.status === 'active' ? 'suspend' : 'resume';
  try {
    await fetch(`${props.apiUrl}/devices/${props.device.product_name}/${props.device.device_name}/${action}`, {
      method: 'PUT',
    });
    emit('device-updated');
  } catch (error) {
    console.error(`Error ${action}ing device:`, error);
  }
};

const deleteDevice = async () => {
  try {
    await fetch(`${props.apiUrl}/devices/${props.device.product_name}/${props.device.device_name}`, {
      method: 'DELETE',
    });
    emit('device-updated');
  } catch (error) {
    console.error('Error deleting device:', error);
  }
};
</script>