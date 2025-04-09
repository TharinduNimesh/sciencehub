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
        :color="getBadgeColor(row.current_month_payment_status)"
        variant="soft"
      >
        {{ formatPaymentStatus(row.current_month_payment_status) }}
      </UBadge>
    </template>
    
    <template #status-data="{ row }">
      <UBadge
        :color="row.is_active ? 'green' : 'gray'"
        variant="soft"
      >
        {{ row.is_active ? 'Active' : 'Inactive' }}
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
    type: Array as PropType<StudentDetails[]>,
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

const columns = [
  {
    key: 'name',
    label: 'Name'
  },
  {
    key: 'grade',
    label: 'Grade'
  },
  {
    key: 'payment',
    label: 'Payment Status'
  },
  {
    key: 'status',
    label: 'Status'
  },
  {
    key: 'actions',
    label: '',
    sortable: false
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

const getBadgeColor = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'green'
    case 'PENDING':
      return 'yellow'
    case 'FREE_PERIOD':
      return 'blue'
    default:
      return 'gray'
  }
}

const formatPaymentStatus = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'Paid'
    case 'PENDING':
      return 'Pending'
    case 'FREE_PERIOD':
      return 'Free Period'
    default:
      return status
  }
}

const getActionItems = (student: any) => {
  const items = [
    [
      {
        label: 'View Details',
        icon: 'i-heroicons-eye',
        to: `/console/students/${student.id}`
      },
    ],
    [
      {
        label: student.is_active ? 'Deactivate' : 'Activate',
        icon: student.is_active 
          ? 'i-heroicons-x-circle' 
          : 'i-heroicons-check-circle',
        click: () => emit('deactivate', student)
      }
    ]
  ]
  return items
}
</script>