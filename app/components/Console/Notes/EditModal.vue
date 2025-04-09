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
    :prevent-close="isUpdating"
  >
    <!-- Header -->
    <div class="flex-none px-6 py-5 border-b border-gray-200 dark:border-gray-800">
      <div class="flex items-center justify-between">
        <div class="flex flex-col gap-1">
          <h3 class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
            Edit Note
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Update learning note details
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
      <UForm :state="form" class="space-y-6" @submit="handleUpdate">
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

        <UFormGroup label="Resource Type" required help="Select the type of resource">
          <USelectMenu
            v-model="form.resource_type"
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
          :help="getUrlHelp(form.resource_type)"
        >
          <UInput
            v-model="form.url"
            type="url"
            :placeholder="getUrlPlaceholder(form.resource_type)"
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
          :loading="isUpdating"
          label="Update Note"
          icon="i-heroicons-check"
          @click="handleUpdate"
        />
      </div>
    </div>
  </USlideover>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import type { Resource, ResourceType, ResourceFormData } from '~/types/resource'
import { useNotification } from '~/composables/useNotification'
import { useClasses } from '~/composables/useClasses'
import { useResources } from '~/composables/useResources'

const props = defineProps<{
  modelValue: boolean
  note: Resource
}>()

const emit = defineEmits<{
  'update:model-value': [value: boolean]
  'updated': []
}>()

const notification = useNotification()
const { getActiveClasses } = useClasses()
const { updateResource } = useResources()

const closeButtonRef = ref<HTMLButtonElement | null>(null)
const submitButtonRef = ref<HTMLButtonElement | null>(null)
const previousFocus = ref<HTMLElement | null>(null)
const isUpdating = ref(false)

// Update the form interface to match what we need
interface NoteFormData extends ResourceFormData {
  // Keep the existing properties but override classes
  classes: string[] // These will be IDs as strings
}

const form = ref<NoteFormData>({
  title: '',
  description: '',
  classes: [],
  type: 'resource',
  resource_type: 'Document',
  url: ''
})

// Resource type options with strict typing
const resourceTypeOptions = ref([
  { label: 'Document', value: 'Document' as ResourceType },
  { label: 'Video', value: 'Video' as ResourceType },
  { label: 'Image', value: 'Image' as ResourceType },
  { label: 'Link', value: 'Link' as ResourceType }
])

// Class options state
const classOptions = ref<{ label: string; value: string }[]>([])

// Helper function to initialize form data
const initializeForm = (note: Resource) => {
  form.value = {
    title: note.title,
    description: note.description || '',
    // Use the classIds array we added to the resource type
    classes: note.classIds?.map(id => id.toString()) || [],
    type: 'resource',
    resource_type: note.resource_type,
    url: note.url
  }
}

// When class options are loaded
onMounted(async () => {
  try {
    const classes = await getActiveClasses()
    classOptions.value = classes.map(cls => ({
      label: `Grade ${cls.grade} - ${cls.name}`,
      value: cls.id.toString()
    }))

    // Initialize form with note data including class selections
    if (props.note) {
      initializeForm(props.note)
    }
  } catch (error) {
    console.error('Error loading classes:', error)
    notification.showError('Failed to load classes')
  }
})

// Update form when note prop changes
watch(
  () => props.note,
  (newNote) => {
    if (newNote) {
      initializeForm(newNote)
    }
  },
  { immediate: true }
)

// Helper functions for resource type UI
const getResourceTypeIcon = (type: ResourceType) => {
  const icons: Record<ResourceType, string> = {
    'Document': 'i-heroicons-document-text',
    'Video': 'i-heroicons-video-camera',
    'Image': 'i-heroicons-photo',
    'Link': 'i-heroicons-link'
  }
  return icons[type] || 'i-heroicons-document'
}

const getUrlHelp = (type: ResourceType): string => {
  const helpText: Record<ResourceType, string> = {
    'Document': 'Enter the URL to the document (PDF, DOCX, etc.)',
    'Video': 'Enter the YouTube video URL',
    'Image': 'Enter the URL to the image',
    'Link': 'Enter the URL to the resource'
  }
  return helpText[type] || 'Enter the resource URL'
}

const getUrlPlaceholder = (type: ResourceType): string => {
  const placeholders: Record<ResourceType, string> = {
    'Document': 'https://example.com/document.pdf',
    'Video': 'https://youtube.com/watch?v=...',
    'Image': 'https://example.com/diagram.jpg',
    'Link': 'https://example.com/resource'
  }
  return placeholders[type] || 'https://example.com'
}

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

const handleUpdate = async () => {
  try {
    isUpdating.value = true

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
    if (!form.value.resource_type) {
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

    await updateResource(props.note.id, {
      title: form.value.title,
      description: form.value.description,
      type: 'resource',
      resource_type: form.value.resource_type,
      url: form.value.url,
      classes: form.value.classes
    })

    notification.showSuccess('Note updated successfully')
    emit('updated')
    emit('update:model-value', false)
  } catch (error: any) {
    notification.showError(error.message || 'Failed to update note')
  } finally {
    isUpdating.value = false
  }
}
</script>