<template>
  <div class="bg-white p-4 rounded-lg border border-gray-200 mb-6">
    <div class="flex flex-col space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <UInput
          v-model="filters.search"
          placeholder="Search by name"
          icon="i-heroicons-magnifying-glass"
          :ui="{ base: 'relative flex w-full', input: 'block w-full bg-gray-50/50' }"
          @input="handleSearchInput"
        />
        
        <USelectMenu
          v-model="filters.grade"
          :options="gradeOptions"
          placeholder="Filter by grade"
          :ui="{ base: 'relative w-full', trigger: { base: 'bg-gray-50/50 w-full' } }"
          value-attribute="value"
        />

        <USelectMenu
          v-model="filters.status"
          :options="statusOptions"
          placeholder="Filter by status"
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
              v-if="filters.grade !== undefined"
              color="gray"
              variant="soft"
              class="items-center"
            >
              Grade {{ filters.grade }}
            </UBadge>
            <UBadge
              v-if="filters.status"
              color="gray"
              variant="soft"
              class="items-center"
            >
              {{ filters.status }}
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
  value: string | number
}

interface StudentFilters {
  search: string
  grade: number | undefined
  status: string | undefined
}

const props = defineProps<{
  filters: StudentFilters
}>()

const emit = defineEmits<{
  'update:filters': [filters: StudentFilters]
}>()

const gradeOptions = [
  { label: "Grade 6", value: 6 },
  { label: "Grade 7", value: 7 },
  { label: "Grade 8", value: 8 },
  { label: "Grade 9", value: 9 },
  { label: "Grade 10", value: 10 },
  { label: "Grade 11", value: 11 },
  { label: "Grade 12", value: 12 },
  { label: "Grade 13", value: 13 },
]

const statusOptions: Option[] = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' }
]

const isFiltersActive = computed(() => {
  return props.filters.search !== '' || 
         props.filters.grade !== undefined || 
         props.filters.status !== undefined
})

const handleSearchInput = () => {
  emit('update:filters', props.filters)
}

const handleClearFilters = () => {
  emit('update:filters', {
    search: '',
    grade: undefined,
    status: undefined
  })
}
</script>