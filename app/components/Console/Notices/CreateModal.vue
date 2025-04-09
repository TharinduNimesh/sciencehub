<template>
  <USlideover
    :model-value="modelValue"
    @update:model-value="$emit('update:model-value', $event)"
    :ui="{
      width: 'sm:max-w-2xl',
      overlay: { background: 'bg-gray-950/50' },
      background: 'bg-white dark:bg-gray-900',
      padding: 'p-0',
      base: 'relative z-50 flex flex-col h-screen shadow-xl',
    }"
    @before-enter="handleBeforeEnter"
    @after-leave="handleAfterLeave"
    :prevent-close="isCreating"
  >
    <!-- Header -->
    <div class="flex-none px-6 py-5 border-b border-gray-200 dark:border-gray-800">
      <div class="flex items-center justify-between">
        <div class="flex flex-col gap-1">
          <h3 class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
            Create Notice
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Create and publish a new notice
          </p>
        </div>
        <UButton
          ref="closeButtonRef"
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark-20-solid"
          class="flex-none"
          @click="$emit('update:model-value', false)"
        />
      </div>
    </div>

    <!-- Form Content -->
    <div class="flex-1 px-6 py-5 overflow-y-auto">
      <UForm :state="form" class="space-y-6" @submit="handleCreate">
        <UFormGroup label="Title" required>
          <UInput v-model="form.title" placeholder="Enter notice title" />
        </UFormGroup>

        <UFormGroup label="Description" required>
          <UTextarea 
            v-model="form.description" 
            placeholder="Enter notice description"
            :ui="{ 
              height: 'h-24',
              base: 'block w-full rounded-md text-gray-900 dark:text-white shadow-sm'
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
            value-attribute="value"
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

        <UFormGroup 
          label="Image URL" 
          help="Provide a URL to an image for the notice (optional)"
        >
          <UInput
            v-model="form.url"
            type="url"
            placeholder="https://example.com/image.jpg"
            icon="i-heroicons-photo"
          />
        </UFormGroup>
      </UForm>
    </div>

    <!-- Footer -->
    <div class="flex-none px-6 py-5 border-t border-gray-200 dark:border-gray-800">
      <div class="flex justify-end gap-3">
        <UButton
          color="gray"
          variant="ghost"
          label="Cancel"
          @click="$emit('update:model-value', false)"
        />
        <UButton
          ref="submitButtonRef"
          color="primary"
          :loading="isCreating"
          label="Create Notice"
          icon="i-heroicons-plus"
          @click="handleCreate"
        />
      </div>
    </div>
  </USlideover>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import type { ResourceFormData } from '~/types/resource'
import { useNotification } from '~/composables/useNotification'
import { useClasses } from '~/composables/useClasses'
import { useResources } from '~/composables/useResources'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:model-value': [value: boolean]
  'created': []
}>()

const notification = useNotification()
const { getActiveClasses, loading: loadingClasses } = useClasses()
const { createResource, loading: creatingResource } = useResources()

const closeButtonRef = ref<HTMLButtonElement | null>(null)
const submitButtonRef = ref<HTMLButtonElement | null>(null)
const previousFocus = ref<HTMLElement | null>(null)
const isCreating = ref(false)

const form = ref<ResourceFormData>({
  title: '',
  description: '',
  classes: [],
  type: 'notice',
  resource_type: 'Image', // Notice type is always Image
  url: ''
})

// Class options state
const classOptions = ref<{ label: string; value: string }[]>([])

// Load classes on component mount
onMounted(async () => {
  try {
    const classes = await getActiveClasses()
    classOptions.value = classes.map(cls => ({
      label: `${cls.name} - Grade ${cls.grade}`,
      value: cls.id.toString()
    }))
  } catch (error) {
    console.error('Error loading classes:', error)
    notification.showError('Failed to load classes')
  }
})

// Reset form when modal opens/closes
watch(
  () => props.modelValue,
  (newModelValue) => {
    if (newModelValue) {
      resetForm()
    }
  },
  { immediate: true }
)

// Focus management
const handleBeforeEnter = () => {
  previousFocus.value = document.activeElement as HTMLElement
}

const handleAfterLeave = () => {
  if (previousFocus.value && typeof previousFocus.value.focus === 'function') {
    nextTick(() => {
      previousFocus.value?.focus()
    })
  }
}

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
    if (!form.value.url) {
      throw new Error('Please upload a notice image')
    }

    await createResource({
      ...form.value,
      type: 'notice',
      resource_type: 'Image' // Enforce Image type for notices
    })

    notification.showSuccess('Notice created successfully')
    emit('created')
    emit('update:model-value', false)
    resetForm()
  } catch (error: any) {
    notification.showError(error.message || 'Failed to create notice')
  } finally {
    isCreating.value = false
  }
}

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    classes: [],
    type: 'notice',
    resource_type: 'Image',
    url: ''
  }
}
</script>