<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary-300 group h-full flex flex-col">
    <!-- Header -->
    <div 
      class="flex items-start justify-between pb-4 transition-all duration-300"
      :class="[
        sidebarStore.isMobile ? 'p-4 sm:p-6' :
        sidebarStore.isOpen ? 'p-6' : 'p-4 lg:p-6'
      ]"
    >
      <div class="flex-1 min-w-0">
        <h3 
          class="font-semibold text-gray-900 mb-2 line-clamp-2 transition-all duration-300"
          :class="[
            sidebarStore.isMobile ? 'text-base sm:text-lg' :
            sidebarStore.isOpen ? 'text-lg' : 'text-base lg:text-lg'
          ]"
        >
          {{ quiz.title }}
        </h3>
        
        <!-- Status and Date -->
        <div class="flex items-center gap-3 mb-3">
          <UBadge 
            :color="statusColor" 
            variant="soft"
            :size="sidebarStore.isMobile ? 'xs' : 'sm'"
          >
            {{ quizStatus }}
          </UBadge>
          <!-- Student Marks Badge -->
          <UBadge 
            v-if="isStudent() && studentMark !== null"
            :color="getMarkColor(studentMark)"
            variant="solid"
            :size="sidebarStore.isMobile ? 'xs' : 'sm'"
          >
            {{ studentMark }}%
          </UBadge>
          <span 
            class="text-gray-500 transition-all duration-300"
            :class="[
              sidebarStore.isMobile ? 'text-xs' :
              sidebarStore.isOpen ? 'text-xs' : 'text-xs lg:text-sm'
            ]"
          >
            {{ formatDate(quiz.createdAt) }}
          </span>
        </div>
      </div>

      <!-- Action Menu (Admin Only) -->
      <UDropdown v-if="isAdmin()" :items="menuItems" :popper="{ arrow: true }">
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-ellipsis-vertical"
          :size="sidebarStore.isMobile ? 'xs' : 'sm'"
          class="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </UDropdown>
    </div>

    <!-- Content -->
    <div 
      class="pb-4 flex-1 flex flex-col transition-all duration-300"
      :class="[
        sidebarStore.isMobile ? 'px-4 sm:px-6' :
        sidebarStore.isOpen ? 'px-6' : 'px-4 lg:px-6'
      ]"
    >
      <!-- Description -->
      <p 
        class="text-gray-600 mb-4 line-clamp-2 flex-shrink-0 transition-all duration-300"
        :class="[
          sidebarStore.isMobile ? 'text-xs sm:text-sm' :
          sidebarStore.isOpen ? 'text-sm' : 'text-xs lg:text-sm'
        ]"
      >
        {{ quiz.description }}
      </p>

      <!-- Quiz Info -->
      <div class="space-y-2 mb-4 flex-shrink-0">
        <!-- Response Count (Admin Only) -->
        <div 
          v-if="isAdmin()"
          class="flex items-center gap-2 text-gray-600 transition-all duration-300"
          :class="[
            sidebarStore.isMobile ? 'text-xs sm:text-sm' :
            sidebarStore.isOpen ? 'text-sm' : 'text-xs lg:text-sm'
          ]"
        >
          <UIcon 
            name="i-heroicons-users" 
            class="text-gray-400 flex-shrink-0"
            :class="[
              sidebarStore.isMobile ? 'w-3 h-3 sm:w-4 sm:h-4' :
              sidebarStore.isOpen ? 'w-4 h-4' : 'w-3 h-3 lg:w-4 lg:h-4'
            ]"
          />
          <span>{{ quiz.responseCount }} {{ quiz.responseCount === 1 ? 'response' : 'responses' }}</span>
        </div>

        <!-- Student Mark Details (Student Only) -->
        <div 
          v-if="isStudent() && studentMark !== null"
          class="flex items-center gap-2 text-gray-600 transition-all duration-300"
          :class="[
            sidebarStore.isMobile ? 'text-xs sm:text-sm' :
            sidebarStore.isOpen ? 'text-sm' : 'text-xs lg:text-sm'
          ]"
        >
          <UIcon 
            name="i-heroicons-academic-cap" 
            class="text-gray-400 flex-shrink-0"
            :class="[
              sidebarStore.isMobile ? 'w-3 h-3 sm:w-4 sm:h-4' :
              sidebarStore.isOpen ? 'w-4 h-4' : 'w-3 h-3 lg:w-4 lg:h-4'
            ]"
          />
          <span>Your Score: {{ studentMark }}%</span>
        </div>

        <!-- Submission Status (Student Only) -->
        <div 
          v-if="isStudent()"
          class="flex items-center gap-2 text-gray-600 transition-all duration-300"
          :class="[
            sidebarStore.isMobile ? 'text-xs sm:text-sm' :
            sidebarStore.isOpen ? 'text-sm' : 'text-xs lg:text-sm'
          ]"
        >
          <UIcon 
            :name="submissionStatusIcon" 
            :class="[
              'flex-shrink-0',
              submissionStatusColor,
              sidebarStore.isMobile ? 'w-3 h-3 sm:w-4 sm:h-4' :
              sidebarStore.isOpen ? 'w-4 h-4' : 'w-3 h-3 lg:w-4 lg:h-4'
            ]"
          />
          <span>{{ submissionStatusText }}</span>
        </div>

        <!-- Duration -->
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <UIcon name="i-heroicons-clock" class="text-gray-400 flex-shrink-0 w-4 h-4" />
          <span>{{ quiz.duration ? `${quiz.duration} minutes` : 'No time limit' }}</span>
        </div>

        <!-- Quiz Schedule -->
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <UIcon name="i-heroicons-calendar" class="text-gray-400 flex-shrink-0 w-4 h-4" />
          <span>{{ formatSchedule(quiz.startDateTime, quiz.endDateTime) }}</span>
        </div>
      </div>

      <!-- Available Classes (Admin Only) -->
      <div v-if="isAdmin()" class="mb-4 flex-1 flex flex-col">
        <p class="text-xs font-medium text-gray-700 mb-2 flex-shrink-0">Available for:</p>
        <div class="flex flex-wrap gap-1 flex-1 content-start">
          <UBadge
            v-for="classItem in quiz.availableClasses.slice(0, 2)"
            :key="classItem.id"
            color="blue"
            variant="soft"
            size="sm"
            class="text-xs"
          >
            {{ classItem.name }}
          </UBadge>
          <UBadge
            v-if="quiz.availableClasses.length > 2"
            color="gray"
            variant="soft"
            size="sm"
            class="text-xs"
          >
            +{{ quiz.availableClasses.length - 2 }} more
          </UBadge>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div 
      class="pb-6 mt-auto flex-shrink-0 transition-all duration-300"
      :class="[
        sidebarStore.isMobile ? 'px-4 sm:px-6' :
        sidebarStore.isOpen ? 'px-6' : 'px-4 lg:px-6'
      ]"
    >
      <div class="flex items-center justify-between pt-4 border-t border-gray-100">
        <!-- Admin Actions -->
        <template v-if="isAdmin()">
          <div class="flex items-center gap-2">
            <UTooltip text="Assign Marks">
              <UButton
                color="primary"
                variant="soft"
                :size="sidebarStore.isMobile ? 'xs' : 'sm'"
                icon="i-heroicons-presentation-chart-bar"
                :to="`/console/quizzes/assign/${quiz.id}`"
                square
              />
            </UTooltip>
          </div>
          <div class="flex items-center gap-2">
            <UTooltip text="Copy quiz link">
              <UButton
                color="gray"
                variant="ghost"
                :size="sidebarStore.isMobile ? 'xs' : 'sm'"
                icon="i-heroicons-clipboard"
                @click="copyQuizLink"
              />
            </UTooltip>
            <UButton
              :to="quiz.googleFormLink"
              target="_blank"
              color="primary"
              variant="outline"
              :size="sidebarStore.isMobile ? 'xs' : 'sm'"
              icon="i-heroicons-arrow-top-right-on-square"
            >
              Open Quiz
            </UButton>
          </div>
        </template>

        <!-- Student Actions -->
        <template v-else-if="isStudent()">
          <div class="flex items-center gap-2 w-full justify-center">
            <UButton
              v-if="canTakeQuiz"
              :to="quiz.googleFormLink"
              target="_blank"
              color="primary"
              variant="solid"
              :size="sidebarStore.isMobile ? 'sm' : 'md'"
              icon="i-heroicons-play"
              class="flex-1 justify-center"
            >
              {{ studentMark !== null ? 'Retake Quiz' : 'Take Quiz' }}
            </UButton>
            <UButton
              v-else-if="quizStatus === 'Closed'"
              disabled
              color="gray"
              variant="outline"
              :size="sidebarStore.isMobile ? 'sm' : 'md'"
              icon="i-heroicons-no-symbol"
              class="flex-1 justify-center"
            >
              Quiz Closed
            </UButton>
            <UButton
              v-else-if="quizStatus === 'Scheduled'"
              disabled
              color="blue"
              variant="outline"
              :size="sidebarStore.isMobile ? 'sm' : 'md'"
              icon="i-heroicons-clock"
              class="flex-1 justify-center"
            >
              Coming Soon
            </UButton>
          </div>
        </template>
      </div>
    </div>

    <ConfirmationDialog
      v-model="showCloseConfirm"
      title="Close Quiz?"
      description="Are you sure you want to close this quiz? Students will no longer be able to submit responses. This action cannot be undone."
      type="danger"
      confirmText="Close Quiz"
      cancelText="Cancel"
      @confirm="confirmClose"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useSidebarStore } from '~/stores/sidebar'
import ConfirmationDialog from '~/components/Common/ConfirmationDialog.vue'
import isStudent from '~/utils/is-student'
import isAdmin from '~/utils/is-admin'

const props = defineProps({
  quiz: {
    type: Object,
    required: true
  },
  studentMark: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['edit', 'close', 'assign-marks'])

// Stores
const sidebarStore = useSidebarStore()

const showCloseConfirm = ref(false)

const handleCloseClick = () => {
  showCloseConfirm.value = true
}

const confirmClose = () => {
  showCloseConfirm.value = false
  emit('close', props.quiz)
}

// Computed properties
const menuItems = computed(() => {
  if (!isAdmin()) return []
  
  const items = [
    [{
      label: 'Edit Quiz',
      icon: 'i-heroicons-pencil-square',
      click: () => emit('edit', props.quiz)
    }]
  ]
  if (props.quiz.is_active !== false) {
    items.push([
      {
        label: 'Close Quiz',
        icon: 'i-heroicons-no-symbol',
        click: handleCloseClick
      }
    ])
  }
  return items
})

// Student-specific computed properties
const submissionStatusIcon = computed(() => {
  if (props.studentMark !== null) return 'i-heroicons-check-circle'
  if (quizStatus.value === 'Active') return 'i-heroicons-exclamation-triangle'
  if (quizStatus.value === 'Scheduled') return 'i-heroicons-clock'
  if (quizStatus.value === 'Closed') {
    if (props.quiz.is_active === false) {
      return 'i-heroicons-no-symbol' // Manually closed
    }
    return 'i-heroicons-x-circle' // Time expired
  }
  return 'i-heroicons-clock'
})

const submissionStatusColor = computed(() => {
  if (props.studentMark !== null) return 'text-green-500'
  if (quizStatus.value === 'Active') return 'text-yellow-500'
  if (quizStatus.value === 'Scheduled') return 'text-gray-400'
  if (quizStatus.value === 'Closed') {
    if (props.quiz.is_active === false) {
      return 'text-red-500' // Manually closed
    }
    return 'text-orange-500' // Time expired
  }
  return 'text-gray-400'
})

const submissionStatusText = computed(() => {
  if (props.studentMark !== null) return 'Marks Assigned'
  if (quizStatus.value === 'Active') return 'Pending Submission'
  if (quizStatus.value === 'Scheduled') return 'Not Started'
  if (quizStatus.value === 'Closed') {
    // Don't show "Not Submitted" for closed quizzes since we can't determine if student actually took it
    if (props.quiz.is_active === false) {
      return 'Quiz Closed' // Manually closed
    }
    return 'Time Expired' // Naturally expired
  }
  return 'Not Submitted'
})

const canTakeQuiz = computed(() => {
  return quizStatus.value === 'Active'
})

// Mark color helper
const getMarkColor = (mark) => {
  if (mark >= 90) return 'green'
  if (mark >= 80) return 'blue'
  if (mark >= 70) return 'yellow'
  if (mark >= 60) return 'orange'
  return 'red'
}

// Make status reactive to quiz.is_active
const quizStatus = computed(() => {
  if (props.quiz.is_active === false) return 'Closed'
  const now = new Date()
  const startDate = new Date(props.quiz.startDateTime)
  const endDate = new Date(props.quiz.endDateTime)
  if (now < startDate) {
    return 'Scheduled'
  } else if (now >= startDate && now <= endDate) {
    return 'Active'
  } else {
    return 'Closed'
  }
})

const statusColor = computed(() => {
  const colors = {
    'Active': 'green',
    'Draft': 'yellow',
    'Closed': 'red',
    'Scheduled': 'blue'
  }
  return colors[quizStatus.value] || 'gray'
})


// Methods
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatSchedule = (startDateTime, endDateTime) => {
  const start = new Date(startDateTime)
  const end = new Date(endDateTime)
  
  const startDate = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endDate = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  
  if (start.toDateString() === end.toDateString()) {
    // Same day
    const startTime = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    const endTime = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    return `${startDate}, ${startTime} - ${endTime}`
  } else {
    // Different days
    return `${startDate} - ${endDate}`
  }
}

const copyQuizLink = async () => {
  try {
    await navigator.clipboard.writeText(props.quiz.googleFormLink)
    // You can add a toast notification here
  } catch (err) {
    console.error('Failed to copy link:', err)
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}
</style>
