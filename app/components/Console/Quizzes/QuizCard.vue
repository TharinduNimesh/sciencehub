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
            :color="getStatusColor(getQuizStatus(quiz))" 
            variant="soft"
            :size="sidebarStore.isMobile ? 'xs' : 'sm'"
          >
            {{ getQuizStatus(quiz) }}
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

      <!-- Action Menu -->
      <UDropdown :items="menuItems" :popper="{ arrow: true }">
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
        <!-- Response Count -->
        <div 
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

      <!-- Available Classes -->
      <div class="mb-4 flex-1 flex flex-col">
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
        <div class="flex items-center gap-2">
          <UButton
            color="primary"
            variant="soft"
            :size="sidebarStore.isMobile ? 'xs' : 'sm'"
            icon="i-heroicons-eye"
            :to="`/console/quizzes/${quiz.id}`"
          >
            View
          </UButton>
          <UTooltip text="Copy quiz link">
            <UButton
              color="gray"
              variant="ghost"
              :size="sidebarStore.isMobile ? 'xs' : 'sm'"
              icon="i-heroicons-clipboard"
              @click="copyQuizLink"
            />
          </UTooltip>
        </div>

        <UButton
          :href="quiz.googleFormLink"
          target="_blank"
          color="primary"
          variant="outline"
          :size="sidebarStore.isMobile ? 'xs' : 'sm'"
          icon="i-heroicons-arrow-top-right-on-square"
        >
          Open Quiz
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSidebarStore } from '~/stores/sidebar'

const props = defineProps({
  quiz: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete', 'duplicate'])

// Stores
const sidebarStore = useSidebarStore()

// Computed properties
const menuItems = computed(() => [
  [{
    label: 'Edit Quiz',
    icon: 'i-heroicons-pencil-square',
    click: () => emit('edit', props.quiz)
  }],
  [{
    label: 'Duplicate Quiz',
    icon: 'i-heroicons-document-duplicate',
    click: () => emit('duplicate', props.quiz)
  }],
  [{
    label: 'Delete Quiz',
    icon: 'i-heroicons-trash',
    click: () => emit('delete', props.quiz)
  }]
])

// Methods
const getQuizStatus = (quiz) => {
  const now = new Date()
  const startDate = new Date(quiz.startDateTime)
  const endDate = new Date(quiz.endDateTime)
  
  if (now < startDate) {
    return 'Scheduled'
  } else if (now >= startDate && now <= endDate) {
    return 'Active'
  } else {
    return 'Closed'
  }
}

const getStatusColor = (status) => {
  const colors = {
    'Active': 'green',
    'Draft': 'yellow',
    'Closed': 'red',
    'Scheduled': 'blue'
  }
  return colors[status] || 'gray'
}

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
