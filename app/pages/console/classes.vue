<template>
  <div class="h-full space-y-8">
    <!-- Moderators Section -->
    <div class="bg-white rounded-lg shadow-sm p-6 lg:p-8 space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-xl font-semibold">Classes</h2>
          <p class="text-sm text-gray-500 mt-1">Manage your classes and schedules</p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div class="flex gap-2 w-full sm:w-auto">
            <UButton
              icon="i-heroicons-arrow-path"
              :ui="{ rounded: 'rounded-full' }"
              :loading="isRefreshing"
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
          <UButton 
            label="Create Class" 
            color="primary" 
            icon="i-heroicons-plus" 
            :ui="{ rounded: 'rounded-full' }"
            :block="isMobile" 
            @click="isCreateModalOpen = true"
          />
        </div>
      </div>

      <!-- Filters -->
      <ConsoleClassesFilters 
        v-show="showFilters" 
        :filters="filters"
        @update:filters="updateFilters" 
        class="transition-all duration-200 ease-in-out"
      />

      <!-- Classes Grid -->
      <div :class="['grid gap-6', gridClass]">
        <ConsoleClassesClassCard
          v-for="classItem in paginatedClasses"
          :key="classItem.id"
          :class-item="classItem"
          @view-students="handleViewStudents"
          @edit="handleEditClass"
          @delete="handleDeleteClass"
          @cancel-week="handleCancelWeek"
        />
      </div>

      <!-- Pagination -->
      <div class="flex justify-between items-center pt-4">
        <div class="text-sm text-gray-500">
          Showing {{ Math.min((page - 1) * pageSize + 1, filteredClasses.length) }}-{{ Math.min(page * pageSize,
            filteredClasses.length) }} of {{ filteredClasses.length }} classes
        </div>

        <UPagination 
          v-model="page" 
          :total="filteredClasses.length" 
          :page-count="pageSize" 
          size="sm"
          :ui="{
            wrapper: 'flex items-center gap-1',
            base: 'min-w-[32px] h-[32px] flex items-center justify-center text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors',
            rounded: 'rounded-lg',
            default: {
              inactive: 'hover:bg-gray-50',
              active: 'bg-primary-50 text-primary-500 font-medium'
            }
          }" 
        />
      </div>
    </div>

    <!-- Create Class Modal -->
    <ConsoleClassesCreateModal 
      v-model="isCreateModalOpen"
      @created="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { isMobileScreen } from '~/lib/utils'
import { useSidebarStore } from '~/stores/sidebar'
import { useNotification } from '~/composables/useNotification'

// Types
type ClassMethod = 'VirtualRecurringSeries' | 'VirtualSingleSession' | 'InPersonRecurringSeries' | 'InPersonSingleSession'

interface ClassItem {
  id: number
  name: string
  description: string | null
  date: string
  start_time: string
  end_time: string
  method: ClassMethod
  is_active: boolean
  tags: string[]
  created_at: string
  student_count: number
  max_students: number | null
}

// Page meta
definePageMeta({
  layout: 'console'
})

// Store & Composables
const sidebarStore = useSidebarStore()
const notification = useNotification()

// State
const isMobile = ref(isMobileScreen())
const showFilters = ref(false)
const isRefreshing = ref(false)
const isCreateModalOpen = ref(false)
const page = ref(1)
const pageSize = 9

// Filter state
const filters = ref({
  search: '',
  method: undefined as ClassMethod | undefined,
  tag: undefined,
  status: undefined
})

// Dummy data for demonstration
const classes = ref<ClassItem[]>([
  {
    id: 1,
    name: 'Advanced Mathematics - Grade 11',
    description: 'Advanced level mathematics covering algebra, calculus, and statistics for Grade 11 students.',
    date: 'Every Monday, Wednesday',
    start_time: '16:00:00',
    end_time: '18:00:00',
    method: 'VirtualRecurringSeries',
    is_active: true,
    tags: ['Mathematics', 'Grade 11', 'Advanced'],
    created_at: '2025-03-30T14:00:00Z',
    student_count: 45,
    max_students: 50
  },
  {
    id: 2,
    name: 'Biology Practical Workshop',
    description: 'Hands-on biology practical session covering microscopy and specimen analysis.',
    date: 'April 15, 2025',
    start_time: '09:00:00',
    end_time: '12:00:00',
    method: 'InPersonSingleSession',
    is_active: true,
    tags: ['Biology', 'Grade 10', 'Practical'],
    created_at: '2025-03-25T08:30:00Z',
    student_count: 20,
    max_students: 25
  },
  {
    id: 3,
    name: 'Physics Theory Class',
    description: 'Regular physics theory class covering mechanics and dynamics.',
    date: 'Every Tuesday, Friday',
    start_time: '14:30:00',
    end_time: '16:30:00',
    method: 'InPersonRecurringSeries',
    is_active: false,
    tags: ['Physics', 'Grade 11', 'Theory'],
    created_at: '2025-03-20T11:15:00Z',
    student_count: 38,
    max_students: 40
  },
  {
    id: 4,
    name: 'Chemistry Revision Webinar',
    description: 'Online revision session for upcoming chemistry examinations.',
    date: 'April 10, 2025',
    start_time: '17:00:00',
    end_time: '19:00:00',
    method: 'VirtualSingleSession',
    is_active: true,
    tags: ['Chemistry', 'Grade 11', 'Revision'],
    created_at: '2025-04-01T09:00:00Z',
    student_count: 65,
    max_students: 100
  }
])

// Computed properties
const filteredClasses = computed(() => {
  return classes.value.filter(classItem => {
    const matchesSearch = !filters.value.search || 
      classItem.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      classItem.description?.toLowerCase().includes(filters.value.search.toLowerCase())
    
    const matchesMethod = filters.value.method === undefined || 
      classItem.method === filters.value.method
    
    const matchesTag = filters.value.tag === undefined || 
      classItem.tags.includes(filters.value.tag)
    
    const matchesStatus = filters.value.status === undefined || 
      classItem.is_active === filters.value.status

    return matchesSearch && matchesMethod && matchesTag && matchesStatus
  })
})

const paginatedClasses = computed(() => 
  filteredClasses.value.slice((page.value - 1) * pageSize, page.value * pageSize)
)

const gridClass = computed(() => {
  if (!sidebarStore.isOpen) {
    return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
  }
  return 'grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3'
})

// Action handlers
const updateFilters = (newFilters: any) => {
  Object.assign(filters.value, newFilters)
}

const refreshData = async () => {
  isRefreshing.value = true
  try {
    // Implement actual data refresh logic here
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    console.error('Error refreshing classes:', error)
  } finally {
    isRefreshing.value = false
  }
}

const handleStartClass = (classItem: any) => {
  // Implement start class logic
  console.log('Starting class:', classItem.name)
}

const handleViewStudents = (classItem: any) => {
  // Implement view students logic
  console.log('Viewing students for:', classItem.name)
}

const handleEditClass = (classItem: any) => {
  // Implement edit class logic
  console.log('Editing class:', classItem.name)
}

const handleDeleteClass = (classItem: any) => {
  // Implement delete class logic
  console.log('Deleting class:', classItem.name)
}

const handleCancelWeek = async (classItem: ClassItem) => {
  try {
    // TODO: Implement actual cancellation logic here
    // await cancelClass(classItem.id)
    notification.showSuccess(`Class cancelled for ${classItem.date}`)
  } catch (error) {
    console.error('Error cancelling class:', error)
    notification.showError('Failed to cancel class')
  }
}

// Initialize data
onMounted(() => {
  refreshData()
})

// Mobile responsive handler
if (import.meta.client) {
  window.addEventListener('resize', () => {
    isMobile.value = isMobileScreen()
  })
}
</script>