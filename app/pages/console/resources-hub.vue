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
      <div v-if="isRefreshingNotices" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in adminItemsPerPage" :key="i" class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
          <!-- Image skeleton -->
          <div class="relative aspect-video w-full bg-gray-100 overflow-hidden">
            <USkeleton class="h-64 w-full" />
          </div>

          <!-- Content skeleton -->
          <div class="p-4 flex flex-col flex-1">
            <!-- Title and date skeleton -->
            <div class="flex items-center justify-between mb-2">
              <USkeleton class="h-6 w-3/4" />
              <USkeleton class="h-4 w-20" />
            </div>

            <!-- Description skeleton -->
            <USkeleton class="h-4 w-full mb-1" />
            <USkeleton class="h-4 w-3/4 mb-3" />

            <!-- Tags skeleton -->
            <div class="flex gap-2 mb-4">
              <USkeleton v-for="j in 3" :key="j" class="h-5 w-16 rounded-full" />
            </div>

            <!-- Actions skeleton -->
            <div class="flex justify-between items-center mt-auto pt-4 border-t">
              <USkeleton class="h-8 w-28 rounded-lg" />
              <div class="flex gap-2">
                <USkeleton class="h-8 w-8 rounded-full" />
                <USkeleton class="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="paginatedNotices.length === 0" class="bg-gray-50 rounded-lg p-12 text-center">
        <div class="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-primary-50">
          <UIcon name="i-heroicons-megaphone" class="h-12 w-12 text-primary-400" />
        </div>
        <h3 class="mt-6 text-xl font-medium text-gray-900">No notices found</h3>
        <p class="mt-2 text-gray-500">Get started by creating a new notice for your students.</p>
        <div class="mt-6">
          <UButton
            color="primary"
            label="Create Notice"
            @click="isCreateNoticeModalOpen = true"
            :ui="{ rounded: 'rounded-full' }"
          />
        </div>
      </div>
      <div v-else :class="['grid gap-6', gridClass]">
        <NoticeCard
          v-for="notice in paginatedNotices"
          :key="notice.id"
          :notice="notice"
          @edit="handleEditNotice"
          @delete="handleDeleteNotice"
        />
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
      <div v-if="isRefreshingNotes" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in adminItemsPerPage" :key="i" class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
          <!-- Icon skeleton -->
          <div class="p-4">
            <div class="flex items-start gap-6">
              <USkeleton class="h-14 w-14 rounded-xl" />
              <div class="flex-1">
                <USkeleton class="h-6 w-3/4 mb-2" />
                <USkeleton class="h-4 w-24" />
              </div>
            </div>
          </div>

          <!-- Content skeleton -->
          <div class="px-4 pb-4 flex flex-col flex-1">
            <!-- Description skeleton -->
            <USkeleton class="h-4 w-full mb-1" />
            <USkeleton class="h-4 w-3/4 mb-3" />

            <!-- Tags skeleton -->
            <div class="flex gap-2 mb-4">
              <USkeleton v-for="j in 3" :key="j" class="h-5 w-16 rounded-full" />
            </div>

            <!-- Actions skeleton -->
            <div class="flex justify-between items-center mt-auto pt-4 border-t">
              <USkeleton class="h-8 w-28 rounded-lg" />
              <div class="flex gap-2">
                <USkeleton class="h-8 w-8 rounded-full" />
                <USkeleton class="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="paginatedNotes.length === 0" class="bg-gray-50 rounded-lg p-12 text-center">
        <div class="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-primary-50">
          <UIcon name="i-heroicons-document-text" class="h-12 w-12 text-primary-400" />
        </div>
        <h3 class="mt-6 text-xl font-medium text-gray-900">No notes found</h3>
        <p class="mt-2 text-gray-500">Get started by creating a new learning note for your students.</p>
        <div class="mt-6">
          <UButton
            color="primary"
            label="Add Note"
            @click="isCreateNoteModalOpen = true"
            :ui="{ rounded: 'rounded-full' }"
          />
        </div>
      </div>
      <div v-else :class="['grid gap-6', gridClass]">
        <NoteCard
          v-for="note in paginatedNotes"
          :key="note.id"
          :note="note"
          @edit="handleEditNote"
          @delete="handleDeleteNote"
          @view="handleViewNote"
        />
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
          v-model:current-page="currentPage"
          :total-items="filteredStudentResources.length"
          :items-per-page="itemsPerPage"
          @resource-action="handleResourceAction"
          @notice-view="viewNoticeDetails"
        />
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
import { useResources } from '~/composables/useResources'
import { useSidebarStore } from '~/stores/sidebar'
import type { Resource, Notice, CombinedResource, ResourceType } from '~/types/resource'
import ResourceSection from '~/components/Console/Resources/ResourceSection.vue'
import NoticeCard from '~/components/Console/Resources/NoticeCard.vue'
import NoteCard from '~/components/Console/Resources/NoteCard.vue'
import StudentResourceList from '~/components/Console/Resources/StudentResourceList.vue'
import ConsoleNoticesEditModal from '~/components/Console/Notices/EditModal.vue'
import ConsoleNotesEditModal from '~/components/Console/Notes/EditModal.vue'

// State
const isMobile = ref(isMobileScreen())
const showNoticeFilters = ref(false)
const showNoteFilters = ref(false)
const isRefreshingNotices = ref(true) // Set initial loading state to true
const isRefreshingNotes = ref(true) // Set initial loading state to true
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

// Filter states with proper typing
const noticeFilters = ref({
  search: '',
  class: undefined as string | undefined,
  dateRange: undefined as string | undefined
})

const noteFilters = ref({
  search: '',
  class: undefined as string | undefined,
  type: undefined as ResourceType | undefined
})

// Replace dummy data with real data fetching with proper typing
const { getResources, deleteResource } = useResources()
const notification = useNotification()

const notices = ref<Notice[]>([])
const notes = ref<Resource[]>([])

// Page meta
definePageMeta({
  layout: 'console'
})

// Add store initialization
const sidebarStore = useSidebarStore()

const loadResources = async () => {
  isRefreshingNotices.value = true
  isRefreshingNotes.value = true
  
  try {
    const [noticesData, notesData] = await Promise.all([
      getResources('notice'),
      getResources('resource')
    ])

    // Transform and type-check the data
    notices.value = noticesData.filter(n => n.type === 'notice').map(notice => ({
      ...notice,
      resource_type: 'Image', // Ensure notices always have Image type
      createdAt: notice.created_at
    }))

    notes.value = notesData.filter(n => n.type === 'resource').map(note => ({
      ...note,
      createdAt: note.created_at
    }))
  } catch (error) {
    console.error('Error loading resources:', error)
    notification.showError('Failed to load resources')
  } finally {
    isRefreshingNotices.value = false
    isRefreshingNotes.value = false
  }
}

// Initialize data on mount
onMounted(loadResources)

// Filtered data computeds
const filteredNotices = computed(() => {
  let filtered = notices.value

  if (noticeFilters.value.search) {
    const search = noticeFilters.value.search.toLowerCase()
    filtered = filtered.filter(notice => 
      notice.title.toLowerCase().includes(search) ||
      notice.description?.toLowerCase().includes(search)
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
      note.description?.toLowerCase().includes(search)
    )
  }

  if (noteFilters.value.class) {
    filtered = filtered.filter(note => 
      note.classes.some(cls => cls === noteFilters.value.class)
    )
  }

  if (noteFilters.value.type) {
    filtered = filtered.filter(note => 
      note.resource_type === noteFilters.value.type
    )
  }

  return filtered
})

const combinedStudentResources = computed(() => {
  // Combine notices and resources into a single array
  const allResources = [
    ...notices.value.map(notice => ({
      ...notice,
      type: 'notice' as const,
      image: notice.url // Map url to image for notices
    })),
    ...notes.value.map(note => ({
      ...note,
      type: 'resource' as const
    }))
  ]

  // Sort by creation date, most recent first
  return allResources.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
})

const filteredStudentResources = computed(() => {
  if (!studentSearch.value) return combinedStudentResources.value

  const search = studentSearch.value.toLowerCase()
  return combinedStudentResources.value.filter(resource => 
    resource.title.toLowerCase().includes(search) ||
    resource.description?.toLowerCase().includes(search) ||
    resource.classes.some(cls => cls.toLowerCase().includes(search)) ||
    (resource.type === 'resource' && resource.resource_type.toLowerCase().includes(search))
  )
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

const paginatedNotes = computed(() => {
  const startIndex = (noteCurrentPage.value - 1) * adminItemsPerPage.value
  const endIndex = startIndex + adminItemsPerPage.value
  return filteredNotes.value.slice(startIndex, endIndex)
})

const gridClass = computed(() => {
  // Base responsive grid that works independently of sidebar
  const baseGrid = "grid-cols-1 sm:grid-cols-2"

  // Only adjust grid on large screens based on sidebar state
  const largeScreenGrid = sidebarStore.isOpen
    ? "xl:grid-cols-2"
    : "lg:grid-cols-2 xl:grid-cols-3"

  return `${baseGrid} ${largeScreenGrid}`
})

const updateNoticeFilters = (filters: typeof noticeFilters.value) => {
  noticeFilters.value = filters
}

const updateNoteFilters = (filters: typeof noteFilters.value) => {
  noteFilters.value = filters
}

const handleResourceAction = (resource: Resource) => {
  if (resource.resource_type === 'Link') {
    window.open(resource.url, '_blank')
  } else {
    window.open(resource.url, '_blank')
  }
}

const handleEditNotice = async (notice: Notice) => {
  await refreshNotices()
}

const handleDeleteNotice = async (notice: Notice) => {
  try {
    await deleteResource(notice.id)
    notification.showSuccess('Notice deleted successfully')
    await refreshNotices()
  } catch (error) {
    console.error('Error deleting notice:', error)
    notification.showError('Failed to delete notice')
  }
}

const handleViewNote = (note: Resource) => {
  window.open(note.url, '_blank')
}

const handleEditNote = async (note: Resource) => {
  await refreshNotes()
}

const handleDeleteNote = async (note: Resource) => {
  try {
    await deleteResource(note.id)
    notification.showSuccess('Note deleted successfully')
    await refreshNotes()
  } catch (error) {
    console.error('Error deleting note:', error)
    notification.showError('Failed to delete note')
  }
}

const refreshNotices = async () => {
  isRefreshingNotices.value = true
  try {
    const noticesData = await getResources('notice')
    notices.value = noticesData.filter(n => n.type === 'notice').map(notice => ({
      ...notice,
      resource_type: 'Image', // Ensure notices always have Image type
      createdAt: notice.created_at
    }))
  } catch (error) {
    console.error('Error refreshing notices:', error)
    notification.showError('Failed to refresh notices')
  } finally {
    isRefreshingNotices.value = false
  }
}

const refreshNotes = async () => {
  isRefreshingNotes.value = true
  try {
    const notesData = await getResources('resource')
    notes.value = notesData.filter(n => n.type === 'resource').map(note => ({
      ...note,
      createdAt: note.created_at
    }))
  } catch (error) {
    console.error('Error refreshing notes:', error)
    notification.showError('Failed to refresh notes')
  } finally {
    isRefreshingNotes.value = false
  }
}

const refreshResources = async () => {
  isRefreshingResources.value = true
  await Promise.all([
    refreshNotices(),
    refreshNotes()
  ])
  isRefreshingResources.value = false
}

const viewNoticeDetails = (notice: Notice) => {
  // TODO: Implement notice details view modal
  console.log('View notice details:', notice)
}

// Mobile responsive handler
if (import.meta.client) {
  window.addEventListener('resize', () => {
    isMobile.value = isMobileScreen()
  })
}
</script>