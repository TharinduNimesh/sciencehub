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

      <template #status-data="{ row }">
        <UBadge
          :color="getStatusColor(row.status)"
          size="sm"
          variant="soft"
        >
          {{ row.status }}
        </UBadge>
      </template>

      <template #invitation-data="{ row }">
        <template v-if="row.status === 'Accepted'">
          <UBadge
            :color="getInvitationStatusColor(row.invitationStatus)"
            size="sm"
            variant="soft"
            class="flex items-center gap-1.5 w-fit"
          >
            <UIcon
              :name="getInvitationStatusIcon(row.invitationStatus)"
              class="w-4 h-4"
            />
            {{ row.invitationStatus || 'Not Sent' }}
          </UBadge>
        </template>
        <span v-else class="text-gray-400">-</span>
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
import type { JoinRequest } from '~/composables/useJoinRequests'

type StatusColor = 'yellow' | 'green' | 'red' | 'blue' | 'gray';

const props = defineProps({
  rows: {
    type: Array as PropType<JoinRequest[]>,
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
});

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
    key: 'status',
    label: 'Status',
  },
  {
    key: 'invitation',
    label: 'Invitation',
  },
  {
    key: 'actions',
    label: '',
  }
];

// Helper functions for status colors
const getStatusColor = (status: JoinRequest['status']): StatusColor => {
  const colors: Record<JoinRequest['status'], StatusColor> = {
    'Pending': 'yellow',
    'Accepted': 'green',
    'Rejected': 'red'
  };
  return colors[status] || 'gray';
};

const getInvitationStatusColor = (status: JoinRequest['invitationStatus']): StatusColor => {
  const colors: Record<NonNullable<JoinRequest['invitationStatus']>, StatusColor> = {
    'Sent': 'blue',
    'Accepted': 'green',
    'Expired': 'yellow',
    'Deleted': 'red'
  }
  return status ? colors[status] || 'gray' : 'gray';
}

const getInvitationStatusIcon = (status: JoinRequest['invitationStatus']): string => {
  const icons: Record<NonNullable<JoinRequest['invitationStatus']>, string> = {
    'Sent': 'i-heroicons-envelope',
    'Accepted': 'i-heroicons-check-circle',
    'Expired': 'i-heroicons-clock',
    'Deleted': 'i-heroicons-trash'
  }
  return status ? icons[status] || 'i-heroicons-minus-circle' : 'i-heroicons-minus-circle'
}

// Action items based on row status
const getActionItems = (row: JoinRequest) => {
  const baseItems = [[{
    label: 'View Details',
    icon: 'i-heroicons-eye',
    click: () => emit('view', row)
  }]];

  if (row.status === 'Pending') {
    return [
      ...baseItems,
      [{
        label: 'Accept',
        icon: 'i-heroicons-check',
        click: () => emit('accept', row)
      }, {
        label: 'Reject',
        icon: 'i-heroicons-x-mark',
        click: () => emit('reject', row)
      }],
      [{
        label: 'Delete',
        icon: 'i-heroicons-trash',
        click: () => emit('delete', row)
      }]
    ]
  }

  return [
    ...baseItems,
    [{
      label: 'Delete',
      icon: 'i-heroicons-trash',
      click: () => emit('delete', row)
    }]
  ]
}

// Helper function to check if a request is being processed
const isProcessing = (requestId: number) => {
  return props.processingIds?.includes(requestId)
}

const emit = defineEmits<{
  view: [request: JoinRequest];
  accept: [request: JoinRequest];
  reject: [request: JoinRequest];
  delete: [request: JoinRequest];
}>();
</script>