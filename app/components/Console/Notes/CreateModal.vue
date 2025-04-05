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
            Add Learning Note
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Add a new educational resource
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
          <UInput v-model="form.title" placeholder="Enter note title" />
        </UFormGroup>

        <UFormGroup label="Description" required>
          <UTextarea 
            v-model="form.description" 
            placeholder="Enter note description"
            :ui="{ 
              height: 'h-24',
              base: 'block w-full rounded-md text-gray-900 dark:text-white shadow-sm'
            }"
          />
        </UFormGroup>

        <UFormGroup label="Classes" required help="Select the classes this note applies to">
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

        <UFormGroup label="Resource Type" required help="Select the type of resource you want to share">
          <USelectMenu
            v-model="form.type"
            :options="resourceTypeOptions"
            value-attribute="value"
            placeholder="Select resource type"
          >
            <template #option="{ option }">
              <div class="flex items-center gap-2">
                <UIcon :name="getResourceTypeIcon(option.value)" class="w-5 h-5 text-gray-400" />
                <span>{{ option.label }}</span>
              </div>
            </template>
          </USelectMenu>
        </UFormGroup>

        <UFormGroup 
          label="Resource URL" 
          required
          :help="getUrlHelp(form.type)"
        >
          <UInput
            v-model="form.url"
            type="url"
            :placeholder="getUrlPlaceholder(form.type)"
            icon="i-heroicons-link"
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
          label="Add Note"
          icon="i-heroicons-plus"
          @click="handleCreate"
        />
      </div>
    </div>
  </USlideover>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useNotification } from '~/composables/useNotification'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:model-value': [value: boolean]
  'created': []
}>()

const notification = useNotification()

// Add refs for focus management
const closeButtonRef = ref<HTMLButtonElement | null>(null)
const submitButtonRef = ref<HTMLButtonElement | null>(null)
const previousFocus = ref<HTMLElement | null>(null)

const isCreating = ref(false)

const form = ref({
  title: '',
  description: '',
  classes: [] as string[],
  type: '',
  url: ''
})

// Focus management handlers
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

// Dummy class options - replace with actual data
const classOptions = [
  { label: 'Grade 11 - Physics', value: 'Grade 11 - Physics' },
  { label: 'Grade 11 - Chemistry', value: 'Grade 11 - Chemistry' },
  { label: 'Grade 10 - Physics', value: 'Grade 10 - Physics' },
  { label: 'Grade 10 - Chemistry', value: 'Grade 10 - Chemistry' }
]

const resourceTypeOptions = [
  { label: 'Document', value: 'Document', help: 'Share a link to a PDF, DOC, or presentation' },
  { label: 'Video', value: 'Video', help: 'Share a link to an educational video' },
  { label: 'Image', value: 'Image', help: 'Share a link to an educational image or diagram' },
  { label: 'Link', value: 'Link', help: 'Share a link to any other educational resource' }
]

const getResourceTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    'Document': 'i-heroicons-document-text',
    'Video': 'i-heroicons-video-camera',
    'Image': 'i-heroicons-photo',
    'Link': 'i-heroicons-link'
  }
  return icons[type] || 'i-heroicons-document'
}

const getUrlHelp = (type: string): string => {
  const helpText: Record<string, string> = {
    'Document': 'Enter the URL of the document (PDF, DOC, PPT, etc.)',
    'Video': 'Enter the URL of the video (YouTube, Vimeo, etc.)',
    'Image': 'Enter the URL of the image',
    'Link': 'Enter the URL of the educational resource'
  }
  return helpText[type] || 'Enter the resource URL'
}

const getUrlPlaceholder = (type: string): string => {
  const placeholders: Record<string, string> = {
    'Document': 'https://example.com/document.pdf',
    'Video': 'https://youtube.com/watch?v=...',
    'Image': 'https://example.com/diagram.jpg',
    'Link': 'https://example.com/resource'
  }
  return placeholders[type] || 'https://example.com'
}

// Reset form when modal opens/closes
watch(
  () => props.modelValue,
  (newModelValue) => {
    if (newModelValue) {
      form.value = {
        title: '',
        description: '',
        classes: [],
        type: '',
        url: ''
      }
    }
  },
  { immediate: true }
)

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
    if (!form.value.type) {
      throw new Error('Please select a resource type')
    }
    if (!form.value.url) {
      throw new Error('Please enter a valid resource URL')
    }

    // Validate URL
    try {
      new URL(form.value.url)
    } catch {
      throw new Error('Please enter a valid URL')
    }

    // TODO: Implement actual creation logic here
    await new Promise(resolve => setTimeout(resolve, 1000))

    notification.showSuccess('Note created successfully')
    emit('created')
    emit('update:model-value', false)
    
    // Reset form
    form.value = {
      title: '',
      description: '',
      classes: [],
      type: '',
      url: ''
    }
  } catch (error: any) {
    notification.showError(error.message || 'Failed to create note')
  } finally {
    isCreating.value = false
  }
}
</script>