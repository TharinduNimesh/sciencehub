<template>
  <div class="h-full space-y-8">
    <!-- Lessons Section -->
    <div class="bg-white rounded-lg shadow-sm p-6 lg:p-8 space-y-6">
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h2 class="text-xl font-semibold">Lessons</h2>
          <p class="text-sm text-gray-500 mt-1">
            Manage your class lessons and recordings
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div class="flex gap-2 w-full sm:w-auto">
            <UButton
              icon="i-heroicons-arrow-path"
              :ui="{ rounded: 'rounded-full' }"
              :loading="loading"
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
          <div class="flex-1 sm:flex-initial" v-if="isAdmin()">
            <UButton
              label="Add New Lesson"
              color="primary"
              icon="i-heroicons-plus"
              :ui="{ rounded: 'rounded-full' }"
              :block="isMobile"
              @click="isAddModalOpen = true"
            />
          </div>
        </div>
      </div>

      <!-- Filters -->
      <ConsoleLessonsFilters
        v-show="showFilters"
        v-model:filters="filters"
        class="transition-all duration-200 ease-in-out"
      />

      <!-- Content Section -->
      <div v-if="loading" :class="['grid gap-6', gridClass]">
        <div
          v-for="i in 6"
          :key="i"
          class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col"
        >
          <!-- Image skeleton matching aspect-video -->
          <div class="relative aspect-video w-full bg-gray-100 overflow-hidden">
            <USkeleton class="h-64 w-full" />
          </div>

          <!-- Content skeleton matching Card layout -->
          <div class="p-4 flex flex-col flex-1">
            <!-- Badge area -->
            <div class="flex items-center justify-between mb-2">
              <USkeleton class="h-5 w-24 rounded-full" />
              <USkeleton class="h-5 w-16 rounded-full" />
            </div>

            <!-- Title -->
            <USkeleton class="h-6 w-full mb-2" />

            <!-- Description - two lines -->
            <USkeleton class="h-4 w-full mb-1" />
            <USkeleton class="h-4 w-3/4 mb-3" />

            <!-- Button area -->
            <div class="flex justify-between items-center mt-auto pt-2">
              <USkeleton class="h-8 w-28 rounded-lg" />
              <div class="flex gap-1">
                <USkeleton class="h-8 w-8 rounded" />
                <USkeleton class="h-8 w-8 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-else-if="filteredLessons.length === 0"
        class="bg-gray-50 rounded-lg p-12 text-center"
      >
        <div
          class="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-primary-50"
        >
          <UIcon
            name="i-heroicons-video-camera"
            class="h-12 w-12 text-primary-400"
          />
        </div>
        <h3 class="mt-6 text-xl font-medium text-gray-900">No lessons found</h3>
        <p v-if="isAdmin()" class="mt-2 text-gray-500">
          Get started by creating a new lesson recording.
        </p>
        <p v-else-if="isStudent()" class="mt-2 text-gray-500">
          No lessons are available for you at the moment.
        </p>
        <div v-if="isAdmin()" class="mt-6">
          <UButton
            color="primary"
            label="Add New Lesson"
            @click="isAddModalOpen = true"
            :ui="{ rounded: 'rounded-full' }"
          />
        </div>
      </div>
      <div v-else :class="['grid gap-6', gridClass]">
        <ConsoleLessonsCard
          v-for="lesson in paginatedLessons"
          :key="lesson.id"
          :lesson="lesson"
          @edit="handleEditLesson"
          @view="navigateToLesson"
          @delete="handleDeleteLesson"
          @hide="handleVisibilityChange"
        />
      </div>

      <!-- Pagination -->
      <div
        v-if="filteredLessons.length > pageSize"
        class="flex justify-between items-center pt-4"
      >
        <div class="text-sm text-gray-500">
          Showing
          {{ Math.min((page - 1) * pageSize + 1, filteredLessons.length) }}-{{
            Math.min(page * pageSize, filteredLessons.length)
          }}
          of {{ filteredLessons.length }} lessons
        </div>
        <UPagination
          v-model="page"
          :total="filteredLessons.length"
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

    <!-- Add/Edit Lesson Modal -->
    <ConsoleLessonsAddModal
      v-model="isAddModalOpen"
      @created="handleAddOrUpdateLesson"
    />

    <!-- Delete Lesson Modal -->
    <ConsoleLessonsDeleteModal
      v-model="isDeleteModalOpen"
      :lesson="lessonToDelete"
      @delete="confirmDeleteLesson"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSidebarStore } from "~/stores/sidebar";
import { isMobileScreen } from "~/lib/utils";
import { useLesson } from "~/composables/useLesson";
import { useClasses } from "~/composables/useClasses";
import type { Lesson, EditableLesson } from "~/types/lesson";
import type { Database } from "~/types/supabase";

interface LessonFilters {
  search: string;
  classId?: number;
  visibility: "ALL" | "HIDDEN" | "VISIBLE";
  dateRange?: string;
}

definePageMeta({
  layout: "console",
});

// Store & Utilities
const sidebarStore = useSidebarStore();
const isMobile = ref(isMobileScreen());
const { getAllLessons, loading, error } = useLesson();
const { getClasses, getActiveClasses } = useClasses();

// State
const router = useRouter();
const lessons = ref<Lesson[]>([]);
const classes = ref<{ id: number; name: string; grade: string }[]>([]);
const isAddModalOpen = ref(false);
const isEditing = ref(false);
const currentLesson = ref<EditableLesson | undefined>(undefined);
const page = ref(1);
const pageSize = 6;
const showFilters = ref(false);

// Delete confirmation state
const isDeleteModalOpen = ref(false);
const lessonToDelete = ref<EditableLesson | undefined>(undefined);

// Filters
const filters = ref<LessonFilters>({
  search: "",
  classId: undefined,
  visibility: "ALL",
  dateRange: undefined,
});

// Computed properties
const filteredLessons = computed(() => {
  return lessons.value.filter((lesson) => {
    // Search filter
    const matchesSearch =
      !filters.value.search ||
      lesson.title.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      lesson.description
        .toLowerCase()
        .includes(filters.value.search.toLowerCase());

    // Class filter - check if any of the lesson's classes match the selected class
    const matchesClass =
      filters.value.classId === undefined ||
      lesson.class_lessons?.some((cl) => cl.class_id === filters.value.classId);

    // Visibility filter
    const matchesVisibility =
      filters.value.visibility === "ALL" ||
      (filters.value.visibility === "HIDDEN"
        ? lesson.is_hidden
        : !lesson.is_hidden);

    // Date range filter
    const matchesDate =
      !filters.value.dateRange ||
      isWithinDateRange(lesson.created_at, filters.value.dateRange);

    return matchesSearch && matchesClass && matchesVisibility && matchesDate;
  });
});

// Computed properties for grid layout and pagination
const gridClass = computed(() => {
  // Base responsive grid that works independently of sidebar
  const baseGrid = "grid-cols-1 sm:grid-cols-2";

  // Only adjust grid on large screens based on sidebar state
  const largeScreenGrid = sidebarStore.isOpen
    ? "xl:grid-cols-2"
    : "lg:grid-cols-2 xl:grid-cols-3";

  return `${baseGrid} ${largeScreenGrid}`;
});

const paginatedLessons = computed(() => {
  const start = (page.value - 1) * pageSize;
  const end = start + pageSize;
  return filteredLessons.value.slice(start, end);
});

// Date range helper function
const isWithinDateRange = (date: string, range: string) => {
  const lessonDate = new Date(date);
  const now = new Date();

  switch (range) {
    case "7d":
      return isDateInRange(lessonDate, 7);
    case "30d":
      return isDateInRange(lessonDate, 30);
    case "90d":
      return isDateInRange(lessonDate, 90);
    default:
      return true;
  }
};

const isDateInRange = (date: Date, days: number) => {
  const now = new Date();
  const rangeDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return date >= rangeDate;
};

// Load lessons from Supabase with proper field mapping
const refreshData = async () => {
  try {
    const lessonsData = await getAllLessons();
    lessons.value = lessonsData.map((lesson) => ({
      ...lesson,
      thumbnailUrl: lesson.thumbnail_url || undefined,
      createdAt: lesson.created_at,
      className: lesson.className || "No Class", // Ensure className is always set
      classId:
        lesson.class_lessons?.map((cl: { class_id: number }) => cl.class_id) ||
        [],
    }));
  } catch (error) {
    console.error("Error loading lessons:", error);
    useNotification().showError("Failed to load lessons");
  }
};

// Load active classes for filters
const loadClasses = async () => {
  try {
    const activeClasses = await getActiveClasses();
    classes.value = activeClasses.map((cls) => ({
      ...cls,
      grade: String(cls.grade), // Convert grade to string
    }));
  } catch (error) {
    console.error("Error loading classes:", error);
    useNotification().showError("Failed to load classes");
  }
};

// Initial data load
onMounted(() => {
  refreshData();
  loadClasses();
});

// Update handlers to work with Supabase
const handleAddOrUpdateLesson = async () => {
  await refreshData();
  isAddModalOpen.value = false;
};

const handleEditLesson = async (lesson: Lesson) => {
  await refreshData(); // Refresh data after edit
};

const handleDeleteLesson = (lesson: Lesson) => {
  lessonToDelete.value = lesson;
  isDeleteModalOpen.value = true;
};

const confirmDeleteLesson = async (lesson: Lesson) => {
  try {
    // First delete class_lessons associations
    const { error: classLessonError } = await useSupabaseClient<Database>()
      .from("class_lessons")
      .delete()
      .eq("lesson_id", BigInt(lesson.id));

    if (classLessonError) throw classLessonError;

    // Then delete the lesson
    const { error: lessonError } = await useSupabaseClient<Database>()
      .from("lessons")
      .delete()
      .eq("id", BigInt(lesson.id));

    if (lessonError) throw lessonError;

    useNotification().showSuccess("Lesson deleted successfully");
    await refreshData();
  } catch (error) {
    console.error("Error deleting lesson:", error);
    useNotification().showError("Failed to delete lesson");
  } finally {
    lessonToDelete.value = undefined;
    isDeleteModalOpen.value = false;
  }
};

const navigateToLesson = (lesson: Lesson) => {
  router.push(`/console/lessons/${lesson.id}`);
};

const handleVisibilityChange = async (lesson: Lesson) => {
  try {
    // Update the local lessons array with the new visibility state
    lessons.value = lessons.value.map((l) =>
      l.id === lesson.id ? { ...l, is_hidden: lesson.is_hidden } : l
    );

    useNotification().showSuccess(
      lesson.is_hidden ? "Lesson has been hidden" : "Lesson is now visible"
    );
  } catch (error) {
    console.error("Error updating lesson visibility:", error);
    useNotification().showError("Failed to update lesson visibility");
  }
};
</script>
