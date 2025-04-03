<template>
  <USlideover
    :model-value="modelValue"
    @update:model-value="handleClose"
    :prevent-close="preventClose"
    :ui="{
      width: isTablet ? 'sm:max-w-lg' : 'sm:max-w-2xl',
      overlay: { background: 'bg-gray-950/50' },
      background: 'bg-white dark:bg-gray-900',
      padding: 'p-0',
      base: 'relative z-50 flex flex-col h-screen shadow-xl',
    }"
  >
    <!-- Header -->
    <div class="flex-none px-6 py-5 border-b border-gray-200 dark:border-gray-800">
      <div class="flex items-center justify-between">
        <div class="flex flex-col gap-1">
          <h3 class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
            Class Students
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ enrolledStudentsCount }} students enrolled in {{ classData?.name }}
          </p>
        </div>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark-20-solid"
          class="flex-none"
          @click="handleClose"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 px-6 py-5 overflow-y-auto">
      <!-- Actions -->
      <div class="mb-6 flex justify-between items-center">
        <UButton
          variant="soft"
          icon="i-heroicons-funnel"
          :color="showFilters ? 'primary' : 'gray'"
          @click="showFilters = !showFilters"
          label="Filters"
          :ui="{ rounded: 'rounded-full' }"
        />
        <UButton
          color="primary"
          label="Add Students"
          icon="i-heroicons-plus"
          @click="isAddStudentsOpen = true"
        />
      </div>

      <!-- Filters -->
      <div
        v-if="showFilters"
        class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg divide-y divide-gray-200 dark:divide-gray-700"
      >
        <div class="pb-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UInput
              v-model="search"
              icon="i-heroicons-magnifying-glass"
              placeholder="Search students..."
              class="w-full"
            />
            <USelectMenu
              v-model="filters.status"
              :options="[
                { label: 'All Status', value: undefined },
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ]"
              placeholder="Filter by status"
              value-attribute="value"
              icon="i-heroicons-funnel"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div class="space-y-2">
        <div class="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <div class="min-w-[800px]">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th
                      v-for="header in tableHeaders"
                      :key="header.key"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {{ header.label }}
                    </th>
                    <th class="px-6 py-3 text-right">
                      <span class="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="student in paginatedStudents" :key="student.student_id">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span class="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {{ student.student_name.charAt(0).toUpperCase() }}
                          </span>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900 dark:text-white">
                            {{ student.student_name }}
                          </div>
                          <div class="text-sm text-gray-500 dark:text-gray-400">
                            {{ student.student_email }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <UBadge :color="student.is_active ? 'green' : 'gray'" variant="soft">
                        {{ student.is_active ? "Active" : "Inactive" }}
                      </UBadge>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex flex-col gap-0.5">
                        <div class="flex items-center gap-1.5 text-sm">
                          <span class="text-gray-500 dark:text-gray-400">Joined:</span>
                          <span class="text-gray-900 dark:text-white">
                            {{ formatDate(student.joined_at) }}
                          </span>
                        </div>
                        <div
                          v-if="student.is_active === false"
                          class="flex items-center gap-1.5 text-sm"
                        >
                          <span class="text-gray-500 dark:text-gray-400">Left:</span>
                          <span class="text-gray-900 dark:text-white">
                            {{ student.active_until ? formatDate(student.active_until) : "-" }}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div class="flex justify-end items-center gap-2">
                        <UTooltip
                          :text="student.is_active ? 'Block student' : 'Reactivate student'"
                          :popper="{ arrow: true }"
                        >
                          <UButton
                            :color="student.is_active ? 'red' : 'green'"
                            variant="ghost"
                            size="xs"
                            :icon="student.is_active ? 'i-heroicons-lock-closed' : 'i-heroicons-lock-open'"
                            :loading="processingIds.includes(student.student_id)"
                            @click="handleToggleStudentStatus(student)"
                          />
                        </UTooltip>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredStudents.length === 0">
                    <td
                      :colspan="tableHeaders.length + 1"
                      class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      {{
                        search
                          ? "No students match your search"
                          : "No students enrolled yet"
                      }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex justify-between items-center pt-2">
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Showing
            {{ Math.min((page - 1) * pageSize + 1, filteredStudents.length) }}-{{
              Math.min(page * pageSize, filteredStudents.length)
            }}
            of {{ filteredStudents.length }} students
          </div>

          <UPagination
            v-model="page"
            :total="filteredStudents.length"
            :page-count="pageSize"
            size="sm"
            :ui="{
              wrapper: 'flex items-center gap-1',
              base: 'min-w-[32px] h-[32px] flex items-center justify-center text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors',
              rounded: 'rounded-lg',
              default: {
                inactive: 'hover:bg-gray-50 dark:hover:bg-gray-800',
                active: 'bg-primary-50 dark:bg-primary-500/20 text-primary-500 dark:text-primary-400 font-medium',
              },
            }"
          />
        </div>
      </div>
    </div>
  </USlideover>

  <!-- Add Students Modal -->
  <ConsoleClassesAddStudentsModal
    v-model="isAddStudentsOpen"
    :class-id="classData?.id"
    :grade="classData?.grade"
    @added="handleStudentAdded"
  />

  <!-- Status Change Confirmation Dialog -->
  <ConfirmationDialog
    v-model="showStatusChangeConfirmation"
    :title="confirmationTitle"
    :description="confirmationDescription"
    :type="selectedStudent?.is_active ? 'danger' : 'success'"
    :confirm-text="selectedStudent?.is_active ? 'Block' : 'Reactivate'"
    @confirm="confirmStatusChange"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { isMobileScreen } from "~/lib/utils";
import { useNotification } from "~/composables/useNotification";
import AddStudentsModal from "./AddStudentsModal.vue";
import ConfirmationDialog from "~/components/Common/ConfirmationDialog.vue";
import { useClassStudents, type ClassStudentDetails } from '~/composables/useClassStudents'

type Student = ClassStudentDetails

const { getStudentsByClassId, toggleStudentStatus, loading: isLoading } = useClassStudents()

const props = defineProps<{
  modelValue: boolean;
  classData?: {
    id: number;
    name: string;
    grade: number;
  };
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  updated: [];
}>();

// State
const isTablet = ref(isMobileScreen());
const showFilters = ref(false);
const search = ref("");
const page = ref(1);
const pageSize = 8;
const students = ref<Student[]>([]);
const processingIds = ref<number[]>([]);
const showStatusChangeConfirmation = ref(false);
const selectedStudent = ref<Student | null>(null);

// UI state
const isAddStudentsOpen = ref(false);
const filters = ref({
  status: undefined as "active" | "inactive" | undefined,
});

// Composables
const notification = useNotification();

// Load function
const loadStudents = async () => {
  if (!props.classData?.id) return
  
  try {
    const data = await getStudentsByClassId(props.classData.id)
    students.value = data
  } catch (error) {
    console.error('Error loading students:', error)
    notification.showError('Failed to load students')
  }
}

// Table configuration
const tableHeaders = [
  { key: "name", label: "Student" },
  { key: "status", label: "Status" },
  { key: "dates", label: "Class History" },
];

// Computed properties
const filteredStudents = computed(() => {
  return students.value.filter((student) => {
    const matchesSearch =
      !search.value ||
      student.student_name.toLowerCase().includes(search.value.toLowerCase()) ||
      student.student_email.toLowerCase().includes(search.value.toLowerCase());

    const matchesStatus =
      !filters.value.status || (student.is_active === (filters.value.status === 'active'));

    return matchesSearch && matchesStatus;
  });
});

const paginatedStudents = computed(() =>
  filteredStudents.value.slice((page.value - 1) * pageSize, page.value * pageSize)
);

const enrolledStudentsCount = computed(() => {
  return students.value.filter((s) => s.is_active).length;
});

const preventClose = computed(() => {
  return showStatusChangeConfirmation.value || isAddStudentsOpen.value;
});

// Confirmation dialog computed properties
const confirmationTitle = computed(() => {
  if (!selectedStudent.value) return "";
  return selectedStudent.value.is_active
    ? `Block ${selectedStudent.value.student_name}`
    : `Reactivate ${selectedStudent.value.student_name}`;
});

const confirmationDescription = computed(() => {
  if (!selectedStudent.value) return "";
  return selectedStudent.value.is_active
    ? `Are you sure you want to block ${selectedStudent.value.student_name} from this class? They will lose access to class materials and activities.`
    : `Are you sure you want to reactivate ${selectedStudent.value.student_name} in this class? They will regain access to class materials and activities.`;
});

// Watchers
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    loadStudents()
  }
})

// Action handlers
const handleAction = async (id: number, action: () => Promise<void>) => {
  processingIds.value.push(id);
  try {
    await action();
    emit("updated");
  } finally {
    processingIds.value = processingIds.value.filter((pid) => pid !== id);
  }
};

const handleToggleStudentStatus = (student: Student) => {
  selectedStudent.value = student;
  showStatusChangeConfirmation.value = true;
};

const confirmStatusChange = async () => {
  if (!selectedStudent.value || !props.classData?.id) return;
  
  await handleAction(selectedStudent.value.student_id, async () => {
    const newStatus = selectedStudent.value!.is_active ? 'inactive' : 'active'
    await toggleStudentStatus(
      selectedStudent.value!.student_id,
      props.classData!.id,
      !selectedStudent.value!.is_active
    )
    
    // Update local state
    const studentToUpdate = students.value.find(
      (s) => s.student_id === selectedStudent.value?.student_id
    )
    if (studentToUpdate) {
      studentToUpdate.is_active = !studentToUpdate.is_active
      studentToUpdate.active_until = !studentToUpdate.is_active ? new Date().toISOString() : null
      
      notification.showSuccess(
        `${studentToUpdate.student_name} has been ${newStatus === 'active' ? 'reactivated in' : 'blocked from'} the class`
      )
    }
  })

  showStatusChangeConfirmation.value = false
  selectedStudent.value = null;
};

const handleStudentAdded = async () => {
  // Refresh the students list to include the newly added student
  await loadStudents();
};

const handleClose = (value: boolean) => {
  if (preventClose.value) {
    return;
  }
  emit("update:modelValue", value);
};

// Date formatting utility
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return `Today at ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }

  if (date.getFullYear() === today.getFullYear()) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Mobile responsive handler
if (import.meta.client) {
  window.addEventListener("resize", () => {
    isTablet.value = window.innerWidth < 1024;
  });
}
</script>
