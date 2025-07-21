<script setup lang="ts">
await navigateTo('/home')
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
      <p class="mt-4 text-gray-600">Chargement...</p>
    </div>
  </div>
</template>
