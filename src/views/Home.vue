<template>
  <div>
    <div v-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
      <div class="flex items-center">
        <AlertCircle class="mr-2" />
        <p>{{ error }}</p>
      </div>
      <router-link to="/settings" class="text-red-700 underline mt-2 inline-block">
        Go to Settings
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="md:col-span-1">
        <DeviceList 
          :devices="devices" 
          @select-device="setSelectedDevice" 
          :apiUrl="apiUrl"
          :defaultProductName="defaultProductName"
          @device-created="fetchDevices"
        />
      </div>
      <div class="md:col-span-2">
        <DeviceDetails 
          v-if="selectedDevice" 
          :device="selectedDevice" 
          :apiUrl="apiUrl" 
          @device-updated="fetchDevices"
        />
        <div v-else class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold mb-4">IoT Hub Overview</h2>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center">
              <Server class="text-blue-500 mr-2" />
              <span>Total Devices: {{ devices.length }}</span>
            </div>
            <div class="flex items-center">
              <Cpu class="text-green-500 mr-2" />
              <span>Active Devices: {{ activeDevices }}</span>
            </div>
            <div class="flex items-center">
              <Wifi class="text-red-500 mr-2" />
              <span>Suspended Devices: {{ suspendedDevices }}</span>
            </div>
            <div class="flex items-center">
              <router-link to="/settings" class="text-blue-600 hover:underline">
                <Settings class="text-gray-500 mr-2" />
                <span>Hub Settings</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Server, Cpu, Wifi, Settings, AlertCircle } from 'lucide-vue-next';
import DeviceList from '../components/DeviceList.vue';
import DeviceDetails from '../components/DeviceDetails.vue';

interface Device {
  product_name: string;
  device_name: string;
  status: 'active' | 'suspended';
  secret?: string;
}

const apiUrl = ref(localStorage.getItem('apiUrl') || '');
const defaultProductName = ref(localStorage.getItem('defaultProductName') || '');
const devices = ref<Device[]>([]);
const selectedDevice = ref<Device | null>(null);
const error = ref<string | null>(null);

const activeDevices = computed(() => devices.value.filter(d => d.status === 'active').length);
const suspendedDevices = computed(() => devices.value.filter(d => d.status === 'suspended').length);

const fetchDevices = async () => {
  try {
    const response = await fetch(`${apiUrl.value}/devices/${defaultProductName.value}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    devices.value = await response.json();
    error.value = null;
  } catch (err) {
    console.error('Error fetching devices:', err);
    error.value = 'Failed to fetch devices. Please check your API settings and try again.';
  }
};

const setSelectedDevice = (device: Device) => {
  selectedDevice.value = device;
};

onMounted(() => {
  if (apiUrl.value && defaultProductName.value) {
    fetchDevices();
  } else {
    error.value = 'Please set up the API URL and default product name in the settings.';
  }
});
</script>