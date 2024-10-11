<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">Messages</h2>
    <div class="mb-4 grid grid-cols-3 gap-4">
      <input
        v-model="productName"
        type="text"
        placeholder="Product Name"
        class="border rounded px-2 py-1"
      />
      <input
        v-model="deviceName"
        type="text"
        placeholder="Device Name"
        class="border rounded px-2 py-1"
      />
      <input
        v-model="messageId"
        type="text"
        placeholder="Message ID"
        class="border rounded px-2 py-1"
      />
    </div>
    <ul class="space-y-4">
      <li v-for="message in messages" :key="message.id" class="border-b pb-2">
        <div class="flex items-center mb-1">
          <MessageSquare class="text-blue-500 mr-2" :size="16" />
          <span class="font-semibold">{{ message.device_name }}</span>
          <span class="text-gray-500 text-sm ml-2">
            {{ new Date(message.timestamp).toLocaleString() }}
          </span>
        </div>
        <p class="text-gray-700">{{ message.content }}</p>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { MessageSquare } from 'lucide-vue-next';

interface Message {
  id: string;
  product_name: string;
  device_name: string;
  timestamp: string;
  content: string;
}

const apiUrl = ref(localStorage.getItem('apiUrl') || '');
const defaultProductName = ref(localStorage.getItem('defaultProductName') || '');

const messages = ref<Message[]>([]);
const productName = ref(defaultProductName.value);
const deviceName = ref('');
const messageId = ref('');

const fetchMessages = async () => {
  try {
    let url = `${apiUrl.value}/messages/${productName.value}`;
    const params = new URLSearchParams();
    if (deviceName.value) params.append('device_name', deviceName.value);
    if (messageId.value) params.append('message_id', messageId.value);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url);
    const data = await response.json();
    messages.value = data;
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
};

watch([productName, deviceName, messageId], fetchMessages);

onMounted(fetchMessages);
</script>