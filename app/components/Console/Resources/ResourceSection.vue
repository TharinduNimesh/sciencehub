<template>
  <div class="bg-white rounded-lg shadow-sm">
    <div class="p-6 lg:p-8 space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-xl font-semibold">{{ title }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ description }}</p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div class="flex gap-2 w-full">
            <UButton
              icon="i-heroicons-arrow-path"
              :ui="{ rounded: 'rounded-full' }"
              :loading="isRefreshing"
              color="gray"
              variant="ghost"
              @click="$emit('refresh')"
              square
            />
            <div class="flex-1">
              <UButton 
                icon="i-heroicons-funnel" 
                :ui="{ rounded: 'rounded-full' }" 
                :color="showFilters ? 'primary' : 'gray'"
                :variant="showFilters ? 'soft' : 'ghost'" 
                :block="true"
                @click="$emit('update:showFilters', !showFilters)"
                label="Filters" 
              />
            </div>
          </div>
          <UButton 
            :label="actionLabel" 
            color="primary" 
            icon="i-heroicons-plus" 
            :ui="{ rounded: 'rounded-full' }"
            :block="isMobile" 
            @click="$emit('action')" 
          />
        </div>
      </div>

      <!-- Filters -->
      <slot name="filters" />

      <!-- Content -->
      <slot />

      <!-- Pagination -->
      <div v-if="totalItems > 0" class="flex justify-between items-center pt-4">
        <div class="text-sm text-gray-500">
          Showing {{ Math.min((currentPage - 1) * itemsPerPage + 1, totalItems) }}-{{ Math.min(currentPage * itemsPerPage, totalItems) }} of {{ totalItems }} {{ itemLabel }}
        </div>

        <UPagination
          :modelValue="currentPage"
          @update:modelValue="$emit('update:currentPage', $event)"
          :total="totalItems"
          :page-count="itemsPerPage"
          size="sm"
          :ui="{
            wrapper: 'flex items-center gap-1',
            base: 'min-w-[32px] h-[32px] flex items-center justify-center text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors',
            rounded: 'rounded-lg',
            default: {
              inactive: 'hover:bg-gray-50',
              active: 'bg-primary-50 text-primary-500 font-medium',
            },
          }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isMobileScreen } from '~/lib/utils'

interface Props {
  title: string
  description: string
  actionLabel: string
  isRefreshing: boolean
  showFilters: boolean
  currentPage: number
  itemsPerPage: number
  totalItems: number
  itemLabel: string
}

const props = defineProps<Props>()

defineEmits<{
  (e: 'refresh'): void
  (e: 'action'): void
  (e: 'update:showFilters', value: boolean): void
  (e: 'update:currentPage', value: number): void
}>()

const isMobile = ref(isMobileScreen())
const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage))

// Mobile responsive handler
if (import.meta.client) {
  window.addEventListener('resize', () => {
    isMobile.value = isMobileScreen()
  })
}
</script>