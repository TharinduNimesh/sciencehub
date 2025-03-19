<template>
  <div class="min-h-screen bg-gray-50/50">
    <div class="bg-white p-6 lg:p-8 min-h-screen">
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-semibold">Join Requests</h2>
            <p class="text-sm text-gray-500 mt-1">Manage student join requests</p>
          </div>
          
          <div class="flex gap-3">
            <UButton
              icon="i-heroicons-funnel"
              :ui="{ rounded: 'rounded-full' }"
              :color="showFilters ? 'primary' : 'gray'"
              :variant="showFilters ? 'soft' : 'ghost'"
              @click="showFilters = !showFilters"
            >
              Filters
            </UButton>
            <UButton
              :ui="{ rounded: 'rounded-full' }"
              color="primary"
              icon="i-heroicons-arrow-path"
              @click="refreshData"
              :loading="isRefreshing"
            >
              Refresh
            </UButton>
          </div>
        </div>

        <ConsoleJoinRequestsFilters
          v-show="showFilters"
          :filters="filters"
          @update:filters="updateFilters"
        />

        <div class="space-y-2">
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
            <ConsoleJoinRequestsTable
              :rows="paginatedRequests"
              :loading="isRefreshing"
              @view="handleViewRequest"
              @accept="handleAcceptRequest"
              @reject="handleRejectRequest"
              @delete="handleDeleteRequest"
            />
          </div>

          <div class="flex justify-between items-center pt-2">
            <div class="text-sm text-gray-500">
              Showing {{ Math.min((page - 1) * pageSize + 1, filteredRequests.length) }}-{{ Math.min(page * pageSize, filteredRequests.length) }} of {{ filteredRequests.length }} requests
            </div>
            <UPagination
              v-model="page"
              :total="filteredRequests.length"
              :page-count="pageSize"
              size="sm"
              :ui="{
                wrapper: 'flex items-center gap-1',
                base: 'min-w-[32px] h-[32px] flex items-center justify-center text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors',
                rounded: 'rounded-lg',
                default: {
                  inactive: 'hover:bg-gray-50',
                  active: 'bg-primary-50 text-primary-500 font-medium'
                }
              }"
            />
          </div>
        </div>

        <ConsoleJoinRequestsDetailsModal
          v-model="isDetailsModalOpen"
          :request="selectedRequest"
          @accept="handleAcceptRequest"
          @reject="handleRejectRequest"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Make sure we import the type directly to avoid global type conflicts
import { useJoinRequests, type JoinRequest } from '~/composables/useJoinRequests'

definePageMeta({
  layout: 'console'
})

const showFilters = ref(false)
const isRefreshing = ref(false)
const isDetailsModalOpen = ref(false)
const selectedRequest = ref<JoinRequest | null>(null)
const page = ref(1)
const pageSize = 8

const { filterRequests, filters } = useJoinRequestFilters()
const { fetchJoinRequests, updateRequestStatus } = useJoinRequests()

const updateFilters = (newFilters: any) => {
  Object.assign(filters, newFilters)
}

// Store join requests
const requests = ref<JoinRequest[]>([])

// Apply filters to requests
const filteredRequests = computed(() => {
  return filterRequests(requests.value)
})

// Get paginated requests
const paginatedRequests = computed(() => {
  return filteredRequests.value.slice(
    (page.value - 1) * pageSize,
    (page.value) * pageSize
  )
})

const refreshData = async () => {
  isRefreshing.value = true
  try {
    requests.value = await fetchJoinRequests()
  } catch (error) {
    console.error('Error fetching join requests:', error)
  } finally {
    isRefreshing.value = false
  }
}

const handleViewRequest = (request: JoinRequest) => {
  selectedRequest.value = request
  isDetailsModalOpen.value = true
}

const handleAcceptRequest = async (request: JoinRequest) => {
  try {
    await updateRequestStatus(request.id, true)
    await refreshData()
  } catch (error) {
    console.error('Error accepting request:', error)
  } finally {
    isDetailsModalOpen.value = false
  }
}

const handleRejectRequest = async (request: JoinRequest) => {
  try {
    await updateRequestStatus(request.id, false)
    await refreshData()
  } catch (error) {
    console.error('Error rejecting request:', error)
  } finally {
    isDetailsModalOpen.value = false
  }
}

const handleDeleteRequest = async (request: JoinRequest) => {
  // Currently not implemented as we're using CASCADE delete in the database
  // If needed, we can add a delete function to the useJoinRequests composable
}

// Fetch data on component mount
onMounted(() => {
  refreshData()
})
</script>