<template>
  <UnderMaintenance v-if="$config.public.isInMaintenanceMode" />
  <div class="p-6" v-else>
    <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h2 class="text-xl font-semibold mb-4">Fees Management</h2>
      <div class="bg-gray-50 p-4 rounded-lg">
        <p class="text-gray-500">Student fees and payments placeholder</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import UnderMaintenance from '~/components/Console/UnderMaintenance.vue';

definePageMeta({
  layout: 'console'
})
</script>