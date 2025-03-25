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

          <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div class="flex gap-2 w-full">
              <UButton
                icon="i-heroicons-arrow-path"
                :ui="{ rounded: 'rounded-full' }"
                :loading="isReloadingStudents"
                color="gray"
                variant="ghost"
                @click="reloadStudents"
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
        <ConsoleStudentsFilters v-show="showFilters" :filters="filters" @update:filters="updateFilters" />

        <!-- Table Section -->
        <div class="space-y-2">
          <div class="border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <ConsoleStudentsTable :rows="paginatedStudents" :loading="false" @view="navigateToStudent"
                @deactivate="handleDeactivate" :processing-ids="processingIds" @delete="handleDelete" />
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
              label="Invite Student" 
              color="primary" 
              icon="i-heroicons-plus" 
              :ui="{ rounded: 'rounded-full' }"
              :block="isMobile" 
              @click="isInviteModalOpen = true" 
            />
          </div>
        </div>

        <!-- Filters -->
        <ConsoleStudentsInvitationsFilters v-show="showInvitationFilters" :filters="invitationFilters"
          @update:filters="updateInvitationFilters" />

        <!-- Table Section -->
        <div class="space-y-2">
          <div class="border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <ConsoleStudentsInvitationsTable 
                :rows="paginatedInvitations" 
                :loading="isLoading"
                :processing-ids="processingIds"
                @resend="handleResendInvitation" 
                @revoke="handleRevokeInvitation" 
                @delete="handleDeleteInvitation" 
              />
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
import { definePageMeta } from '#imports'
import { ref, computed, onMounted } from 'vue'
import type { Invitation } from '~/components/Console/Students/Invitations/Table.vue'
import { useInvitations } from '~/composables/useInvitations'
import { isMobileScreen } from '~/lib/utils'

// Initialize composables
const { createInvitation, fetchInvitations, updateInvitationStatus, deleteInvitation, resendInvitation } = useInvitations()
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
    const newInvitation = await createInvitation({
      email: formData.email,
      name: formData.name,
      grade: formData.grade,
      expiresIn: formData.expiresIn,
      role: 'STUDENT'
    })
    
    // Transform the new invitation to match the Invitation type
    const transformedInvitation: Invitation = {
      id: newInvitation.id,
      name: newInvitation.name,
      email: newInvitation.email,
      grade: newInvitation.grade ?? 0,
      invitedAt: newInvitation.invitedAt,
      invitedBy: 'Current User',
      status: newInvitation.status
    }
    
    // Add the new invitation to the list
    invitations.value.unshift(transformedInvitation)
    
    toast.add({
      title: 'Success',
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
    isInviteModalOpen.value = false
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

// Replace the invitations ref with proper typing
const invitations = ref<Invitation[]>([])

// Add loading state
const isLoading = ref(false)

// Add reload state
const isReloadingStudents = ref(false)

// Update the onMounted function with proper status mapping
onMounted(async () => {
  try {
    isLoading.value = true
    const rawInvitations = await fetchInvitations('STUDENT')
    // Transform the raw invitations to match the required Invitation type
    invitations.value = rawInvitations.map(invitation => ({
      id: invitation.id,
      name: invitation.name,
      email: invitation.email,
      grade: invitation.grade ?? 0,
      invitedAt: invitation.invitedAt,
      invitedBy: 'Current User',
      status: invitation.status
    }))
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
  await handleAction(invitation.id, async () => {
    try {
      await resendInvitation(invitation.id)
      
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
      throw error // Re-throw to ensure the processing state is cleared
    }
  })
}

const handleRevokeInvitation = async (invitation: Invitation) => {
  await handleAction(invitation.id, async () => {
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
      throw error // Re-throw to ensure the processing state is cleared
    }
  })
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

// Update reloadInvitations to transform data properly
const reloadInvitations = async () => {
  try {
    isLoading.value = true
    const rawInvitations = await fetchInvitations('STUDENT')
    invitations.value = rawInvitations.map(invitation => ({
      id: invitation.id,
      name: invitation.name,
      email: invitation.email,
      grade: invitation.grade ?? 0,
      invitedAt: invitation.invitedAt,
      invitedBy: 'Current User',
      status: invitation.status
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

// Processing state management
const processingIds = ref<number[]>([])

const handleAction = async (id: number, action: () => Promise<void>) => {
  processingIds.value.push(id)
  try {
    await action()
  } finally {
    processingIds.value = processingIds.value.filter(pid => pid !== id)
  }
}

// Add deleteStudent function with proper type
const deleteStudent = async (studentId: number) => {
  try {
    // TODO: Implement actual student deletion logic with Supabase
    // For now, just remove from local state
    students.value = students.value.filter(s => s.id !== studentId)
    
    toast.add({
      title: 'Success',
      description: 'Student has been deleted successfully',
      icon: 'i-heroicons-check-circle',
      color: 'green'
    })
  } catch (error) {
    console.error('Failed to delete student:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to delete student. Please try again.',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    })
  }
}

// Update handleDelete with proper typing
const handleDelete = async (student: { id: number }) => {
  await handleAction(student.id, async () => {
    await deleteStudent(student.id)
  })
}

// Update onMounted to handle grade properly
onMounted(async () => {
  try {
    isLoading.value = true
    const fetchedInvitations = await fetchInvitations('STUDENT')
    // Ensure grade is always defined for the table
    invitations.value = fetchedInvitations.map(invitation => ({
      ...invitation,
      grade: invitation.grade || 0, // Provide a default value if grade is undefined
      invitedBy: 'Current User' // We'll update this once we have user data
    }))
  } catch (error) {
    console.error('Failed to fetch invitations:', error)
  } finally {
    isLoading.value = false
  }
})
</script>