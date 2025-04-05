<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

definePageMeta({
  layout: "console",
});

const route = useRoute();
const studentId = route.params.id;

// This would be replaced with an actual API call
const student = ref({
  id: studentId,
  name: "John Doe",
  email: "john.doe@example.com",
  grade: 10,
  enrollmentDate: "2022-09-01",
  status: "Active",
  profileImage: null,
});

// Add tab state similar to the classes page
const activeTab = ref(0);
const tabItems = [
  {
    key: "personal",
    label: "Personal",
    description: "View and edit student's personal information",
    icon: "i-heroicons-identification",
  },
  {
    key: "classes",
    label: "Classes",
    description: "Manage student's class enrollments",
    icon: "i-heroicons-academic-cap",
  },
  {
    key: "fees",
    label: "Fees",
    description: "View and manage payment information",
    icon: "i-heroicons-banknotes",
  },
] as const;

// Available grades for select options
const gradeOptions = [
  { label: 'Grade 6', value: '6' },
  { label: 'Grade 7', value: '7' },
  { label: 'Grade 8', value: '8' },
  { label: 'Grade 9', value: '9' },
  { label: 'Grade 10', value: '10' },
  { label: 'Grade 11', value: '11' },
  { label: 'Grade 12', value: '12' },
];

// Contact relation options
const relationOptions = [
  { label: 'Parent', value: 'Parent' },
  { label: 'Guardian', value: 'Guardian' },
  { label: 'Sibling', value: 'Sibling' },
  { label: 'Other', value: 'Other' },
];

// Class status options
const classStatusOptions = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
  { label: 'Completed', value: 'Completed' },
];

// Payment status options
const paymentStatusOptions = [
  { label: 'Paid', value: 'Paid', icon: 'i-heroicons-check-circle' },
  { label: 'Pending', value: 'Pending', icon: 'i-heroicons-clock' },
  { label: 'Overdue', value: 'Overdue', icon: 'i-heroicons-exclamation-circle' },
];

// Generate months for fee selection
const getMonthOptions = () => {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const currentYear = new Date().getFullYear();
  const options = [];
  
  // Include previous year
  for (const month of months) {
    options.push({ 
      label: `${currentYear-1}-${month}`, 
      value: `${currentYear-1}-${month}` 
    });
  }
  
  // Current year
  for (const month of months) {
    options.push({ 
      label: `${currentYear}-${month}`, 
      value: `${currentYear}-${month}` 
    });
  }
  
  return options;
};

const monthOptions = getMonthOptions();

// Fee table columns configuration
const feeColumns = [
  { key: 'month', label: 'Month' },
  { key: 'status', label: 'Status' },
  { key: 'paidAt', label: 'Paid Date' },
  { key: 'actions', label: 'Actions' }
];

const state = reactive({
  // Personal
  dateOfBirth: "2005-05-15",
  gender: "Male",
  currentGrade: "10",
  contacts: [
    { relation: "Parent", contactName: "Jane Doe", mobile: "+1234567890" },
  ],
  addresses: [
    { address: "123 Education St, Learning City, LC 12345", primary: true },
  ],

  // Classes
  classes: [
    {
      className: "Advanced Mathematics",
      joinedAt: "2022-09-15",
      leftAt: "",
      status: "Active",
    },
  ],

  // Fees
  fees: [
    { month: "2023-JAN", status: "Paid", paidAt: "2023-01-05", amount: 5000 },
    { month: "2023-FEB", status: "Paid", paidAt: "2023-02-03", amount: 5000 },
    { month: "2023-MAR", status: "Pending", paidAt: "", amount: 5000 },
  ],
});

const isLoading = ref(false);
// Initialize currentTab with the first tab's key (personal)
const currentTab = ref("personal");

// Get total fees paid and pending amounts
const totalFeesAmount = computed(() => {
  return state.fees.reduce((sum, fee) => sum + fee.amount, 0);
});

const paidFeesAmount = computed(() => {
  return state.fees
    .filter(fee => fee.status === 'Paid')
    .reduce((sum, fee) => sum + fee.amount, 0);
});

const pendingFeesAmount = computed(() => {
  return totalFeesAmount.value - paidFeesAmount.value;
});

// Contact management
const addContact = () => {
  state.contacts.push({ relation: "", contactName: "", mobile: "" });
};

const removeContact = (index: number) => {
  state.contacts.splice(index, 1);
};

// Address management
const addAddress = () => {
  state.addresses.push({ address: "", primary: false });
};

const removeAddress = (index: number) => {
  state.addresses.splice(index, 1);
};

const setPrimaryAddress = (index: number) => {
  state.addresses.forEach((address, i) => {
    address.primary = i === index;
  });
};

// Class management
const addClass = () => {
  state.classes.push({ className: "", joinedAt: "", leftAt: "", status: "Active" });
};

const removeClass = (index: number) => {
  state.classes.splice(index, 1);
};

// Fee management
const addFee = () => {
  const today = new Date();
  const year = today.getFullYear();
  const monthIndex = today.getMonth();
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  state.fees.push({ 
    month: `${year}-${months[monthIndex]}`, 
    status: "Pending", 
    paidAt: "", 
    amount: 5000 
  });
};

const removeFee = (index: number) => {
  state.fees.splice(index, 1);
};

// Mark fee as paid
const markAsPaid = (index: number) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  state.fees[index].status = "Paid";
  state.fees[index].paidAt = `${year}-${month}-${day}`;
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

// Save changes handlers
const savePersonalInfo = () => {
  isLoading.value = true;
  // Simulate API call
  setTimeout(() => {
    isLoading.value = false;
    useNotification().showSuccess("Personal information saved successfully");
  }, 800);
};

const saveClasses = () => {
  isLoading.value = true;
  // Simulate API call
  setTimeout(() => {
    isLoading.value = false;
    useNotification().showSuccess("Class information saved successfully");
  }, 800);
};

const saveFees = () => {
  isLoading.value = true;
  // Simulate API call
  setTimeout(() => {
    isLoading.value = false;
    useNotification().showSuccess("Fee information saved successfully");
  }, 800);
};

// Get current tab key
const currentTabKey = computed(() => tabItems[activeTab.value]?.key ?? "personal");

// Watch for tab changes to reset state or load data as needed
watch(
  () => activeTab.value,
  (newTab) => {
    // You could add logic here to load data when switching tabs
    console.log(`Switched to tab: ${tabItems[newTab].label}`);
  }
);
</script>

<template>
  <div class="h-full space-y-6">
    <!-- Top Navigation Bar -->
    <div
      class="flex justify-between items-center bg-white rounded-lg shadow-sm p-4"
    >
      <div class="flex items-center gap-3">
        <UButton
          to="/console/students"
          color="gray"
          variant="ghost"
          icon="i-heroicons-arrow-left"
          class="mr-2"
        />
        <UAvatar :text="student.name.charAt(0)" size="lg" color="primary" :src="student.profileImage" />
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-bold">{{ student.name }}</h1>
            <UBadge
              :color="student.status === 'Active' ? 'green' : 'gray'"
              variant="soft"
              class="text-xs py-0.5"
            >
              {{ student.status }}
            </UBadge>
          </div>
          <div class="flex items-center text-sm text-gray-500 gap-2 mt-0.5">
            <UIcon name="i-heroicons-envelope" class="w-4 h-4" />
            <div>{{ student.email }}</div>
            <div class="h-1 w-1 rounded-full bg-gray-300"></div>
            <UIcon name="i-heroicons-academic-cap" class="w-4 h-4" />
            <div>Grade {{ student.grade }}</div>
            <div class="h-1 w-1 rounded-full bg-gray-300"></div>
            <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
            <div>
              Since {{ new Date(student.enrollmentDate).toLocaleDateString() }}
            </div>
          </div>
        </div>
      </div>

      <!-- <div class="flex gap-2">
        <UButton
          icon="i-heroicons-envelope"
          label="Contact"
          color="gray"
          variant="soft"
        />
        <UButton
          icon="i-heroicons-pencil-square"
          label="Edit Profile"
          color="primary"
          variant="soft"
        />
      </div> -->
    </div>

    <!-- Student Stats Summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UCard class="shadow-sm">
        <template #header>
          <div class="flex items-center justify-between px-4 py-3">
            <h3 class="text-base font-medium text-gray-700">Class Status</h3>
            <UIcon
              name="i-heroicons-academic-cap"
              class="text-primary-500 w-5 h-5"
            />
          </div>
        </template>
        <div class="flex flex-col items-center py-2">
          <div class="text-3xl font-bold text-primary-600">
            {{ state.classes.filter((c) => c.status === "Active").length }}
          </div>
          <div class="text-sm text-gray-500">Active Classes</div>
        </div>
      </UCard>

      <UCard class="shadow-sm">
        <template #header>
          <div class="flex items-center justify-between px-4 py-3">
            <h3 class="text-base font-medium text-gray-700">Payment Status</h3>
            <UIcon
              name="i-heroicons-banknotes"
              class="text-primary-500 w-5 h-5"
            />
          </div>
        </template>
        <div class="flex flex-col items-center py-2">
          <div
            class="text-3xl font-bold"
            :class="
              state.fees.some((f) => f.status === 'Pending')
                ? 'text-amber-600'
                : 'text-green-600'
            "
          >
            {{ state.fees.filter((f) => f.status === "Paid").length }}/{{
              state.fees.length
            }}
          </div>
          <div class="text-sm text-gray-500">Payments Completed</div>
        </div>
        <template #footer v-if="pendingFeesAmount > 0">
          <div class="text-center text-sm text-amber-600 font-medium px-4 py-2">
            {{ formatCurrency(pendingFeesAmount) }} pending payment
          </div>
        </template>
      </UCard>

      <UCard class="shadow-sm">
        <template #header>
          <div class="flex items-center justify-between px-4 py-3">
            <h3 class="text-base font-medium text-gray-700">Contact Info</h3>
            <UIcon name="i-heroicons-phone" class="text-primary-500 w-5 h-5" />
          </div>
        </template>
        <div class="flex flex-col items-center py-2">
          <div class="text-3xl font-bold text-primary-600">
            {{ state.contacts.length }}
          </div>
          <div class="text-sm text-gray-500">Emergency Contacts</div>
        </div>
      </UCard>
    </div>

    <!-- Tabs Section - Updated to match classes page style -->
    <div class="bg-white rounded-lg shadow-sm">
      <div class="p-6">
        <!-- Updated tabs using the tabItems array and activeTab -->
        <UTabs
          v-model="activeTab"
          :items="tabItems"
          variant="pills"
          class="gap-4"
          :ui="{
            list: {
              background: 'bg-gray-50',
              padding: 'p-1',
              rounded: 'rounded-xl',
              width: 'w-full',
              height: 'h-full',
              base: 'mb-6',
            },
            wrapper: 'flex-grow mb-6',
            container: 'w-full',
            tab: {
              base: 'relative flex-1 flex items-center justify-center focus:outline-none transition duration-200',
              active: 'text-primary-500 font-medium',
            },
          }"
        >
          <!-- Template for each tab item -->
          <template #item="{ item }">
            <div v-if="item.key === 'personal'" class="space-y-6">
              <UCard class="bg-white/50 shadow-none border-0">
                <template #header>
                  <div class="flex justify-between items-center mb-4">
                    <div>
                      <h2 class="text-lg font-semibold">Personal Information</h2>
                      <p class="text-sm text-gray-500">
                        Student's basic information and contacts
                      </p>
                    </div>
                  </div>
                </template>

                <UForm :state="state" class="space-y-6">
                  <!-- Basic Info Section -->
                  <div class="space-y-4">
                    <h3 class="font-medium text-gray-900 border-b pb-2">
                      <div class="flex items-center gap-2">
                        <UIcon name="i-heroicons-identification" class="w-5 h-5" />
                        Basic Information
                      </div>
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <UFormField label="Date of Birth" name="dateOfBirth">
                        <UInput
                          v-model="state.dateOfBirth"
                          type="date"
                          class="w-full"
                          placeholder="Select date of birth"
                          icon="i-heroicons-calendar"
                        />
                      </UFormField>

                      <UFormField label="Gender" name="gender">
                        <USelect
                          v-model="state.gender"
                          :options="['Male', 'Female', 'Other']"
                          class="w-full"
                          placeholder="Select gender"
                          icon="i-heroicons-user"
                        />
                      </UFormField>

                      <UFormField label="Current Grade" name="currentGrade">
                        <USelect
                          v-model="state.currentGrade"
                          :options="gradeOptions"
                          class="w-full"
                          placeholder="Select grade"
                          icon="i-heroicons-academic-cap"
                        />
                      </UFormField>
                    </div>
                  </div>

                  <!-- Contact Details Section -->
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <h3 class="font-medium text-gray-900 border-b pb-2">
                        <div class="flex items-center gap-2">
                          <UIcon name="i-heroicons-phone" class="w-5 h-5" />
                          Contact Details
                        </div>
                      </h3>
                      <UButton
                        @click="addContact"
                        variant="soft"
                        size="sm"
                        color="primary"
                        icon="i-heroicons-plus"
                        label="Add Contact"
                      />
                    </div>

                    <div
                      v-if="state.contacts.length === 0"
                      class="text-center py-6 bg-gray-50 rounded-xl"
                    >
                      <UIcon
                        name="i-heroicons-user-plus"
                        class="mx-auto h-12 w-12 text-gray-400"
                      />
                      <h3 class="mt-2 text-sm font-semibold text-gray-900">
                        No contacts
                      </h3>
                      <p class="mt-1 text-sm text-gray-500">
                        Get started by adding a new contact.
                      </p>
                      <div class="mt-6">
                        <UButton
                          @click="addContact"
                          label="Add contact"
                          color="primary"
                        />
                      </div>
                    </div>

                    <UCard
                      v-for="(contact, index) in state.contacts"
                      :key="index"
                      class="border border-gray-200 shadow-none mb-3"
                    >
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <UFormField
                          label="Relation"
                          :name="`contacts[${index}].relation`"
                        >
                          <USelect
                            v-model="contact.relation"
                            :options="relationOptions"
                            class="w-full"
                            placeholder="Select relation"
                            icon="i-heroicons-user-group"
                          />
                        </UFormField>
                        <UFormField
                          label="Contact Name"
                          :name="`contacts[${index}].contactName`"
                        >
                          <UInput 
                            v-model="contact.contactName" 
                            class="w-full" 
                            placeholder="Enter contact name"
                            icon="i-heroicons-user"
                          />
                        </UFormField>
                        <UFormField
                          label="Mobile"
                          :name="`contacts[${index}].mobile`"
                        >
                          <UInput 
                            v-model="contact.mobile" 
                            class="w-full" 
                            placeholder="Enter mobile number"
                            icon="i-heroicons-device-phone-mobile"
                          />
                        </UFormField>
                      </div>
                      <template #footer>
                        <div class="flex justify-end">
                          <UButton
                            @click="removeContact(index)"
                            color="red"
                            variant="ghost"
                            size="sm"
                            icon="i-heroicons-trash"
                            label="Remove"
                          />
                        </div>
                      </template>
                    </UCard>
                  </div>

                  <!-- Addresses Section -->
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <h3 class="font-medium text-gray-900 border-b pb-2">
                        <div class="flex items-center gap-2">
                          <UIcon name="i-heroicons-home" class="w-5 h-5" />
                          Addresses
                        </div>
                      </h3>
                      <UButton
                        @click="addAddress"
                        variant="soft"
                        size="sm"
                        color="primary"
                        icon="i-heroicons-plus"
                        label="Add Address"
                      />
                    </div>

                    <div
                      v-if="state.addresses.length === 0"
                      class="text-center py-6 bg-gray-50 rounded-xl"
                    >
                      <UIcon
                        name="i-heroicons-home"
                        class="mx-auto h-12 w-12 text-gray-400"
                      />
                      <h3 class="mt-2 text-sm font-semibold text-gray-900">
                        No addresses
                      </h3>
                      <p class="mt-1 text-sm text-gray-500">
                        Add a residential or correspondence address.
                      </p>
                      <div class="mt-6">
                        <UButton
                          @click="addAddress"
                          label="Add address"
                          color="primary"
                        />
                      </div>
                    </div>

                    <UCard
                      v-for="(address, index) in state.addresses"
                      :key="index"
                      class="border border-gray-200 shadow-none mb-3"
                      :ui="{
                        body: {
                          padding: address.primary ? 'p-4 bg-blue-50/50' : 'p-4',
                        },
                      }"
                    >
                      <UBadge
                        v-if="address.primary"
                        color="blue"
                        variant="soft"
                        class="mb-2"
                      >
                        <template #leading>
                          <UIcon name="i-heroicons-star" />
                        </template>
                        Primary Address
                      </UBadge>
                      <UFormField
                        label="Address"
                        :name="`addresses[${index}].address`"
                      >
                        <UTextarea
                          v-model="address.address"
                          class="w-full"
                          rows="2"
                          placeholder="Enter full address"
                          icon="i-heroicons-home"
                        />
                      </UFormField>
                      <template #footer>
                        <div class="flex items-center justify-between">
                          <div v-if="!address.primary">
                            <UButton
                              @click="setPrimaryAddress(index)"
                              color="blue"
                              variant="soft"
                              size="sm"
                              icon="i-heroicons-star"
                              label="Set as Primary"
                            />
                          </div>
                          <UButton
                            @click="removeAddress(index)"
                            color="red"
                            variant="ghost"
                            size="sm"
                            icon="i-heroicons-trash"
                            label="Remove"
                          />
                        </div>
                      </template>
                    </UCard>
                  </div>

                  <div class="pt-4 border-t">
                    <UButton
                      @click="savePersonalInfo"
                      color="primary"
                      block
                      :loading="isLoading"
                      :disabled="isLoading"
                      label="Save Changes"
                      icon="i-heroicons-check-circle"
                    />
                  </div>
                </UForm>
              </UCard>
            </div>
            
            <div v-else-if="item.key === 'classes'" class="space-y-6">
              <UCard class="bg-white/50 shadow-none border-0">
                <template #header>
                  <div class="flex justify-between items-center mb-4">
                    <div>
                      <h2 class="text-lg font-semibold">Class Enrollments</h2>
                      <p class="text-sm text-gray-500">
                        Manage student's classes and courses
                      </p>
                    </div>
                    <UButton
                      @click="addClass"
                      variant="soft"
                      color="primary"
                      icon="i-heroicons-plus"
                      label="Add Class"
                    />
                  </div>
                </template>

                <UForm :state="state" class="space-y-6">
                  <div
                    v-if="state.classes.length === 0"
                    class="text-center py-10 bg-gray-50 rounded-xl"
                  >
                    <UIcon
                      name="i-heroicons-academic-cap"
                      class="mx-auto h-12 w-12 text-gray-400"
                    />
                    <h3 class="mt-2 text-sm font-semibold text-gray-900">
                      No classes enrolled
                    </h3>
                    <p class="mt-1 text-sm text-gray-500">
                      Add classes that this student is enrolled in.
                    </p>
                    <div class="mt-6">
                      <UButton
                        @click="addClass"
                        label="Add class"
                        color="primary"
                      />
                    </div>
                  </div>

                  <UCard
                    v-for="(classItem, index) in state.classes"
                    :key="index"
                    class="mb-4 border border-gray-200 shadow-none"
                    :ui="{
                      body: {
                        padding:
                          classItem.status === 'Active'
                            ? 'p-4 bg-green-50/50'
                            : classItem.status === 'Completed'
                            ? 'p-4 bg-blue-50/50'
                            : 'p-4',
                      },
                    }"
                  >
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <UFormField
                        label="Class Name"
                        :name="`classes[${index}].className`"
                      >
                        <UInput 
                          v-model="classItem.className" 
                          class="w-full" 
                          placeholder="Enter class name"
                          icon="i-heroicons-academic-cap"
                        />
                      </UFormField>
                      <UFormField
                        label="Status"
                        :name="`classes[${index}].status`"
                      >
                        <USelect
                          v-model="classItem.status"
                          :options="classStatusOptions"
                          class="w-full"
                          placeholder="Select status"
                          icon="i-heroicons-tag"
                        />
                      </UFormField>
                      <UFormField
                        label="Joined At"
                        :name="`classes[${index}].joinedAt`"
                      >
                        <UInput
                          v-model="classItem.joinedAt"
                          type="date"
                          class="w-full"
                          placeholder="Select join date"
                          icon="i-heroicons-calendar-days"
                        />
                      </UFormField>
                      <UFormField
                        label="Left At"
                        :name="`classes[${index}].leftAt`"
                      >
                        <UInput
                          v-model="classItem.leftAt"
                          type="date"
                          class="w-full"
                          placeholder="Select left date"
                          icon="i-heroicons-calendar-days"
                          :disabled="classItem.status === 'Active'"
                        />
                      </UFormField>
                    </div>

                    <template #footer>
                      <div class="flex justify-end">
                        <UButton
                          @click="removeClass(index)"
                          color="red"
                          variant="ghost"
                          size="sm"
                          icon="i-heroicons-trash"
                          label="Remove"
                        />
                      </div>
                    </template>
                  </UCard>

                  <div class="pt-4 border-t">
                    <UButton
                      @click="saveClasses"
                      color="primary"
                      block
                      :loading="isLoading"
                      :disabled="isLoading"
                      label="Save Changes"
                      icon="i-heroicons-check-circle"
                    />
                  </div>
                </UForm>
              </UCard>
            </div>
            
            <div v-else-if="item.key === 'fees'" class="space-y-6">
              <UCard class="bg-white/50 shadow-none border-0">
                <template #header>
                  <div class="flex justify-between items-center mb-4">
                    <div>
                      <h2 class="text-lg font-semibold">Payment History</h2>
                      <p class="text-sm text-gray-500">
                        View and manage student's fee payments
                      </p>
                    </div>
                    <UButton
                      @click="addFee"
                      variant="soft"
                      color="primary"
                      icon="i-heroicons-plus"
                      label="Add Payment"
                    />
                  </div>
                </template>

                <UForm :state="state" class="space-y-6">
                  <div
                    v-if="state.fees.length === 0"
                    class="text-center py-10 bg-gray-50 rounded-xl"
                  >
                    <UIcon
                      name="i-heroicons-banknotes"
                      class="mx-auto h-12 w-12 text-gray-400"
                    />
                    <h3 class="mt-2 text-sm font-semibold text-gray-900">
                      No payment records
                    </h3>
                    <p class="mt-1 text-sm text-gray-500">
                      Start tracking payments by adding a record.
                    </p>
                    <div class="mt-6">
                      <UButton
                        @click="addFee"
                        label="Add payment"
                        color="primary"
                      />
                    </div>
                  </div>

                  <div class="space-y-4">
                    <UTable
                      :rows="state.fees"
                      :columns="feeColumns"
                      class="border border-gray-200 rounded-xl shadow-sm"
                    >
                      <template #month-data="{ row }">
                        <div class="flex items-center gap-2">
                          <UIcon name="i-heroicons-calendar" class="w-4 h-4 text-gray-500" />
                          <span>{{ row.month }}</span>
                        </div>
                      </template>

                      <template #status-data="{ row }">
                        <UBadge
                          :color="
                            row.status === 'Paid'
                              ? 'green'
                              : row.status === 'Pending'
                              ? 'amber'
                              : 'red'
                          "
                          variant="soft"
                        >
                          <template #leading>
                            <UIcon
                              :name="
                                row.status === 'Paid'
                                  ? 'i-heroicons-check-circle'
                                  : row.status === 'Pending'
                                  ? 'i-heroicons-clock'
                                  : 'i-heroicons-exclamation-circle'
                              "
                            />
                          </template>
                          {{ row.status }}
                        </UBadge>
                      </template>

                      <template #paidAt-data="{ row }">
                        <div v-if="row.paidAt" class="flex items-center gap-2">
                          <UIcon name="i-heroicons-check" class="w-4 h-4 text-green-500" />
                          {{ new Date(row.paidAt).toLocaleDateString() }}
                        </div>
                        <span v-else class="text-gray-400">Not paid yet</span>
                      </template>

                      <template #actions-data="{ row, index }">
                        <div class="flex justify-end gap-2">
                          <UButton
                            v-if="row.status !== 'Paid'"
                            @click="markAsPaid(index)"
                            color="green"
                            variant="soft"
                            size="xs"
                            icon="i-heroicons-check"
                            label="Mark as Paid"
                          />
                          <UButton
                            @click="removeFee(index)"
                            color="red"
                            variant="ghost"
                            size="xs"
                            icon="i-heroicons-trash"
                          />
                        </div>
                      </template>
                    </UTable>

                    <div class="bg-gray-50 rounded-xl p-4">
                      <div class="flex justify-between font-medium">
                        <div class="flex items-center gap-2">
                          <UIcon name="i-heroicons-calculator" class="w-4 h-4" />
                          Total Fees
                        </div>
                        <div>{{ formatCurrency(totalFeesAmount) }}</div>
                      </div>
                      <div class="flex justify-between mt-2">
                        <div class="flex items-center gap-2">
                          <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-green-500" />
                          Paid
                        </div>
                        <div class="text-green-600">{{ formatCurrency(paidFeesAmount) }}</div>
                      </div>
                      <div class="flex justify-between mt-2">
                        <div class="flex items-center gap-2">
                          <UIcon name="i-heroicons-clock" class="w-4 h-4 text-amber-500" />
                          Pending
                        </div>
                        <div class="text-amber-600">{{ formatCurrency(pendingFeesAmount) }}</div>
                      </div>
                      <UDivider class="my-3" />
                      <div class="flex justify-between font-medium">
                        <div class="flex items-center gap-2">
                          <UIcon name="i-heroicons-banknotes" class="w-4 h-4" />
                          Payment Status
                        </div>
                        <div
                          :class="
                            state.fees.some((f) => f.status === 'Pending')
                              ? 'text-amber-600'
                              : 'text-green-600'
                          "
                        >
                          {{
                            state.fees.some((f) => f.status === "Pending")
                              ? "Payments Pending"
                              : "All Payments Complete"
                          }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="state.fees.length > 0" class="pt-4 border-t">
                    <UButton
                      @click="saveFees"
                      color="primary"
                      block
                      :loading="isLoading"
                      :disabled="isLoading"
                      label="Save Changes"
                      icon="i-heroicons-check-circle"
                    />
                  </div>
                </UForm>
              </UCard>
            </div>
          </template>
        </UTabs>
      </div>
    </div>
  </div>
</template>
