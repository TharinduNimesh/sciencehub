<template>
  <div class="h-full">
    <div class="bg-white rounded-lg shadow-sm">
      <div class="p-6 lg:p-8 space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 class="text-xl font-semibold">Join Requests</h2>
            <p class="text-sm text-gray-500 mt-1">Manage student join requests</p>
          </div>
            <div class="flex flex-col-reverse sm:flex-row sm:w-auto gap-3 w-full">
            <UButton icon="i-heroicons-funnel" :ui="{ rounded: 'rounded-full' }"
              :color="showFilters ? 'primary' : 'gray'" :variant="showFilters ? 'soft' : 'ghost'"
              :block="isMobile"
              @click="showFilters = !showFilters">
              Filters
            </UButton>
            <UButton :ui="{ rounded: 'rounded-full' }" color="primary" icon="i-heroicons-arrow-path"
              :block="isMobile"
              @click="refreshData" :loading="isRefreshing">
              Refresh
            </UButton>
            </div>
        </div>

        <ConsoleJoinRequestsFilters v-show="showFilters" :filters="filters" @update:filters="updateFilters" />

        <div class="space-y-2">
          <div class="border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <ConsoleJoinRequestsTable :rows="paginatedRequests" :loading="isRefreshing" @view="handleViewRequest"
                @accept="handleAcceptRequest" @reject="handleRejectRequest" @delete="handleDeleteRequest" />
            </div>
          </div>

          <div class="flex justify-between items-center pt-2">
            <div class="text-sm text-gray-500">
              Showing {{ Math.min((page - 1) * pageSize + 1, filteredRequests.length) }}-{{ Math.min(page * pageSize,
              filteredRequests.length) }} of {{ filteredRequests.length }} requests
            </div>
            <UPagination v-model="page" :total="filteredRequests.length" :page-count="pageSize" size="sm" :ui="{
              wrapper: 'flex items-center gap-1',
              base: 'min-w-[32px] h-[32px] flex items-center justify-center text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors',
              rounded: 'rounded-lg',
              default: {
                inactive: 'hover:bg-gray-50',
                active: 'bg-primary-50 text-primary-500 font-medium'
              }
            }" />
          </div>
        </div>

        <ConsoleJoinRequestsDetailsModal v-model="isDetailsModalOpen" :request="selectedRequest"
          @accept="handleAcceptRequest" @reject="handleRejectRequest" />

        <CommonConfirmationDialog
          v-model="isDeleteConfirmOpen"
          title="Delete Join Request"
          description="Are you sure you want to delete this join request? This action cannot be undone."
          type="danger"
          confirm-text="Delete Request"
          cancel-text="Cancel"
          :has-learn-more="true"
          @confirm="handleConfirmDelete"
          @learn-more="isDeleteInfoOpen = true"
        />

        <ConsoleJoinRequestsDeleteInfoModal
          v-model="isDeleteInfoOpen"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useJoinRequests, type JoinRequest } from '~/composables/useJoinRequests'
import { useJoinRequestFilters } from '~/composables/useJoinRequestFilters'
import { ref, computed, onMounted } from 'vue'
import { isMobileScreen } from '~/lib/utils'

definePageMeta({
  layout: 'console'
})

const isMobile = ref(isMobileScreen())
const showFilters = ref(false)
const isRefreshing = ref(false)
const isDetailsModalOpen = ref(false)
const selectedRequest = ref<JoinRequest | null>(null)
const page = ref(1)
const pageSize = 8

const { filterRequests, filters } = useJoinRequestFilters()
const { fetchJoinRequests, updateRequestStatus, deleteJoinRequest } = useJoinRequests()

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

const isDeleteConfirmOpen = ref(false)
const isDeleteInfoOpen = ref(false)
const requestToDelete = ref<JoinRequest | null>(null)

const handleDeleteRequest = async (request: JoinRequest) => {
  requestToDelete.value = request
  isDeleteConfirmOpen.value = true
}

const handleConfirmDelete = async () => {
  if (!requestToDelete.value) return

  try {
    await deleteJoinRequest(requestToDelete.value.id)
    await refreshData()
    toast.add({
      title: 'Success',
      description: 'Join request deleted successfully',
      color: 'green'
    })
  } catch (error) {
    console.error('Error deleting request:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to delete join request',
      color: 'red'
    })
  } finally {
    isDeleteConfirmOpen.value = false
    requestToDelete.value = null
  }
}

// Add toast to composables
const toast = useToast()

// Fetch data on component mount
onMounted(() => {
  refreshData()
})

// Add resize event listener
if (process.client) {
  window.addEventListener('resize', () => {
    isMobile.value = isMobileScreen()
  })
}
</script>