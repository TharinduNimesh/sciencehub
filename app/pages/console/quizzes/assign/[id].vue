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
            <template v-if="quizLoading">
              <USkeleton class="h-7 w-40 mb-2" />
              <USkeleton class="h-4 w-32" />
            </template>
            <template v-else>
              <h1 
                class="font-semibold text-gray-900 transition-all duration-300"
                :class="[
                  sidebarStore.isMobile ? 'text-lg sm:text-xl' :
                  sidebarStore.isOpen ? 'text-xl' : 'text-lg lg:text-xl xl:text-2xl'
                ]"
              >
                {{ quiz?.title || '' }}
              </h1>
              <p 
                class="text-gray-500 mt-1 transition-all duration-300"
                :class="[
                  sidebarStore.isMobile ? 'text-xs sm:text-sm' :
                  sidebarStore.isOpen ? 'text-sm' : 'text-xs lg:text-sm'
                ]"
              >
                {{ quiz?.description || '' }}
              </p>
            </template>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <UButton
            icon="i-heroicons-arrow-top-right-on-square"
            color="gray"
            variant="outline"
            :to="quiz?.form_link || ''"
            target="_blank"
            :size="sidebarStore.isMobile ? 'sm' : 'md'"
            :disabled="quizLoading"
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

      <div v-if="quizLoading || classStudentsLoading">
        <div v-for="i in 3" :key="i" class="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center justify-between gap-4 mb-3">
          <div class="flex items-center gap-4">
            <USkeleton class="rounded-full h-10 w-10" />
            <div>
              <USkeleton class="h-4 w-32 mb-2 rounded" />
              <div class="flex gap-2 items-center">
                <USkeleton class="h-3 w-20 rounded" />
                <USkeleton class="h-3 w-16 rounded" />
              </div>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <USkeleton class="h-6 w-10 rounded" />
            <USkeleton class="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
      <div v-else-if="filteredAssignedStudents.length === 0">
        <div class="text-center py-8">
          <UIcon name="i-heroicons-academic-cap" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500">No assigned marks found</p>
        </div>
      </div>
      <div v-else class="space-y-4">
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

      <div v-if="quizLoading || classStudentsLoading">
        <div v-for="i in 3" :key="i" class="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center justify-between gap-4 mb-3">
          <div class="flex items-center gap-4">
            <USkeleton class="rounded-full h-10 w-10" />
            <div>
              <USkeleton class="h-4 w-32 mb-2 rounded" />
              <div class="flex gap-2 items-center">
                <USkeleton class="h-3 w-20 rounded" />
                <USkeleton class="h-3 w-16 rounded" />
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <USkeleton class="h-5 w-28 rounded" />
            <USkeleton class="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
      <div v-else-if="filteredPendingStudents.length === 0">
        <div class="text-center py-8">
          <UIcon name="i-heroicons-clock" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500">No pending assignments found</p>
        </div>
      </div>
      <div v-else class="space-y-4">
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
              :alt="selectedStudent.name"
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
            <UButton color="gray" variant="outline" @click="showAssignModal = false" :disabled="assigningMarks">
              Cancel
            </UButton>
            <UButton color="primary" @click="confirmAssignMarks" :loading="assigningMarks" :disabled="assigningMarks || !isValidMarks">
              Assign Marks
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Add loading skeleton for quiz and class students -->
    <div v-if="quizLoading || classStudentsLoading" class="flex flex-col gap-6 py-12">
      <div class="animate-pulse space-y-4">
        <div class="h-8 bg-gray-200 rounded w-1/3 mx-auto" />
        <div class="h-6 bg-gray-200 rounded w-1/4 mx-auto" />
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div v-for="i in 4" :key="i" class="h-24 bg-gray-100 rounded-lg border border-gray-200" />
        </div>
        <div class="h-10 bg-gray-200 rounded w-1/2 mx-auto mt-8" />
        <div class="h-40 bg-gray-100 rounded-lg border border-gray-200 mt-4" />
      </div>
      <div class="flex flex-col items-center mt-8">
        <span class="text-gray-400 text-sm">Loading students and marks...</span>
      </div>
    </div>
    <div v-else-if="quizError || classStudentsError" class="flex flex-col items-center py-12 text-red-500">
      <span v-if="quizError">Failed to load quiz: {{ quizError.message }}</span>
      <span v-else-if="classStudentsError">Failed to load students: {{ classStudentsError.message }}</span>
    </div>
    <div v-else>
      <template v-if="assignedCount === 0 && pendingCount === 0">
        <div class="flex flex-col items-center py-16">
          <UIcon name="i-heroicons-user-group" class="w-16 h-16 text-gray-200 mb-4" />
          <p class="text-gray-500 text-lg mb-2">No students found for this quiz</p>
          <p class="text-gray-400 text-sm">Check if classes are assigned and students are enrolled.</p>
        </div>
      </template>
      <template v-else>
        <!-- Main content here -->
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSidebarStore } from '~/stores/sidebar'
import { useNotification } from '~/composables/useNotification'


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

// Quizzes composable
const { getQuizById, loading: quizLoading, error: quizError } = useQuizzes()

// Quiz state
const quiz = ref(null)
const quizMarks = ref([])

// Class students state
const classStudents = ref({}) // { [classId]: students[] }
const classStudentsLoading = ref(false)
const classStudentsError = ref(null)

const supabase = useSupabaseClient()
const { getStudentsByClassId } = useClassStudents()

// Helper to load quiz marks
const loadQuizMarks = async (quizId) => {
  const { data, error } = await supabase
    .from('quiz_marks')
    .select('*')
    .eq('quiz_id', quizId)
  if (error) throw error
  quizMarks.value = data || []
}

// Load quiz data, quiz marks, and then class students
onMounted(async () => {
  try {
    quiz.value = await getQuizById(Number(quizId))
    await loadQuizMarks(Number(quizId))
    // Only load class students after quiz and marks are loaded
    if (quiz.value?.classes && quiz.value.classes.length > 0) {
      classStudentsLoading.value = true
      for (const cls of quiz.value.classes) {
        try {
          classStudents.value[cls.id] = await getStudentsByClassId(cls.id)
        } catch (err) {
          classStudentsError.value = err
        }
      }
      classStudentsLoading.value = false
    }
  } catch (e) {
    // error is already set in quizError
  }
})

// State
const assignedSearch = ref('')
const pendingSearch = ref('')
const showAssignModal = ref(false)
const selectedStudent = ref(null)
const assignedMarks = ref('')
const sortBy = ref('marks_desc')
const assigningMarks = ref(false)

// Sort options
const sortOptions = [
  { label: 'Marks: High to Low', value: 'marks_desc' },
  { label: 'Marks: Low to High', value: 'marks_asc' },
  { label: 'Name: A to Z', value: 'name_asc' },
  { label: 'Name: Z to A', value: 'name_desc' },
  { label: 'Date: Newest First', value: 'date_desc' },
  { label: 'Date: Oldest First', value: 'date_asc' }
]

// Helper: Flatten all loaded class students into a single array
const allLoadedStudents = computed(() => {
  if (!quiz.value?.classes) return []
  const students = []
  for (const cls of quiz.value.classes) {
    if (classStudents.value[cls.id]) {
      for (const s of classStudents.value[cls.id]) {
        students.push({
          ...s,
          name: s.student_name, // use correct property for name
          email: s.student_email, // use correct property for email
          class: { name: cls.name, color: 'blue' } // TODO: set color dynamically if available
        })
      }
    }
  }
  return students
})

// Split students into assigned and pending based on quiz_marks
const assignedStudents = computed(() => {
  return allLoadedStudents.value
    .map(student => {
      const mark = quizMarks.value.find(m => m.student_id === student.student_id)
      if (mark) {
        return {
          ...student,
          marks: mark.marks,
          assignedAt: mark.created_at
        }
      }
      return null
    })
    .filter(Boolean)
})

const pendingStudents = computed(() => {
  return allLoadedStudents.value.filter(student => {
    return !quizMarks.value.find(m => m.student_id === student.student_id)
  })
})

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

const isValidMarks = computed(() => {
  // Only allow numbers >= 0 and <= 100 (or set your max)
  const val = Number(assignedMarks.value)
  return !isNaN(val) && val >= 0 && val <= 100 && selectedStudent.value
})

const { showSuccess, showError } = useNotification()

const confirmAssignMarks = async () => {
  if (!isValidMarks.value) return
  assigningMarks.value = true
  try {
    // Check if a mark already exists for this student/quiz
    const { data: existing, error: checkError } = await supabase
      .from('quiz_marks')
      .select('id')
      .eq('quiz_id', quizId)
      .eq('student_id', selectedStudent.value.student_id)
      .maybeSingle()
    if (checkError) throw checkError
    if (existing) {
      // Update existing mark
      const { error: updateError } = await supabase
        .from('quiz_marks')
        .update({ marks: Number(assignedMarks.value) })
        .eq('id', existing.id)
      if (updateError) throw updateError
      showSuccess('Marks updated successfully!')
    } else {
      // Insert new mark
      const { error: insertError } = await supabase
        .from('quiz_marks')
        .insert({
          quiz_id: Number(quizId),
          student_id: selectedStudent.value.student_id,
          marks: Number(assignedMarks.value)
        })
      if (insertError) throw insertError
      showSuccess('Marks assigned successfully!')
    }
    showAssignModal.value = false
    selectedStudent.value = null
    assignedMarks.value = ''
    // Refresh marks
    await loadQuizMarks(Number(quizId))
  } catch (e) {
    showError(e.message || 'Failed to assign/update marks')
  } finally {
    assigningMarks.value = false
  }
}
</script>
