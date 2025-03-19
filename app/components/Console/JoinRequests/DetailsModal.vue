<template>
  <UModal
    v-model="isOpen"
    :ui="{ width: 'sm:max-w-xl' }"
  >
    <UCard v-if="request">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Join Request Details</h3>
          <UBadge
            :color="getStatusColor(request.status)"
            size="sm"
            variant="soft"
          >
            {{ request.status }}
          </UBadge>
        </div>
      </template>

      <div class="space-y-6">
        <!-- Basic Information -->
        <div>
          <h4 class="font-medium text-gray-900 mb-3">Student Information</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-500">Full Name</div>
              <div class="font-medium">{{ request.name }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Grade</div>
              <div class="font-medium">Grade {{ request.grade }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Email</div>
              <div class="font-medium">{{ request.email }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Contact Number</div>
              <div class="font-medium">{{ request.contactNumber }}</div>
            </div>
          </div>
        </div>

        <!-- Additional Information -->
        <div>
          <h4 class="font-medium text-gray-900 mb-3">Additional Information</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-500">How did they find us?</div>
              <div class="font-medium">{{ request.referralSource }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Requested At</div>
              <div class="font-medium">{{ formatDate(request.requestedAt) }}</div>
            </div>
            <div v-if="request.status === 'Accepted'">
              <div class="text-sm text-gray-500">Accepted At</div>
              <div class="font-medium">{{ formatDate(request.acceptedAt) }}</div>
            </div>
            <div v-if="request.status === 'Accepted'">
              <div class="text-sm text-gray-500">Invitation Status</div>
              <UBadge
                :color="getInvitationStatusColor(request.invitationStatus)"
                size="sm"
                variant="soft"
              >
                {{ request.invitationStatus || 'Not Sent' }}
              </UBadge>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            color="gray"
            variant="ghost"
            @click="isOpen = false"
          >
            Close
          </UButton>
          <template v-if="request.status === 'Pending'">
            <UButton
              color="red"
              variant="soft"
              @click="emit('reject', request)"
            >
              Reject
            </UButton>
            <UButton
              color="primary"
              @click="emit('accept', request)"
            >
              Accept
            </UButton>
          </template>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
interface JoinRequest {
  id: number;
  name: string;
  email: string;
  grade: number;
  contactNumber: string;
  referralSource: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  requestedAt: string;
  acceptedAt: string | null;
  invitationStatus: string | null;
}

const props = defineProps<{
  modelValue: boolean;
  request: JoinRequest | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'accept': [request: JoinRequest]
  'reject': [request: JoinRequest]
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formatDate = (dateString: string | null) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

type StatusColor = 'yellow' | 'green' | 'red' | 'blue' | 'gray';

const getStatusColor = (status: JoinRequest['status']): StatusColor => {
  const colors: Record<JoinRequest['status'], StatusColor> = {
    'Pending': 'yellow',
    'Accepted': 'green',
    'Rejected': 'red'
  }
  return colors[status] || 'gray'
}

const getInvitationStatusColor = (status: string | null): StatusColor => {
  const colors: Record<string, StatusColor> = {
    'Sent': 'blue',
    'Accepted': 'green',
    'Expired': 'yellow'
  }
  return status ? (colors[status] || 'gray') : 'gray'
}
</script>