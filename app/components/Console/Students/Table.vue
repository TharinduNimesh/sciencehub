<template>
  <div class="min-w-[800px]">
    <UTable
      :rows="rows"
      :columns="columns"
      :loading="loading"
    >
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

      <template #payment-data="{ row }">
        <UBadge
          :color="row.paymentStatus === 'Paid' ? 'green' : 'red'"
          size="sm"
          variant="soft"
        >
          {{ row.paymentStatus }}
        </UBadge>
      </template>

      <template #status-data="{ row }">
        <UBadge
          :color="getStatusColor(row.status)"
          size="sm"
          variant="soft"
        >
          {{ row.status }}
        </UBadge>
      </template>

      <template #actions-data="{ row }">
        <UDropdown
          :items="getActionItems(row)"
        >
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-ellipsis-horizontal"
            :ui="{ rounded: 'rounded-full' }"
          />
        </UDropdown>
      </template>
    </UTable>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

interface Student {
  id: number
  name: string
  email: string
  grade: number
  paymentStatus: string
  status: string
}

type StatusColor = 'green' | 'red' | 'gray'

const props = defineProps({
  rows: {
    type: Array as PropType<Student[]>,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits<{
  view: [student: Student]
  deactivate: [student: Student]
}>()

// Table columns configuration
const columns = [
  {
    key: 'name',
    label: 'Student',
  },
  {
    key: 'grade',
    label: 'Grade',
  },
  {
    key: 'payment',
    label: 'Payment Status',
  },
  {
    key: 'status',
    label: 'Status',
  },
  {
    key: 'actions',
    label: '',
  }
]

// Helper functions
const getStatusColor = (status: string): StatusColor => {
  const colors: Record<string, StatusColor> = {
    'Active': 'green',
    'Inactive': 'gray'
  }
  return colors[status] || 'gray'
}

// Action items for dropdown
const getActionItems = (row: Student) => {
  return [
    [{
      label: 'View Details',
      icon: 'i-heroicons-eye',
      click: () => emit('view', row)
    }],
    [{
      label: row.status === 'Active' ? 'Deactivate' : 'Activate',
      icon: row.status === 'Active' ? 'i-heroicons-pause' : 'i-heroicons-play',
      click: () => emit('deactivate', row)
    }]
  ]
}
</script>