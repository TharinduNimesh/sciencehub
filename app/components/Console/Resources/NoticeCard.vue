<template>
  <!-- Add edit modal -->
  <ConsoleNoticesEditModal
    v-model="isEditModalOpen"
    :notice="notice"
    @updated="emit('edit', notice)"
  />

  <ConfirmationDialog
    v-model="showDeleteConfirmation"
    title="Delete Notice"
    description="Are you sure you want to delete this notice? This action cannot be undone."
    type="danger"
    confirm-text="Delete"
    @confirm="confirmDelete"
  />

  <UCard class="cursor-pointer hover:shadow-md transition-shadow h-full flex flex-col relative overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 overflow-hidden opacity-30 text-gray-200">
      <!-- Top-right shape -->
      <svg
        class="absolute -right-24 -top-24 w-80 h-80 animate-float-slow"
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M180,80 Q250,60 290,100 Q330,140 350,200 Q370,260 330,300 Q290,340 230,340 Q170,340 130,300 Q90,260 90,200 Q90,140 130,100 Q150,80 180,80"
          fill="currentColor"
          opacity="0.5"
        />
      </svg>

      <!-- Bottom-left shape -->
      <svg
        class="absolute -left-20 -bottom-20 w-64 h-64 animate-float-medium"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M80,40 Q110,30 130,50 Q150,70 150,100 Q150,130 130,150 Q110,170 80,160 Q50,150 40,120 Q30,90 50,60 Q70,30 80,40"
          fill="currentColor"
          opacity="0.4"
        />
      </svg>
    </div>

    <div class="space-y-4 flex-1 relative">
      <div class="flex items-start justify-between">
        <div>
          <h3 class="text-lg font-semibold">{{ notice.title }}</h3>
          <p class="text-sm text-gray-500">{{ formatDate(notice.createdAt) }}</p>
        </div>
      </div>
      <p class="text-gray-600">{{ notice.description }}</p>
      <div class="flex flex-wrap gap-2">
        <UBadge 
          color="primary" 
          variant="soft" 
          size="sm"
        >
          {{ classDisplay }}
        </UBadge>
      </div>
      <div v-if="notice.url" class="mt-4">
        <img :src="notice.url" :alt="notice.title" class="rounded-lg w-full object-cover h-48">
      </div>
    </div>

    <!-- Actions Section -->
    <div class="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 relative">
      <span class="text-xs text-gray-500">
        Created {{ formatDate(notice.createdAt) }}
      </span>
      <div class="flex items-center gap-2">
        <UTooltip text="Edit notice" :popper="{ arrow: true }">
          <UButton
            color="orange"
            variant="soft"
            icon="i-heroicons-pencil-square"
            :ui="{ rounded: 'rounded-full' }"
            size="sm"
            @click="handleEditClick(notice)"
          />
        </UTooltip>
        <UTooltip text="Delete notice" :popper="{ arrow: true }">
          <UButton
            color="red"
            variant="soft"
            icon="i-heroicons-trash"
            :ui="{ rounded: 'rounded-full' }"
            size="sm"
            @click="handleDeleteClick(notice)"
          />
        </UTooltip>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Notice } from '~/types/resource'
import ConfirmationDialog from '~/components/Common/ConfirmationDialog.vue'

const showDeleteConfirmation = ref(false)
const noticeToDelete = ref<Notice | null>(null)
const isEditModalOpen = ref(false)

const props = defineProps<{
  notice: Notice
}>()

const emit = defineEmits<{
  (e: 'edit', notice: Notice): void
  (e: 'delete', notice: Notice): void
}>()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatClassName = (className: string): string => {
  const parts = className.split(' - ')
  if (parts.length >= 2 && parts[0]) {
    const gradeMatch = parts[0].match(/\d+/)
    const grade = gradeMatch ? gradeMatch[0] : ''
    return `G${grade} ${parts[1]}`
  }
  return className
}

// Add computed property for class display
const classDisplay = computed(() => {
  if (!props.notice.classes?.length) return 'No Class'
  
  const firstClass = props.notice.classes[0]
  if (!firstClass) return 'No Class'
  
  if (props.notice.classes.length === 1) {
    return formatClassName(firstClass)
  }
  
  return `${formatClassName(firstClass)} and ${props.notice.classes.length - 1} more`
})

const handleDeleteClick = (notice: Notice) => {
  noticeToDelete.value = notice
  showDeleteConfirmation.value = true
}

const handleEditClick = (notice: Notice) => {
  isEditModalOpen.value = true
}

const confirmDelete = () => {
  if (noticeToDelete.value) {
    emit('delete', noticeToDelete.value)
    showDeleteConfirmation.value = false
    noticeToDelete.value = null
  }
}
</script>

<style scoped>
@keyframes float-slow {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    transform: translate(12px, -12px) rotate(2deg);
  }
}

@keyframes float-medium {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    transform: translate(-10px, 10px) rotate(-3deg);
  }
}

.animate-float-slow {
  animation: float-slow 12s ease-in-out infinite;
}

.animate-float-medium {
  animation: float-medium 8s ease-in-out infinite;
}
</style>