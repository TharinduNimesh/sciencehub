<template>
  <div class="h-full space-y-8">
    <!-- Notices Section -->
    <ResourceSection
      v-if="isAdmin() || isModerator()"
      title="Notices"
      description="Important announcements and updates"
      action-label="Create Notice"
      :is-refreshing="isRefreshingNotices"
      v-model:show-filters="showNoticeFilters"
      v-model:current-page="noticeCurrentPage"
      :items-per-page="adminItemsPerPage"
      :total-items="filteredNotices.length"
      item-label="notices"
      @refresh="refreshNotices"
      @action="isCreateNoticeModalOpen = true"
    >
      <!-- Notice Filters -->
      <template #filters>
        <ConsoleNoticesFilters 
          v-show="showNoticeFilters" 
          :filters="noticeFilters"
          @update:filters="updateNoticeFilters" 
          class="transition-all duration-200 ease-in-out"
        />
      </template>

      <!-- Notice Cards -->
      <div v-if="paginatedNotices.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <NoticeCard
          v-for="notice in paginatedNotices"
          :key="notice.id"
          :notice="notice"
          @edit="handleEditNotice"
          @delete="handleDeleteNotice"
        />
      </div>
      <div v-else class="text-center py-12">
        <UIcon name="i-heroicons-document-text" class="w-12 h-12 mx-auto text-gray-400" />
        <h3 class="mt-2 text-sm font-semibold text-gray-900">No notices</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by creating a new notice.</p>
      </div>
    </ResourceSection>

    <!-- Notes Section -->
    <ResourceSection
      v-if="isAdmin() || isModerator()"
      title="Learning Notes"
      description="Educational resources and materials"
      action-label="Add Note"
      :is-refreshing="isRefreshingNotes"
      v-model:show-filters="showNoteFilters"
      v-model:current-page="noteCurrentPage"
      :items-per-page="adminItemsPerPage"
      :total-items="filteredNotes.length"
      item-label="notes"
      @refresh="refreshNotes"
      @action="isCreateNoteModalOpen = true"
    >
      <!-- Note Filters -->
      <template #filters>
        <ConsoleNotesFilters 
          v-show="showNoteFilters" 
          :filters="noteFilters"
          @update:filters="updateNoteFilters" 
          class="transition-all duration-200 ease-in-out"
        />
      </template>

      <!-- Note Cards -->
      <div v-if="paginatedNotes.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <NoteCard
          v-for="note in paginatedNotes"
          :key="note.id"
          :note="note"
          @view="handleViewNote"
          @edit="handleEditNote"
          @delete="handleDeleteNote"
        />
      </div>
      <div v-else class="text-center py-12">
        <UIcon name="i-heroicons-book-open" class="w-12 h-12 mx-auto text-gray-400" />
        <h3 class="mt-2 text-sm font-semibold text-gray-900">No notes</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by adding a new note.</p>
      </div>
    </ResourceSection>

    <!-- Student Resources Section -->
    <div v-if="isStudent()" class="bg-white rounded-lg shadow-sm">
      <div class="p-6 lg:p-8 space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 class="text-xl font-semibold">Learning Resources</h2>
            <p class="text-sm text-gray-500 mt-1">Access all your study materials and announcements</p>
          </div>

          <div class="flex gap-2 w-full sm:w-auto">
            <UButton
              icon="i-heroicons-arrow-path"
              :ui="{ rounded: 'rounded-full' }"
              :loading="isRefreshingResources"
              color="gray"
              variant="ghost"
              @click="refreshResources"
              square
            />
            <UInput
              v-model="studentSearch"
              icon="i-heroicons-magnifying-glass"
              :ui="{ rounded: 'rounded-full' }"
              placeholder="Search resources..."
              class="w-full sm:w-64"
            />
          </div>
        </div>

        <!-- Combined Resources List -->
        <StudentResourceList
          :resources="paginatedStudentResources"
          @resource-action="handleResourceAction"
          @notice-view="viewNoticeDetails"
        />

        <!-- Pagination -->
        <div v-if="filteredStudentResources.length > 0" class="bg-white px-4 py-3 border-t border-gray-100">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500">
              Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredStudentResources.length) }} of {{ filteredStudentResources.length }} resources
            </div>
            <div class="flex gap-2">
              <UButton
                :disabled="currentPage === 1"
                @click="currentPage--"
                color="gray"
                variant="soft"
                icon="i-heroicons-chevron-left"
                :ui="{ rounded: 'rounded-full' }"
                square
              />
              <div class="flex items-center gap-1">
                <template v-for="page in totalPages" :key="page">
                  <UButton
                    v-if="page === currentPage || page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)"
                    :color="page === currentPage ? 'primary' : 'gray'"
                    :variant="page === currentPage ? 'solid' : 'soft'"
                    :ui="{ rounded: 'rounded-full' }"
                    @click="currentPage = page"
                    class="min-w-[32px]"
                  >
                    {{ page }}
                  </UButton>
                  <span v-else-if="page === currentPage - 2 || page === currentPage + 2" class="px-1">...</span>
                </template>
              </div>
              <UButton
                :disabled="currentPage === totalPages"
                @click="currentPage++"
                color="gray"
                variant="soft"
                icon="i-heroicons-chevron-right"
                :ui="{ rounded: 'rounded-full' }"
                square
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Create Notice Modal -->
  <ConsoleNoticesCreateModal
    v-model="isCreateNoticeModalOpen"
    @created="refreshNotices"
  />

  <!-- Create Note Modal -->
  <ConsoleNotesCreateModal
    v-model="isCreateNoteModalOpen"
    @created="refreshNotes"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { isMobileScreen } from '~/lib/utils'
import { useNotification } from '~/composables/useNotification'
import ResourceSection from '~/components/Console/Resources/ResourceSection.vue'
import NoticeCard from '~/components/Console/Resources/NoticeCard.vue'
import NoteCard from '~/components/Console/Resources/NoteCard.vue'
import StudentResourceList from '~/components/Console/Resources/StudentResourceList.vue'

// Page meta
definePageMeta({
  layout: 'console'
})

// State
const isMobile = ref(isMobileScreen())
const showNoticeFilters = ref(false)
const showNoteFilters = ref(false)
const isRefreshingNotices = ref(false)
const isRefreshingNotes = ref(false)
const isCreateNoticeModalOpen = ref(false)
const isCreateNoteModalOpen = ref(false)
const studentSearch = ref('')
const isRefreshingResources = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Pagination states for admin sections
const noticeCurrentPage = ref(1)
const noteCurrentPage = ref(1)
const adminItemsPerPage = ref(6) // 6 items per page for grid layout (3x2)

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

// Filtered data computeds
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
      notice.classes.some(cls => cls === noticeFilters.value.class)
    )
  }

  if (noticeFilters.value.dateRange) {
    const now = Date.now()
    const ranges: Record<string, number> = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '180d': 180 * 24 * 60 * 60 * 1000,
      '365d': 365 * 24 * 60 * 60 * 1000
    }
    const range = ranges[noticeFilters.value.dateRange] || 0
    const cutoffDate = new Date(now - range)

    filtered = filtered.filter(notice => 
      new Date(notice.createdAt) >= cutoffDate
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
      note.classes.some(cls => cls === noteFilters.value.class)
    )
  }

  if (noteFilters.value.type) {
    filtered = filtered.filter(note => 
      note.type === noteFilters.value.type
    )
  }

  return filtered
})

const filteredStudentNotices = computed(() => {
  let filtered = notices.value
  if (studentSearch.value) {
    const search = studentSearch.value.toLowerCase()
    filtered = filtered.filter(notice => 
      notice.title.toLowerCase().includes(search) ||
      notice.description.toLowerCase().includes(search) ||
      notice.classes.some(cls => cls.toLowerCase().includes(search))
    )
  }
  return filtered
})

const filteredStudentNotes = computed(() => {
  let filtered = notes.value
  if (studentSearch.value) {
    const search = studentSearch.value.toLowerCase()
    filtered = filtered.filter(note => 
      note.title.toLowerCase().includes(search) ||
      note.description.toLowerCase().includes(search) ||
      note.classes.some(cls => cls.toLowerCase().includes(search)) ||
      note.type.toLowerCase().includes(search)
    )
  }
  return filtered
})

const filteredStudentResources = computed(() => {
  // Combine notices and notes into a single array
  const allResources = [
    ...notices.value.map(notice => ({ ...notice, isNotice: true })),
    ...notes.value.map(note => ({ ...note, isNote: true }))
  ]

  // Sort by creation date, most recent first
  allResources.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  if (studentSearch.value) {
    const search = studentSearch.value.toLowerCase()
    return allResources.filter(resource => 
      resource.title.toLowerCase().includes(search) ||
      resource.description.toLowerCase().includes(search) ||
      resource.classes.some(cls => cls.toLowerCase().includes(search)) ||
      (resource.type?.toLowerCase().includes(search))
    )
  }

  return allResources
})

const paginatedStudentResources = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value
  const endIndex = startIndex + itemsPerPage.value
  return filteredStudentResources.value.slice(startIndex, endIndex)
})

const totalPages = computed(() => 
  Math.ceil(filteredStudentResources.value.length / itemsPerPage.value)
)

const paginatedNotices = computed(() => {
  const startIndex = (noticeCurrentPage.value - 1) * adminItemsPerPage.value
  const endIndex = startIndex + adminItemsPerPage.value
  return filteredNotices.value.slice(startIndex, endIndex)
})

const totalNoticePages = computed(() => 
  Math.ceil(filteredNotices.value.length / adminItemsPerPage.value)
)

const paginatedNotes = computed(() => {
  const startIndex = (noteCurrentPage.value - 1) * adminItemsPerPage.value
  const endIndex = startIndex + adminItemsPerPage.value
  return filteredNotes.value.slice(startIndex, endIndex)
})

const totalNotePages = computed(() => 
  Math.ceil(filteredNotes.value.length / adminItemsPerPage.value)
)

const updateNoticeFilters = (filters: typeof noticeFilters.value) => {
  noticeFilters.value = filters
}

const updateNoteFilters = (filters: typeof noteFilters.value) => {
  noteFilters.value = filters
}

// Dummy data for notices
const notices = ref([
  {
    id: 1,
    title: 'Upcoming Final Exam Schedule',
    description: 'Important information about the final examination dates and venues.',
    createdAt: '2024-04-01T09:00:00',
    classes: ['Grade 11 - Physics', 'Grade 11 - Chemistry'],
    image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400'
  },
  {
    id: 2,
    title: 'Holiday Schedule Update',
    description: 'Updated schedule for the upcoming holiday period.',
    createdAt: '2024-03-30T14:30:00',
    classes: ['All Classes'],
    image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8MHx8&auto=format&fit=crop&w=800&h=400'
  },
  {
    id: 3,
    title: 'Science Lab Safety Guidelines',
    description: 'Updated safety protocols and guidelines for all laboratory sessions.',
    createdAt: '2024-03-28T11:00:00',
    classes: ['Grade 11 - Physics', 'Grade 11 - Chemistry'],
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8MHx8&auto=format&fit=crop&w=800&h=400'
  }
])

// Dummy data for notes
const notes = ref([
  {
    id: 1,
    title: 'Quantum Mechanics Introduction',
    description: 'Comprehensive introduction to quantum mechanics principles.',
    type: 'Document',
    createdAt: '2024-03-29T10:15:00',
    classes: ['Grade 11 - Physics'],
    url: 'https://example.com/quantum-mechanics.pdf'
  },
  {
    id: 2,
    title: 'Chemical Bonding Video Lecture',
    description: 'Video lecture explaining different types of chemical bonds.',
    type: 'Video',
    createdAt: '2024-03-28T16:45:00',
    classes: ['Grade 11 - Chemistry'],
    url: 'https://example.com/chemical-bonding.mp4'
  },
  {
    id: 3,
    title: 'Periodic Table Reference Guide',
    description: 'Interactive periodic table with detailed element information.',
    type: 'Link',
    createdAt: '2024-03-27T09:30:00',
    classes: ['Grade 11 - Chemistry', 'Grade 10 - Chemistry'],
    url: 'https://example.com/periodic-table'
  }
])

// Utility functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getResourceTypeIcon = (type: string) => {
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

const getResourceActionColor = (type: string): string => {
  const colors: Record<string, string> = {
    'Document': 'blue',
    'Video': 'red',
    'Image': 'green',
    'Link': 'purple'
  }
  return colors[type] || 'primary'
}

const getResourceActionVariant = (type: string): string => {
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

const formatClassName = (className: string): string => {
  // Extract grade number and subject
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

const handleResourceAction = (note: any) => {
  if (note.type === 'Link') {
    window.open(note.url, '_blank')
  } else {
    // TODO: Implement download/view actions for other resource types
    console.log('Handle resource action:', note.type, note.url)
  }
}

const handleEditNotice = (notice: any) => {
  console.log('Edit notice:', notice.id)
}

const handleDeleteNotice = (notice: any) => {
  console.log('Delete notice:', notice.id)
}

const handleViewNote = (note: any) => {
  console.log('View note:', note.id)
}

const handleEditNote = (note: any) => {
  console.log('Edit note:', note.id)
}

const handleDeleteNote = (note: any) => {
  console.log('Delete note:', note.id)
}

const refreshNotices = async () => {
  isRefreshingNotices.value = true
  // TODO: Implement actual refresh logic
  await new Promise(resolve => setTimeout(resolve, 1000))
  isRefreshingNotices.value = false
}

const refreshNotes = async () => {
  isRefreshingNotes.value = true
  // TODO: Implement actual refresh logic
  await new Promise(resolve => setTimeout(resolve, 1000))
  isRefreshingNotes.value = false
}

const refreshResources = async () => {
  isRefreshingResources.value = true
  await Promise.all([
    refreshNotices(),
    refreshNotes()
  ])
  isRefreshingResources.value = false
}

const getResourceTypeIconClass = (type: string): string => {
  const classes: Record<string, string> = {
    'Document': 'text-blue-500',
    'Video': 'text-red-500',
    'Image': 'text-green-500',
    'Link': 'text-purple-500'
  }
  return classes[type] || 'text-gray-500'
}

const viewNoticeDetails = (notice: any) => {
  // TODO: Implement notice details view
  console.log('View notice details:', notice.id)
}

// Mobile responsive handler
if (import.meta.client) {
  window.addEventListener('resize', () => {
    isMobile.value = isMobileScreen()
  })
}
</script>