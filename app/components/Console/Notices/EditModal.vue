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
            Edit Notice
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Update notice details
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
          help="Provide a URL to an image for the notice"
          required
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
          :loading="isUpdating"
          label="Update Notice"
          icon="i-heroicons-check"
          @click="handleUpdate"
        />
      </div>
    </div>
  </USlideover>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import { useNotification } from '~/composables/useNotification'
import { useClasses } from '~/composables/useClasses'
import { useResources } from '~/composables/useResources'
import type { Notice, ResourceFormData } from '~/types/resource'

// Update the form interface to match what we need
interface NoticeFormData extends ResourceFormData {
  // Keep the existing properties but override classes
  classes: string[] // These will be IDs as strings
}

const props = defineProps<{
  modelValue: boolean
  notice: Notice
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

const form = ref<NoticeFormData>({
  title: '',
  description: '',
  classes: [],
  type: 'notice',
  resource_type: 'Image',
  url: ''
})

// Class options state
const classOptions = ref<{ label: string; value: string }[]>([])

// Helper function to initialize form data
const initializeForm = (notice: Notice) => {
  form.value = {
    title: notice.title,
    description: notice.description || '',
    // Use the classIds array we added to the resource type
    classes: notice.classIds?.map(id => id.toString()) || [],
    type: 'notice',
    resource_type: 'Image',
    url: notice.url
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

    // Initialize form with notice data including class selections
    if (props.notice) {
      initializeForm(props.notice)
    }
  } catch (error) {
    console.error('Error loading classes:', error)
    notification.showError('Failed to load classes')
  }
})

// Update form when notice prop changes
watch(
  () => props.notice,
  (newNotice) => {
    if (newNotice) {
      initializeForm(newNotice)
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

const handleUpdate = async () => {
  try {
    isUpdating.value = true

    // Validate form
    if (!form.value.title.trim()) {
      throw new Error('Title is required')
    }
    if (!form.value.description?.trim()) {
      throw new Error('Description is required')
    }
    if (!form.value.classes.length) {
      throw new Error('Please select at least one class')
    }
    if (!form.value.url) {
      throw new Error('Please provide an image URL for the notice')
    }

    // Validate URL
    try {
      new URL(form.value.url)
    } catch {
      throw new Error('Please enter a valid image URL')
    }

    await updateResource(props.notice.id, {
      title: form.value.title,
      description: form.value.description,
      type: 'notice',
      resource_type: 'Image',
      url: form.value.url,
      classes: form.value.classes // The type conversion happens in useResources
    })

    notification.showSuccess('Notice updated successfully')
    emit('updated')
    emit('update:model-value', false)
  } catch (error: any) {
    notification.showError(error.message || 'Failed to update notice')
  } finally {
    isUpdating.value = false
  }
}
</script>