<template>
  <div class="bg-white p-4 rounded-lg border border-gray-200 mb-6">
    <div class="flex flex-col space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <UInput
          v-model="filters.search"
          placeholder="Search by name or email"
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
          v-model="filters.status"
          :options="statusOptions"
          placeholder="Filter by status"
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
              Class: {{ filters.class }}
            </UBadge>
            <UBadge
              v-if="filters.status"
              color="gray"
              variant="soft"
              class="items-center"
            >
              {{ filters.status }}
            </UBadge>
            <UBadge
              v-if="filters.dateRange"
              color="gray"
              variant="soft"
              class="items-center"
            >
              Last {{ getDateRangeLabel(filters.dateRange) }}
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

interface InvitationFilters {
  search: string
  class: string | undefined
  status: string | undefined
  dateRange: string | undefined
}

const props = defineProps<{
  filters: InvitationFilters
}>()

const emit = defineEmits<{
  'update:filters': [filters: InvitationFilters]
}>()

const classOptions: Option[] = [
  { label: 'Grade 11 - Revision', value: 'Grade 11 - Revision' },
  { label: 'Grade 11 - Theory', value: 'Grade 11 - Theory' },
  { label: 'Grade 10 - Revision', value: 'Grade 10 - Revision' },
  { label: 'Grade 10 - Theory', value: 'Grade 10 - Theory' }
]

const statusOptions: Option[] = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Accepted', value: 'Accepted' },
  { label: 'Expired', value: 'Expired' },
  { label: 'Revoked', value: 'Revoked' }
]

const dateRangeOptions: Option[] = [
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' }
]

const getDateRangeLabel = (value: string) => {
  const option = dateRangeOptions.find(opt => opt.value === value)
  return option ? option.label.toLowerCase() : ''
}

const isFiltersActive = computed(() => {
  return props.filters.search !== '' || 
         props.filters.class !== undefined || 
         props.filters.status !== undefined ||
         props.filters.dateRange !== undefined
})

const handleSearchInput = () => {
  emit('update:filters', props.filters)
}

const handleClearFilters = () => {
  emit('update:filters', {
    search: '',
    class: undefined,
    status: undefined,
    dateRange: undefined
  })
}
</script>