<template>
  <div class="bg-white p-4 rounded-lg border border-gray-200 mb-6">
    <div class="flex flex-col space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <UInput
          v-model="filters.search"
          placeholder="Search notes"
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
        >
          <template #option="{ option }">
            <div class="flex items-center py-2 px-3">
              <span class="truncate">{{ option.label }}</span>
            </div>
          </template>
          <template #selected-option="{ option }">
            <div class="flex items-center gap-2">
              <span class="truncate">{{ option.label }}</span>
            </div>
          </template>
        </USelectMenu>

        <USelectMenu
          v-model="filters.type"
          :options="resourceTypeOptions"
          placeholder="Filter by type"
          :ui="{ base: 'relative w-full', trigger: { base: 'bg-gray-50/50 w-full' } }"
          value-attribute="value"
        >
          <template #option="{ option }">
            <div class="flex items-center gap-2 py-2 px-3">
              <UIcon :name="getResourceTypeIcon(option.value)" class="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span>{{ option.label }}</span>
            </div>
          </template>
          <template #selected-option="{ option }">
            <div class="flex items-center gap-2">
              <UIcon :name="getResourceTypeIcon(option.value)" class="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span>{{ option.label }}</span>
            </div>
          </template>
        </USelectMenu>
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
              v-if="filters.type"
              color="gray"
              variant="soft"
              class="items-center"
            >
              <UIcon :name="getResourceTypeIcon(filters.type)" class="w-4 h-4 mr-1" />
              {{ filters.type }}
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

interface NoteFilters {
  search: string
  class: string | undefined
  type: string | undefined
}

const props = defineProps<{
  filters: NoteFilters
}>()

const emit = defineEmits<{
  'update:filters': [filters: NoteFilters]
}>()

const classOptions: Option[] = [
  { label: 'Grade 11 - Physics', value: 'Grade 11 - Physics' },
  { label: 'Grade 11 - Chemistry', value: 'Grade 11 - Chemistry' },
  { label: 'Grade 10 - Physics', value: 'Grade 10 - Physics' },
  { label: 'Grade 10 - Chemistry', value: 'Grade 10 - Chemistry' }
]

const resourceTypeOptions: Option[] = [
  { label: 'Document', value: 'Document' },
  { label: 'Video', value: 'Video' },
  { label: 'Image', value: 'Image' },
  { label: 'Link', value: 'Link' }
]

const getResourceTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    'Document': 'i-heroicons-document-text',
    'Video': 'i-heroicons-video-camera',
    'Image': 'i-heroicons-photo',
    'Link': 'i-heroicons-link'
  }
  return icons[type] || 'i-heroicons-document'
}

const isFiltersActive = computed(() => {
  return props.filters.search !== '' || 
         props.filters.class !== undefined || 
         props.filters.type !== undefined
})

const handleSearchInput = () => {
  emit('update:filters', props.filters)
}

const handleClearFilters = () => {
  emit('update:filters', {
    search: '',
    class: undefined,
    type: undefined
  })
}
</script>