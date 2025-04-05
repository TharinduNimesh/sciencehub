<template>
  <UCard class="group transition-all duration-200 hover:shadow-lg hover:border-primary-100 relative overflow-hidden">
    <div class="space-y-4">
      <!-- Header with Icon -->
      <div class="flex items-start gap-6">
        <!-- Left side with type icon -->
        <div class="flex-shrink-0">
          <div
            class="w-14 h-14 flex items-center justify-center rounded-xl"
            :class="{
              'bg-blue-50 text-blue-500': note.type === 'Document',
              'bg-red-50 text-red-500': note.type === 'Video',
              'bg-green-50 text-green-500': note.type === 'Image',
              'bg-purple-50 text-purple-500': note.type === 'Link',
              'bg-gray-50 text-gray-500': !note.type
            }"
          >
            <UIcon
              :name="getResourceTypeIcon(note.type)"
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
          v-for="className in note.classes" 
          :key="className" 
          :color="getClassBadgeColor(className)"
          variant="outline" 
          size="xs"
          class="group-hover:border-primary-200 transition-colors font-medium"
        >
          {{ formatClassName(className) }}
        </UBadge>
      </div>

      <!-- Action Buttons and Resource Button -->
      <div class="pt-4 mt-auto border-t border-gray-100 flex items-center justify-between">
        <!-- Resource Action Button -->
        <UButton
          :color="getResourceActionColor(note.type)"
          :variant="getResourceActionVariant()"
          :icon="getResourceActionIcon(note.type)"
          size="sm"
          class="text-sm font-medium group"
          :class="getResourceActionClass(note.type)"
          @click="handleResourceAction(note)"
        >
          <span class="flex items-center gap-2 justify-center">
            {{ getResourceActionLabel(note.type) }}
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
              @click="emit('edit', note)"
            />
          </UTooltip>
          <UTooltip text="Delete note" :popper="{ arrow: true }">
            <UButton
              color="red"
              variant="soft"
              icon="i-heroicons-trash"
              :ui="{ rounded: 'rounded-full' }"
              size="sm"
              @click="emit('delete', note)"
            />
          </UTooltip>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { BadgeColor, ButtonColor, ButtonVariant } from '#ui/types'

interface Note {
  id: number
  title: string
  description: string
  type: string
  createdAt: string
  classes: string[]
  url: string
}

const props = defineProps<{
  note: Note
}>()

const emit = defineEmits<{
  (e: 'view', note: Note): void
  (e: 'edit', note: Note): void
  (e: 'delete', note: Note): void
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

const getClassBadgeColor = (className: string): BadgeColor => {
  if (className.includes('Physics')) return 'blue'
  if (className.includes('Chemistry')) return 'green'
  if (className.includes('Biology')) return 'yellow'
  if (className.includes('Mathematics')) return 'purple'
  return 'gray'
}

const getResourceTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'Document': 'i-heroicons-document-text',
    'Video': 'i-heroicons-video-camera',
    'Image': 'i-heroicons-photo',
    'Link': 'i-heroicons-link'
  }
  return icons[type] || 'i-heroicons-document'
}

const getResourceActionColor = (type: string): ButtonColor => {
  const colors: Record<string, ButtonColor> = {
    'Document': 'blue',
    'Video': 'red',
    'Image': 'green',
    'Link': 'purple'
  }
  return colors[type] || 'gray'
}

const getResourceActionVariant = (): ButtonVariant => {
  return 'soft'
}

const getResourceActionIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'Document': 'i-heroicons-arrow-down-tray',
    'Video': 'i-heroicons-play',
    'Image': 'i-heroicons-eye',
    'Link': 'i-heroicons-arrow-top-right-on-square'
  }
  return icons[type] || 'i-heroicons-arrow-right'
}

const getResourceActionLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'Document': 'Download',
    'Video': 'Watch Video',
    'Image': 'View Image',
    'Link': 'Open Link'
  }
  return labels[type] || 'View'
}

const getResourceActionClass = (type: string): string => {
  const classes: Record<string, string> = {
    'Document': 'hover:bg-blue-50',
    'Video': 'hover:bg-red-50',
    'Image': 'hover:bg-green-50',
    'Link': 'hover:bg-purple-50'
  }
  return classes[type] || ''
}

const handleResourceAction = (note: Note) => {
  if (note.type === 'Link') {
    window.open(note.url, '_blank')
  } else {
    emit('view', note)
  }
}

const getNoteActions = (note: Note) => {
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