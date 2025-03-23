<template>
  <div class="min-w-[800px]">
    <UTable :rows="rows" :columns="columns" :loading="loading">
      <template #name-data="{ row }">
        <div class="flex items-center gap-2">
          <UAvatar
            :text="row.name.split(' ').map((n: string) => n[0]).join('')"
            size="sm"
          />
          <div>
            <div class="font-medium text-gray-900">{{ row.name }}</div>
            <div class="text-gray-500 text-sm">{{ row.email }}</div>
          </div>
        </div>
      </template>

      <template #classes-data="{ row }">
        <div class="flex items-center gap-2">
          <div class="text-sm text-gray-600">
            {{ formatClassesDisplay(row.classes) }}
          </div>
        </div>
      </template>

      <template #status-data="{ row }">
        <UBadge
          :color="row.status === 'Active' ? 'green' : 'red'"
          variant="soft"
          size="sm"
        >
          {{ row.status }}
        </UBadge>
      </template>

      <template #actions-data="{ row }">
        <UDropdown
          :items="getActionItems(row)"
          :disabled="isProcessing(row.id)"
        >
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-ellipsis-horizontal"
            :ui="{ rounded: 'rounded-full' }"
            :loading="isProcessing(row.id)"
          />
        </UDropdown>
      </template>
    </UTable>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

export interface ModeratorClass {
  id: number
  name: string
}

export interface Moderator {
  id: number
  name: string
  email: string
  classes: ModeratorClass[]
  status: 'Active' | 'Inactive'
}

const props = defineProps({
  rows: {
    type: Array as PropType<Moderator[]>,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  processingIds: {
    type: Array as PropType<number[]>,
    default: () => []
  }
})

const emit = defineEmits<{
  (e: 'view', moderator: Moderator): void
  (e: 'edit', moderator: Moderator): void
  (e: 'deactivate', moderator: Moderator): void
}>()

const columns = [
  {
    key: 'name',
    label: 'Moderator'
  },
  {
    key: 'classes',
    label: 'Classes'
  },
  {
    key: 'status',
    label: 'Status'
  },
  {
    key: 'actions',
    label: ''
  }
]

const formatClassesDisplay = (classes: ModeratorClass[]) => {
  if (!classes?.length) return 'No classes assigned'
  if (classes.length === 1 && classes[0]?.name) return classes[0].name
  if (classes[0]?.name) {
    return `${classes[0].name} and ${classes.length - 1} more ${classes.length - 1 === 1 ? 'class' : 'classes'}`
  }
  return 'No classes assigned'
}

const isProcessing = (moderatorId: number) => {
  return props.processingIds?.includes(moderatorId)
}

const getActionItems = (row: Moderator) => {
  const items = [
    [{
      label: 'View Profile',
      icon: 'i-heroicons-user',
      disabled: isProcessing(row.id),
      click: () => emit('view', row)
    }],
    [{
      label: 'Edit',
      icon: 'i-heroicons-pencil-square',
      disabled: isProcessing(row.id),
      click: () => emit('edit', row)
    }],
    [{
      label: 'Deactivate',
      icon: 'i-heroicons-x-mark',
      color: 'red',
      disabled: isProcessing(row.id),
      click: () => emit('deactivate', row)
    }]
  ]

  return items
}
</script>