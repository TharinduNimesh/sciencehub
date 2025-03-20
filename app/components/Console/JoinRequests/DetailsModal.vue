<template>
  <UModal
    v-model="isOpen"
    :ui="{ 
      width: 'w-full sm:max-w-2xl',
      container: 'items-center',
      wrapper: 'p-4',
      base: 'relative overflow-hidden rounded-2xl',
      padding: 'p-0',
      background: 'bg-gradient-to-b from-white to-gray-50/80',
      ring: 'ring-1 ring-gray-200',
      rounded: 'rounded-2xl'
    }"
  >
    <UCard
      v-if="request"
      class="shadow-none border-none max-h-[90vh] sm:max-h-[85vh] overflow-y-auto"
    >
      <template #header>
        <div class="space-y-4 pb-4 border-b border-gray-100">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <UAvatar
                :text="request.name.split(' ').map(n => n[0]).join('')"
                size="lg"
                class="ring-2 ring-offset-2"
                :class="[
                  request.status === 'Pending' ? 'ring-yellow-500/20 bg-yellow-50 text-yellow-600' :
                  request.status === 'Accepted' ? 'ring-green-500/20 bg-green-50 text-green-600' :
                  'ring-red-500/20 bg-red-50 text-red-600'
                ]"
              />
              <div>
                <h3 class="text-xl font-semibold tracking-tight">Join Request Details</h3>
                <p class="text-sm text-gray-500">Submitted {{ formatDateRelative(request.requestedAt) }}</p>
              </div>
            </div>
            <UBadge
              :color="getStatusColor(request.status)"
              size="lg"
              variant="soft"
              class="px-3 py-1 self-start sm:self-center"
            >
              <div class="flex items-center gap-1.5">
                <UIcon
                  :name="getStatusIcon(request.status)"
                  class="w-4 h-4"
                />
                {{ request.status }}
              </div>
            </UBadge>
          </div>
        </div>
      </template>

      <div class="space-y-8 py-2">
        <!-- Basic Information -->
        <div class="space-y-4">
          <h4 class="flex items-center gap-2 text-base font-semibold text-gray-900">
            <UIcon name="i-heroicons-user-circle" class="w-5 h-5 text-gray-400"/>
            Student Information
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="space-y-1">
              <div class="text-sm font-medium text-gray-500">Full Name</div>
              <div class="font-medium text-gray-900">{{ request.name }}</div>
            </div>
            <div class="space-y-1">
              <div class="text-sm font-medium text-gray-500">Grade</div>
              <div class="font-medium text-gray-900">Grade {{ request.grade }}</div>
            </div>
            <div class="space-y-1">
              <div class="text-sm font-medium text-gray-500">Email</div>
              <div class="font-medium text-gray-900 flex items-center gap-2">
                {{ request.email }}
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-clipboard"
                  size="xs"
                  square
                  @click="copyToClipboard(request.email)"
                />
              </div>
            </div>
            <div class="space-y-1">
              <div class="text-sm font-medium text-gray-500">Contact Number</div>
              <div class="font-medium text-gray-900 flex items-center gap-2">
                {{ request.contactNumber }}
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-clipboard"
                  size="xs"
                  square
                  @click="copyToClipboard(request.contactNumber)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Information -->
        <div class="space-y-4">
          <h4 class="flex items-center gap-2 text-base font-semibold text-gray-900">
            <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-gray-400"/>
            Additional Information
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="space-y-1">
              <div class="text-sm font-medium text-gray-500">How did they find us?</div>
              <div class="font-medium text-gray-900">{{ request.referralSource }}</div>
            </div>
            <div class="space-y-1">
              <div class="text-sm font-medium text-gray-500">Request Timeline</div>
              <div class="space-y-2">
                <div class="flex items-center gap-2 text-gray-900">
                  <UIcon name="i-heroicons-clock" class="w-4 h-4 text-gray-400"/>
                  <span class="text-sm">Requested: {{ formatDate(request.requestedAt) }}</span>
                </div>
                <div v-if="request.status === 'Accepted'" class="flex items-center gap-2 text-gray-900">
                  <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-green-500"/>
                  <span class="text-sm">Accepted: {{ formatDate(request.acceptedAt) }}</span>
                </div>
              </div>
            </div>
            <div v-if="request.status === 'Accepted'" class="col-span-2 space-y-1">
              <div class="text-sm font-medium text-gray-500">Invitation Status</div>
              <UBadge
                :color="getInvitationStatusColor(request.invitationStatus)"
                size="md"
                variant="soft"
                class="px-2.5"
              >
                <div class="flex items-center gap-1.5">
                  <UIcon
                    :name="getInvitationStatusIcon(request.invitationStatus)"
                    class="w-4 h-4"
                  />
                  {{ request.invitationStatus || 'Not Sent' }}
                </div>
              </UBadge>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100">
          <UButton
            color="gray"
            variant="ghost"
            @click="isOpen = false"
            class="w-full sm:w-auto px-4"
          >
            Close
          </UButton>
          <template v-if="request.status === 'Pending'">
            <UButton
              color="red"
              variant="soft"
              @click="emit('reject', request)"
              class="w-full sm:w-auto px-4"
            >
              <template #leading>
                <UIcon name="i-heroicons-x-mark" />
              </template>
              Reject
            </UButton>
            <UButton
              color="primary"
              @click="emit('accept', request)"
              class="w-full sm:w-auto px-4"
            >
              <template #leading>
                <UIcon name="i-heroicons-check" />
              </template>
              Accept
            </UButton>
          </template>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import type { JoinRequest } from '~/composables/useJoinRequests'

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

const formatDateRelative = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
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

const getStatusIcon = (status: JoinRequest['status']): string => {
  const icons: Record<JoinRequest['status'], string> = {
    'Pending': 'i-heroicons-clock',
    'Accepted': 'i-heroicons-check-circle',
    'Rejected': 'i-heroicons-x-circle'
  }
  return icons[status] || 'i-heroicons-question-mark-circle'
}

const getInvitationStatusColor = (status: JoinRequest['invitationStatus']): StatusColor => {
  const colors: Record<NonNullable<JoinRequest['invitationStatus']>, StatusColor> = {
    'Sent': 'blue',
    'Accepted': 'green',
    'Expired': 'yellow'
  }
  return status ? colors[status] || 'gray' : 'gray'
}

const getInvitationStatusIcon = (status: JoinRequest['invitationStatus']): string => {
  const icons: Record<NonNullable<JoinRequest['invitationStatus']>, string> = {
    'Sent': 'i-heroicons-envelope',
    'Accepted': 'i-heroicons-check-circle',
    'Expired': 'i-heroicons-clock'
  }
  return status ? icons[status] || 'i-heroicons-minus-circle' : 'i-heroicons-minus-circle'
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
}
</script>

<style scoped>
.modal-card-enter-active,
.modal-card-leave-active {
  transition: transform 0.3s ease;
}

.modal-card-enter-from,
.modal-card-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>