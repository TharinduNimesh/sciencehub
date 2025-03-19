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
              :total="requests.length"
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
definePageMeta({
  layout: 'console'
})

interface JoinRequest {
  id: number;
  name: string;
  email: string;
  grade: number;
  contactNumber: string;
  referralSource: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  requestedAt: string;
  acceptedAt: string | null;
  invitationStatus: string | null;
}

const showFilters = ref(false)
const isRefreshing = ref(false)
const isDetailsModalOpen = ref(false)
const selectedRequest = ref<JoinRequest | null>(null)
const page = ref(1)
const pageSize = 8

const { filterRequests } = useJoinRequestFilters()

// Dummy data for now - will be replaced with actual data from Supabase
const requests = ref<JoinRequest[]>([
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    grade: 6,
    contactNumber: '+94 71 234 5678',
    referralSource: 'Social Media',
    status: 'Pending',
    requestedAt: '2024-01-15T10:30:00Z',
    acceptedAt: null,
    invitationStatus: null
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    grade: 7,
    contactNumber: '+94 71 987 6543',
    referralSource: 'Friend',
    status: 'Accepted',
    requestedAt: '2024-01-14T08:15:00Z',
    acceptedAt: '2024-01-14T09:30:00Z',
    invitationStatus: 'Sent'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike@example.com',
    grade: 8,
    contactNumber: '+94 71 555 1234',
    referralSource: 'Search Engine',
    status: 'Rejected',
    requestedAt: '2024-01-13T14:20:00Z',
    acceptedAt: null,
    invitationStatus: null
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    grade: 9,
    contactNumber: '+94 71 111 2222',
    referralSource: 'Advertisement',
    status: 'Pending',
    requestedAt: '2024-01-16T09:15:00Z',
    acceptedAt: null,
    invitationStatus: null
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david@example.com',
    grade: 10,
    contactNumber: '+94 71 333 4444',
    referralSource: 'Social Media',
    status: 'Accepted',
    requestedAt: '2024-01-15T14:20:00Z',
    acceptedAt: '2024-01-15T15:30:00Z',
    invitationStatus: 'Accepted'
  },
  {
    id: 6,
    name: 'Emma Davis',
    email: 'emma@example.com',
    grade: 6,
    contactNumber: '+94 71 555 6666',
    referralSource: 'Friend',
    status: 'Pending',
    requestedAt: '2024-01-16T11:45:00Z',
    acceptedAt: null,
    invitationStatus: null
  },
  {
    id: 7,
    name: 'Michael Chen',
    email: 'michael@example.com',
    grade: 7,
    contactNumber: '+94 71 777 8888',
    referralSource: 'Hand Bill',
    status: 'Accepted',
    requestedAt: '2024-01-14T16:30:00Z',
    acceptedAt: '2024-01-14T17:45:00Z',
    invitationStatus: 'Sent'
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david@example.com',
    grade: 10,
    contactNumber: '+94 71 333 4444',
    referralSource: 'Social Media',
    status: 'Accepted',
    requestedAt: '2024-01-15T14:20:00Z',
    acceptedAt: '2024-01-15T15:30:00Z',
    invitationStatus: 'Accepted'
  },
  {
    id: 6,
    name: 'Emma Davis',
    email: 'emma@example.com',
    grade: 6,
    contactNumber: '+94 71 555 6666',
    referralSource: 'Friend',
    status: 'Pending',
    requestedAt: '2024-01-16T11:45:00Z',
    acceptedAt: null,
    invitationStatus: null
  },
  {
    id: 7,
    name: 'Michael Chen',
    email: 'michael@example.com',
    grade: 7,
    contactNumber: '+94 71 777 8888',
    referralSource: 'Hand Bill',
    status: 'Accepted',
    requestedAt: '2024-01-14T16:30:00Z',
    acceptedAt: '2024-01-14T17:45:00Z',
    invitationStatus: 'Sent'
  },
  {
    id: 8,
    name: 'Lisa Taylor',
    email: 'lisa@example.com',
    grade: 8,
    contactNumber: '+94 71 999 0000',
    referralSource: 'Search Engine',
    status: 'Rejected',
    requestedAt: '2024-01-13T10:20:00Z',
    acceptedAt: null,
    invitationStatus: null
  },
  {
    id: 9,
    name: 'Kevin Anderson',
    email: 'kevin@example.com',
    grade: 9,
    contactNumber: '+94 71 122 3344',
    referralSource: 'Advertisement',
    status: 'Pending',
    requestedAt: '2024-01-16T13:15:00Z',
    acceptedAt: null,
    invitationStatus: null
  },
  {
    id: 10,
    name: 'Rachel Green',
    email: 'rachel@example.com',
    grade: 10,
    contactNumber: '+94 71 556 7788',
    referralSource: 'Social Media',
    status: 'Accepted',
    requestedAt: '2024-01-15T09:30:00Z',
    acceptedAt: '2024-01-15T10:45:00Z',
    invitationStatus: 'Expired'
  }
])

// Apply filters to requests
const filteredRequests = computed(() => {
  return filterRequests(requests.value)
})

// Get paginated requests - using exactly the same approach as Nuxt UI docs
const paginatedRequests = computed(() => {
  return filteredRequests.value.slice(
    (page.value - 1) * pageSize,
    (page.value) * pageSize
  )
})

const refreshData = async () => {
  isRefreshing.value = true
  try {
    // TODO: Implement refresh logic with Supabase
    await new Promise(resolve => setTimeout(resolve, 1000))
  } finally {
    isRefreshing.value = false
  }
}

const handleViewRequest = (request: JoinRequest) => {
  selectedRequest.value = request
  isDetailsModalOpen.value = true
}

const handleAcceptRequest = async (request: JoinRequest) => {
  // TODO: Implement accept logic
  isDetailsModalOpen.value = false
}

const handleRejectRequest = async (request: JoinRequest) => {
  // TODO: Implement reject logic
  isDetailsModalOpen.value = false
}

const handleDeleteRequest = async (request: JoinRequest) => {
  // TODO: Implement delete logic
}
</script>