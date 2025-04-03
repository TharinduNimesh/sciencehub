<template>
  <UTable
    :rows="rows"
    :columns="columns"
    :loading="loading"
    :ui="{ 
      thead: 'border-b border-gray-200',
      tbody: 'divide-y divide-gray-100',
    }"
  >
    <template #name-data="{ row }">
      <div class="flex items-center gap-2">
        <UAvatar
          :text="getInitials(row.name)"
          size="sm"
          color="primary"
        />
        <div>
          <div class="font-medium">
            <NuxtLink 
              :to="`/console/students/${row.id}`"
              class="text-primary-600 hover:text-primary-700"
            >
              {{ row.name }}
            </NuxtLink>
          </div>
          <div class="text-sm text-gray-500">{{ row.email }}</div>
        </div>
      </div>
    </template>
    
    <template #grade-data="{ row }">
      <div>Grade {{ row.grade }}</div>
    </template>
    
    <template #payment-data="{ row }">
      <UBadge
        :color="row.paymentStatus === 'Paid' ? 'green' : 'red'"
        variant="soft"
      >
        {{ row.paymentStatus }}
      </UBadge>
    </template>
    
    <template #status-data="{ row }">
      <UBadge
        :color="row.status === 'Active' ? 'green' : 'gray'"
        variant="soft"
      >
        {{ row.status }}
      </UBadge>
    </template>
    
    <template #actions-data="{ row }">
      <div class="flex justify-end gap-2">
        <UDropdown
          :items="getActionItems(row)"
          :popper="{ placement: 'bottom-end' }"
        >
          <UButton
            icon="i-heroicons-ellipsis-vertical"
            color="gray"
            variant="ghost"
            size="xs"
            :disabled="processingIds.includes(row.id)"
          />
        </UDropdown>
      </div>
    </template>
  </UTable>
</template>

<script setup lang="ts">
defineProps({
  rows: {
    type: Array,
    required: true
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
  view: [student: any]
  deactivate: [student: any]
  edit: [student: any]
  delete: [student: any]
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
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

const getActionItems = (student: any) => {
  const items = [
    [
      {
        label: 'View Details',
        icon: 'i-heroicons-eye',
        to: `/console/students/${student.id}`
      },
      {
        label: 'Edit',
        icon: 'i-heroicons-pencil-square',
        click: () => emit('edit', student)
      },
    ],
    [
      {
        label: student.status === 'Active' ? 'Deactivate' : 'Activate',
        icon: student.status === 'Active' 
          ? 'i-heroicons-x-circle' 
          : 'i-heroicons-check-circle',
        click: () => emit('deactivate', student)
      },
      {
        label: 'Delete',
        icon: 'i-heroicons-trash',
        click: () => emit('delete', student)
      }
    ]
  ]
  return items
}
</script>