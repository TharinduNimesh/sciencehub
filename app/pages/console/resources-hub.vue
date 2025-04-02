<template>
  <div class="h-full space-y-8">
    <!-- Notices Section -->
    <div v-if="isAdmin() || isModerator()" class="bg-white rounded-lg shadow-sm">
      <div class="p-6 lg:p-8 space-y-6">
        <!-- Header Section -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 class="text-xl font-semibold">Notices</h2>
            <p class="text-sm text-gray-500 mt-1">Important announcements and updates</p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div class="flex gap-2 w-full">
              <UButton
                icon="i-heroicons-arrow-path"
                :ui="{ rounded: 'rounded-full' }"
                :loading="isRefreshingNotices"
                color="gray"
                variant="ghost"
                @click="refreshNotices"
                square
              />
              <div class="flex-1">
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
            <UButton 
              label="Create Notice" 
              color="primary" 
              icon="i-heroicons-plus" 
              :ui="{ rounded: 'rounded-full' }"
              :block="isMobile" 
              @click="isCreateNoticeModalOpen = true" 
            />
          </div>
        </div>

        <!-- Filters -->
        <ConsoleNoticesFilters 
          v-show="showNoticeFilters" 
          :filters="noticeFilters"
          @update:filters="updateNoticeFilters" 
          class="transition-all duration-200 ease-in-out"
        />

        <!-- Notice Cards -->
        <div v-if="paginatedNotices.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <UCard v-for="notice in paginatedNotices" :key="notice.id" class="cursor-pointer hover:shadow-md transition-shadow">
            <div class="space-y-4">
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="text-lg font-semibold">{{ notice.title }}</h3>
                  <p class="text-sm text-gray-500">{{ formatDate(notice.createdAt) }}</p>
                </div>
                <UDropdown :items="getNoticeActions(notice)">
                  <UButton
                    color="gray"
                    variant="ghost"
                    icon="i-heroicons-ellipsis-horizontal"
                    :ui="{ rounded: 'rounded-full' }"
                  />
                </UDropdown>
              </div>
              <p class="text-gray-600">{{ notice.description }}</p>
              <div v-if="notice.image" class="mt-4">
                <img :src="notice.image" :alt="notice.title" class="rounded-lg w-full object-cover h-48">
              </div>
              <div class="flex flex-wrap gap-2">
                <UBadge v-for="className in notice.classes" :key="className" color="primary" variant="soft" size="sm">
                  {{ className }}
                </UBadge>
              </div>
            </div>
          </UCard>
        </div>
        <div v-else class="text-center py-12">
          <UIcon name="i-heroicons-document-text" class="w-12 h-12 mx-auto text-gray-400" />
          <h3 class="mt-2 text-sm font-semibold text-gray-900">No notices</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by creating a new notice.</p>
        </div>

        <!-- Pagination Controls -->
        <div v-if="filteredNotices.length > 0" class="bg-white px-4 py-3 border-t border-gray-100">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500">
              Showing {{ ((noticeCurrentPage - 1) * adminItemsPerPage) + 1 }} to {{ Math.min(noticeCurrentPage * adminItemsPerPage, filteredNotices.length) }} of {{ filteredNotices.length }} notices
            </div>
            <div class="flex gap-2">
              <UButton
                :disabled="noticeCurrentPage === 1"
                @click="noticeCurrentPage--"
                color="gray"
                variant="soft"
                icon="i-heroicons-chevron-left"
                :ui="{ rounded: 'rounded-full' }"
                square
              />
              <div class="flex items-center gap-1">
                <template v-for="page in totalNoticePages" :key="page">
                  <UButton
                    v-if="page === noticeCurrentPage || page === 1 || page === totalNoticePages || (page >= noticeCurrentPage - 1 && page <= noticeCurrentPage + 1)"
                    :color="page === noticeCurrentPage ? 'primary' : 'gray'"
                    :variant="page === noticeCurrentPage ? 'solid' : 'soft'"
                    :ui="{ rounded: 'rounded-full' }"
                    @click="noticeCurrentPage = page"
                    class="min-w-[32px]"
                  >
                    {{ page }}
                  </UButton>
                  <span v-else-if="page === noticeCurrentPage - 2 || page === noticeCurrentPage + 2" class="px-1">...</span>
                </template>
              </div>
              <UButton
                :disabled="noticeCurrentPage === totalNoticePages"
                @click="noticeCurrentPage++"
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

    <!-- Notes Section -->
    <div v-if="isAdmin() || isModerator()" class="bg-white rounded-lg shadow-sm">
      <div class="p-6 lg:p-8 space-y-6">
        <!-- Header Section -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 class="text-xl font-semibold">Learning Notes</h2>
            <p class="text-sm text-gray-500 mt-1">Educational resources and materials</p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div class="flex gap-2 w-full">
              <UButton
                icon="i-heroicons-arrow-path"
                :ui="{ rounded: 'rounded-full' }"
                :loading="isRefreshingNotes"
                color="gray"
                variant="ghost"
                @click="refreshNotes"
                square
              />
              <div class="flex-1">
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
            <UButton 
              label="Add Note" 
              color="primary" 
              icon="i-heroicons-plus" 
              :ui="{ rounded: 'rounded-full' }"
              :block="isMobile" 
              @click="isCreateNoteModalOpen = true" 
            />
          </div>
        </div>

        <!-- Filters -->
        <ConsoleNotesFilters 
          v-show="showNoteFilters" 
          :filters="noteFilters"
          @update:filters="updateNoteFilters" 
          class="transition-all duration-200 ease-in-out"
        />

        <!-- Note Cards -->
        <div v-if="paginatedNotes.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <UCard 
            v-for="note in paginatedNotes" 
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
              <!-- Header -->
              <div class="flex items-start justify-between">
                <div class="pr-20"> <!-- Added padding to prevent overlap with badge -->
                  <h3 class="text-lg font-semibold group-hover:text-primary-600 transition-colors">{{ note.title }}</h3>
                  <p class="text-sm text-gray-500">{{ formatDate(note.createdAt) }}</p>
                </div>
                <UDropdown 
                  :items="getNoteActions(note)"
                  :popper="{ placement: 'bottom-end' }"
                >
                  <UButton
                    color="gray"
                    variant="ghost"
                    icon="i-heroicons-ellipsis-horizontal"
                    :ui="{ rounded: 'rounded-full' }"
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </UDropdown>
              </div>

              <!-- Description with truncation -->
              <p class="text-gray-600 line-clamp-2">{{ note.description }}</p>

              <!-- Classes -->
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
              </div>
            </div>
          </UCard>
        </div>
        <div v-else class="text-center py-12">
          <UIcon name="i-heroicons-book-open" class="w-12 h-12 mx-auto text-gray-400" />
          <h3 class="mt-2 text-sm font-semibold text-gray-900">No notes</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by adding a new note.</p>
        </div>

        <!-- Pagination Controls -->
        <div v-if="filteredNotes.length > 0" class="bg-white px-4 py-3 border-t border-gray-100">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500">
              Showing {{ ((noteCurrentPage - 1) * adminItemsPerPage) + 1 }} to {{ Math.min(noteCurrentPage * adminItemsPerPage, filteredNotes.length) }} of {{ filteredNotes.length }} notes
            </div>
            <div class="flex gap-2">
              <UButton
                :disabled="noteCurrentPage === 1"
                @click="noteCurrentPage--"
                color="gray"
                variant="soft"
                icon="i-heroicons-chevron-left"
                :ui="{ rounded: 'rounded-full' }"
                square
              />
              <div class="flex items-center gap-1">
                <template v-for="page in totalNotePages" :key="page">
                  <UButton
                    v-if="page === noteCurrentPage || page === 1 || page === totalNotePages || (page >= noteCurrentPage - 1 && page <= noteCurrentPage + 1)"
                    :color="page === noteCurrentPage ? 'primary' : 'gray'"
                    :variant="page === noteCurrentPage ? 'solid' : 'soft'"
                    :ui="{ rounded: 'rounded-full' }"
                    @click="noteCurrentPage = page"
                    class="min-w-[32px]"
                  >
                    {{ page }}
                  </UButton>
                  <span v-else-if="page === noteCurrentPage - 2 || page === noteCurrentPage + 2" class="px-1">...</span>
                </template>
              </div>
              <UButton
                :disabled="noteCurrentPage === totalNotePages"
                @click="noteCurrentPage++"
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
        <div class="border border-gray-100 rounded-xl overflow-hidden">
          <div class="bg-gray-50 px-4 py-3 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <h3 class="font-medium">All Resources</h3>
              <UBadge color="primary" variant="soft" size="sm">{{ filteredStudentResources.length }}</UBadge>
            </div>
          </div>
          <div class="divide-y divide-gray-100">
            <div v-for="resource in paginatedStudentResources" :key="resource.id" 
              class="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              @click="resource.type ? handleResourceAction(resource) : viewNoticeDetails(resource)"
            >
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0">
                  <UAvatar
                    v-if="!resource.type"
                    :src="resource.image"
                    :alt="resource.title"
                    size="lg"
                  />
                  <UIcon 
                    v-else
                    :name="getResourceTypeIcon(resource.type)" 
                    class="w-10 h-10"
                    :class="getResourceTypeIconClass(resource.type)"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <h4 class="font-medium text-gray-900">{{ resource.title }}</h4>
                      <p class="text-sm text-gray-500">{{ formatDate(resource.createdAt) }}</p>
                    </div>
                    <UBadge
                      v-if="resource.type"
                      :color="getResourceTypeColor(resource.type)"
                      variant="soft"
                      size="sm"
                      class="flex items-center gap-1"
                    >
                      <UIcon :name="getResourceTypeIcon(resource.type)" class="w-4 h-4" />
                      {{ resource.type }}
                    </UBadge>
                    <UBadge
                      v-else
                      color="amber"
                      variant="soft"
                      size="sm"
                      class="flex items-center gap-1"
                    >
                      <UIcon name="i-heroicons-bell-alert" class="w-4 h-4" />
                      Notice
                    </UBadge>
                  </div>
                  <p class="mt-1 text-sm text-gray-600 line-clamp-2">{{ resource.description }}</p>
                  <div class="mt-2 flex items-center gap-4">
                    <div class="flex flex-wrap gap-2">
                      <UBadge v-for="className in resource.classes" :key="className" 
                        :color="getClassBadgeColor(className)" 
                        variant="soft" 
                        size="xs"
                      >
                        {{ formatClassName(className) }}
                      </UBadge>
                    </div>
                    <UButton
                      v-if="resource.type"
                      :color="getResourceTypeColor(resource.type)"
                      variant="soft"
                      size="xs"
                      :icon="getResourceActionIcon(resource.type)"
                      class="ml-auto"
                    >
                      {{ getResourceActionLabel(resource.type) }}
                    </UButton>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="!filteredStudentResources.length" class="p-4 text-center text-gray-500">
              No resources available
            </div>
          </div>

          <!-- Pagination Controls -->
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
    image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400'
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

const getNoticeActions = (notice: any) => {
  return [
    [{
      label: 'Edit',
      icon: 'i-heroicons-pencil-square',
      click: () => console.log('Edit notice:', notice.id)
    }],
    [{
      label: 'Delete',
      icon: 'i-heroicons-trash',
      color: 'red',
      click: () => console.log('Delete notice:', notice.id)
    }]
  ]
}

const getNoteActions = (note: any) => {
  return [
    [{
      label: 'View',
      icon: 'i-heroicons-eye',
      click: () => console.log('View note:', note.id)
    }],
    [{
      label: 'Edit',
      icon: 'i-heroicons-pencil-square',
      click: () => console.log('Edit note:', note.id)
    }],
    [{
      label: 'Delete',
      icon: 'i-heroicons-trash',
      color: 'red',
      click: () => console.log('Delete note:', note.id)
    }]
  ]
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