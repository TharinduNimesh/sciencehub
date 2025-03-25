<template>
  <div class="h-full space-y-8">
    <!-- Moderators Section -->
    <div class="bg-white rounded-lg shadow-sm">
      <div class="p-6 lg:p-8 space-y-6">
        <!-- Header Section -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 class="text-xl font-semibold">Moderators</h2>
            <p class="text-sm text-gray-500 mt-1">Manage your moderators</p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div class="flex gap-2 w-full">
              <UButton
                icon="i-heroicons-arrow-path"
                :ui="{ rounded: 'rounded-full' }"
                :loading="isReloadingModerators"
                color="gray"
                variant="ghost"
                @click="reloadModerators"
                square
              />
              <div class="flex-1">
                <UButton 
                  icon="i-heroicons-funnel" 
                  :ui="{ rounded: 'rounded-full' }" 
                  :color="showFilters ? 'primary' : 'gray'"
                  :variant="showFilters ? 'soft' : 'ghost'" 
                  :block="true"
                  @click="showFilters = !showFilters"
                  label="Filters" 
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <ConsoleModeratorsFilters 
          v-show="showFilters" 
          :filters="filters" 
          @update:filters="updateFilters" 
          class="transition-all duration-200 ease-in-out"
        />

        <!-- Table Section -->
        <div class="space-y-2">
          <div class="border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <ConsoleModeratorsTable 
                :rows="paginatedModerators" 
                :loading="false" 
                @deactivate="handleDeactivate" 
                :processing-ids="processingIds" 
              />
            </div>
          </div>

          <!-- Pagination -->
          <div class="flex justify-between items-center pt-2">
            <div class="text-sm text-gray-500">
              Showing {{ Math.min((page - 1) * pageSize + 1, filteredModerators.length) }}-{{ Math.min(page * pageSize,
                filteredModerators.length) }} of {{ filteredModerators.length }} moderators
            </div>

            <UPagination v-model="page" :total="filteredModerators.length" :page-count="pageSize" size="sm" :ui="{
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
      </div>
    </div>

    <!-- Invitations Section -->
    <div class="bg-white rounded-lg shadow-sm">
      <div class="p-6 lg:p-8 space-y-6">
        <!-- Header Section -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 class="text-xl font-semibold">Moderator Invitations</h2>
            <p class="text-sm text-gray-500 mt-1">Manage pending and sent invitations</p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div class="flex gap-2 w-full">
              <UButton
                icon="i-heroicons-arrow-path"
                :ui="{ rounded: 'rounded-full' }"
                :loading="isLoading"
                color="gray"
                variant="ghost"
                @click="reloadInvitations"
                square
              />
              <div class="flex-1">
                <UButton 
                  icon="i-heroicons-funnel" 
                  :ui="{ rounded: 'rounded-full' }" 
                  :color="showInvitationFilters ? 'primary' : 'gray'"
                  :variant="showInvitationFilters ? 'soft' : 'ghost'" 
                  :block="true"
                  @click="showInvitationFilters = !showInvitationFilters"
                  label="Filters" 
                />
              </div>
            </div>
            <UButton 
              label="Invite Moderator" 
              color="primary" 
              icon="i-heroicons-plus" 
              :ui="{ rounded: 'rounded-full' }"
              :block="isMobile" 
              @click="isInviteModalOpen = true" 
            />
          </div>
        </div>

        <!-- Filters -->
        <ConsoleModeratorsInvitationsFilters 
          v-show="showInvitationFilters" 
          :filters="invitationFilters"
          @update:filters="updateInvitationFilters" 
          class="transition-all duration-200 ease-in-out"
        />

        <!-- Table Section -->
        <div class="space-y-2">
          <div class="border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <ConsoleModeratorsInvitationsTable :rows="paginatedInvitations" :loading="isLoading"
                @resend="handleResendInvitation" @revoke="handleRevokeInvitation" @delete="handleDeleteInvitation" :processing-ids="processingIds" />
            </div>
          </div>

          <!-- Pagination -->
          <div class="flex justify-between items-center pt-2">
            <div class="text-sm text-gray-500">
              Showing {{ Math.min((invitationPage - 1) * pageSize + 1, filteredInvitations.length) }}-{{
                Math.min(invitationPage
                  * pageSize, filteredInvitations.length) }} of {{ filteredInvitations.length }} invitations
            </div>

            <UPagination v-model="invitationPage" :total="filteredInvitations.length" :page-count="pageSize" size="sm"
              :ui="{
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
      </div>
    </div>

    <!-- Invite Modal -->
    <ConsoleModeratorsInviteModal v-model="isInviteModalOpen" @invite="handleInvite" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Database, Invitation } from '~/types/supabase'
import type { Moderator } from '~/components/Console/Moderators/Table.vue'
import { useInvitations } from '~/composables/useInvitations'
import { isMobileScreen } from '~/lib/utils'
import { useNotification } from '~/composables/useNotification'
import { useRouter } from '#app'

// Page meta
definePageMeta({ layout: 'console' })

// Composables
const { createInvitation, fetchInvitations, updateInvitationStatus, deleteInvitation, resendInvitation } = useInvitations()
const notification = useNotification()
const router = useRouter()

// Navigation
const navigateToModerator = (moderator: Moderator) => {
  router.push(`/console/moderators/${moderator.id}`)
}

// Reactive state
const isMobile = ref(isMobileScreen())
const showFilters = ref(false)
const showInvitationFilters = ref(false)
const isInviteModalOpen = ref(false)
const isLoading = ref(false)
const isReloadingModerators = ref(false)
const processingIds = ref<number[]>([])
const page = ref(1)
const invitationPage = ref(1)
const pageSize = 8

// Filter states
const filters = ref({
  search: '',
  class: undefined,
  status: undefined
})

const invitationFilters = ref({
  search: '',
  class: undefined,
  status: undefined,
  dateRange: undefined
})

// Mobile responsive handler
if (import.meta.client) {
  window.addEventListener('resize', () => isMobile.value = isMobileScreen())
}

// Moderators state
const moderators = ref<Moderator[]>([])

// Invitations state
const invitations = ref<Invitation[]>([])

// Computed properties
const filteredModerators = computed(() => {
  return moderators.value.filter(moderator => {
    const matchesSearch = !filters.value.search || 
      moderator.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      moderator.email.toLowerCase().includes(filters.value.search.toLowerCase())
    const matchesClass = !filters.value.class || 
      moderator.classes.some(c => c.name === filters.value.class)
    const matchesStatus = !filters.value.status || 
      moderator.status === filters.value.status
    return matchesSearch && matchesClass && matchesStatus
  })
})

const paginatedModerators = computed(() => 
  filteredModerators.value.slice((page.value - 1) * pageSize, page.value * pageSize)
)

const filteredInvitations = computed(() => {
  return invitations.value.filter(invitation => {
    const matchesSearch = !invitationFilters.value.search || 
      invitation.name.toLowerCase().includes(invitationFilters.value.search.toLowerCase()) ||
      invitation.email.toLowerCase().includes(invitationFilters.value.search.toLowerCase())
    const matchesClass = !invitationFilters.value.class || 
      invitation.classes?.some(c => c.name === invitationFilters.value.class)
    const matchesStatus = !invitationFilters.value.status || 
      invitation.status === invitationFilters.value.status
    
    if (!matchesSearch || !matchesClass || !matchesStatus) return false
    
    if (invitationFilters.value.dateRange) {
      const invitedDate = new Date(invitation.invitedAt).getTime()
      const now = new Date().getTime()
      const timeRanges = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      }
      return now - invitedDate <= timeRanges[invitationFilters.value.dateRange]
    }
    return true
  })
})

const paginatedInvitations = computed(() => 
  filteredInvitations.value.slice((invitationPage.value - 1) * pageSize, invitationPage.value * pageSize)
)

// Action handlers
const handleAction = async (id: number, action: () => Promise<void>) => {
  processingIds.value.push(id)
  try {
    await action()
  } finally {
    processingIds.value = processingIds.value.filter(pid => pid !== id)
  }
}

const handleInvite = async (formData: { name: string; email: string; classes?: Array<{ id: number; name: string }>; expiresIn: number }) => {
  try {
    isLoading.value = true
    const newInvitation = await createInvitation({
      ...formData,
      role: 'MODERATOR',
      classes: formData.classes || []
    })

    // Reload invitations to get fresh data
    await loadInvitations()
    
    notification.showSuccess(`Invitation sent to ${formData.email}`)
    isInviteModalOpen.value = false
  } catch (error) {
    console.error('Failed to send invitation:', error)
    notification.showError('Failed to send invitation. Please try again.')
  } finally {
    isLoading.value = false
  }
}

// Data loading functions
const loadInvitations = async () => {
  try {
    isLoading.value = true
    const fetchedInvitations = await fetchInvitations('MODERATOR')
    invitations.value = fetchedInvitations;
  } catch (error) {
    console.error('Failed to fetch invitations:', error)
    notification.showError('Failed to fetch invitations. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const reloadInvitations = () => loadInvitations()

const reloadModerators = async () => {
  try {
    isReloadingModerators.value = true
    // Implement actual moderator reload logic here
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    console.error('Failed to reload moderators:', error)
    notification.showError('Failed to reload moderators. Please try again.')
  } finally {
    isReloadingModerators.value = false
  }
}

// Invitation handlers
const handleResendInvitation = async (invitation: Invitation) => {
  await handleAction(invitation.id, async () => {
    await resendInvitation(invitation.id)
    notification.showSuccess(`Invitation resent to ${invitation.email}`)
  })
}

const handleRevokeInvitation = async (invitation: Invitation) => {
  await handleAction(invitation.id, async () => {
    await updateInvitationStatus(invitation.id)
    const invitationToUpdate = invitations.value.find(i => i.id === invitation.id)
    if (invitationToUpdate) {
      invitationToUpdate.status = 'Revoked'
    }
    notification.showSuccess(`Invitation for ${invitation.email} has been revoked`)
  })
}

const handleDeleteInvitation = async (invitation: Invitation) => {
  await handleAction(invitation.id, async () => {
    await deleteInvitation(invitation.id)
    invitations.value = invitations.value.filter(i => i.id !== invitation.id)
    notification.showSuccess(`Invitation for ${invitation.email} has been deleted`)
  })
}

// Moderator handlers
const handleDeactivate = async (moderator: Moderator) => {
  await handleAction(moderator.id, async () => {
    const status = moderator.status === 'Active' ? 'Inactive' : 'Active'
    moderator.status = status
    notification.showSuccess(`Moderator status updated to ${status}`)
  })
}

// Filter handlers
const updateFilters = (newFilters: any) => {
  Object.assign(filters.value, newFilters)
}

const updateInvitationFilters = (newFilters: any) => {
  Object.assign(invitationFilters.value, newFilters)
}

// Initialize data
onMounted(loadInvitations)
</script>