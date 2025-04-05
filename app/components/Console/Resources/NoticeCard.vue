<template>
  <UCard class="cursor-pointer hover:shadow-md transition-shadow h-full flex flex-col">
    <div class="space-y-4 flex-1">
      <div class="flex items-start justify-between">
        <div>
          <h3 class="text-lg font-semibold">{{ notice.title }}</h3>
          <p class="text-sm text-gray-500">{{ formatDate(notice.createdAt) }}</p>
        </div>
      </div>
      <p class="text-gray-600">{{ notice.description }}</p>
      <div v-if="notice.image" class="mt-4">
        <img :src="notice.image" :alt="notice.title" class="rounded-lg w-full object-cover h-48">
      </div>
      <div class="flex flex-wrap gap-2">
        <UBadge v-for="className in notice.classes" :key="className" color="primary" variant="soft" size="sm">
          {{ className }}
        </UBadge>
      </div>
    </div>

    <!-- Actions Section -->
    <div class="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
      <span class="text-xs text-gray-500">
        Created {{ formatDate(notice.createdAt) }}
      </span>
      <div class="flex items-center gap-2">
        <UTooltip text="Edit notice" :popper="{ arrow: true }">
          <UButton
            color="orange"
            variant="soft"
            icon="i-heroicons-pencil-square"
            :ui="{ rounded: 'rounded-full' }"
            size="sm"
            @click="emit('edit', notice)"
          />
        </UTooltip>
        <UTooltip text="Delete notice" :popper="{ arrow: true }">
          <UButton
            color="red"
            variant="soft"
            icon="i-heroicons-trash"
            :ui="{ rounded: 'rounded-full' }"
            size="sm"
            @click="emit('delete', notice)"
          />
        </UTooltip>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Notice {
  id: number
  title: string
  description: string
  createdAt: string
  classes: string[]
  image?: string
}

const props = defineProps<{
  notice: Notice
}>()

const emit = defineEmits<{
  (e: 'edit', notice: Notice): void
  (e: 'delete', notice: Notice): void
}>()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getNoticeActions = (notice: Notice) => {
  return [
    [{
      label: 'Edit',
      icon: 'i-heroicons-pencil-square',
      click: () => emit('edit', notice)
    }],
    [{
      label: 'Delete',
      icon: 'i-heroicons-trash',
      color: 'red',
      click: () => emit('delete', notice)
    }]
  ]
}
</script>