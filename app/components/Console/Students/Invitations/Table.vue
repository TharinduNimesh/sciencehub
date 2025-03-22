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

      <template #invited-data="{ row }">
        <div>
          <div class="font-medium text-gray-900">{{ formatDate(row.invitedAt) }}</div>
          <div class="text-gray-500 text-sm">by {{ row.invitedBy }}</div>
        </div>
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

export interface Invitation {
  id: number
  name: string
  email: string
  grade: number
  invitedAt: string
  invitedBy: string
  status: 'Pending' | 'Accepted' | 'Expired' | 'Revoked'
}

type StatusColor = 'yellow' | 'green' | 'gray' | 'red'

const props = defineProps({
  rows: {
    type: Array as PropType<Invitation[]>,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits<{
  resend: [invitation: Invitation]
  revoke: [invitation: Invitation]
  delete: [invitation: Invitation]
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
    key: 'invited',
    label: 'Invited',
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
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusColor = (status: string): StatusColor => {
  const colors: Record<string, StatusColor> = {
    'Pending': 'yellow',
    'Accepted': 'green',
    'Expired': 'gray',
    'Revoked': 'red'
  }
  return colors[status] || 'gray'
}

// Action items for dropdown
const getActionItems = (row: Invitation) => {
  const items = []
  const actionGroup = []

  // Resend action for Pending, Expired, or Revoked invitations
  if (['Pending', 'Expired', 'Revoked'].includes(row.status)) {
    items.push([{
      label: 'Resend Invitation',
      icon: 'i-heroicons-arrow-path',
      click: () => emit('resend', row)
    }])
  }

  // Second group - status dependent actions
  // Only Pending invitations can be revoked
  if (row.status === 'Pending') {
    actionGroup.push({
      label: 'Revoke Invitation',
      icon: 'i-heroicons-x-mark',
      color: 'red',
      click: () => emit('revoke', row)
    })
  }

  // All invitations can be deleted
  actionGroup.push({
    label: 'Delete',
    icon: 'i-heroicons-trash',
    color: 'red',
    click: () => emit('delete', row)
  })

  if (actionGroup.length > 0) {
    items.push(actionGroup)
  }

  return items
}
</script>