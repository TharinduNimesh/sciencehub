<template>
  <UModal v-model="isOpen" :ui="{
    width: 'w-full sm:max-w-xl',
    container: 'items-center',
    padding: 'p-0'
  }">
    <UCard class="shadow-none border-none">
      <template #header>
        <div class="flex items-center gap-3 pb-4 border-b border-gray-100">
          <UIcon name="i-heroicons-user-plus" class="w-6 h-6 text-primary-500" />
          <div>
            <h3 class="text-lg font-semibold tracking-tight">Invite New Student</h3>
            <p class="text-sm text-gray-500">Send invitation to join the platform</p>
          </div>
        </div>
      </template>

      <div class="py-4 px-6">
        <form @submit.prevent="handleInvite" class="space-y-4">
          <UFormGroup label="Student Name" required>
            <UInput v-model="form.name" placeholder="Enter student's full name" />
          </UFormGroup>

          <UFormGroup label="Email Address" required>
            <UInput v-model="form.email" type="email" placeholder="Enter student's email address" />
          </UFormGroup>

          <UFormGroup label="Grade" required>
            <USelectMenu v-model="form.grade" :options="gradeOptions" placeholder="Select student's grade"
              value-attribute="value" />
          </UFormGroup>
        </form>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <UButton color="gray" variant="ghost" @click="isOpen = false">
            Cancel
          </UButton>
          <UButton color="primary" @click="handleInvite">
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
  'invite': [form: { name: string, email: string, grade: number | undefined }]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const form = ref<{ name: string, email: string, grade: number | undefined }>({
  name: '',
  email: '',
  grade: undefined
})

const gradeOptions = [
  { label: 'Grade 6', value: 6 },
  { label: 'Grade 7', value: 7 },
  { label: 'Grade 8', value: 8 },
  { label: 'Grade 9', value: 9 },
  { label: 'Grade 10', value: 10 },
  { label: 'Grade 11', value: 11 },
  { label: 'Grade 12', value: 12 },
  { label: 'Grade 13', value: 13 }
]

const handleInvite = () => {
  emit('invite', form.value)
  form.value = {
    name: '',
    email: '',
    grade: undefined
  }
  isOpen.value = false
}
</script>