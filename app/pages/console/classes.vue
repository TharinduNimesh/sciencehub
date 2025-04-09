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
            v-if="isAdmin()"
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
        :view-mode="currentViewMode"
        @update:filters="updateFilters"
        class="transition-all duration-200 ease-in-out"
      />

      <!-- Tabs -->
      <UTabs
        v-if="!isStudent()"
        v-model="selectedTabIndex"
        :items="tabItems"
        :ui="{
          wrapper: 'mt-6',
          list: {
            base: 'mb-6',
          },
        }"
      />

      <!-- Content Section -->
      <div class="grid grid-cols-1 gap-6" :class="[
        currentViewMode === 'summary' ? gridClass : '',
        currentViewMode === 'summary' ? 'auto-rows-fr' : ''
      ]">
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

        <template v-else>
          <!-- Empty State -->
          <div v-if="currentViewMode === 'timetable' && filteredTimetableEntries.length === 0" 
               class="bg-gray-50 rounded-lg p-12 text-center col-span-full">
            <div class="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-primary-50">
              <UIcon name="i-heroicons-calendar" class="h-12 w-12 text-primary-400" />
            </div>
            <h3 class="mt-6 text-xl font-medium text-gray-900">No classes scheduled</h3>
            <p v-if="isAdmin()" class="mt-2 text-gray-500">
              Get started by creating a new class and scheduling sessions.
            </p>
            <p v-else-if="isStudent()" class="mt-2 text-gray-500">
              No classes are scheduled for you at the moment.
            </p>
            <div v-if="isAdmin()" class="mt-6">
              <UButton
                color="primary"
                label="Create Class"
                @click="isCreateModalOpen = true"
                :ui="{ rounded: 'rounded-full' }"
              />
            </div>
          </div>

          <div v-else-if="currentViewMode === 'summary' && filteredClasses.length === 0" 
               class="bg-gray-50 rounded-lg p-12 text-center col-span-full">
            <div class="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-primary-50">
              <UIcon name="i-heroicons-academic-cap" class="h-12 w-12 text-primary-400" />
            </div>
            <h3 class="mt-6 text-xl font-medium text-gray-900">No classes found</h3>
            <p v-if="isAdmin()" class="mt-2 text-gray-500">
              Get started by creating your first class.
            </p>
            <p v-else-if="isStudent()" class="mt-2 text-gray-500">
              You are not enrolled in any classes at the moment.
            </p>
            <div v-if="isAdmin()" class="mt-6">
              <UButton
                color="primary"
                label="Create Class"
                @click="isCreateModalOpen = true"
                :ui="{ rounded: 'rounded-full' }"
              />
            </div>
          </div>

          <!-- Timetable View -->
          <template v-else-if="currentViewMode === 'timetable'">
            <ConsoleClassesTimeTableCard
              v-for="entry in paginatedTimetableEntries"
              :key="entry.id"
              :entry="entry"
              @cancel="handleCancelSession(entry)"
              @reschedule="handleRescheduleSession(entry)"
              @refresh="refreshData"
            />
          </template>

          <!-- Summary View -->
          <template v-else>
            <ConsoleClassesClassCard
              v-for="classItem in paginatedClasses"
              :key="classItem.id"
              :class-item="classItem"
              view-mode="summary"
              @view-students="handleViewStudents"
              @edit="handleEditClass"
              @delete="handleDeleteClass"
              @cancel-week="handleCancelWeek"
            />
          </template>
        </template>
      </div>

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
import { useRoute, useRouter } from "#app";
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
  selectedDate: undefined as Date | undefined,
  selectedDays: [] as string[],
});

const route = useRoute();
const router = useRouter();

// Modified tab state
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

// Computed for tab index based on route query
const selectedTabIndex = computed({
  get() {
    const tab = route.query.tab as string;
    const index = tabItems.findIndex(item => item.key === tab);
    return index === -1 ? 0 : index;
  },
  set(value: number) {
    router.replace({ 
      query: { 
        ...route.query, 
        tab: tabItems[value]?.key ?? 'timetable'
      }
    });
  }
});

// Computed to get current view mode
const currentViewMode = computed(() => {
  // Always return 'timetable' for students
  if (isStudent()) {
    return 'timetable' as const;
  }
  // For others, return based on selected tab
  return (tabItems[selectedTabIndex.value]?.key ?? 'timetable') as 'timetable' | 'summary';
});

// Watch for tab changes through route
watch(
  () => route.query.tab,
  () => {
    // Reset page when switching views
    page.value = 1;
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
const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;
type DayName = (typeof dayNames)[number];

// Add helper function for date validation
const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

const filteredTimetableEntries = computed(() => {
  // Cache the selected date to avoid multiple normalizations
  let selectedDate = filters.value.selectedDate
  if (selectedDate) {
    selectedDate = new Date(selectedDate)
    selectedDate.setHours(0, 0, 0, 0)
  }

  return timetableEntries.value.filter((entry) => {
    // Create dates and normalize to midnight UTC
    const entryDate = new Date(entry.date)
    entryDate.setHours(0, 0, 0, 0)

    // Text search filter
    const matchesSearch =
      !filters.value.search ||
      entry.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      entry.description?.toLowerCase().includes(filters.value.search.toLowerCase())

    // Status filter
    const matchesStatus =
      filters.value.status === undefined ||
      (filters.value.status === true && !entry.is_cancelled) ||
      (filters.value.status === false && entry.is_cancelled)

    // Date filter - compare dates after ensuring they're properly normalized
    const matchesDate = !selectedDate || 
      (entryDate.getFullYear() === selectedDate.getFullYear() &&
       entryDate.getMonth() === selectedDate.getMonth() &&
       entryDate.getDate() === selectedDate.getDate())

    // Days filter
    const dayIndex = entryDate.getDay()
    const dayName = dayNames[dayIndex] as DayName
    const selectedDays = filters.value.selectedDays ?? []
    const matchesDays = selectedDays.length === 0 || selectedDays.includes(dayName)

    return matchesSearch && matchesStatus && matchesDate && matchesDays
  })
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
        is_cancelled: false,
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
