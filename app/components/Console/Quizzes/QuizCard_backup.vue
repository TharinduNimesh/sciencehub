<template>
  <div class="relative group">
    <!-- Background SVG Pattern -->
    <div class="absolute inset-0 opacity-5 pointer-events-none">
      <svg class="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="quiz-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="2" fill="currentColor"/>
            <path d="M5 5l10 10M15 5l-10 10" stroke="currentColor" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#quiz-pattern)"/>
      </svg>
    </div>

    <!-- Card Content -->
    <div class="relative bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-primary-300 group-hover:translate-y-[-2px]">
      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {{ quiz.title }}
          </h3>
          
          <!-- Status Badge -->
          <div class="flex items-center gap-2 mb-3">
            <UBadge 
              :color="getStatusColor(quiz.status)" 
              variant="soft"
              size="sm"
            >
              {{ quiz.status }}
            </UBadge>
            <span class="text-xs text-gray-500">
              Created {{ formatDate(quiz.createdAt) }}
            </span>
          </div>
        </div>

        <!-- Action Menu -->
        <UDropdown :items="menuItems">
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-ellipsis-vertical"
            size="sm"
            class="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </UDropdown>
      </div>

      <!-- Quiz Info -->
      <div class="space-y-3 mb-4">
        <!-- Google Form Link -->
        <div class="flex items-center gap-2 text-sm">
          <UIcon name="i-heroicons-link" class="text-gray-400 flex-shrink-0" />
          <a 
            :href="quiz.googleFormLink" 
            target="_blank"
            class="text-primary-600 hover:text-primary-700 truncate font-medium"
          >
            Open Quiz Form
          </a>
        </div>

        <!-- Response Count -->
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <UIcon name="i-heroicons-users" class="text-gray-400 flex-shrink-0" />
          <span>{{ quiz.responseCount }} responses</span>
        </div>

        <!-- Duration (if exists) -->
        <div v-if="quiz.duration" class="flex items-center gap-2 text-sm text-gray-600">
          <UIcon name="i-heroicons-clock" class="text-gray-400 flex-shrink-0" />
          <span>{{ quiz.duration }} minutes</span>
        </div>
      </div>

      <!-- Available Classes -->
      <div class="mb-4">
        <p class="text-xs font-medium text-gray-700 mb-2">Available for:</p>
        <div class="flex flex-wrap gap-1">
          <UBadge
            v-for="classItem in quiz.availableClasses.slice(0, 3)"
            :key="classItem.id"
            color="blue"
            variant="soft"
            size="sm"
          >
            {{ classItem.name }}
          </UBadge>
          <UBadge
            v-if="quiz.availableClasses.length > 3"
            color="gray"
            variant="soft"
            size="sm"
          >
            +{{ quiz.availableClasses.length - 3 }} more
          </UBadge>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-between pt-4 border-t border-gray-100">
        <div class="flex items-center gap-2">
          <UButton
            color="primary"
            variant="soft"
            size="sm"
            icon="i-heroicons-eye"
            :to="`/console/quizzes/${quiz.id}`"
          >
            View Details
          </UButton>
          <UTooltip text="Copy quiz link">
            <UButton
              color="gray"
              variant="ghost"
              size="sm"
              icon="i-heroicons-clipboard"
              @click="copyQuizLink"
            />
          </UTooltip>
        </div>

        <div class="flex items-center gap-2 text-xs text-gray-500">
          <UIcon name="i-heroicons-clock" />
          <span>{{ quiz.duration || 'No time limit' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  quiz: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete', 'duplicate'])

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
