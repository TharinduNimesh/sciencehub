<template>
  <div class="h-full space-y-8">
    <!-- Moderators Section -->
    <div class="bg-white rounded-lg shadow-sm p-6 lg:p-8 space-y-6">
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h2 class="text-xl font-semibold">Classes</h2>
          <p class="text-sm text-gray-500 mt-1">
            Manage your classes and schedules
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div class="flex gap-2 w-full sm:w-auto">
            <UButton
              icon="i-heroicons-arrow-path"
              :ui="{ rounded: 'rounded-full' }"
              :loading="isRefreshing"
              color="gray"
              variant="ghost"
              @click="refreshData"
              square
            />
            <div class="flex-1 sm:flex-initial">
              <UButton
                icon="i-heroicons-funnel"
                :ui="{ rounded: 'rounded-full' }"
                :color="showFilters ? 'primary' : 'gray'"
                :variant="showFilters ? 'soft' : 'ghost'"
                :block="isMobile"
                @click="showFilters = !showFilters"
                label="Filters"
              />
            </div>
          </div>
          <UButton
            label="Create Class"
            color="primary"
            icon="i-heroicons-plus"
            :ui="{ rounded: 'rounded-full' }"
            :block="isMobile"
            @click="isCreateModalOpen = true"
          />
        </div>
      </div>

      <!-- Filters -->
      <ConsoleClassesFilters
        v-show="showFilters"
        :filters="filters"
        @update:filters="updateFilters"
        class="transition-all duration-200 ease-in-out"
      />

      <!-- Tabs -->
      <UTabs
        v-model="activeTab"
        :items="tabItems"
        :ui="{
          wrapper: 'mt-6',
          list: {
            base: 'mb-6',
          },
        }"
      >
        <template #item="{ item }">
          <div
            :class="[
              item.key === 'timetable'
                ? 'space-y-4'
                : ['grid gap-6', gridClass],
            ]"
          >
            <!-- Loading Skeletons -->
            <template v-if="isRefreshing">
              <div
                v-for="i in 6"
                :key="i"
                class="bg-white rounded-xl border border-gray-200 shadow-sm"
              >
                <div class="p-6 space-y-4">
                  <!-- Header Skeleton -->
                  <div class="flex justify-between items-start gap-4">
                    <div class="space-y-2 flex-1">
                      <USkeleton class="h-6 w-2/3" />
                      <USkeleton class="h-4 w-full" />
                    </div>
                    <USkeleton class="h-6 w-16" />
                  </div>

                  <!-- Method & Schedule Skeleton -->
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <USkeleton class="h-6 w-32" />
                      <USkeleton class="h-6 w-24" />
                    </div>
                    <div class="flex items-center justify-between">
                      <USkeleton class="h-5 w-36" />
                      <USkeleton class="h-5 w-32" />
                    </div>
                  </div>

                  <!-- Tags Skeleton -->
                  <div class="flex gap-2">
                    <USkeleton v-for="j in 3" :key="j" class="h-5 w-16" />
                  </div>

                  <!-- Actions Skeleton -->
                  <div class="flex items-center justify-between pt-2">
                    <USkeleton class="h-4 w-32" />
                    <div class="flex items-center gap-2">
                      <USkeleton
                        v-for="j in 4"
                        :key="j"
                        class="h-8 w-8 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <template v-else-if="item.key === 'timetable'">
              <!-- Timetable view -->
              <ConsoleClassesTimeTableCard
                v-for="entry in paginatedTimetableEntries"
                :key="entry.id"
                :entry="entry"
                @cancel="handleCancelSession(entry)"
                @reschedule="handleRescheduleSession(entry)"
                @refresh="refreshData"
              />
            </template>

            <template v-else>
              <!-- Summary view -->
              <ConsoleClassesClassCard
                v-for="classItem in paginatedClasses"
                :key="classItem.id"
                :class-item="classItem"
                :view-mode="item.key"
                @view-students="handleViewStudents"
                @edit="handleEditClass"
                @delete="handleDeleteClass"
                @cancel-week="handleCancelWeek"
              />
            </template>
          </div>
        </template>
      </UTabs>

      <!-- Pagination -->
      <div class="flex justify-between items-center pt-4">
        <div class="text-sm text-gray-500">
          <template v-if="currentViewMode === 'timetable'">
            Showing
            {{
              Math.min(
                (page - 1) * pageSize + 1,
                filteredTimetableEntries.length
              )
            }}-{{
              Math.min(page * pageSize, filteredTimetableEntries.length)
            }}
            of {{ filteredTimetableEntries.length }} sessions
          </template>
          <template v-else>
            Showing
            {{ Math.min((page - 1) * pageSize + 1, filteredClasses.length) }}-{{
              Math.min(page * pageSize, filteredClasses.length)
            }}
            of {{ filteredClasses.length }} classes
          </template>
        </div>

        <UPagination
          v-model="page"
          :total="
            currentViewMode === 'timetable'
              ? filteredTimetableEntries.length
              : filteredClasses.length
          "
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

    <!-- Create Class Modal -->
    <ConsoleClassesCreateModal
      v-model="isCreateModalOpen"
      @created="refreshData"
    />

    <!-- Edit Class Modal -->
    <ConsoleClassesEditModal
      v-model="isEditModalOpen"
      :class-data="selectedClass"
      @updated="refreshData"
    />

    <!-- Restore Class Confirmation -->
    <ConfirmationDialog
      v-model="isRestoreDialogOpen"
      title="Restore Class Session"
      :description="'This will remove the cancellation and restore the class to its original schedule. If you need to reschedule to a different date, please create a new single session class instead.'"
      type="info"
      confirm-text="Yes, Restore Class"
      cancel-text="Cancel"
      @confirm="handleRestoreConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { isMobileScreen } from "~/lib/utils";
import { useSidebarStore } from "~/stores/sidebar";
import { useNotification } from "~/composables/useNotification";
import {
  useClasses,
  type Class,
  type ClassMethod,
  type TimeTableEntry,
} from "~/composables/useClasses";
import { useSupabaseClient } from "#imports";
import type { Database } from "~/types/supabase";
import ConfirmationDialog from "~/components/Common/ConfirmationDialog.vue";

// Page meta
definePageMeta({
  layout: "console",
});

// Store & Composables
const sidebarStore = useSidebarStore();
const notification = useNotification();
const {
  getClasses,
  getTimeTable,
  endClass,
  loading: isRefreshing,
} = useClasses();
const supabase = useSupabaseClient<Database>();

// State
const isMobile = ref(isMobileScreen());
const showFilters = ref(false);
const isCreateModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isRestoreDialogOpen = ref(false);
const selectedClass = ref<Class | undefined>();
const selectedSession = ref<TimeTableEntry>();
const page = ref(1);
const pageSize = 6;
const classes = ref<Class[]>([]);
const timetableEntries = ref<TimeTableEntry[]>([]);

// Filter state
const filters = ref({
  search: "",
  method: undefined as ClassMethod | undefined,
  tag: undefined,
  status: undefined,
});

// Tab state
const activeTab = ref(0);
const tabItems = [
  {
    key: "timetable",
    label: "Time Table",
    description: "View upcoming classes for the current month",
  },
  {
    key: "summary",
    label: "Summary",
    description: "View and manage all your classes",
  },
];

// Computed to get current view mode
const currentViewMode = computed(
  () => tabItems[activeTab.value]?.key ?? "timetable"
);

// Watch for tab changes
watch(
  () => activeTab.value,
  (newTab) => {
    // Reset page when switching views
    if (currentViewMode.value === "summary") {
      page.value = 1;
    }
  }
);

// Computed properties
const filteredClasses = computed(() => {
  return classes.value.filter((classItem) => {
    const matchesSearch =
      !filters.value.search ||
      classItem.name
        .toLowerCase()
        .includes(filters.value.search.toLowerCase()) ||
      classItem.description
        ?.toLowerCase()
        .includes(filters.value.search.toLowerCase());

    const matchesMethod =
      filters.value.method === undefined ||
      classItem.method === filters.value.method;

    const matchesTag =
      filters.value.tag === undefined ||
      classItem.tags.includes(filters.value.tag);

    const matchesStatus =
      filters.value.status === undefined ||
      classItem.is_active === filters.value.status;

    return matchesSearch && matchesMethod && matchesTag && matchesStatus;
  });
});

const paginatedClasses = computed(() =>
  filteredClasses.value.slice(
    (page.value - 1) * pageSize,
    page.value * pageSize
  )
);

const gridClass = computed(() => {
  if (!sidebarStore.isOpen) {
    return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";
  }
  return "grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3";
});

// Get current month's classes
const currentMonthClasses = computed(() => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return filteredClasses.value
    .filter((classItem) => {
      if (classItem.method.endsWith("RecurringSeries")) {
        // For recurring classes, calculate next occurrence
        const nextDate = getNextClassDate(classItem);
        if (!nextDate) return false;

        const classDate = new Date(nextDate);
        return (
          classDate.getMonth() === currentMonth &&
          classDate.getFullYear() === currentYear
        );
      } else {
        // For single session classes
        const classDate = new Date(classItem.date);
        return (
          classDate.getMonth() === currentMonth &&
          classDate.getFullYear() === currentYear
        );
      }
    })
    .sort((a, b) => {
      const dateA = new Date(getNextClassDate(a) || "");
      const dateB = new Date(getNextClassDate(b) || "");
      return dateA.getTime() - dateB.getTime();
    });
});

// Add new computed property for filtered timetable entries
const filteredTimetableEntries = computed(() => {
  return timetableEntries.value.filter((entry) => {
    const matchesSearch =
      !filters.value.search ||
      entry.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      entry.description
        ?.toLowerCase()
        .includes(filters.value.search.toLowerCase());

    // Filter by status if specified
    const matchesStatus =
      filters.value.status === undefined ||
      (filters.value.status === true && !entry.is_cancelled) ||
      (filters.value.status === false && entry.is_cancelled);

    return matchesSearch && matchesStatus;
  });
});

// Add new computed for paginated timetable entries
const paginatedTimetableEntries = computed(() =>
  filteredTimetableEntries.value.slice(
    (page.value - 1) * pageSize,
    page.value * pageSize
  )
);

// Helper function to get next class date
const getNextClassDate = (classItem: Class): string | null => {
  if (!classItem.method.endsWith("RecurringSeries")) {
    return classItem.date;
  }

  const weekdayMap: Record<string, number> = {
    SUN: 0,
    MON: 1,
    TUE: 2,
    WED: 3,
    THU: 4,
    FRI: 5,
    SAT: 6,
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDay = weekdayMap[classItem.date];
  if (targetDay === undefined) return null;

  const result = new Date(today);
  const currentDay = today.getDay();

  let daysUntilNext = targetDay - currentDay;
  if (daysUntilNext <= 0) {
    daysUntilNext += 7;
  }

  result.setDate(result.getDate() + daysUntilNext);
  return result.toISOString().split("T")[0] || null;
};

// Action handlers
const updateFilters = (newFilters: any) => {
  Object.assign(filters.value, newFilters);
};

const refreshData = async () => {
  try {
    const [classesData, timetableData] = await Promise.all([
      getClasses(),
      getTimeTable(),
    ]);
    classes.value = classesData;
    timetableEntries.value = timetableData;
  } catch (error) {
    console.error("Error refreshing data:", error);
    notification.showError("Failed to load data");
  }
};

const handleViewStudents = (classItem: Class) => {
  // Implement view students logic
  console.log("Viewing students for:", classItem.name);
};

const handleEditClass = (classItem: Class) => {
  selectedClass.value = classItem;
  isEditModalOpen.value = true;
};

const handleDeleteClass = async (classItem: Class) => {
  try {
    await endClass(classItem.id);
    notification.showSuccess("Class ended successfully");
    refreshData();
  } catch (error) {
    console.error("Error ending class:", error);
    notification.showError("Failed to end class");
  }
};

const handleCancelWeek = async (classItem: Class) => {
  try {
    await refreshData();
  } catch (error) {
    console.error("Error refreshing data after class cancellation:", error);
    notification.showError("Failed to refresh class data");
  }
};

// Add function to handle session cancellation
const handleCancelSession = async (session: TimeTableEntry) => {
  try {
    const { error } = await supabase
      .from("class_sessions")
      .update({ is_cancelled: true })
      .eq("id", session.id);

    if (error) throw error;
    notification.showSuccess("Class session cancelled successfully");
    refreshData();
  } catch (error) {
    console.error("Error cancelling session:", error);
    notification.showError("Failed to cancel class session");
  }
};

// Update the handleRescheduleSession function to show confirmation dialog
const handleRescheduleSession = (session: TimeTableEntry) => {
  selectedSession.value = session;
  isRestoreDialogOpen.value = true;
};

const handleRestoreConfirm = async () => {
  if (!selectedSession.value) return;
  
  try {
    const { error } = await supabase
      .from("class_sessions")
      .update({
        is_cancelled: false
      })
      .eq("id", selectedSession.value.id);

    if (error) throw error;
    notification.showSuccess("Class session restored successfully");
    isRestoreDialogOpen.value = false;
    refreshData();
  } catch (error) {
    console.error("Error restoring session:", error);
    notification.showError("Failed to restore class session");
  }
};

// Format date function
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Format time function
const formatTime = (time: string) => {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Initialize data
onMounted(() => {
  refreshData();
});

// Mobile responsive handler
if (import.meta.client) {
  window.addEventListener("resize", () => {
    isMobile.value = isMobileScreen();
  });
}
</script>
