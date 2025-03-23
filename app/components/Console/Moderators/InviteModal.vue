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
            <h3 class="text-lg font-semibold tracking-tight">Invite New Moderator</h3>
            <p class="text-sm text-gray-500">Send invitation to join as a moderator</p>
          </div>
        </div>
      </template>

      <div class="py-4 px-6">
        <form @submit.prevent="handleInvite" class="space-y-4">
          <UFormGroup label="Moderator Name" required>
            <UInput v-model="form.name" placeholder="Enter moderator's full name" />
          </UFormGroup>

          <UFormGroup label="Email Address" required>
            <UInput v-model="form.email" type="email" placeholder="Enter moderator's email address" />
          </UFormGroup>

          <UFormGroup label="Classes" help="You can always assign or remove classes to the moderator later.">
            <USelectMenu
              v-model="form.classes"
              :options="classOptions"
              multiple
              placeholder="Select classes (optional)"
              searchable
              searchPlaceholder="Search classes..."
            >
              <template #option="{ option }">
                <span class="truncate">{{ option.label }}</span>
                <UBadge
                  v-if="form.classes.includes(option.value)"
                  class="ml-2"
                  color="primary"
                  size="xs"
                  variant="soft"
                >
                  Selected
                </UBadge>
              </template>
            </USelectMenu>
            <small v-if="form.classes.length" class="mt-2 text-gray-500">
              {{ form.classes.length }} class(es) selected
            </small>
          </UFormGroup>

          <UFormGroup label="Invitation Expires In" required>
            <USelectMenu
              v-model="form.expiresIn"
              :options="expiryOptions"
              placeholder="Select expiration period"
              value-attribute="value"
            />
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
  'invite': [form: { 
    name: string
    email: string
    classes: Array<{ id: number; name: string }>
    expiresIn: number
  }]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const form = ref<{ 
  name: string
  email: string
  classes: Array<{ id: number; name: string }>
  expiresIn: number
}>({
  name: '',
  email: '',
  classes: [],
  expiresIn: 7
})

const classOptions = [
  { label: 'Grade 11 - Revision', value: { id: 1, name: 'Grade 11 - Revision' } },
  { label: 'Grade 11 - Theory', value: { id: 2, name: 'Grade 11 - Theory' } },
  { label: 'Grade 10 - Revision', value: { id: 3, name: 'Grade 10 - Revision' } },
  { label: 'Grade 10 - Theory', value: { id: 4, name: 'Grade 10 - Theory' } }
]

const expiryOptions = [
  { label: '24 Hours', value: 1 },
  { label: '3 Days', value: 3 },
  { label: '7 Days', value: 7 },
  { label: '14 Days', value: 14 },
  { label: '30 Days', value: 30 },
  { label: '60 Days', value: 60 }
]

const handleInvite = () => {
  emit('invite', form.value)
  form.value = {
    name: '',
    email: '',
    classes: [],
    expiresIn: 7
  }
  isOpen.value = false
}
</script>