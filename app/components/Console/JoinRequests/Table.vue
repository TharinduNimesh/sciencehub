<template>
  <div>
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
          >
            {{ row.invitationStatus }}
          </UBadge>
        </template>
        <span v-else class="text-gray-400">-</span>
      </template>

      <template #actions-data="{ row }">
        <UDropdown :items="getActionItems(row)" :popper="{ placement: 'bottom-end' }">
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-ellipsis-horizontal"
          />
        </UDropdown>
      </template>
    </UTable>
  </div>
</template>

<script setup lang="ts">
interface TableRow {
  id: number;
  name: string;
  email: string;
  grade: number;
  status: 'Pending' | 'Accepted' | 'Rejected';
  invitationStatus?: 'Sent' | 'Accepted' | 'Expired';
  requestedAt: string;
  acceptedAt?: string;
}

type StatusColor = 'yellow' | 'green' | 'red' | 'blue' | 'gray';

const props = defineProps({
  rows: {
    type: Array as PropType<TableRow[]>,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
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
const getStatusColor = (status: TableRow['status']): StatusColor => {
  const colors: Record<TableRow['status'], StatusColor> = {
    'Pending': 'yellow',
    'Accepted': 'green',
    'Rejected': 'red'
  };
  return colors[status] || 'gray';
};

const getInvitationStatusColor = (status: TableRow['invitationStatus']): StatusColor => {
  const colors: Record<NonNullable<TableRow['invitationStatus']>, StatusColor> = {
    'Sent': 'blue',
    'Accepted': 'green',
    'Expired': 'yellow'
  };
  return status ? colors[status] : 'gray';
};

// Action items based on row status
const getActionItems = (row: TableRow) => {
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
        color: 'red',
        click: () => emit('delete', row)
      }]
    ]
  }

  return [
    ...baseItems,
    [{
      label: 'Delete',
      icon: 'i-heroicons-trash',
      color: 'red',
      click: () => emit('delete', row)
    }]
  ]
}

const emit = defineEmits(['view', 'accept', 'reject', 'delete']);
</script>