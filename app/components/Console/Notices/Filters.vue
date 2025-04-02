<template>
  <div class="bg-white p-4 rounded-lg border border-gray-200 mb-6">
    <div class="flex flex-col space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <UInput
          v-model="filters.search"
          placeholder="Search notices"
          icon="i-heroicons-magnifying-glass"
          :ui="{ base: 'relative flex w-full', input: 'block w-full bg-gray-50/50' }"
          @input="handleSearchInput"
        />
        
        <USelectMenu
          v-model="filters.class"
          :options="classOptions"
          placeholder="Filter by class"
          :ui="{ base: 'relative w-full', trigger: { base: 'bg-gray-50/50 w-full' } }"
          value-attribute="value"
        />

        <USelectMenu
          v-model="filters.dateRange"
          :options="dateRangeOptions"
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
              v-if="filters.search"
              color="gray"
              variant="soft"
              class="items-center"
            >
              Search: {{ filters.search }}
            </UBadge>
            <UBadge
              v-if="filters.class"
              color="gray"
              variant="soft"
              class="items-center"
            >
              {{ filters.class }}
            </UBadge>
            <UBadge
              v-if="filters.dateRange"
              color="gray"
              variant="soft"
              class="items-center"
            >
              {{ getDateRangeLabel(filters.dateRange) }}
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
import { computed } from 'vue'

interface Option {
  label: string
  value: string
}

interface NoticeFilters {
  search: string
  class: string | undefined
  dateRange: string | undefined
}

const props = defineProps<{
  filters: NoticeFilters
}>()

const emit = defineEmits<{
  'update:filters': [filters: NoticeFilters]
}>()

const classOptions: Option[] = [
  { label: 'Grade 11 - Physics', value: 'Grade 11 - Physics' },
  { label: 'Grade 11 - Chemistry', value: 'Grade 11 - Chemistry' },
  { label: 'Grade 10 - Physics', value: 'Grade 10 - Physics' },
  { label: 'Grade 10 - Chemistry', value: 'Grade 10 - Chemistry' }
]

const dateRangeOptions: Option[] = [
  { label: 'Today', value: '24h' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'All time', value: 'all' }
]

const getDateRangeLabel = (value: string) => {
  const option = dateRangeOptions.find(opt => opt.value === value)
  return option ? option.label : ''
}

const isFiltersActive = computed(() => {
  return props.filters.search !== '' || 
         props.filters.class !== undefined || 
         props.filters.dateRange !== undefined
})

const handleSearchInput = () => {
  emit('update:filters', props.filters)
}

const handleClearFilters = () => {
  emit('update:filters', {
    search: '',
    class: undefined,
    dateRange: undefined
  })
}
</script>