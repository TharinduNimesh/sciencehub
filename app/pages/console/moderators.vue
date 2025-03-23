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
                @view="navigateToModerator"
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
import type { Invitation } from '~/components/Console/Moderators/Invitations/Table.vue'
import type { Moderator } from '~/components/Console/Moderators/Table.vue'
import { useInvitations } from '~/composables/useInvitations'
import { isMobileScreen } from '~/lib/utils'

definePageMeta({
  layout: 'console'
})

const isMobile = ref(isMobileScreen())
const showFilters = ref(false)
const isInviteModalOpen = ref(false)
const page = ref(1)
const pageSize = 8

// Add resize event listener
if (import.meta.client) {
  window.addEventListener('resize', () => {
    isMobile.value = isMobileScreen()
  })
}

// Filter states
const filters = ref({
  search: '',
  class: undefined,
  status: undefined
})

// Update filters
const updateFilters = (newFilters: any) => {
  Object.assign(filters.value, newFilters)
}

// Dummy data for moderators with correct status type
const moderators = ref<Moderator[]>([
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    classes: [
      { id: 1, name: 'Grade 11 - Revision' },
      { id: 2, name: 'Grade 11 - Theory' },
      { id: 3, name: 'Grade 10 - Revision' }
    ],
    status: 'Active'
  },
  {
    id: 2,
    name: 'Jane Wilson',
    email: 'jane.wilson@example.com',
    classes: [
      { id: 2, name: 'Grade 11 - Theory' }
    ],
    status: 'Active'
  },
  {
    id: 3,
    name: 'Michael Brown',
    email: 'michael.b@example.com',
    classes: [
      { id: 3, name: 'Grade 10 - Revision' },
      { id: 4, name: 'Grade 10 - Theory' }
    ],
    status: 'Inactive'
  }
] as const)

// Apply filters to moderators
const filteredModerators = computed(() => {
  return moderators.value.filter((moderator: any) => {
    if (filters.value.search && 
      !moderator.name.toLowerCase().includes(filters.value.search.toLowerCase()) &&
      !moderator.email.toLowerCase().includes(filters.value.search.toLowerCase())) {
      return false
    }
    if (filters.value.class && !moderator.classes.some((c: any) => c.name === filters.value.class)) {
      return false
    }
    if (filters.value.status && moderator.status !== filters.value.status) {
      return false
    }
    return true
  })
})

// Get paginated moderators
const paginatedModerators = computed(() => {
  return filteredModerators.value.slice(
    (page.value - 1) * pageSize,
    page.value * pageSize
  )
})

// Navigation and action handlers
const navigateToModerator = (moderator: any) => {
  console.log(`Navigate to moderator ${moderator.id}`)
}

// Add processing state management
const processingIds = ref<number[]>([])

const handleAction = async (id: number, action: () => Promise<void>) => {
  processingIds.value.push(id)
  try {
    await action()
  } finally {
    processingIds.value = processingIds.value.filter(pid => pid !== id)
  }
}

// Update the action handlers to use processing state
const handleDeactivate = async (moderator: Moderator) => {
  await handleAction(moderator.id, async () => {
    // Your deactivate logic here
    await deactivateModerator(moderator.id)
  })
}

// Invitation section
const showInvitationFilters = ref(false)
const invitationPage = ref(1)
const isLoading = ref(false)
const isReloadingModerators = ref(false)

// Invitation filters state
const invitationFilters = ref({
  search: '',
  class: undefined,
  status: undefined,
  dateRange: undefined
})

// Update invitation filters
const updateInvitationFilters = (newFilters: any) => {
  Object.assign(invitationFilters.value, newFilters)
}

// Dummy invitations data
const invitations = ref<Invitation[]>([]);

// Apply filters to invitations
const filteredInvitations = computed(() => {
  return invitations.value.filter((invitation: Invitation) => {
    if (invitationFilters.value.search &&
      !invitation.name.toLowerCase().includes(invitationFilters.value.search.toLowerCase()) &&
      !invitation.email.toLowerCase().includes(invitationFilters.value.search.toLowerCase())) {
      return false
    }
    if (invitationFilters.value.class && !invitation.classes.some(c => c.name === invitationFilters.value.class)) {
      return false
    }
    if (invitationFilters.value.status && invitation.status !== invitationFilters.value.status) {
      return false
    }
    if (invitationFilters.value.dateRange) {
      const invitedDate = new Date(invitation.invitedAt)
      const now = new Date()
      switch (invitationFilters.value.dateRange) {
        case '24h':
          if (now.getTime() - invitedDate.getTime() > 24 * 60 * 60 * 1000) return false
          break
        case '7d':
          if (now.getTime() - invitedDate.getTime() > 7 * 24 * 60 * 60 * 1000) return false
          break
        case '30d':
          if (now.getTime() - invitedDate.getTime() > 30 * 24 * 60 * 60 * 1000) return false
          break
      }
    }
    return true
  })
})

// Get paginated invitations
const paginatedInvitations = computed(() => {
  return filteredInvitations.value.slice(
    (invitationPage.value - 1) * pageSize,
    invitationPage.value * pageSize
  )
})

// Initialize composables
const { createInvitation, fetchInvitations, updateInvitationStatus, deleteInvitation, resendInvitation } = useInvitations()
const toast = useToast()

definePageMeta({
  layout: 'console'
})

// Update handleInvite to transform the data before assigning
const handleInvite = async (formData: { name: string; email: string; classes?: Array<{ id: number; name: string }>; expiresIn: number }) => {
  try {
    isLoading.value = true
    const newInvitation = await createInvitation({
      email: formData.email,
      name: formData.name,
      classes: formData.classes,
      expiresIn: formData.expiresIn,
      role: 'MODERATOR'
    })
    
    // Transform the new invitation to match the Invitation type
    const transformedInvitation = {
      id: newInvitation.id,
      name: newInvitation.name,
      email: newInvitation.email,
      classes: newInvitation.classes || [],
      invitedAt: newInvitation.invitedAt,
      invitedBy: 'Current User',
      status: newInvitation.status
    }
    
    // Add the new invitation to the list
    invitations.value.unshift(transformedInvitation)
    
    toast.add({
      title: 'Invitation Sent',
      description: `Invitation sent to ${formData.email}`,
      icon: 'i-heroicons-check-circle',
      color: 'green'
    })
  } catch (error: any) {
    console.error('Failed to send invitation:', error)
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to send invitation. Please try again.',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    })
  } finally {
    isLoading.value = false
    isInviteModalOpen.value = false
  }
}

// Update handleRevokeInvitation to properly handle types
const handleRevokeInvitation = async (invitation: Invitation) => {
  await handleAction(invitation.id, async () => {
    try {
      await updateInvitationStatus(invitation.id)
      const index = invitations.value.findIndex(i => i.id === invitation.id)
      if (index !== -1) {
        const currentInvitation = invitations.value[index]
        if (currentInvitation) {
          // Create updatedInvitation with all required properties
          const updatedInvitation: Invitation = {
            id: currentInvitation.id,
            name: currentInvitation.name,
            email: currentInvitation.email,
            classes: currentInvitation.classes,
            invitedAt: currentInvitation.invitedAt,
            invitedBy: currentInvitation.invitedBy,
            status: 'Revoked'
          }
          invitations.value[index] = updatedInvitation
        }
      }
      useToast().add({
        title: 'Success',
        description: 'Invitation revoked successfully',
        color: 'green'
      })
    } catch (error) {
      useToast().add({
        title: 'Error',
        description: 'Failed to revoke invitation',
        color: 'red'
      })
    }
  })
}

// Invitation handlers
const handleResendInvitation = async (invitation: Invitation) => {
  await handleAction(invitation.id, async () => {
    try {
      await resendInvitation(invitation.id)
      
      useToast().add({
        title: 'Success',
        description: `Invitation resent to ${invitation.email}`,
        color: 'green'
      })
    } catch (error) {
      console.error('Failed to resend invitation:', error)
      useToast().add({
        title: 'Error',
        description: 'Failed to resend invitation. Please try again.',
        color: 'red'
      })
      throw error // Re-throw to ensure the processing state is cleared
    }
  })
}

const handleDeleteInvitation = async (invitation: Invitation) => {
  await handleAction(invitation.id, async () => {
    try {
      await deleteInvitation(invitation.id)
      invitations.value = invitations.value.filter(i => i.id !== invitation.id)
      useToast().add({
        title: 'Success',
        description: 'Invitation deleted successfully',
        color: 'green'
      })
    } catch (error) {
      useToast().add({
        title: 'Error',
        description: 'Failed to delete invitation',
        color: 'red'
      })
    }
  })
}

// Reload functions
const reloadModerators = async () => {
  try {
    isReloadingModerators.value = true
    // TODO: Implement moderators reload
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    console.error('Failed to reload moderators:', error)
    useToast().add({
      title: 'Error',
      description: 'Failed to reload moderators. Please try again.',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    })
  } finally {
    isReloadingModerators.value = false
  }
}

// Update onMounted to properly transform the invitations data
onMounted(async () => {
  try {
    isLoading.value = true
    const rawInvitations = await fetchInvitations('MODERATOR')
    // Transform the raw invitations to match the required Invitation type
    invitations.value = rawInvitations.map(invitation => ({
      ...invitation,
      classes: invitation.classes || [], // Provide empty array if classes is undefined
      invitedBy: invitation.invitedBy || 'System' // Provide default value if undefined
    }))
  } catch (error) {
    console.error('Failed to fetch invitations:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to fetch invitations. Please try again.',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    })
  } finally {
    isLoading.value = false
  }
})

// Update reloadInvitations to use the same transformation
const reloadInvitations = async () => {
  try {
    isLoading.value = true
    const rawInvitations = await fetchInvitations('MODERATOR')
    invitations.value = rawInvitations.map(invitation => ({
      ...invitation,
      classes: invitation.classes || [],
      invitedBy: invitation.invitedBy || 'System'
    }))
  } catch (error) {
    console.error('Failed to reload invitations:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to reload invitations. Please try again.',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    })
  } finally {
    isLoading.value = false
  }
}

// Fix type definitions
const deactivateModerator = async (moderatorId: number) => {
  try {
    // TODO: Implement actual moderator deactivation logic
    const moderatorToUpdate = moderators.value.find(m => m.id === moderatorId)
    if (moderatorToUpdate) {
      moderatorToUpdate.status = moderatorToUpdate.status === 'Active' ? 'Inactive' : 'Active'
      
      toast.add({
        title: 'Success',
        description: `Moderator status updated successfully`,
        icon: 'i-heroicons-check-circle',
        color: 'green'
      })
    }
  } catch (error) {
    console.error('Failed to deactivate moderator:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to update moderator status. Please try again.',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    })
  }
}
</script>