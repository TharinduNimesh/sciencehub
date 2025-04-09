<template>
  <!-- Add confirmation dialog at the top level of the template -->
  <ConfirmationDialog
    v-model="showDeleteConfirmation"
    title="Delete Note"
    description="Are you sure you want to delete this note? This action cannot be undone."
    type="danger"
    confirm-text="Delete"
    @confirm="confirmDelete"
  />

  <!-- Add edit modal -->
  <ConsoleNotesEditModal
    v-model="isEditModalOpen"
    :note="note"
    @updated="emit('edit', note)"
  />
  
  <UCard class="group transition-all duration-200 hover:shadow-lg hover:border-primary-100 relative overflow-hidden">
    <div class="space-y-4">
      <!-- Header with Icon -->
      <div class="flex items-start gap-6">
        <!-- Left side with type icon -->
        <div class="flex-shrink-0">
          <div
            class="w-14 h-14 flex items-center justify-center rounded-xl"
            :class="{
              'bg-blue-50 text-blue-500': note.resource_type === 'Document',
              'bg-red-50 text-red-500': note.resource_type === 'Video',
              'bg-green-50 text-green-500': note.resource_type === 'Image',
              'bg-purple-50 text-purple-500': note.resource_type === 'Link',
              'bg-gray-50 text-gray-500': !note.resource_type
            }"
          >
            <UIcon
              :name="getResourceTypeIcon(note.resource_type)"
              class="text-2xl"
            />
          </div>
        </div>

        <!-- Title and Date -->
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold group-hover:text-primary-600 transition-colors">{{ note.title }}</h3>
          <p class="text-sm text-gray-500">{{ formatDate(note.createdAt) }}</p>
        </div>
      </div>

      <!-- Description with truncation -->
      <p class="text-gray-600 line-clamp-2">{{ note.description }}</p>

      <!-- Classes -->
      <div class="flex flex-wrap gap-2">
        <UBadge 
          color="primary"
          variant="soft" 
          size="xs"
          class="group-hover:border-primary-200 transition-colors font-medium"
        >
          {{ classDisplay }}
        </UBadge>
      </div>

      <!-- Action Buttons and Resource Button -->
      <div class="pt-4 mt-auto border-t border-gray-100 flex items-center justify-between">
        <!-- Resource Action Button -->
        <UButton
          :color="getResourceActionColor(note.resource_type)"
          :variant="getResourceActionVariant()"
          :icon="getResourceActionIcon(note.resource_type)"
          size="sm"
          class="text-sm font-medium group"
          :class="getResourceActionClass(note.resource_type)"
          @click="handleResourceAction(note)"
        >
          <span class="flex items-center gap-2 justify-center">
            {{ getResourceActionLabel(note.resource_type) }}
            <UIcon 
              name="i-heroicons-arrow-right" 
              class="w-4 h-4 transition-transform group-hover:translate-x-0.5" 
            />
          </span>
        </UButton>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2">
          <UTooltip text="Edit note" :popper="{ arrow: true }">
            <UButton
              color="orange"
              variant="soft"
              icon="i-heroicons-pencil-square"
              :ui="{ rounded: 'rounded-full' }"
              size="sm"
              @click="handleEditClick(note)"
            />
          </UTooltip>
          <UTooltip text="Delete note" :popper="{ arrow: true }">
            <UButton
              color="red"
              variant="soft"
              icon="i-heroicons-trash"
              :ui="{ rounded: 'rounded-full' }"
              size="sm"
              @click="handleDeleteClick(note)"
            />
          </UTooltip>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { BadgeColor, ButtonColor, ButtonVariant } from '#ui/types'
import type { Resource, ResourceType } from '~/types/resource'
import ConfirmationDialog from '~/components/Common/ConfirmationDialog.vue'

const showDeleteConfirmation = ref(false)
const noteToDelete = ref<Resource | null>(null)
const isEditModalOpen = ref(false)

const props = defineProps<{
  note: Resource
}>()

const emit = defineEmits<{
  (e: 'view', note: Resource): void
  (e: 'edit', note: Resource): void
  (e: 'delete', note: Resource): void
}>()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatClassName = (className: string): string => {
  const parts = className.split(' - ')
  if (parts.length >= 2 && parts[0]) {
    const gradeMatch = parts[0].match(/\d+/)
    const grade = gradeMatch ? gradeMatch[0] : ''
    return `G${grade} ${parts[1]}`
  }
  return className
}

// Add computed property for class display
const classDisplay = computed(() => {
  if (!props.note.classes?.length) return 'No Class'
  
  const firstClass = props.note.classes[0]
  if (!firstClass) return 'No Class'
  
  if (props.note.classes.length === 1) {
    return formatClassName(firstClass)
  }
  
  return `${formatClassName(firstClass)} and ${props.note.classes.length - 1} more`
})

const getResourceTypeIcon = (resourceType: ResourceType): string => {
  const icons: Record<ResourceType, string> = {
    'Document': 'i-heroicons-document-text',
    'Video': 'i-heroicons-video-camera',
    'Image': 'i-heroicons-photo',
    'Link': 'i-heroicons-link'
  }
  return icons[resourceType] || 'i-heroicons-document'
}

const getResourceActionColor = (resourceType: ResourceType): ButtonColor => {
  const colors: Record<ResourceType, ButtonColor> = {
    'Document': 'blue',
    'Video': 'red',
    'Image': 'green',
    'Link': 'purple'
  }
  return colors[resourceType] || 'gray'
}

const getResourceActionVariant = (): ButtonVariant => {
  return 'soft'
}

const getResourceActionIcon = (resourceType: ResourceType): string => {
  const icons: Record<ResourceType, string> = {
    'Document': 'i-heroicons-arrow-down-tray',
    'Video': 'i-heroicons-play',
    'Image': 'i-heroicons-eye',
    'Link': 'i-heroicons-arrow-top-right-on-square'
  }
  return icons[resourceType] || 'i-heroicons-arrow-right'
}

const getResourceActionLabel = (resourceType: ResourceType): string => {
  const labels: Record<ResourceType, string> = {
    'Document': 'Download',
    'Video': 'Watch Video',
    'Image': 'View Image',
    'Link': 'Open Link'
  }
  return labels[resourceType] || 'View'
}

const getResourceActionClass = (resourceType: ResourceType): string => {
  const classes: Record<ResourceType, string> = {
    'Document': 'hover:bg-blue-50',
    'Video': 'hover:bg-red-50',
    'Image': 'hover:bg-green-50',
    'Link': 'hover:bg-purple-50'
  }
  return classes[resourceType] || ''
}

const handleResourceAction = (note: Resource) => {
  if (note.resource_type === 'Link') {
    window.open(note.url, '_blank')
  } else {
    emit('view', note)
  }
}

const handleDeleteClick = (note: Resource) => {
  noteToDelete.value = note
  showDeleteConfirmation.value = true
}

const handleEditClick = (note: Resource) => {
  isEditModalOpen.value = true
}

const confirmDelete = () => {
  if (noteToDelete.value) {
    emit('delete', noteToDelete.value)
    showDeleteConfirmation.value = false
    noteToDelete.value = null
  }
}

const getNoteActions = (note: Resource) => {
  return [
    [{
      label: 'View',
      icon: 'i-heroicons-eye',
      click: () => emit('view', note)
    }],
    [{
      label: 'Edit',
      icon: 'i-heroicons-pencil-square',
      click: () => emit('edit', note)
    }],
    [{
      label: 'Delete',
      icon: 'i-heroicons-trash',
      color: 'red',
      click: () => emit('delete', note)
    }]
  ]
}
</script>