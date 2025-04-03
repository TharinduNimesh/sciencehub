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
          class="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gray-100"
        >
          <UIcon
            name="i-heroicons-video-camera"
            class="h-12 w-12 text-gray-400"
          />
        </div>
        <h3 class="mt-6 text-xl font-medium text-gray-900">No lessons found</h3>
        <p class="mt-2 text-gray-500">
          Get started by creating a new lesson recording.
        </p>
        <div class="mt-6">
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
      :is-editing="isEditing"
      :edit-data="currentLesson"
      @add="handleAddOrUpdateLesson"
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

definePageMeta({
  layout: "console",
});

interface Lesson {
  id: number;
  title: string;
  description?: string;
  duration: number;
  classId: number;
  className: string;
  thumbnailUrl: string;
  videoUrl: string;
  createdAt: string;
}

// Store & Utilities
const sidebarStore = useSidebarStore();
const isMobile = ref(isMobileScreen());

// State
const router = useRouter();
const lessons = ref<Lesson[]>([]);
const loading = ref(true);
const isAddModalOpen = ref(false);
const isEditing = ref(false);
const currentLesson = ref<Lesson | null>(null);
const page = ref(1);
const pageSize = 9;
const showFilters = ref(false);

// Delete confirmation state
const isDeleteModalOpen = ref(false);
const lessonToDelete = ref<Lesson | null>(null);

// Filters
const filters = ref({
  search: "",
  grade: undefined,
  subject: undefined,
  dateRange: undefined,
});

// Load lessons (mock data for now)
onMounted(async () => {
  refreshData();

  // Mobile responsive handler
  if (import.meta.client) {
    window.addEventListener("resize", () => {
      isMobile.value = isMobileScreen();
    });
  }
});

// Computed properties
const filteredLessons = computed(() => {
  return lessons.value.filter((lesson) => {
    const matchesSearch =
      !filters.value.search ||
      lesson.title.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      lesson.description
        ?.toLowerCase()
        .includes(filters.value.search.toLowerCase());

    // Additional filters can be added here when we have grade, subject info in lessons model

    return matchesSearch;
  });
});

const paginatedLessons = computed(() => {
  return filteredLessons.value.slice(
    (page.value - 1) * pageSize,
    page.value * pageSize
  );
});

const gridClass = computed(() => {
  if (!sidebarStore.isOpen) {
    return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";
  }
  return "grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3";
});

// Action handlers
const refreshData = async () => {
  try {
    loading.value = true;
    // Simulate API call
    setTimeout(() => {
      lessons.value = [
        {
          id: 1,
          title: "Introduction to Acids and Bases",
          description:
            "Learn the fundamentals of acids and bases in chemistry.",
          duration: 45,
          classId: 2,
          className: "Chemistry Class B",
          thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          createdAt: "2023-09-15T10:30:00",
        },
        {
          id: 2,
          title: "Force and Motion - Newton's Laws",
          description:
            "Comprehensive overview of Newton's three laws of motion",
          duration: 60,
          classId: 1,
          className: "Physics Class A",
          thumbnailUrl: "https://img.youtube.com/vi/L-Wtlv6E7zs/hqdefault.jpg",
          videoUrl: "https://www.youtube.com/watch?v=L-Wtlv6E7zs",
          createdAt: "2023-09-22T14:00:00",
        },
        {
          id: 3,
          title: "Cell Structure and Function",
          description: "Explore the basic unit of life - the cell.",
          duration: 55,
          classId: 3,
          className: "Biology Class C",
          thumbnailUrl: "https://img.youtube.com/vi/8IlzKri08kk/hqdefault.jpg",
          videoUrl: "https://www.youtube.com/watch?v=8IlzKri08kk",
          createdAt: "2023-10-01T09:15:00",
        },
      ];
      loading.value = false;
    }, 1000);
  } catch (error) {
    console.error("Error loading lessons:", error);
    loading.value = false;
  }
};

const handleAddOrUpdateLesson = (lesson: Lesson) => {
  if (isEditing.value && currentLesson.value) {
    // Update existing lesson
    const index = lessons.value.findIndex(
      (l) => l.id === currentLesson.value!.id
    );
    if (index !== -1) {
      lessons.value[index] = { ...lesson, id: currentLesson.value.id };
    }

    // Reset editing state
    isEditing.value = false;
    currentLesson.value = null;
  } else {
    // Add new lesson with a generated ID
    const newId = Math.max(0, ...lessons.value.map((l) => l.id)) + 1;
    lessons.value.push({
      ...lesson,
      id: newId,
      createdAt: new Date().toISOString(),
    });
  }

  // Close modal
  isAddModalOpen.value = false;
};

const handleEditLesson = (lesson: Lesson) => {
  currentLesson.value = { ...lesson };
  isEditing.value = true;
  isAddModalOpen.value = true;
};

const handleDeleteLesson = (lesson: Lesson) => {
  lessonToDelete.value = lesson;
  isDeleteModalOpen.value = true;
};

const confirmDeleteLesson = (lesson: Lesson) => {
  // Remove the lesson from array
  lessons.value = lessons.value.filter((l) => l.id !== lesson.id);

  // Show success notification
  useNotification().showSuccess("Lesson deleted successfully");

  // Reset state
  lessonToDelete.value = null;
};

const navigateToLesson = (lesson: Lesson) => {
  router.push(`/console/lessons/${lesson.id}`);
};
</script>
