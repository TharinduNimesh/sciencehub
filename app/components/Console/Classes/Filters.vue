<template>
  <div class="bg-white p-4 rounded-lg border border-gray-200 mb-6">
    <div class="flex flex-col space-y-4">
      <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <UInput
          v-model="localFilters.search"
          placeholder="Search by class name"
          icon="i-heroicons-magnifying-glass"
          :ui="{ base: 'relative flex w-full', input: 'block w-full bg-gray-50/50' }"
          @input="handleSearchInput"
        />
        
        <!-- Timetable specific filters -->
        <template v-if="isTimetableView">
          <!-- Date Picker -->
          <UPopover v-model="isDatePickerOpen">
            <UButton
              :icon="localFilters.selectedDate ? 'i-heroicons-calendar-days-solid' : 'i-heroicons-calendar-days'"
              :color="localFilters.selectedDate ? 'primary' : 'gray'"
              :label="dateButtonLabel"
              :variant="localFilters.selectedDate ? 'soft' : 'outline'"
              :ui="{ base: 'w-full', rounded: 'rounded-lg' }"
            />

            <template #panel="{ close }">
              <VCalendarDatePicker
                v-model="localFilters.selectedDate"
                :attributes="attrs"
                @dayclick="handleDateSelect"
                @close="close"
              />
            </template>
          </UPopover>

          <!-- Days Multi-select -->
          <USelectMenu
            v-model="localFilters.selectedDays"
            :options="dayOptions"
            placeholder="Filter by days"
            multiple
            :ui="{ base: 'relative w-full', trigger: { base: 'bg-gray-50/50 w-full' } }"
            value-attribute="value"
          />

          <USelectMenu
            v-model="localFilters.status"
            :options="statusOptions"
            placeholder="Filter by status"
            :ui="{ base: 'relative w-full', trigger: { base: 'bg-gray-50/50 w-full' } }"
            value-attribute="value"
          />
        </template>

        <!-- Summary view filters -->
        <template v-else>
          <USelectMenu
            v-model="localFilters.method"
            :options="methodOptions"
            placeholder="Filter by method"
            :ui="{ base: 'relative w-full', trigger: { base: 'bg-gray-50/50 w-full' } }"
            value-attribute="value"
          />

          <USelectMenu
            v-model="localFilters.tag"
            :options="tagOptions"
            placeholder="Filter by tag"
            :ui="{ base: 'relative w-full', trigger: { base: 'bg-gray-50/50 w-full' } }"
            value-attribute="value"
          />

          <USelectMenu
            v-if="isAdmin()"
            v-model="localFilters.status"
            :options="statusOptions"
            placeholder="Filter by status"
            :ui="{ base: 'relative w-full', trigger: { base: 'bg-gray-50/50 w-full' } }"
            value-attribute="value"
          />
        </template>
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
              v-if="localFilters.method"
              color="gray"
              variant="soft"
              class="items-center"
            >
              {{ formatMethodLabel(localFilters.method) }}
            </UBadge>
            <UBadge
              v-if="localFilters.tag"
              color="gray"
              variant="soft"
              class="items-center"
            >
              Tag: {{ localFilters.tag }}
            </UBadge>
            <UBadge
              v-if="localFilters.status !== undefined"
              color="gray"
              variant="soft"
              class="items-center"
            >
              {{ localFilters.status ? 'Active' : 'Inactive' }}
            </UBadge>
            <UBadge
              v-if="localFilters.selectedDate"
              color="gray"
              variant="soft"
              class="items-center"
            >
              Date: {{ formatSelectedDate }}
            </UBadge>
            <UBadge
              v-if="localFilters.selectedDays && localFilters.selectedDays.length > 0"
              color="gray"
              variant="soft"
              class="items-center"
            >
              Days: {{ localFilters.selectedDays.join(', ') }}
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
import { format } from 'date-fns'
import { DatePicker as VCalendarDatePicker } from 'v-calendar'
import 'v-calendar/dist/style.css'
import { useDebounceFn } from '@vueuse/core'

type ClassMethod = 'InPersonSingleSession' | 'VirtualSingleSession' | 'InPersonRecurringSeries' | 'VirtualRecurringSeries'

interface Option {
  label: string
  value: string | boolean
}

interface ClassFilters {
  search: string
  method: ClassMethod | undefined
  tag: string | undefined
  status: boolean | undefined
  selectedDate?: Date
  selectedDays?: string[]
}

const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime())
}

const props = defineProps<{
  filters: ClassFilters
  viewMode?: 'timetable' | 'summary'
}>()

const emit = defineEmits<{
  'update:filters': [filters: ClassFilters]
}>()

const localFilters = ref<ClassFilters>({
  search: props.filters.search || '',
  method: props.filters.method,
  tag: props.filters.tag,
  status: props.filters.status,
  selectedDate: props.filters.selectedDate ? new Date(props.filters.selectedDate) : undefined,
  selectedDays: props.filters.selectedDays || []
})

const isDatePickerOpen = ref(false)

const attrs = {
  class: 'p-2',
  color: 'primary',
  isDark: false,
  firstDayOfWeek: 1
}

// Optimize the watchers to use more specific conditions
watch(() => props.filters, (newFilters) => {
  // Only update if there's an actual difference to avoid recursive updates
  const currentFilters = {
    ...localFilters.value,
    selectedDate: localFilters.value.selectedDate?.toISOString()
  }
  const newFiltersCopy = {
    ...newFilters,
    selectedDate: newFilters.selectedDate?.toISOString()
  }
  
  if (JSON.stringify(newFiltersCopy) !== JSON.stringify(currentFilters)) {
    localFilters.value = {
      ...newFilters,
      selectedDate: newFilters.selectedDate ? new Date(newFilters.selectedDate) : undefined,
      selectedDays: newFilters.selectedDays || []
    }
  }
}, { deep: true })

// Debounce the filter updates
const debouncedEmitUpdate = useDebounceFn((newFilters: ClassFilters) => {
  emit('update:filters', newFilters)
}, 300)

watch(localFilters, (newFilters) => {
  const currentFilters = {
    ...props.filters,
    selectedDate: props.filters.selectedDate?.toISOString()
  }
  const newFiltersCopy = {
    ...newFilters,
    selectedDate: newFilters.selectedDate?.toISOString()
  }
  
  if (JSON.stringify(newFiltersCopy) !== JSON.stringify(currentFilters)) {
    debouncedEmitUpdate({
      ...newFilters,
      selectedDate: newFilters.selectedDate instanceof Date ? newFilters.selectedDate : undefined
    })
  }
}, { deep: true })

const methodOptions = [
  { label: 'In-Person (Single)', value: 'InPersonSingleSession' },
  { label: 'Virtual (Single)', value: 'VirtualSingleSession' },
  { label: 'In-Person (Series)', value: 'InPersonRecurringSeries' },
  { label: 'Virtual (Series)', value: 'VirtualRecurringSeries' }
]

const tagOptions = [
  { label: 'Mathematics', value: 'Mathematics' },
  { label: 'Science', value: 'Science' },
  { label: 'Physics', value: 'Physics' },
  { label: 'Chemistry', value: 'Chemistry' },
  { label: 'Biology', value: 'Biology' }
]

const statusOptions = [
  { label: 'Active', value: true },
  { label: 'Inactive', value: false }
]

const dayOptions = [
  { label: 'Monday', value: 'MON' },
  { label: 'Tuesday', value: 'TUE' },
  { label: 'Wednesday', value: 'WED' },
  { label: 'Thursday', value: 'THU' },
  { label: 'Friday', value: 'FRI' },
  { label: 'Saturday', value: 'SAT' },
  { label: 'Sunday', value: 'SUN' }
]

const formatMethodLabel = (method: ClassMethod) => {
  const option = methodOptions.find(opt => opt.value === method)
  return option ? option.label : method
}

const isFiltersActive = computed(() => {
  return localFilters.value.search !== '' || 
         localFilters.value.method !== undefined || 
         localFilters.value.tag !== undefined ||
         localFilters.value.status !== undefined ||
         localFilters.value.selectedDate !== undefined ||
         (localFilters.value.selectedDays?.length ?? 0) > 0
})

const handleSearchInput = () => {
  emit('update:filters', localFilters.value)
}

const handleClearFilters = () => {
  const clearedFilters: ClassFilters = {
    search: '',
    method: undefined,
    tag: undefined,
    status: undefined,
    selectedDate: undefined,
    selectedDays: []
  }
  localFilters.value = clearedFilters
  emit('update:filters', clearedFilters)
}

const handleDateSelect = (date: any) => {
  if (!date) {
    localFilters.value.selectedDate = undefined
    isDatePickerOpen.value = false
    return
  }
  
  // Handle v-calendar date object format
  const newDate = date.id ? new Date(date.id) : (date instanceof Date ? new Date(date) : undefined)
  
  if (newDate && isValidDate(newDate)) {
    newDate.setHours(0, 0, 0, 0)
    localFilters.value.selectedDate = newDate
  }
  
  isDatePickerOpen.value = false
}

const formatSelectedDate = computed(() => {
  if (!localFilters.value.selectedDate || !isValidDate(localFilters.value.selectedDate)) {
    return ''
  }
  return format(localFilters.value.selectedDate, 'd MMM, yyyy')
})

const dateButtonLabel = computed(() => {
  if (!localFilters.value.selectedDate || !isValidDate(localFilters.value.selectedDate)) {
    return 'Select Date'
  }
  return format(localFilters.value.selectedDate, 'd MMM, yyyy')
})

const isTimetableView = computed(() => props.viewMode === 'timetable')
</script>