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
        <!-- Loading Skeletons -->
        <template v-if="isRefreshing">
          <div v-for="i in 6" :key="i" class="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div class="p-6 space-y-4">
              <!-- Header Skeleton -->
              <div class="flex justify-between items-start gap-4">
                <div class="space-y-2 flex-1">
                  <USkeleton class="h-6 w-2/3" />
                  <USkeleton class="h-4 w-full" />
                </div>
                <USkeleton class="h-6 w-16" />
              </div>

              <!-- Method & Schedule Skeleton -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <USkeleton class="h-6 w-32" />
                  <USkeleton class="h-6 w-24" />
                </div>
                <div class="flex items-center justify-between">
                  <USkeleton class="h-5 w-36" />
                  <USkeleton class="h-5 w-32" />
                </div>
              </div>

              <!-- Tags Skeleton -->
              <div class="flex gap-2">
                <USkeleton v-for="j in 3" :key="j" class="h-5 w-16" />
              </div>

              <!-- Actions Skeleton -->
              <div class="flex items-center justify-between pt-2">
                <USkeleton class="h-4 w-32" />
                <div class="flex items-center gap-2">
                  <USkeleton v-for="j in 4" :key="j" class="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </template>

        <ConsoleClassesClassCard
          v-else
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
import { useClasses, type Class, type ClassMethod } from '~/composables/useClasses'

// Page meta
definePageMeta({
  layout: 'console'
})

// Store & Composables
const sidebarStore = useSidebarStore()
const notification = useNotification()
const { getClasses, loading: isRefreshing } = useClasses()

// State
const isMobile = ref(isMobileScreen())
const showFilters = ref(false)
const isCreateModalOpen = ref(false)
const page = ref(1)
const pageSize = 9
const classes = ref<Class[]>([])

// Filter state
const filters = ref({
  search: '',
  method: undefined as ClassMethod | undefined,
  tag: undefined,
  status: undefined
})

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
  try {
    const data = await getClasses()
    classes.value = data
  } catch (error) {
    console.error('Error refreshing classes:', error)
    notification.showError('Failed to load classes')
  }
}

const handleViewStudents = (classItem: Class) => {
  // Implement view students logic
  console.log('Viewing students for:', classItem.name)
}

const handleEditClass = (classItem: Class) => {
  // Implement edit class logic
  console.log('Editing class:', classItem.name)
}

const handleDeleteClass = (classItem: Class) => {
  // Implement delete class logic
  console.log('Deleting class:', classItem.name)
}

const handleCancelWeek = async (classItem: Class) => {
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