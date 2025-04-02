<template>
  <div class="h-full space-y-8">
    <!-- Notices Section -->
    <div class="bg-white rounded-lg shadow-sm">
      <div class="p-6 lg:p-8 space-y-6">
        <!-- Header Section -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 class="text-xl font-semibold">Class Notices</h2>
            <p class="text-sm text-gray-500 mt-1">Important announcements and updates</p>
          </div>

          <!-- Filters -->
          <div class="flex gap-2 w-full sm:w-auto">
            <UButton
              icon="i-heroicons-funnel" 
              :ui="{ rounded: 'rounded-full' }" 
              :color="showNoticeFilters ? 'primary' : 'gray'"
              :variant="showNoticeFilters ? 'soft' : 'ghost'" 
              :block="true"
              @click="showNoticeFilters = !showNoticeFilters"
              label="Filters" 
            />
          </div>
        </div>

        <ConsoleNoticesFilters 
          v-show="showNoticeFilters" 
          :filters="noticeFilters"
          @update:filters="updateNoticeFilters" 
          class="transition-all duration-200 ease-in-out"
        />

        <!-- Notice Cards -->
        <div v-if="filteredNotices.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <UCard v-for="notice in filteredNotices" :key="notice.id" class="group transition-all duration-200 hover:shadow-lg hover:border-primary-100">
            <div class="space-y-4">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="text-lg font-semibold group-hover:text-primary-600 transition-colors">{{ notice.title }}</h3>
                  <p class="text-sm text-gray-500">{{ formatDate(notice.createdAt) }}</p>
                </div>
              </div>
              <p class="text-gray-600 line-clamp-2">{{ notice.description }}</p>
              <div v-if="notice.image" class="mt-4">
                <img :src="notice.image" :alt="notice.title" class="rounded-lg w-full object-cover h-48">
              </div>
              <div class="flex flex-wrap gap-2">
                <UBadge 
                  v-for="className in notice.classes" 
                  :key="className" 
                  :color="getClassBadgeColor(className)"
                  variant="soft"
                  size="sm"
                >
                  {{ formatClassName(className) }}
                </UBadge>
              </div>
            </div>
          </UCard>
        </div>
        <div v-else class="text-center py-12">
          <UIcon name="i-heroicons-document-text" class="w-12 h-12 mx-auto text-gray-400" />
          <h3 class="mt-2 text-sm font-semibold text-gray-900">No notices</h3>
          <p class="mt-1 text-sm text-gray-500">No notices available at the moment.</p>
        </div>
      </div>
    </div>

    <!-- Notes Section -->
    <div class="bg-white rounded-lg shadow-sm">
      <div class="p-6 lg:p-8 space-y-6">
        <!-- Header Section -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 class="text-xl font-semibold">Learning Notes</h2>
            <p class="text-sm text-gray-500 mt-1">Educational resources and materials</p>
          </div>

          <div class="flex gap-2 w-full sm:w-auto">
            <UButton
              icon="i-heroicons-funnel" 
              :ui="{ rounded: 'rounded-full' }" 
              :color="showNoteFilters ? 'primary' : 'gray'"
              :variant="showNoteFilters ? 'soft' : 'ghost'" 
              :block="true"
              @click="showNoteFilters = !showNoteFilters"
              label="Filters" 
            />
          </div>
        </div>

        <ConsoleNotesFilters 
          v-show="showNoteFilters" 
          :filters="noteFilters"
          @update:filters="updateNoteFilters" 
          class="transition-all duration-200 ease-in-out"
        />

        <!-- Note Cards -->
        <div v-if="filteredNotes.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <UCard 
            v-for="note in filteredNotes" 
            :key="note.id"
            class="group transition-all duration-200 hover:shadow-lg hover:border-primary-100 relative overflow-hidden"
          >
            <!-- Resource Type Badge -->
            <div class="absolute top-4 right-4">
              <UBadge
                :color="getResourceTypeColor(note.type)"
                variant="solid"
                size="sm"
                class="flex items-center gap-1.5"
              >
                <UIcon :name="getResourceTypeIcon(note.type)" class="w-4 h-4" />
                {{ note.type }}
              </UBadge>
            </div>

            <div class="space-y-4">
              <div class="flex items-start justify-between">
                <div class="pr-20">
                  <h3 class="text-lg font-semibold group-hover:text-primary-600 transition-colors">{{ note.title }}</h3>
                  <p class="text-sm text-gray-500">{{ formatDate(note.createdAt) }}</p>
                </div>
              </div>

              <p class="text-gray-600 line-clamp-2">{{ note.description }}</p>

              <div class="flex flex-wrap gap-2 mb-4">
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

              <!-- Action Button -->
              <div class="pt-4 mt-auto border-t border-gray-100">
                <UButton
                  :color="getResourceActionColor(note.type)"
                  :variant="getResourceActionVariant(note.type)"
                  :icon="getResourceActionIcon(note.type)"
                  size="sm"
                  class="w-full text-sm font-medium group"
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
              </div>
            </div>
          </UCard>
        </div>
        <div v-else class="text-center py-12">
          <UIcon name="i-heroicons-book-open" class="w-12 h-12 mx-auto text-gray-400" />
          <h3 class="mt-2 text-sm font-semibold text-gray-900">No notes</h3>
          <p class="mt-1 text-sm text-gray-500">No learning notes available at the moment.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { isMobileScreen } from '~/lib/utils'

// Page meta
definePageMeta({
  layout: 'console'
})

// State
const showNoticeFilters = ref(false)
const showNoteFilters = ref(false)

// Filter states
const noticeFilters = ref({
  search: '',
  class: undefined as string | undefined,
  dateRange: undefined as string | undefined
})

const noteFilters = ref({
  search: '',
  class: undefined as string | undefined,
  type: undefined as string | undefined
})

// Dummy data for notices (replace with actual data fetching)
const notices = ref([
  {
    id: 1,
    title: 'Upcoming Final Exam Schedule',
    description: 'Important information about the final examination dates and venues.',
    createdAt: '2024-04-01T09:00:00',
    classes: ['Grade 11 - Physics', 'Grade 11 - Chemistry'],
    image: null
  },
  {
    id: 2,
    title: 'Holiday Schedule Update',
    description: 'Updated schedule for the upcoming holiday period.',
    createdAt: '2024-03-30T14:30:00',
    classes: ['Grade 10 - Physics', 'Grade 10 - Chemistry'],
    image: null
  }
])

// Dummy data for notes (replace with actual data fetching)
const notes = ref([
  {
    id: 1,
    title: 'Quantum Mechanics Introduction',
    description: 'Comprehensive introduction to quantum mechanics principles.',
    type: 'Document',
    createdAt: '2024-03-29T10:15:00',
    classes: ['Grade 11 - Physics']
  },
  {
    id: 2,
    title: 'Chemical Bonding Video Lecture',
    description: 'Video lecture explaining different types of chemical bonds.',
    type: 'Video',
    createdAt: '2024-03-28T15:45:00',
    classes: ['Grade 11 - Chemistry']
  }
])

// Computed
const filteredNotices = computed(() => {
  let filtered = notices.value

  if (noticeFilters.value.search) {
    const search = noticeFilters.value.search.toLowerCase()
    filtered = filtered.filter(notice => 
      notice.title.toLowerCase().includes(search) ||
      notice.description.toLowerCase().includes(search)
    )
  }

  if (noticeFilters.value.class) {
    filtered = filtered.filter(notice => 
      notice.classes.includes(noticeFilters.value.class!)
    )
  }

  return filtered
})

const filteredNotes = computed(() => {
  let filtered = notes.value

  if (noteFilters.value.search) {
    const search = noteFilters.value.search.toLowerCase()
    filtered = filtered.filter(note => 
      note.title.toLowerCase().includes(search) ||
      note.description.toLowerCase().includes(search)
    )
  }

  if (noteFilters.value.class) {
    filtered = filtered.filter(note => 
      note.classes.includes(noteFilters.value.class!)
    )
  }

  if (noteFilters.value.type) {
    filtered = filtered.filter(note => 
      note.type === noteFilters.value.type
    )
  }

  return filtered
})

// Methods
const updateNoticeFilters = (filters: typeof noticeFilters.value) => {
  noticeFilters.value = filters
}

const updateNoteFilters = (filters: typeof noteFilters.value) => {
  noteFilters.value = filters
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatClassName = (className: string): string => {
  const parts = className.split(' - ')
  if (parts.length === 2) {
    const grade = parts[0].match(/\d+/)?.[0] || ''
    return `G${grade} ${parts[1]}`
  }
  return className
}

const getClassBadgeColor = (className: string): string => {
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

const getResourceTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    'Document': 'blue',
    'Video': 'red',
    'Image': 'green',
    'Link': 'purple'
  }
  return colors[type] || 'gray'
}

const getResourceActionLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'Document': 'Download PDF',
    'Video': 'Watch Video',
    'Image': 'View Image',
    'Link': 'Open Link'
  }
  return labels[type] || 'View Resource'
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

const getResourceActionVariant = (type: string): string => {
  return type === 'Link' ? 'soft' : 'outline'
}

const getResourceActionColor = (type: string): string => {
  const colors: Record<string, string> = {
    'Document': 'blue',
    'Video': 'red',
    'Image': 'green',
    'Link': 'purple'
  }
  return colors[type] || 'gray'
}

const handleResourceAction = (note: any) => {
  if (note.type === 'Link') {
    window.open(note.url, '_blank')
  } else {
    // TODO: Implement download/view actions for other resource types
    console.log('Handle resource action:', note.type, note.url)
  }
}
</script>