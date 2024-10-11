<template>
  <header class="bg-blue-600 text-white p-4">
    <div class="container mx-auto flex items-center justify-between">
      <router-link to="/" class="flex items-center">
        <Cloud class="mr-2" :size="24" />
        <h1 class="text-2xl font-bold">IoT Hub Management</h1>
      </router-link>
      <nav>
        <router-link to="/messages" class="flex items-center hover:underline">
          <MessageSquare class="mr-2" :size="20" />
          <span>Messages</span>
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Cloud, MessageSquare } from 'lucide-vue-next';
</script>