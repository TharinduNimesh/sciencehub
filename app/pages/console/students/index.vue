<template>
  <div class="h-full space-y-8">
    <!-- Students Section -->
    <div class="bg-white rounded-lg shadow-sm">
      <div class="p-6 lg:p-8 space-y-6">
        <!-- Header Section -->
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
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
        <ConsoleStudentsFilters
          v-show="showFilters"
          :filters="filters"
          @update:filters="updateFilters"
        />

        <!-- Table Section -->
        <div class="space-y-2">
          <div
            class="border border-gray-200 rounded-xl shadow-sm overflow-hidden"
          >
            <div class="overflow-x-auto">
              <ConsoleStudentsTable
                :rows="paginatedStudents"
                :loading="false"
                :processing-ids="processingIds"
                @deactivate="handleDeactivate"
                @delete="handleDelete"
              />
            </div>
          </div>

          <!-- Pagination -->
          <div class="flex justify-between items-center pt-2">
            <div class="text-sm text-gray-500">
              Showing
              {{
                Math.min((page - 1) * pageSize + 1, filteredStudents.length)
              }}-{{ Math.min(page * pageSize, filteredStudents.length) }} of
              {{ filteredStudents.length }} students
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
                  inactive: 'hover:bg-gray-50',
                  active: 'bg-primary-50 text-primary-500 font-medium',
                },
              }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Invitations Section -->
    <div class="bg-white rounded-lg shadow-sm">
      <div class="p-6 lg:p-8 space-y-6">
        <!-- Header Section -->
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h2 class="text-xl font-semibold">Student Invitations</h2>
            <p class="text-sm text-gray-500 mt-1">
              Manage pending and sent invitations
            </p>
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
        <ConsoleStudentsInvitationsFilters
          v-show="showInvitationFilters"
          :filters="invitationFilters"
          @update:filters="updateInvitationFilters"
        />

        <!-- Table Section -->
        <div class="space-y-2">
          <div
            class="border border-gray-200 rounded-xl shadow-sm overflow-hidden"
          >
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
              Showing
              {{
                Math.min(
                  (invitationPage - 1) * pageSize + 1,
                  filteredInvitations.length
                )
              }}-{{
                Math.min(invitationPage * pageSize, filteredInvitations.length)
              }}
              of {{ filteredInvitations.length }} invitations
            </div>

            <UPagination
              v-model="invitationPage"
              :total="filteredInvitations.length"
              :page-count="pageSize"
              size="sm"
              :ui="{
                wrapper: 'flex items-center gap-1',
                base: 'min-w-[32px] h-[32px] flex items-center justify-center text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors',
                rounded: 'rounded-lg',
                default: {
                  inactive: 'hover:bg-gray-50',
                  active: 'bg-primary-50 text-primary-500 font-medium',
                },
              }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Invite Modal -->
    <ConsoleStudentsInviteModal
      v-model="isInviteModalOpen"
      @invite="handleInvite"
    />
  </div>
</template>

<script setup lang="ts">
import { isMobileScreen } from "~/lib/utils";
import type { Invitation } from "~/types/supabase";

// Page meta
definePageMeta({ layout: "console" });

// Composables
const { getStudents, toggleStudentStatus } = useStudents();
const {
  createInvitation,
  fetchInvitations,
  updateInvitationStatus,
  deleteInvitation,
  resendInvitation,
} = useInvitations();
const supabase = useSupabaseClient();
const { showSuccess, showError } = useNotification();

// Reactive state
const isMobile = ref(isMobileScreen());
const showFilters = ref(false);
const showInvitationFilters = ref(false);
const isInviteModalOpen = ref(false);
const isLoading = ref(false);
const isReloadingStudents = ref(false);
const processingIds = ref<number[]>([]);
const page = ref(1);
const invitationPage = ref(1);
const pageSize = 8;

// Filter states
const filters = ref({
  search: "",
  grade: undefined,
  status: undefined,
});

const invitationFilters = ref({
  search: "",
  grade: undefined,
  status: undefined,
  dateRange: undefined,
});

// Mobile responsive handler
if (import.meta.client) {
  window.addEventListener("resize", () => (isMobile.value = isMobileScreen()));
}

// Students state
const students = ref<StudentDetails[]>([]);

// Invitations state
const invitations = ref<Invitation[]>([]);

// Computed properties
const filteredStudents = computed(() => {
  return students.value.filter((student) => {
    const matchesSearch =
      !filters.value.search ||
      student.name.toLowerCase().includes(filters.value.search.toLowerCase());
    const matchesGrade =
      filters.value.grade === undefined ||
      student.grade === filters.value.grade;
    const matchesStatus =
      !filters.value.status || 
      (filters.value.status === 'active' ? student.is_active : !student.is_active);
    return matchesSearch && matchesGrade && matchesStatus;
  });
});

const paginatedStudents = computed(() =>
  filteredStudents.value.slice(
    (page.value - 1) * pageSize,
    page.value * pageSize
  )
);

const filteredInvitations = computed(() => {
  return invitations.value.filter((invitation) => {
    const matchesSearch =
      !invitationFilters.value.search ||
      invitation.name
        .toLowerCase()
        .includes(invitationFilters.value.search.toLowerCase()) ||
      invitation.email
        .toLowerCase()
        .includes(invitationFilters.value.search.toLowerCase());
    const matchesGrade =
      invitationFilters.value.grade === undefined ||
      invitation.grade === invitationFilters.value.grade;
    const matchesStatus =
      !invitationFilters.value.status ||
      invitation.status === invitationFilters.value.status;

    if (!matchesSearch || !matchesGrade || !matchesStatus) return false;

    if (invitationFilters.value.dateRange) {
      const invitedDate = new Date(invitation.invitedAt).getTime();
      const now = new Date().getTime();
      const timeRanges = {
        "24h": 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000,
        "30d": 30 * 24 * 60 * 60 * 1000,
      };
      return now - invitedDate <= timeRanges[invitationFilters.value.dateRange];
    }
    return true;
  });
});

const paginatedInvitations = computed(() =>
  filteredInvitations.value.slice(
    (invitationPage.value - 1) * pageSize,
    invitationPage.value * pageSize
  )
);

// Action handlers
const handleAction = async (id: number, action: () => Promise<void>) => {
  processingIds.value.push(id);
  try {
    await action();
  } finally {
    processingIds.value = processingIds.value.filter((pid) => pid !== id);
  }
};

const handleInvite = async (formData: {
  name: string;
  email: string;
  grade: number | undefined;
  expiresIn: number;
}) => {
  if (!formData.grade) {
    showError("Please select a grade");
    return;
  }

  try {
    isLoading.value = true;
    const newInvitation = await createInvitation({
      ...formData,
      role: "STUDENT",
    });

    await loadInvitations();

    showSuccess(`Invitation sent to ${formData.email}`);
    isInviteModalOpen.value = false;
  } catch (error) {
    console.error("Failed to send invitation:", error);
    showError("Failed to send invitation. Please try again.");
  } finally {
    isLoading.value = false;
  }
};

// Data loading functions
const loadStudents = async () => {
  try {
    isReloadingStudents.value = true;
    students.value = await getStudents();
  } catch (error) {
    console.error("Failed to load students:", error);
    showError("Failed to load students. Please try again.");
  } finally {
    isReloadingStudents.value = false;
  }
};

const loadInvitations = async () => {
  try {
    isLoading.value = true;
    const fetchedInvitations = await fetchInvitations("STUDENT");
    invitations.value = fetchedInvitations.map((invitation) => ({
      ...invitation,
      invitedBy: invitation.invitedBy ?? "System",
    }));
  } catch (error) {
    console.error("Failed to fetch invitations:", error);
    showError("Failed to fetch invitations. Please try again.");
  } finally {
    isLoading.value = false;
  }
};

const reloadInvitations = () => loadInvitations();

const reloadStudents = () => loadStudents();

// Invitation handlers
const handleResendInvitation = async (invitation: Invitation) => {
  await handleAction(invitation.id, async () => {
    await resendInvitation(invitation.id);
    showSuccess(`Invitation resent to ${invitation.email}`);
  });
};

const handleRevokeInvitation = async (invitation: Invitation) => {
  await handleAction(invitation.id, async () => {
    await updateInvitationStatus(invitation.id);
    const invitationToUpdate = invitations.value.find(
      (i) => i.id === invitation.id
    );
    if (invitationToUpdate) {
      invitationToUpdate.status = "Revoked";
    }
    showSuccess(`Invitation for ${invitation.email} has been revoked`);
  });
};

const handleDeleteInvitation = async (invitation: Invitation) => {
  await handleAction(invitation.id, async () => {
    await deleteInvitation(invitation.id);
    invitations.value = invitations.value.filter((i) => i.id !== invitation.id);
    showSuccess(`Invitation for ${invitation.email} has been deleted`);
  });
};

// Student handlers
const handleDeactivate = async (student: StudentDetails) => {
  await handleAction(student.id, async () => {
    await toggleStudentStatus(student.id, !student.is_active);
    const studentToUpdate = students.value.find((s) => s.id === student.id);
    if (studentToUpdate) {
      studentToUpdate.is_active = !student.is_active;
    }
    showSuccess(`Student has been ${student.is_active ? 'deactivated' : 'activated'} successfully`);
  });
};

const handleDelete = async (student: { id: number }) => {
  await handleAction(student.id, async () => {
    students.value = students.value.filter((s) => s.id !== student.id);
    showSuccess("Student has been deleted successfully");
  });
};

// Filter handlers
const updateFilters = (newFilters: any) => {
  Object.assign(filters.value, newFilters);
};

const updateInvitationFilters = (newFilters: any) => {
  Object.assign(invitationFilters.value, newFilters);
};

// Initialize data
onMounted(() => {
  loadStudents();
  loadInvitations();
});
</script>
