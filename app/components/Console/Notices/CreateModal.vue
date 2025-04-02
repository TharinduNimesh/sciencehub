<template>
  <UModal v-model="isOpen" :ui="{
    width: 'w-full sm:max-w-xl',
    container: 'items-center',
    padding: 'p-0'
  }">
    <UCard class="shadow-none border-none">
      <template #header>
        <div class="flex items-center gap-3 pb-4 border-b border-gray-100">
          <UIcon name="i-heroicons-megaphone" class="w-6 h-6 text-primary-500" />
          <div>
            <h3 class="text-lg font-semibold tracking-tight">Create Notice</h3>
            <p class="text-sm text-gray-500">Create and publish a new notice</p>
          </div>
        </div>
      </template>

      <div class="py-4 px-6">
        <form @submit.prevent="handleCreate" class="space-y-4">
          <UFormGroup label="Title" required>
            <UInput v-model="form.title" placeholder="Enter notice title" />
          </UFormGroup>

          <UFormGroup label="Description" required>
            <UTextarea 
              v-model="form.description" 
              placeholder="Enter notice description"
              :ui="{ 
                height: 'h-24',
                base: 'block w-full rounded-md text-gray-900 shadow-sm'
              }"
            />
          </UFormGroup>

          <UFormGroup label="Classes" required help="Select the classes this notice applies to">
            <USelectMenu
              v-model="form.classes"
              :options="classOptions"
              multiple
              placeholder="Select classes"
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

          <UFormGroup label="Image" help="Upload an image for the notice (optional)">
            <UFileInput
              v-model="form.image"
              :ui="{ 
                wrapper: 'flex items-center gap-2',
                base: 'relative block w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 text-center',
                input: 'hidden',
                file: {
                  base: 'max-w-[200px]',
                  icon: 'flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-500',
                  name: 'text-sm text-gray-600 dark:text-gray-400 truncate'
                }
              }"
              accept="image/*"
              placeholder="Click to upload or drag and drop"
              size="lg"
            />
          </UFormGroup>
        </form>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <UButton color="gray" variant="ghost" @click="isOpen = false">
            Cancel
          </UButton>
          <UButton color="primary" @click="handleCreate" :loading="isCreating">
            Create Notice
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useNotification } from '~/composables/useNotification'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'created': []
}>()

const notification = useNotification()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isCreating = ref(false)

const form = ref({
  title: '',
  description: '',
  classes: [] as string[],
  image: null as File | null
})

// Dummy class options - replace with actual data
const classOptions = [
  { label: 'Grade 11 - Physics', value: 'Grade 11 - Physics' },
  { label: 'Grade 11 - Chemistry', value: 'Grade 11 - Chemistry' },
  { label: 'Grade 10 - Physics', value: 'Grade 10 - Physics' },
  { label: 'Grade 10 - Chemistry', value: 'Grade 10 - Chemistry' }
]

const handleCreate = async () => {
  try {
    isCreating.value = true

    // Validate form
    if (!form.value.title.trim()) {
      throw new Error('Title is required')
    }
    if (!form.value.description.trim()) {
      throw new Error('Description is required')
    }
    if (!form.value.classes.length) {
      throw new Error('Please select at least one class')
    }

    // TODO: Implement actual creation logic here
    await new Promise(resolve => setTimeout(resolve, 1000))

    notification.showSuccess('Notice created successfully')
    emit('created')
    isOpen.value = false
    
    // Reset form
    form.value = {
      title: '',
      description: '',
      classes: [],
      image: null
    }
  } catch (error: any) {
    notification.showError(error.message || 'Failed to create notice')
  } finally {
    isCreating.value = false
  }
}
</script>