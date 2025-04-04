<template>
  <div class="bg-white p-4 rounded-lg border border-gray-200 mb-6">
    <div class="flex flex-col space-y-4">
      <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <UInput
          v-model="localFilters.search"
          placeholder="Search lessons"
          icon="i-heroicons-magnifying-glass"
          @update:model-value="emitUpdate"
        />
        
        <USelectMenu
          v-model="localFilters.classId"
          :options="classOptions"
          placeholder="Filter by class"
          option-attribute="label"
          value-attribute="value"
          @update:model-value="emitUpdate"
        />

        <USelectMenu
          v-model="localFilters.visibility"
          :options="visibilityOptions"
          placeholder="Filter by visibility"
          option-attribute="label"
          value-attribute="value"
          @update:model-value="emitUpdate"
        />

        <USelectMenu
          v-model="localFilters.dateRange"
          :options="dateOptions"
          placeholder="Filter by date"
          option-attribute="label"
          value-attribute="value"
          @update:model-value="emitUpdate"
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
              v-if="localFilters.classId !== undefined"
              color="gray"
              variant="soft"
              class="items-center"
            >
              Class: {{ getClassLabel(localFilters.classId) }}
            </UBadge>
            <UBadge
              v-if="localFilters.visibility !== 'ALL'"
              color="gray"
              variant="soft"
              class="items-center"
            >
              {{ localFilters.visibility === 'HIDDEN' ? 'Hidden' : 'Visible' }} Lessons
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
import { computed, ref, onMounted } from 'vue'
import type { Database } from '~/types/supabase'

interface FilterOption {
  label: string
  value: any
}

export interface LessonFilters {
  search: string
  classId?: number
  visibility: 'ALL' | 'VISIBLE' | 'HIDDEN'
  dateRange?: string
}

// Props and emits
const props = defineProps<{
  filters: LessonFilters
}>()

const emit = defineEmits<{
  'update:filters': [filters: LessonFilters]
}>()

// Default filter values
const defaultFilters: LessonFilters = {
  search: '',
  classId: undefined,
  visibility: 'ALL',
  dateRange: undefined
}

// Local state
const localFilters = ref<LessonFilters>({ ...defaultFilters })

// Initialize local filters from props
onMounted(() => {
  localFilters.value = { ...props.filters }
})

// Fetch classes from Supabase
const classes = ref<Array<{ id: number; name: string }>>([])

onMounted(async () => {
  try {
    const { data, error } = await useSupabaseClient<Database>()
      .from('classes')
      .select('id, name')
      .eq('is_active', true)
    
    if (error) throw error
    if (data) {
      classes.value = data
    }
  } catch (error) {
    console.error('Error loading classes:', error)
  }
})

// Options for select menus
const classOptions = computed<FilterOption[]>(() => 
  [
    { label: 'All Classes', value: undefined },
    ...classes.value.map(c => ({
      label: c.name,
      value: c.id
    }))
  ]
)

const visibilityOptions = computed<FilterOption[]>(() => [
  { label: 'All Lessons', value: 'ALL' },
  { label: 'Visible Lessons', value: 'VISIBLE' },
  { label: 'Hidden Lessons', value: 'HIDDEN' }
])

const dateOptions = computed<FilterOption[]>(() => [
  { label: 'All Time', value: undefined },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' }
])

// Computed properties
const isFiltersActive = computed(() => {
  return localFilters.value.search !== '' || 
         localFilters.value.classId !== undefined || 
         localFilters.value.visibility !== 'ALL' ||
         localFilters.value.dateRange !== undefined
})

// Methods
const getClassLabel = (id: number) => {
  const classOption = classes.value.find(c => c.id === id)
  return classOption?.name || 'Unknown Class'
}

const getDateRangeLabel = (value: string) => {
  const option = dateOptions.value.find(opt => opt.value === value)
  return option?.label || value
}

const emitUpdate = () => {
  emit('update:filters', { ...localFilters.value })
}

const handleClearFilters = () => {
  localFilters.value = { ...defaultFilters }
  emitUpdate()
}
</script>
