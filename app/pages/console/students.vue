<template>
  <div class="h-full space-y-8">
    <!-- Students Section -->
    <div class="bg-white rounded-lg shadow-sm">
      <div class="p-6 lg:p-8 space-y-6">
        <!-- Header Section -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 class="text-xl font-semibold">Students</h2>
            <p class="text-sm text-gray-500 mt-1">Manage your students</p>
          </div>

          <div class="flex items-center gap-3">
            <UButton
              icon="i-heroicons-arrow-path"
              :ui="{ rounded: 'rounded-full' }"
              :loading="isReloadingStudents"
              color="gray"
              variant="ghost"
              @click="reloadStudents"
              square
            />
            <UButton icon="i-heroicons-funnel" :ui="{ rounded: 'rounded-full' }" :color="showFilters ? 'primary' : 'gray'"
              :variant="showFilters ? 'soft' : 'ghost'" :block="isMobile" @click="showFilters = !showFilters"
              label="Filters" />
          </div>
        </div>

        <!-- Filters -->
        <ConsoleStudentsFilters v-show="showFilters" :filters="filters" @update:filters="updateFilters" />

        <!-- Table Section -->
        <div class="space-y-2">
          <div class="border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <ConsoleStudentsTable :rows="paginatedStudents" :loading="false" @view="navigateToStudent"
                @deactivate="handleDeactivate" />
            </div>
          </div>

          <!-- Pagination -->
          <div class="flex justify-between items-center pt-2">
            <div class="text-sm text-gray-500">
              Showing {{ Math.min((page - 1) * pageSize + 1, filteredStudents.length) }}-{{ Math.min(page * pageSize,
                filteredStudents.length) }} of {{ filteredStudents.length }} students
            </div>

            <UPagination v-model="page" :total="filteredStudents.length" :page-count="pageSize" size="sm" :ui="{
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
            <h2 class="text-xl font-semibold">Student Invitations</h2>
            <p class="text-sm text-gray-500 mt-1">Manage pending and sent invitations</p>
          </div>

          <div class="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto">
            <UButton
              icon="i-heroicons-arrow-path"
              :ui="{ rounded: 'rounded-full' }"
              :loading="isLoading"
              color="gray"
              variant="ghost"
              @click="reloadInvitations"
              square
            />
            <UButton label="Filters" icon="i-heroicons-funnel" :ui="{ rounded: 'rounded-full' }"
              :color="showInvitationFilters ? 'primary' : 'gray'" :variant="showInvitationFilters ? 'soft' : 'ghost'"
              :block="isMobile" @click="showInvitationFilters = !showInvitationFilters" />
            <UButton label="Invite Student" color="primary" icon="i-heroicons-plus" :ui="{ rounded: 'rounded-full' }"
              :block="isMobile" @click="isInviteModalOpen = true" />
          </div>
        </div>

        <!-- Filters -->
        <ConsoleStudentsInvitationsFilters v-show="showInvitationFilters" :filters="invitationFilters"
          @update:filters="updateInvitationFilters" />

        <!-- Table Section -->
        <div class="space-y-2">
          <div class="border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <ConsoleStudentsInvitationsTable :rows="paginatedInvitations" :loading="isLoading"
                @resend="handleResendInvitation" @revoke="handleRevokeInvitation" @delete="handleDeleteInvitation" />
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
    <ConsoleStudentsInviteModal v-model="isInviteModalOpen" @invite="handleInvite" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
// import { useSupabaseClient } from '@nuxtjs/supabase-edge'
import type { Invitation } from '~/components/Console/Students/Invitations/Table.vue'
import { useInvitations } from '~/composables/useInvitations'
import { isMobileScreen } from '~/lib/utils'

// Initialize composables
const { createInvitation, fetchInvitations, updateInvitationStatus, deleteInvitation, sendInvitationEmail } = useInvitations()
const supabase = useSupabaseClient()
const toast = useToast()

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
  grade: undefined,
  status: undefined
})

// Update filters
const updateFilters = (newFilters: any) => {
  Object.assign(filters.value, newFilters)
}

// Dummy data for students
const students = ref([
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    grade: 10,
    paymentStatus: 'Paid',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    grade: 11,
    paymentStatus: 'Unpaid',
    status: 'Active'
  },
  {
    id: 3,
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    grade: 9,
    paymentStatus: 'Paid',
    status: 'Inactive'
  }
])

// Apply filters to students
const filteredStudents = computed(() => {
  return students.value.filter((student: any) => {
    if (filters.value.search && !student.name.toLowerCase().includes(filters.value.search.toLowerCase())) {
      return false
    }
    if (filters.value.grade !== undefined && student.grade !== filters.value.grade) {
      return false
    }
    if (filters.value.status && student.status !== filters.value.status) {
      return false
    }
    return true
  })
})

// Get paginated students
const paginatedStudents = computed(() => {
  return filteredStudents.value.slice(
    (page.value - 1) * pageSize,
    page.value * pageSize
  )
})

// Navigation and action handlers
const navigateToStudent = (student: any) => {
  console.log(`Navigate to student ${student.id}`)
}

const handleDeactivate = (student: any) => {
  // Toggle student status
  const studentToUpdate = students.value.find((s: any) => s.id === student.id)
  if (studentToUpdate) {
    studentToUpdate.status = studentToUpdate.status === 'Active' ? 'Inactive' : 'Active'
  }
}

// Update handleInvite function to handle undefined grade
const handleInvite = async (formData: { name: string; email: string; grade: number | undefined; expiresIn: number }) => {
  if (!formData.grade) {
    toast.add({
      title: 'Error',
      description: 'Please select a grade',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    })
    return
  }

  try {
    isLoading.value = true
    await createInvitation({
      email: formData.email,
      name: formData.name,
      grade: formData.grade,
      expiresIn: formData.expiresIn
    })
    
    // Refresh invitations list
    const fetchedInvitations = await fetchInvitations()
    invitations.value = fetchedInvitations.map(invitation => ({
      ...invitation,
      invitedBy: 'Current User' // We'll update this once we have user data
    }))
    
    toast.add({
      title: 'Invitation Sent',
      description: `Invitation sent to ${formData.email}`,
      icon: 'i-heroicons-check-circle',
      color: 'green'
    })
  } catch (error) {
    console.error('Failed to send invitation:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to send invitation. Please try again.',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    })
  } finally {
    isLoading.value = false
  }
}

// Invitation section state
const showInvitationFilters = ref(false)
const invitationPage = ref(1)

// Invitation filters state
const invitationFilters = ref({
  search: '',
  grade: undefined,
  status: undefined,
  dateRange: undefined
})

// Update invitation filters
const updateInvitationFilters = (newFilters: any) => {
  Object.assign(invitationFilters.value, newFilters)
}

// Replace the invitations ref with useInvitations composable
const invitations = ref<Invitation[]>([])

// Add loading state
const isLoading = ref(false)

// Add reload state
const isReloadingStudents = ref(false)

// Update the onMounted function with proper status mapping
onMounted(async () => {
  try {
    isLoading.value = true
    const fetchedInvitations = await fetchInvitations()
    invitations.value = fetchedInvitations
  } catch (error) {
    console.error('Failed to fetch invitations:', error)
  } finally {
    isLoading.value = false
  }
})

// Apply filters to invitations
const filteredInvitations = computed(() => {
  return invitations.value.filter((invitation: Invitation) => {
    if (invitationFilters.value.search &&
      !invitation.name.toLowerCase().includes(invitationFilters.value.search.toLowerCase()) &&
      !invitation.email.toLowerCase().includes(invitationFilters.value.search.toLowerCase())) {
      return false
    }
    if (invitationFilters.value.grade !== undefined && invitation.grade !== invitationFilters.value.grade) {
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

// Invitation handlers
const handleResendInvitation = async (invitation: Invitation) => {
  try {
    isLoading.value = true
    const { data: invitationDB } = await supabase
      .from('invitations')
      .select('*')
      .eq('id', invitation.id)
      .single()
    
    if (!invitationDB) {
      throw new Error('Invitation not found')
    }

    await sendInvitationEmail(invitationDB)
    
    toast.add({
      title: 'Success',
      description: `Invitation resent to ${invitation.email}`,
      icon: 'i-heroicons-check-circle',
      color: 'green'
    })
  } catch (error) {
    console.error('Failed to resend invitation:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to resend invitation. Please try again.',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    })
  } finally {
    isLoading.value = false
  }
}

const handleRevokeInvitation = async (invitation: Invitation) => {
  try {
    await updateInvitationStatus(invitation.id)
    const invitationToUpdate = invitations.value.find(i => i.id === invitation.id)
    if (invitationToUpdate) {
      invitationToUpdate.status = 'Revoked'
    }
    
    toast.add({
      title: 'Invitation Revoked',
      description: `Invitation for ${invitation.email} has been revoked`,
      icon: 'i-heroicons-check-circle',
      color: 'green'
    })
  } catch (error) {
    console.error('Failed to revoke invitation:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to revoke invitation. Please try again.',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    })
  }
}

const handleDeleteInvitation = async (invitation: Invitation) => {
  try {
    await deleteInvitation(invitation.id)
    invitations.value = invitations.value.filter(i => i.id !== invitation.id)
    
    toast.add({
      title: 'Invitation Deleted',
      description: `Invitation for ${invitation.email} has been deleted`,
      icon: 'i-heroicons-check-circle',
      color: 'green'
    })
  } catch (error) {
    console.error('Failed to delete invitation:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to delete invitation. Please try again.',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    })
  }
}

// Reload students function
const reloadStudents = async () => {
  try {
    isReloadingStudents.value = true
    // Simulate fetching students
    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    console.error('Failed to reload students:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to reload students. Please try again.',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    })
  } finally {
    isReloadingStudents.value = false
  }
}

// Reload invitations function
const reloadInvitations = async () => {
  try {
    isLoading.value = true
    const fetchedInvitations = await fetchInvitations()
    invitations.value = fetchedInvitations
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

</script>