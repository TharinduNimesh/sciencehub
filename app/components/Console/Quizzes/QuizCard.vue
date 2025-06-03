<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary-300 group h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-start justify-between p-6 pb-4">
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {{ quiz.title }}
        </h3>
        
        <!-- Status and Date -->
        <div class="flex items-center gap-3 mb-3">
          <UBadge 
            :color="getStatusColor(quiz.status)" 
            variant="soft"
            size="sm"
          >
            {{ quiz.status }}
          </UBadge>
          <span class="text-xs text-gray-500">
            {{ formatDate(quiz.createdAt) }}
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

    <!-- Content -->
    <div class="px-6 pb-4 flex-1 flex flex-col">
      <!-- Description -->
      <p class="text-sm text-gray-600 mb-4 line-clamp-2 flex-shrink-0">
        {{ quiz.description }}
      </p>

      <!-- Quiz Info -->
      <div class="space-y-2 mb-4 flex-shrink-0">
        <!-- Response Count -->
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <UIcon name="i-heroicons-users" class="text-gray-400 flex-shrink-0 w-4 h-4" />
          <span>{{ quiz.responseCount }} {{ quiz.responseCount === 1 ? 'response' : 'responses' }}</span>
        </div>

        <!-- Duration -->
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <UIcon name="i-heroicons-clock" class="text-gray-400 flex-shrink-0 w-4 h-4" />
          <span>{{ quiz.duration ? `${quiz.duration} minutes` : 'No time limit' }}</span>
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
    <div class="px-6 pb-6 mt-auto flex-shrink-0">
      <div class="flex items-center justify-between pt-4 border-t border-gray-100">
        <div class="flex items-center gap-2">
          <UButton
            color="primary"
            variant="soft"
            size="sm"
            icon="i-heroicons-eye"
            :to="`/console/quizzes/${quiz.id}`"
          >
            View
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

        <UButton
          :href="quiz.googleFormLink"
          target="_blank"
          color="primary"
          variant="outline"
          size="sm"
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
