<template>
  <div class="bg-white p-4 rounded-lg border border-gray-200 mb-6">
    <div class="flex flex-col space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <UInput
          v-model="localFilters.search"
          placeholder="Search lessons"
          icon="i-heroicons-magnifying-glass"
          :ui="{ base: 'relative flex w-full', input: 'block w-full bg-gray-50/50' }"
          @input="handleSearchInput"
        />
        
        <USelectMenu
          v-model="localFilters.grade"
          :options="gradeOptions"
          placeholder="Filter by grade"
          :ui="{ base: 'relative w-full', trigger: { base: 'bg-gray-50/50 w-full' } }"
          value-attribute="value"
        />

        <USelectMenu
          v-model="localFilters.subject"
          :options="subjectOptions"
          placeholder="Filter by subject"
          :ui="{ base: 'relative w-full', trigger: { base: 'bg-gray-50/50 w-full' } }"
          value-attribute="value"
        />

        <USelectMenu
          v-model="localFilters.dateRange"
          :options="dateOptions"
          placeholder="Filter by date"
          :ui="{ base: 'relative w-full', trigger: { base: 'bg-gray-50/50 w-full' } }"
          value-attribute="value"
        />
      </div>

      <!-- Active filters bar -->
      <div v-if="isFiltersActive" class="flex items-center justify-between pt-2 border-t">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">Active filters:</span>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-if="localFilters.search"
              color="gray"
              variant="soft"
              class="items-center"
            >
              Search: {{ localFilters.search }}
            </UBadge>
            <UBadge
              v-if="localFilters.grade !== undefined"
              color="gray"
              variant="soft"
              class="items-center"
            >
              Grade {{ localFilters.grade }}
            </UBadge>
            <UBadge
              v-if="localFilters.subject"
              color="gray"
              variant="soft"
              class="items-center"
            >
              {{ localFilters.subject }}
            </UBadge>
            <UBadge
              v-if="localFilters.dateRange"
              color="gray"
              variant="soft"
              class="items-center"
            >
              {{ getDateRangeLabel(localFilters.dateRange) }}
            </UBadge>
          </div>
        </div>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark"
          size="sm"
          @click="handleClearFilters"
        >
          Clear all
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Option {
  label: string
  value: string | number
}

interface LessonFilters {
  search: string
  grade: number | undefined
  subject: string | undefined
  dateRange: string | undefined
}

const props = defineProps<{
  filters: LessonFilters
}>()

const emit = defineEmits<{
  'update:filters': [filters: LessonFilters]
}>()

// Create a local copy of filters to avoid directly mutating props
const defaultFilters = {
  search: '',
  grade: undefined,
  subject: undefined,
  dateRange: undefined
};

// Initialize localFilters with default values or from props if available
const localFilters = ref<LessonFilters>({ ...defaultFilters });

// Sync props to local state
watch(() => props.filters, (newFilters) => {
  if (newFilters) {
    localFilters.value = { ...newFilters };
  }
}, { immediate: true, deep: true });

// Sync local state to props
watch(localFilters, (newFilters) => {
  emit('update:filters', { ...newFilters });
}, { deep: true });

const gradeOptions: Option[] = [
  { label: 'Grade 6', value: 6 },
  { label: 'Grade 7', value: 7 },
  { label: 'Grade 8', value: 8 },
  { label: 'Grade 9', value: 9 },
  { label: 'Grade 10', value: 10 },
  { label: 'Grade 11', value: 11 }
]

const subjectOptions: Option[] = [
  { label: 'Biology', value: 'Biology' },
  { label: 'Chemistry', value: 'Chemistry' },
  { label: 'Physics', value: 'Physics' },
  { label: 'Mathematics', value: 'Mathematics' },
  { label: 'General Science', value: 'General Science' },
]

const dateOptions = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' }
]

const isFiltersActive = computed(() => {
  return localFilters.value.search !== '' || 
         localFilters.value.grade !== undefined || 
         localFilters.value.subject !== undefined ||
         localFilters.value.dateRange !== undefined
})

const getDateRangeLabel = (value: string) => {
  const option = dateOptions.find(opt => opt.value === value)
  return option ? option.label : value
}

const handleSearchInput = () => {
  // Emit not needed here as the watch handler takes care of it
}

const handleClearFilters = () => {
  localFilters.value = { ...defaultFilters };
}
</script>
