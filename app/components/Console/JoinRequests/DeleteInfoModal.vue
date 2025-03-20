<template>
  <UModal
    v-model="isOpen"
    :ui="{ 
      width: 'w-full sm:max-w-xl',
      container: 'items-center',
      wrapper: 'sm:p-4',
      base: 'relative overflow-hidden sm:rounded-2xl',
      padding: 'p-0',
      background: 'bg-white',
      ring: 'ring-1 ring-gray-200',
      rounded: 'sm:rounded-2xl'
    }"
  >
    <UCard class="shadow-none border-none">
      <template #header>
        <div class="flex items-center gap-3 pb-4 border-b border-gray-100">
          <UIcon
            name="i-heroicons-information-circle"
            class="w-6 h-6 text-blue-500"
          />
          <div>
            <h3 class="text-lg font-semibold tracking-tight">About Deleting Join Requests</h3>
            <p class="text-sm text-gray-500">Important information about this action</p>
          </div>
        </div>
      </template>

      <div class="py-4 space-y-4">
        <div class="space-y-2">
          <h4 class="font-medium text-gray-900">What happens when you delete a join request?</h4>
          <p class="text-sm text-gray-600">
            Deleting a join request will completely remove the record from our database. This action is permanent and cannot be undone.
          </p>
        </div>

        <div class="space-y-2">
          <h4 class="font-medium text-gray-900">What about previously accepted/rejected requests?</h4>
          <ul class="text-sm text-gray-600 space-y-2">
            <li class="flex gap-2">
              <UIcon name="i-heroicons-x-circle" class="w-5 h-5 text-red-500 flex-shrink-0" />
              <span>For <strong>rejected requests</strong>: Deleting will not affect any notifications already sent to the student about the rejection.</span>
            </li>
            <li class="flex gap-2">
              <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>For <strong>accepted requests</strong>: Deleting will not affect any invitations already sent or student accounts already created.</span>
            </li>
          </ul>
        </div>

        <div class="space-y-2">
          <h4 class="font-medium text-gray-900">Managing Student Invitations</h4>
          <p class="text-sm text-gray-600">
            To manage student invitations and accounts, please use the Student Management page instead of deleting join requests.
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <UButton
            color="gray"
            variant="ghost"
            @click="isOpen = false"
          >
            Close
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});
</script>