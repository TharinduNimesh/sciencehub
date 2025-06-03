<template>
  <div class="h-full space-y-8">
    <!-- Quizzes Section -->
    <div class="bg-white rounded-lg shadow-sm p-6 lg:p-8 space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-xl font-semibold">Quizzes</h2>
          <p class="text-sm text-gray-500 mt-1">
            Manage and create quizzes for your students
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div class="flex gap-2 w-full sm:w-auto">
            <UButton
              icon="i-heroicons-arrow-path"
              :ui="{ rounded: 'rounded-full' }"
              :loading="isLoading"
              color="gray"
              variant="ghost"
              @click="refreshData"
              square
            />
            <div class="flex-1 sm:flex-initial">
              <UButton
                icon="i-heroicons-funnel"
                :ui="{ rounded: 'rounded-full' }"
                :color="showFilters ? 'primary' : 'gray'"
                :variant="showFilters ? 'soft' : 'ghost'"
                :block="isMobile"
                @click="showFilters = !showFilters"
                label="Filters"
              />
            </div>
          </div>
          <div class="flex-1 sm:flex-initial">
            <UButton
              label="Add Quiz"
              color="primary"
              icon="i-heroicons-plus"
              :ui="{ rounded: 'rounded-full' }"
              :block="isMobile"
              @click="openAddModal"
            />
          </div>
        </div>
      </div>

      <!-- Filters -->
      <QuizzesFilters
        v-show="showFilters"
        v-model:filters="filters"
        :classes="availableClasses"
        class="transition-all duration-200 ease-in-out"
      />

      <!-- Content Section -->
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        <div
          v-for="i in 6"
          :key="i"
          class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col"
        >
          <!-- Header skeleton -->
          <div class="p-6 flex flex-col flex-1">
            <!-- Title and status -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <USkeleton class="h-6 w-full mb-2" />
                <div class="flex items-center gap-2 mb-3">
                  <USkeleton class="h-5 w-16 rounded-full" />
                  <USkeleton class="h-4 w-24" />
                </div>
              </div>
              <USkeleton class="h-8 w-8 rounded" />
            </div>

            <!-- Description -->
            <USkeleton class="h-4 w-full mb-1" />
            <USkeleton class="h-4 w-3/4 mb-4" />

            <!-- Classes and stats -->
            <div class="space-y-3 mb-4">
              <USkeleton class="h-5 w-32" />
              <div class="flex gap-2">
                <USkeleton class="h-6 w-20 rounded-full" />
                <USkeleton class="h-6 w-24 rounded-full" />
              </div>
            </div>

            <!-- Action buttons -->
            <div class="flex gap-2 mt-auto pt-2">
              <USkeleton class="h-8 w-28 rounded-lg" />
              <USkeleton class="h-8 w-20 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredQuizzes.length === 0 && !hasActiveFilters" 
           class="bg-gray-50 rounded-lg p-12 text-center">
        <div class="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-primary-50">
          <UIcon name="i-heroicons-clipboard-document-list" class="h-12 w-12 text-primary-500" />
        </div>
        <h3 class="mt-6 text-lg font-semibold text-gray-900">No quizzes</h3>
        <p class="mt-2 text-gray-500">Get started by creating a new quiz.</p>
        <div class="mt-6">
          <UButton
            color="primary"
            icon="i-heroicons-plus"
            @click="openAddModal"
          >
            Add Quiz
          </UButton>
        </div>
      </div>

      <!-- No Results State -->
      <div v-else-if="filteredQuizzes.length === 0 && hasActiveFilters" 
           class="bg-gray-50 rounded-lg p-12 text-center">
        <div class="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gray-100">
          <UIcon name="i-heroicons-magnifying-glass" class="h-12 w-12 text-gray-400" />
        </div>
        <h3 class="mt-6 text-lg font-semibold text-gray-900">No quizzes found</h3>
        <p class="mt-2 text-gray-500">Try adjusting your search or filter criteria.</p>
      </div>

      <!-- Quizzes Grid -->
      <div v-else class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          <QuizCard
            v-for="quiz in paginatedQuizzes"
            :key="quiz.id"
            :quiz="quiz"
            @edit="editQuiz"
            @delete="deleteQuiz"
            @duplicate="duplicateQuiz"
          />
        </div>

        <!-- Pagination -->
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-200">
          <div class="text-sm text-gray-500">
            Showing
            {{ Math.min((currentPage - 1) * pageSize + 1, filteredQuizzes.length) }}-{{
              Math.min(currentPage * pageSize, filteredQuizzes.length)
            }}
            of {{ filteredQuizzes.length }} quizzes
          </div>
          <UPagination
            v-model="currentPage"
            :total="filteredQuizzes.length"
            :page-count="pageSize"
            size="sm"
            :ui="{
              wrapper: 'flex items-center gap-1',
              base: 'min-w-[32px] h-[32px] flex items-center justify-center text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors',
              rounded: 'rounded-lg',
              default: {
                inactive: 'hover:bg-gray-50',
                active: 'bg-primary-50 text-primary-500 font-medium',
              },
            }"
          />
        </div>
      </div>
    </div>

    <!-- Add/Edit Quiz Modal -->
    <QuizzesAddModal
      v-model="showAddModal"
      :quiz="selectedQuiz"
      :available-classes="availableClasses"
      @submit="handleQuizSubmit"
    />

    <!-- Delete Confirmation Modal -->
    <UModal v-model="showDeleteModal">
      <div class="p-6">
        <div class="flex items-center gap-3 mb-4">
          <UIcon name="i-heroicons-exclamation-triangle" class="text-red-500 text-xl" />
          <h3 class="text-lg font-semibold text-gray-900">Delete Quiz</h3>
        </div>
        
        <p class="text-gray-600 mb-6">
          Are you sure you want to delete "{{ quizToDelete?.title }}"? This action cannot be undone.
        </p>
        
        <div class="flex justify-end gap-3">
          <UButton
            variant="outline"
            color="gray"
            @click="showDeleteModal = false"
          >
            Cancel
          </UButton>
          <UButton
            color="red"
            @click="confirmDelete"
            :loading="isDeleting"
          >
            Delete Quiz
          </UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// Components
import QuizzesFilters from '~/components/Console/Quizzes/Filters.vue'
import QuizCard from '~/components/Console/Quizzes/QuizCard.vue'
import QuizzesAddModal from '~/components/Console/Quizzes/AddModal.vue'

// Page metadata
definePageMeta({
  layout: 'console',
  title: 'Quizzes'
})

// State
const isLoading = ref(false)
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const selectedQuiz = ref(null)
const quizToDelete = ref(null)
const isDeleting = ref(false)
const currentPage = ref(1)
const pageSize = ref(12)
const showFilters = ref(false)
const isMobile = ref(false)

// Filters
const filters = ref({
  search: '',
  classId: undefined,
  status: 'all',
  dateRange: undefined
})

// Mock data - Replace with actual API calls
const quizzes = ref([
  {
    id: 1,
    title: 'Chapter 5: Photosynthesis Quiz',
    description: 'Test your understanding of photosynthesis process',
    googleFormLink: 'https://forms.gle/example1',
    status: 'Active',
    responseCount: 24,
    createdAt: '2024-01-15T10:00:00Z',
    duration: '45',
    instructions: 'Please complete this quiz after reading Chapter 5.',
    availableClasses: [
      { id: 1, name: 'Biology Grade 10A' },
      { id: 2, name: 'Biology Grade 10B' }
    ]
  },
  {
    id: 2,
    title: 'Mathematical Functions Assessment',
    description: 'Comprehensive test on functions and their properties',
    googleFormLink: 'https://forms.gle/example2',
    status: 'Draft',
    responseCount: 0,
    createdAt: '2024-01-14T14:30:00Z',
    duration: '60',
    instructions: 'This quiz covers functions from Chapter 3.',
    availableClasses: [
      { id: 3, name: 'Mathematics Grade 11' }
    ]
  },
  {
    id: 3,
    title: 'World War II History Quiz',
    description: 'Knowledge check on WWII events and outcomes',
    googleFormLink: 'https://forms.gle/example3',
    status: 'Closed',
    responseCount: 31,
    createdAt: '2024-01-10T09:15:00Z',
    duration: null,
    instructions: 'Based on chapters 8-10 of the textbook.',
    availableClasses: [
      { id: 4, name: 'History Grade 12A' },
      { id: 5, name: 'History Grade 12B' }
    ]
  },
  {
    id: 4,
    title: 'Chemical Bonding Fundamentals',
    description: 'Quiz on ionic and covalent bonding concepts',
    googleFormLink: 'https://forms.gle/example4',
    status: 'Scheduled',
    responseCount: 0,
    createdAt: '2024-01-16T11:20:00Z',
    duration: '30',
    instructions: 'Review notes before attempting.',
    availableClasses: [
      { id: 6, name: 'Chemistry Grade 11A' }
    ]
  },
  {
    id: 5,
    title: 'Literature Analysis: Romeo and Juliet',
    description: 'Character analysis and theme exploration quiz',
    googleFormLink: 'https://forms.gle/example5',
    status: 'Active',
    responseCount: 18,
    createdAt: '2024-01-12T16:45:00Z',
    duration: '90',
    instructions: 'Ensure you have completed reading Acts 1-3.',
    availableClasses: [
      { id: 7, name: 'English Literature Grade 10' }
    ]
  },
  {
    id: 6,
    title: 'Physics: Motion and Forces',
    description: 'Practice problems on kinematics and dynamics',
    googleFormLink: 'https://forms.gle/example6',
    status: 'Active',
    responseCount: 15,
    createdAt: '2024-01-13T13:10:00Z',
    duration: '75',
    instructions: 'Calculator allowed. Show all work.',
    availableClasses: [
      { id: 8, name: 'Physics Grade 12' }
    ]
  }
])

const availableClasses = ref([
  { id: 1, name: 'Biology Grade 10A', studentCount: 28, isActive: true },
  { id: 2, name: 'Biology Grade 10B', studentCount: 25, isActive: true },
  { id: 3, name: 'Mathematics Grade 11', studentCount: 32, isActive: true },
  { id: 4, name: 'History Grade 12A', studentCount: 24, isActive: true },
  { id: 5, name: 'History Grade 12B', studentCount: 26, isActive: true },
  { id: 6, name: 'Chemistry Grade 11A', studentCount: 29, isActive: true },
  { id: 7, name: 'English Literature Grade 10', studentCount: 27, isActive: true },
  { id: 8, name: 'Physics Grade 12', studentCount: 23, isActive: true },
  { id: 9, name: 'Computer Science Grade 11', studentCount: 20, isActive: false }
])

// Computed properties
const hasActiveFilters = computed(() => {
  return filters.value.search || 
         filters.value.status !== 'all' || 
         filters.value.classId !== undefined || 
         filters.value.dateRange !== undefined
})

const filteredQuizzes = computed(() => {
  let filtered = [...quizzes.value]

  // Apply search filter
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(quiz =>
      quiz.title.toLowerCase().includes(search) ||
      quiz.description.toLowerCase().includes(search)
    )
  }

  // Apply status filter
  if (filters.value.status !== 'all') {
    filtered = filtered.filter(quiz => quiz.status.toLowerCase() === filters.value.status)
  }

  // Apply class filter
  if (filters.value.classId !== undefined) {
    filtered = filtered.filter(quiz =>
      quiz.availableClasses.some(cls => cls.id === filters.value.classId)
    )
  }

  // Apply date range filter
  if (filters.value.dateRange) {
    const now = new Date()
    filtered = filtered.filter(quiz => {
      const createdDate = new Date(quiz.createdAt)
      switch (filters.value.dateRange) {
        case '7d':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return createdDate >= weekAgo
        case '30d':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return createdDate >= monthAgo
        case '90d':
          const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          return createdDate >= threeMonthsAgo
        default:
          return true
      }
    })
  }

  // Sort by creation date (newest first)
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return filtered
})

const paginatedQuizzes = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredQuizzes.value.slice(start, end)
})

const totalQuizzes = computed(() => quizzes.value.length)
const activeQuizzes = computed(() => quizzes.value.filter(q => q.status === 'Active').length)
const totalResponses = computed(() => quizzes.value.reduce((sum, q) => sum + q.responseCount, 0))

// Methods
const openAddModal = () => {
  selectedQuiz.value = null
  showAddModal.value = true
}

const editQuiz = (quiz) => {
  selectedQuiz.value = quiz
  showAddModal.value = true
}

const deleteQuiz = (quiz) => {
  quizToDelete.value = quiz
  showDeleteModal.value = true
}

const duplicateQuiz = async (quiz) => {
  const newQuiz = {
    ...quiz,
    id: Date.now(), // Generate temporary ID
    title: `${quiz.title} (Copy)`,
    status: 'Draft',
    responseCount: 0,
    createdAt: new Date().toISOString()
  }
  
  quizzes.value.unshift(newQuiz)
  
  // Show success notification (implement with your notification system)
  console.log('Quiz duplicated successfully!')
}

const refreshData = async () => {
  isLoading.value = true
  try {
    // Simulate API refresh (replace with actual API call)
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Data refreshed successfully!')
  } catch (error) {
    console.error('Error refreshing data:', error)
  } finally {
    isLoading.value = false
  }
}

const confirmDelete = async () => {
  isDeleting.value = true
  
  try {
    // Remove quiz from array (replace with API call)
    const index = quizzes.value.findIndex(q => q.id === quizToDelete.value.id)
    if (index > -1) {
      quizzes.value.splice(index, 1)
    }
    
    showDeleteModal.value = false
    quizToDelete.value = null
    
    // Show success notification
    console.log('Quiz deleted successfully!')
  } catch (error) {
    console.error('Error deleting quiz:', error)
  } finally {
    isDeleting.value = false
  }
}

const handleQuizSubmit = async ({ data, isEdit, quiz }) => {
  try {
    if (isEdit) {
      // Update existing quiz
      const index = quizzes.value.findIndex(q => q.id === quiz.id)
      if (index > -1) {
        quizzes.value[index] = {
          ...quiz,
          ...data,
          availableClasses: availableClasses.value.filter(cls => 
            data.selectedClasses.includes(cls.id)
          )
        }
      }
      console.log('Quiz updated successfully!')
    } else {
      // Create new quiz
      const newQuiz = {
        id: Date.now(), // Generate temporary ID
        ...data,
        responseCount: 0,
        createdAt: new Date().toISOString(),
        availableClasses: availableClasses.value.filter(cls => 
          data.selectedClasses.includes(cls.id)
        )
      }
      quizzes.value.unshift(newQuiz)
      console.log('Quiz created successfully!')
    }
    
    selectedQuiz.value = null
  } catch (error) {
    console.error('Error saving quiz:', error)
    throw error
  }
}

// Watchers
watch(showAddModal, (newValue) => {
  if (!newValue) {
    // Clear selected quiz when modal is closed
    selectedQuiz.value = null
  }
})

// Lifecycle
onMounted(() => {
  // Load initial data (replace with actual API calls)
  isLoading.value = false
  
  // Check if mobile
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 768
  }
  
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  // Cleanup on unmount
  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })
})
</script>