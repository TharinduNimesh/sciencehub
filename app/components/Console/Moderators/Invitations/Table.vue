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

      <template #invited-data="{ row }">
        <div>
          <div class="font-medium text-gray-900">{{ formatDate(row.invitedAt) }}</div>
          <div class="text-gray-500 text-sm">by {{ row.invitedBy }}</div>
        </div>
      </template>

      <template #status-data="{ row }">
        <UBadge
          :color="getStatusColor(row.status)"
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

export interface Invitation {
  id: number
  name: string
  email: string
  classes: {
    id: number
    name: string
  }[]
  invitedAt: string
  invitedBy: string
  status: 'Pending' | 'Expired' | 'Revoked' | 'Rejected' | 'Accepted' | 'Used'
}

type StatusColor = 'yellow' | 'green' | 'red' | 'gray' | 'blue'

const props = defineProps({
  rows: {
    type: Array as PropType<Invitation[]>,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  processingIds: {  // Add new prop for processing state
    type: Array as PropType<number[]>,
    default: () => []
  }
})

const emit = defineEmits<{
  resend: [invitation: Invitation]
  revoke: [invitation: Invitation]
  delete: [invitation: Invitation]
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
    key: 'invited',
    label: 'Invited'
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

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatClassesDisplay = (classes: any[]) => {
  if (!classes?.length) return 'No classes assigned'
  
  // Handle the case where classes are in label/value format
  const normalizedClasses = classes.map(c => {
    if (c.value && c.label) {
      return c.value
    }
    return c
  })

  if (normalizedClasses.length === 1) {
    return normalizedClasses[0].name
  }

  return `${normalizedClasses[0].name} and ${normalizedClasses.length - 1} more ${normalizedClasses.length - 1 === 1 ? 'class' : 'classes'}`
}

const getStatusColor = (status: Invitation['status']): StatusColor => {
  const colors: Record<Invitation['status'], StatusColor> = {
    'Pending': 'yellow',
    'Accepted': 'green',
    'Used': 'blue',
    'Expired': 'gray',
    'Rejected': 'red',
    'Revoked': 'red'
  }
  return colors[status]
}

// Add isProcessing helper function
const isProcessing = (invitationId: number) => {
  return props.processingIds?.includes(invitationId)
}

// Update getActionItems function to properly handle loading states
const getActionItems = (row: Invitation) => {
  const items = []
  const actionGroup = []

  // Resend action for Pending, Expired, Rejected, or Revoked invitations
  if (['Pending', 'Expired', 'Rejected', 'Revoked'].includes(row.status)) {
    items.push([{
      label: 'Resend Invitation',
      icon: 'i-heroicons-paper-airplane',
      disabled: isProcessing(row.id),
      loading: isProcessing(row.id),
      click: () => emit('resend', row)
    }])
  }

  // Only Pending invitations can be revoked
  if (row.status === 'Pending') {
    actionGroup.push({
      label: 'Revoke Invitation',
      icon: 'i-heroicons-x-mark',
      color: 'red',
      disabled: isProcessing(row.id),
      click: () => emit('revoke', row)
    })
  }

  // All invitations except Used ones can be deleted
  if (row.status !== 'Used') {
    actionGroup.push({
      label: 'Delete',
      icon: 'i-heroicons-trash',
      color: 'red',
      disabled: isProcessing(row.id),
      click: () => emit('delete', row)
    })
  }

  if (actionGroup.length > 0) {
    items.push(actionGroup)
  }

  return items
}
</script>