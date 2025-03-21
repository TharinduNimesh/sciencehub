<template>
  <UModal
    v-model="isOpen"
    :ui="{
      width: 'w-full sm:max-w-xl',
      container: 'items-center',
      padding: 'p-0'
    }"
  >
    <UCard class="shadow-none border-none">
      <template #header>
        <div class="flex items-center gap-3 pb-4 border-b border-gray-100">
          <UIcon
            name="i-heroicons-user-plus"
            class="w-6 h-6 text-primary-500"
          />
          <div>
            <h3 class="text-lg font-semibold tracking-tight">Invite New Student</h3>
            <p class="text-sm text-gray-500">Send invitation to join the platform</p>
          </div>
        </div>
      </template>

      <div class="py-4">
        <p class="text-gray-500">Invitation form will be implemented here</p>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <UButton
            color="gray"
            variant="ghost"
            @click="isOpen = false"
          >
            Cancel
          </UButton>
          <UButton
            color="primary"
            @click="handleInvite"
          >
            Send Invitation
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'invite': []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleInvite = () => {
  emit('invite')
  isOpen.value = false
}
</script>