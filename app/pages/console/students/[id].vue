<template>
  <div class="h-full space-y-8">
    <div v-if="student" class="bg-white rounded-lg shadow-sm">
      <!-- Header Section -->
      <div class="p-6 lg:p-8 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <UAvatar
              :text="getInitials(student.name)"
              size="lg"
              color="primary"
            />
            <div>
              <h2 class="text-xl font-semibold">{{ student.name }}</h2>
              <p class="text-sm text-gray-500">{{ student.email }}</p>
            </div>
          </div>
          <UBadge
            :color="student.is_active ? 'green' : 'gray'"
            variant="soft"
          >
            {{ student.is_active ? 'Active' : 'Inactive' }}
          </UBadge>
        </div>
      </div>

      <!-- Content Section -->
      <div class="p-6 lg:p-8 space-y-8">
        <!-- Basic Information -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold">Basic Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label class="text-sm font-medium text-gray-700">Grade</label>
              <p class="mt-1">Grade {{ student.current_grade }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700">Date of Birth</label>
              <p class="mt-1">{{ formatDate(student.date_of_birth) }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700">Gender</label>
              <p class="mt-1">{{ formatGender(student.gender) }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700">Enrolled At</label>
              <p class="mt-1">{{ formatDate(student.enrolled_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Contact Information</h3>
            <!-- <UButton
              icon="i-heroicons-plus"
              label="Add Contact"
              color="gray"
              variant="ghost"
              @click="openAddContactModal"
            /> -->
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div v-for="contact in student.contacts" :key="contact.id" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-start justify-between">
                <div>
                  <h4 class="font-medium">{{ contact.contact_name }}</h4>
                  <p class="text-sm text-gray-500">{{ contact.relation }}</p>
                  <p class="text-sm mt-1">{{ contact.details }}</p>
                </div>
                <!-- <UDropdown :items="getContactActions(contact)">
                  <UButton
                    icon="i-heroicons-ellipsis-vertical"
                    color="gray"
                    variant="ghost"
                    size="xs"
                  />
                </UDropdown> -->
              </div>
            </div>
          </div>
        </div>

        <!-- Address Information -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Address Information</h3>
            <!-- <UButton
              icon="i-heroicons-plus"
              label="Add Address"
              color="gray"
              variant="ghost"
              @click="openAddAddressModal"
            /> -->
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div v-for="address in student.addresses" :key="address.id" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-start justify-between">
                <div>
                  <p>{{ address.street }}</p>
                  <p class="text-sm text-gray-500">{{ address.city }}, {{ address.postal_code }}</p>
                </div>
                <!-- <UDropdown :items="getAddressActions(address)">
                  <UButton
                    icon="i-heroicons-ellipsis-vertical"
                    color="gray"
                    variant="ghost"
                    size="xs"
                  />
                </UDropdown> -->
              </div>
            </div>
          </div>
        </div>

        <!-- Payment History -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold">Payment History</h3>
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid At</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="fee in student.monthly_fees" :key="fee.id">
                  <td class="px-6 py-4 whitespace-nowrap">{{ formatMonth(fee.month) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">Rs. {{ fee.amount }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <UBadge
                      :color="getPaymentStatusColor(fee.status)"
                      variant="soft"
                    >
                      {{ formatPaymentStatus(fee.status) }}
                    </UBadge>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ fee.paid_at ? formatDate(fee.paid_at) : '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="isLoading" class="flex justify-center items-center h-64">
      <USkeleton class="h-32 w-full max-w-lg" />
    </div>

    <div v-else class="flex justify-center items-center h-64">
      <p class="text-gray-500">Student not found</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StudentDetailedInfo, StudentContact, StudentAddress, StudentMonthlyFee } from '~/composables/useStudents'

definePageMeta({
  layout: "console"
})

const route = useRoute()
const router = useRouter()
const studentId = Number(route.params.id)
const { getStudentById, loading: isLoading } = useStudents()
const { showSuccess, showError } = useNotification()

// State
const student = ref<StudentDetailedInfo | null>(null)

// Helpers
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatMonth = (month: string) => {
  const [year, monthNum] = month.split('-')
  return new Date(Number(year), Number(monthNum) - 1).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  })
}

const formatGender = (gender: string) => {
  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase()
}

const getPaymentStatusColor = (status: StudentMonthlyFee['status']) => {
  switch (status) {
    case 'PAID':
      return 'green'
    case 'PENDING':
      return 'yellow'
    case 'FREE_PERIOD':
      return 'blue'
    default:
      return 'gray'
  }
}

const formatPaymentStatus = (status: StudentMonthlyFee['status']) => {
  switch (status) {
    case 'PAID':
      return 'Paid'
    case 'PENDING':
      return 'Pending'
    case 'FREE_PERIOD':
      return 'Free Period'
    default:
      return status
  }
}

const getContactActions = (contact: StudentContact) => {
  return [
    [
      {
        label: 'Edit',
        icon: 'i-heroicons-pencil-square',
        click: () => editContact(contact)
      },
      {
        label: 'Delete',
        icon: 'i-heroicons-trash',
        click: () => deleteContact(contact.id)
      }
    ]
  ]
}

const getAddressActions = (address: StudentAddress) => {
  return [
    [
      {
        label: 'Edit',
        icon: 'i-heroicons-pencil-square',
        click: () => editAddress(address)
      },
      {
        label: 'Delete',
        icon: 'i-heroicons-trash',
        click: () => deleteAddress(address.id)
      }
    ]
  ]
}

// Action handlers (to be implemented)
const openAddContactModal = () => {
  // TODO: Implement
}

const openAddAddressModal = () => {
  // TODO: Implement
}

const editContact = (contact: StudentContact) => {
  // TODO: Implement
}

const deleteContact = async (id: number) => {
  // TODO: Implement
}

const editAddress = (address: StudentAddress) => {
  // TODO: Implement
}

const deleteAddress = async (id: number) => {
  // TODO: Implement
}

// Initial data loading
const loadStudent = async () => {
  try {
    student.value = await getStudentById(studentId)
    if (!student.value) {
      showError('Student not found')
    }
  } catch (error) {
    console.error('Failed to load student:', error)
    showError('Failed to load student details')
  }
}

// Initialize data
onMounted(() => {
  loadStudent()
})
</script>
