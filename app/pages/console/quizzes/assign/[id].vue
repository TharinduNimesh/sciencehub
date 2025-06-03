<template>
  <div 
    class="h-full space-y-8 transition-all duration-300"
    :class="[
      sidebarStore.isMobile ? 'px-0' : 
      sidebarStore.isOpen ? 'px-0' : 'px-2'
    ]"
  >
    <!-- Header Section -->
    <div 
      class="bg-white rounded-lg shadow-sm space-y-6 transition-all duration-300"
      :class="[
        sidebarStore.isMobile ? 'p-4 sm:p-6' : 
        sidebarStore.isOpen ? 'p-6 lg:p-8' : 'p-4 lg:p-6 xl:p-8'
      ]"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <UButton
            icon="i-heroicons-arrow-left"
            color="gray"
            variant="ghost"
            to="/console/quizzes"
            :size="sidebarStore.isMobile ? 'sm' : 'md'"
          />
          <div>
            <h1 
              class="font-semibold text-gray-900 transition-all duration-300"
              :class="[
                sidebarStore.isMobile ? 'text-lg sm:text-xl' :
                sidebarStore.isOpen ? 'text-xl' : 'text-lg lg:text-xl xl:text-2xl'
              ]"
            >
              Assign Marks
            </h1>
            <p 
              class="text-gray-500 mt-1 transition-all duration-300"
              :class="[
                sidebarStore.isMobile ? 'text-xs sm:text-sm' :
                sidebarStore.isOpen ? 'text-sm' : 'text-xs lg:text-sm'
              ]"
            >
              {{ quiz.title }}
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <UButton
            icon="i-heroicons-arrow-top-right-on-square"
            color="gray"
            variant="outline"
            :to="quiz.googleFormLink"
            target="_blank"
            :size="sidebarStore.isMobile ? 'sm' : 'md'"
          >
            View Quiz
          </UButton>
        </div>
      </div>

      <!-- Quiz Info Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-users" class="text-white w-5 h-5" />
            </div>
            <div>
              <p class="text-sm font-medium text-blue-700">Total Students</p>
              <p class="text-xl font-bold text-blue-900">{{ totalStudents }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-check-circle" class="text-white w-5 h-5" />
            </div>
            <div>
              <p class="text-sm font-medium text-green-700">Assigned</p>
              <p class="text-xl font-bold text-green-900">{{ assignedCount }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-clock" class="text-white w-5 h-5" />
            </div>
            <div>
              <p class="text-sm font-medium text-yellow-700">Pending</p>
              <p class="text-xl font-bold text-yellow-900">{{ pendingCount }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-academic-cap" class="text-white w-5 h-5" />
            </div>
            <div>
              <p class="text-sm font-medium text-purple-700">Average</p>
              <p class="text-xl font-bold text-purple-900">{{ averageMarks }}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Assigned Marks Section -->
    <div 
      class="bg-white rounded-lg shadow-sm transition-all duration-300"
      :class="[
        sidebarStore.isMobile ? 'p-4 sm:p-6' : 
        sidebarStore.isOpen ? 'p-6 lg:p-8' : 'p-4 lg:p-6 xl:p-8'
      ]"
    >
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 
            class="font-semibold text-gray-900 transition-all duration-300"
            :class="[
              sidebarStore.isMobile ? 'text-base sm:text-lg' :
              sidebarStore.isOpen ? 'text-lg' : 'text-base lg:text-lg'
            ]"
          >
            Assigned Marks
          </h2>
          <p 
            class="text-gray-500 mt-1 transition-all duration-300"
            :class="[
              sidebarStore.isMobile ? 'text-xs sm:text-sm' :
              sidebarStore.isOpen ? 'text-sm' : 'text-xs lg:text-sm'
            ]"
          >
            Students who have been graded
          </p>
        </div>
        
        <div class="flex items-center gap-2">
          <UInput
            v-model="assignedSearch"
            placeholder="Search students..."
            icon="i-heroicons-magnifying-glass"
            :size="sidebarStore.isMobile ? 'sm' : 'md'"
            class="w-48"
          />
          <USelectMenu
            v-model="sortBy"
            :options="sortOptions"
            :size="sidebarStore.isMobile ? 'sm' : 'md'"
            class="w-40"
            value-attribute="value"
            option-attribute="label"
          />
          <UButton
            icon="i-heroicons-funnel"
            color="gray"
            variant="outline"
            :size="sidebarStore.isMobile ? 'sm' : 'md'"
          />
        </div>
      </div>

      <div class="space-y-4">
        <div
          v-for="student in filteredAssignedStudents"
          :key="student.id"
          class="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <UAvatar
                :alt="student.name"
                size="md"
              />
              
              <div>
                <h3 class="font-medium text-gray-900">{{ student.name }}</h3>
                <div class="flex items-center gap-3 mt-1">
                  <span class="text-sm text-gray-500">{{ student.email }}</span>
                  <UBadge 
                    :color="student.class.color" 
                    variant="soft" 
                    size="xs"
                  >
                    {{ student.class.name }}
                  </UBadge>
                </div>
              </div>
            </div>
            
            <div class="flex items-center gap-4">
              <div class="text-right">
                <div class="flex items-center gap-2">
                  <span class="text-2xl font-bold" :class="getMarkColor(student.marks)">
                    {{ student.marks }}
                  </span>
                </div>
                <div class="flex items-center gap-1 mt-1">
                  <UIcon name="i-heroicons-calendar" class="w-3 h-3 text-gray-400" />
                  <span class="text-xs text-gray-500">{{ formatDate(student.assignedAt) }}</span>
                </div>
              </div>
              
              <UButton
                icon="i-heroicons-pencil-square"
                color="primary"
                variant="soft"
                size="sm"
                @click="editMarks(student)"
              />
            </div>
          </div>
        </div>

        <div v-if="filteredAssignedStudents.length === 0" class="text-center py-8">
          <UIcon name="i-heroicons-academic-cap" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500">No assigned marks found</p>
        </div>
      </div>
    </div>

    <!-- Pending Marks Section -->
    <div 
      class="bg-white rounded-lg shadow-sm transition-all duration-300"
      :class="[
        sidebarStore.isMobile ? 'p-4 sm:p-6' : 
        sidebarStore.isOpen ? 'p-6 lg:p-8' : 'p-4 lg:p-6 xl:p-8'
      ]"
    >
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 
            class="font-semibold text-gray-900 transition-all duration-300"
            :class="[
              sidebarStore.isMobile ? 'text-base sm:text-lg' :
              sidebarStore.isOpen ? 'text-lg' : 'text-base lg:text-lg'
            ]"
          >
            Pending Assignments
          </h2>
          <p 
            class="text-gray-500 mt-1 transition-all duration-300"
            :class="[
              sidebarStore.isMobile ? 'text-xs sm:text-sm' :
              sidebarStore.isOpen ? 'text-sm' : 'text-xs lg:text-sm'
            ]"
          >
            Students ready to be graded
          </p>
        </div>
        
        <div class="flex items-center gap-2">
          <UInput
            v-model="pendingSearch"
            placeholder="Search students..."
            icon="i-heroicons-magnifying-glass"
            :size="sidebarStore.isMobile ? 'sm' : 'md'"
            class="w-48"
          />
        </div>
      </div>

      <div class="space-y-4">
        <div
          v-for="student in filteredPendingStudents"
          :key="student.id"
          class="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <UAvatar
                :alt="student.name"
                size="md"
              />
              
              <div>
                <h3 class="font-medium text-gray-900">{{ student.name }}</h3>
                <div class="flex items-center gap-3 mt-1">
                  <span class="text-sm text-gray-500">{{ student.email }}</span>
                  <UBadge 
                    :color="student.class.color" 
                    variant="soft" 
                    size="xs"
                  >
                    {{ student.class.name }}
                  </UBadge>
                </div>
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <div class="text-right text-sm text-gray-500">
                <div class="flex items-center gap-1">
                  <UIcon name="i-heroicons-clock" class="w-3 h-3" />
                  <span>Submitted {{ formatDate(student.submittedAt) }}</span>
                </div>
              </div>
              
              <UButton
                icon="i-heroicons-plus"
                color="primary"
                variant="outline"
                size="sm"
                @click="assignMarks(student)"
              >
                Assign
              </UButton>
            </div>
          </div>
        </div>

        <div v-if="filteredPendingStudents.length === 0" class="text-center py-8">
          <UIcon name="i-heroicons-clock" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500">No pending assignments found</p>
        </div>
      </div>
    </div>

    <!-- Assign Marks Modal -->
    <UModal v-model="showAssignModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Assign Marks</h3>
        </template>

        <div v-if="selectedStudent" class="space-y-4">
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <UAvatar
                :alt="student.name"
                size="md"
              />
            <div>
              <p class="font-medium">{{ selectedStudent.name }}</p>
              <p class="text-sm text-gray-500">{{ selectedStudent.email }}</p>
            </div>
          </div>

          <UFormGroup label="Marks">
            <UInput
              v-model="assignedMarks"
              type="number"
              :min="0"
              placeholder="Enter marks"
            />
          </UFormGroup>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton color="gray" variant="outline" @click="showAssignModal = false">
              Cancel
            </UButton>
            <UButton color="primary" @click="confirmAssignMarks">
              Assign Marks
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSidebarStore } from '~/stores/sidebar'

// Page metadata
definePageMeta({
  layout: 'console',
  title: 'Assign Marks'
})

// Stores
const sidebarStore = useSidebarStore()

// Get quiz ID from route
const route = useRoute()
const quizId = route.params.id

// Dummy data
const quiz = ref({
  id: quizId,
  title: 'Mathematics Final Exam 2024',
  description: 'Comprehensive exam covering all topics from the semester',
  googleFormLink: 'https://forms.google.com/example',
  maxMarks: 100
})

const maxMarks = 100

// State
const assignedSearch = ref('')
const pendingSearch = ref('')
const showAssignModal = ref(false)
const selectedStudent = ref(null)
const assignedMarks = ref('')
const sortBy = ref('marks_desc')

// Sort options
const sortOptions = [
  { label: 'Marks: High to Low', value: 'marks_desc' },
  { label: 'Marks: Low to High', value: 'marks_asc' },
  { label: 'Name: A to Z', value: 'name_asc' },
  { label: 'Name: Z to A', value: 'name_desc' },
  { label: 'Date: Newest First', value: 'date_desc' },
  { label: 'Date: Oldest First', value: 'date_asc' }
]

// Dummy assigned students data
const assignedStudents = ref([
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: null,
    marks: 85,
    assignedAt: '2024-03-15T10:30:00Z',
    class: { name: 'Grade 10A', color: 'blue' }
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    avatar: null,
    marks: 92,
    assignedAt: '2024-03-15T11:15:00Z',
    class: { name: 'Grade 10B', color: 'green' }
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    avatar: null,
    marks: 78,
    assignedAt: '2024-03-15T09:45:00Z',
    class: { name: 'Grade 10A', color: 'blue' }
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    avatar: null,
    marks: 96,
    assignedAt: '2024-03-15T12:20:00Z',
    class: { name: 'Grade 10C', color: 'purple' }
  }
])

// Dummy pending students data
const pendingStudents = ref([
  {
    id: 5,
    name: 'David Brown',
    email: 'david.brown@example.com',
    avatar: null,
    submittedAt: '2024-03-14T16:30:00Z',
    class: { name: 'Grade 10A', color: 'blue' }
  },
  {
    id: 6,
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    avatar: null,
    submittedAt: '2024-03-14T17:15:00Z',
    class: { name: 'Grade 10B', color: 'green' }
  },
  {
    id: 7,
    name: 'Alex Miller',
    email: 'alex.miller@example.com',
    avatar: null,
    submittedAt: '2024-03-14T15:45:00Z',
    class: { name: 'Grade 10C', color: 'purple' }
  }
])

// Computed properties
const totalStudents = computed(() => assignedStudents.value.length + pendingStudents.value.length)
const assignedCount = computed(() => assignedStudents.value.length)
const pendingCount = computed(() => pendingStudents.value.length)
const averageMarks = computed(() => {
  if (assignedStudents.value.length === 0) return 0
  const total = assignedStudents.value.reduce((sum, student) => sum + student.marks, 0)
  return Math.round(total / assignedStudents.value.length)
})

const filteredAssignedStudents = computed(() => {
  let filtered = assignedStudents.value
  
  // Apply search filter
  if (assignedSearch.value) {
    filtered = filtered.filter(student =>
      student.name.toLowerCase().includes(assignedSearch.value.toLowerCase()) ||
      student.email.toLowerCase().includes(assignedSearch.value.toLowerCase())
    )
  }
  
  // Apply sorting
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy.value) {
      case 'marks_desc':
        return b.marks - a.marks
      case 'marks_asc':
        return a.marks - b.marks
      case 'name_asc':
        return a.name.localeCompare(b.name)
      case 'name_desc':
        return b.name.localeCompare(a.name)
      case 'date_desc':
        return new Date(b.assignedAt) - new Date(a.assignedAt)
      case 'date_asc':
        return new Date(a.assignedAt) - new Date(b.assignedAt)
      default:
        return 0
    }
  })
  
  return sorted
})

const filteredPendingStudents = computed(() => {
  if (!pendingSearch.value) return pendingStudents.value
  return pendingStudents.value.filter(student =>
    student.name.toLowerCase().includes(pendingSearch.value.toLowerCase()) ||
    student.email.toLowerCase().includes(pendingSearch.value.toLowerCase())
  )
})

// Methods
const getMarkColor = (marks) => {
  if (marks >= 90) return 'text-green-600'
  if (marks >= 80) return 'text-blue-600'
  if (marks >= 70) return 'text-yellow-600'
  if (marks >= 60) return 'text-orange-600'
  return 'text-red-600'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const editMarks = (student) => {
  selectedStudent.value = student
  assignedMarks.value = student.marks
  showAssignModal.value = true
}

const assignMarks = (student) => {
  selectedStudent.value = student
  assignedMarks.value = ''
  showAssignModal.value = true
}

const confirmAssignMarks = () => {
  // Here you would normally save the marks
  console.log('Assigning marks:', {
    student: selectedStudent.value,
    marks: assignedMarks.value
  })
  
  showAssignModal.value = false
  selectedStudent.value = null
  assignedMarks.value = ''
}
</script>