<template>
  <div class="bg-white p-4 rounded-lg border border-gray-200 mb-6">
    <div class="flex flex-col space-y-4">
      <div :class="{
        'grid gap-4': true,
        'grid-cols-1 sm:grid-cols-3 lg:grid-cols-4': isAdmin(),
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': !isAdmin()
      }">
        <UInput
          v-model="localFilters.search"
          placeholder="Search by class name"
          icon="i-heroicons-magnifying-glass"
          :ui="{ base: 'relative flex w-full', input: 'block w-full bg-gray-50/50' }"
          @input="handleSearchInput"
        />
        
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
}

const props = defineProps<{
  filters: ClassFilters
}>()

const emit = defineEmits<{
  'update:filters': [filters: ClassFilters]
}>()

const localFilters = ref<ClassFilters>({ ...props.filters })

// Watch for changes in props and update local filters
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

// Watch for changes in local filters and emit updates
watch(localFilters, (newFilters) => {
  emit('update:filters', newFilters)
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

const formatMethodLabel = (method: ClassMethod) => {
  const option = methodOptions.find(opt => opt.value === method)
  return option ? option.label : method
}

const isFiltersActive = computed(() => {
  return localFilters.value.search !== '' || 
         localFilters.value.method !== undefined || 
         localFilters.value.tag !== undefined ||
         localFilters.value.status !== undefined
})

const handleSearchInput = () => {
  emit('update:filters', localFilters.value)
}

const handleClearFilters = () => {
  const clearedFilters: ClassFilters = {
    search: '',
    method: undefined,
    tag: undefined,
    status: undefined
  }
  localFilters.value = clearedFilters
  emit('update:filters', clearedFilters)
}
</script>