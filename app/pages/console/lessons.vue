<template>
  <div class="h-full space-y-8">
    <!-- Moderators Section -->
    <div class="bg-white rounded-lg shadow-sm p-6 lg:p-8 space-y-6">
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h2 class="text-xl font-semibold">Lessons</h2>
          <p class="text-sm text-gray-500 mt-1">
            Manage your lessons and resources
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div class="flex gap-2 w-full">
            <UButton
              icon="i-heroicons-arrow-path"
              :ui="{ rounded: 'rounded-full' }"
              :loading="isLoading"
              color="gray"
              variant="ghost"
              @click="reloadLessons"
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
          <UButton
            v-if="isAdmin || isModerator"
            label="Add Lesson"
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
        :filters="filters"
        @update:filters="updateFilters"
      />

      <!-- Lessons List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        <ConsoleLessonsCard
          v-for="lesson in paginatedLessons"
          :key="lesson.id"
          :lesson="lesson"
          :processing="processingIds.includes(lesson.id)"
          @view="handleViewLesson"
          @edit="handleEditLesson"
          @delete="handleDeleteLesson"
        />
        <p
          v-if="
            (paginatedLessons?.length === 0 || !paginatedLessons) && !isLoading
          "
          class="text-gray-500 col-span-full text-center py-12"
        >
          No lessons found.
          {{ showFilters ? "Try adjusting your filters." : "" }}
        </p>
        <div v-if="isLoading" class="col-span-full flex justify-center py-12">
          <UIcon
            name="i-heroicons-arrow-path"
            class="w-8 h-8 animate-spin text-gray-400"
          />
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex justify-between items-center pt-2">
        <div class="text-sm text-gray-500">
          Showing
          {{
            Math.min((page - 1) * pageSize + 1, filteredLessons?.length || 0)
          }}-{{ Math.min(page * pageSize, filteredLessons?.length || 0) }} of
          {{ filteredLessons?.length || 0 }} lessons
        </div>

        <UPagination
          v-model="page"
          :total="filteredLessons?.length || 0"
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

    <!-- Add Lesson Modal -->
    <ConsoleLessonsAddModal v-model="isAddModalOpen" @add="handleAddLesson" />

    <!-- Edit Lesson Modal -->
    <ConsoleLessonsAddModal
      v-model="isEditModalOpen"
      :is-editing="true"
      :edit-data="selectedLessonForEdit"
      @add="handleUpdateLesson"
    />

    <!-- View Lesson Modal -->
    <ConsoleLessonsViewModal
      v-model="isViewModalOpen"
      :lesson="selectedLesson"
      @edit="handleEditFromView"
    />
  </div>
</template>

<script setup lang="ts">
import { isMobileScreen } from "~/lib/utils";
import { useAuthStore } from "@/stores/auth";

// Page meta
definePageMeta({ layout: "console" });

// Composables
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { showSuccess, showError } = useNotification();
const authStore = useAuthStore();

// Reactive state
const isMobile = ref(isMobileScreen());
const showFilters = ref(false);
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isViewModalOpen = ref(false);
const isLoading = ref(false);
const processingIds = ref<number[]>([]);
const selectedLesson = ref<Lesson | null>(null);
const selectedLessonForEdit = ref<Lesson | null>(null);
const page = ref(1);
const pageSize = 9;

// Role-based access
const userRole = computed(() => authStore.getCurrentUserRole());
const isAdmin = computed(() => userRole.value === "ADMIN");
const isModerator = computed(() => userRole.value === "MODERATOR");

// Filters
const filters = ref({
  search: "",
  grade: undefined,
  subject: undefined,
  dateRange: undefined,
});

// Mobile responsive handler
if (import.meta.client) {
  window.addEventListener("resize", () => (isMobile.value = isMobileScreen()));
}

// Types
interface Lesson {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  grade: number;
  subject: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

// Lessons state - mock data for now
const lessons = ref<Lesson[]>([
  {
    id: 1,
    title: "Introduction to Chemical Bonds",
    description:
      "Learn about the fundamental concepts of chemical bonding and molecular structures.",
    thumbnailUrl: "https://picsum.photos/seed/picsum1/800/450",
    videoUrl: "https://example.com/videos/chemical-bonds",
    grade: 10,
    subject: "Chemistry",
    duration: 45,
    createdAt: "2023-11-10T14:00:00Z",
    updatedAt: "2023-11-10T14:00:00Z",
  },
  {
    id: 2,
    title: "Ecosystem Dynamics",
    description:
      "Explore the complex interactions within ecosystems and how energy flows through food chains.",
    thumbnailUrl: "https://picsum.photos/seed/picsum2/800/450",
    videoUrl: "https://example.com/videos/ecosystem",
    grade: 9,
    subject: "Biology",
    duration: 50,
    createdAt: "2023-11-05T10:30:00Z",
    updatedAt: "2023-11-05T10:30:00Z",
  },
  {
    id: 3,
    title: "Newton's Laws of Motion",
    description:
      "A comprehensive review of Newton's three laws of motion with practical examples.",
    thumbnailUrl: "https://picsum.photos/seed/picsum3/800/450",
    videoUrl: "https://example.com/videos/newton-laws",
    grade: 11,
    subject: "Physics",
    duration: 55,
    createdAt: "2023-10-28T13:15:00Z",
    updatedAt: "2023-10-28T13:15:00Z",
  },
  {
    id: 4,
    title: "Periodic Table and Element Properties",
    description:
      "Understanding the periodic table organization and trends in element properties.",
    thumbnailUrl: "https://picsum.photos/seed/picsum4/800/450",
    videoUrl: "https://example.com/videos/periodic-table",
    grade: 10,
    subject: "Chemistry",
    duration: 60,
    createdAt: "2023-10-20T09:45:00Z",
    updatedAt: "2023-10-20T09:45:00Z",
  },
  {
    id: 5,
    title: "Cell Division: Mitosis and Meiosis",
    description:
      "Comparing the processes of mitosis and meiosis in cellular reproduction.",
    thumbnailUrl: "https://picsum.photos/seed/picsum5/800/450",
    videoUrl: "https://example.com/videos/cell-division",
    grade: 9,
    subject: "Biology",
    duration: 48,
    createdAt: "2023-10-15T11:20:00Z",
    updatedAt: "2023-10-15T11:20:00Z",
  },
  {
    id: 6,
    title: "Wave Properties and Behaviors",
    description:
      "Investigating the properties and behaviors of mechanical and electromagnetic waves.",
    thumbnailUrl: "https://picsum.photos/seed/picsum6/800/450",
    videoUrl: "https://example.com/videos/wave-properties",
    grade: 11,
    subject: "Physics",
    duration: 52,
    createdAt: "2023-10-08T15:30:00Z",
    updatedAt: "2023-10-08T15:30:00Z",
  },
]);

// Computed
const filteredLessons = computed(() => {
  if (!lessons.value) return [];

  return lessons.value.filter((lesson) => {
    // Search filter
    const matchesSearch =
      !filters.value.search ||
      lesson.title.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      lesson.description
        .toLowerCase()
        .includes(filters.value.search.toLowerCase());

    // Grade filter
    const matchesGrade =
      filters.value.grade === undefined || lesson.grade === filters.value.grade;

    // Subject filter
    const matchesSubject =
      !filters.value.subject || lesson.subject === filters.value.subject;

    // Date range filter
    if (!matchesSearch || !matchesGrade || !matchesSubject) return false;

    if (filters.value.dateRange) {
      const lessonDate = new Date(lesson.createdAt).getTime();
      const now = new Date().getTime();
      const timeRanges = {
        "7d": 7 * 24 * 60 * 60 * 1000,
        "30d": 30 * 24 * 60 * 60 * 1000,
        "90d": 90 * 24 * 60 * 60 * 1000,
      };
      return now - lessonDate <= timeRanges[filters.value.dateRange];
    }

    return true;
  });
});

const paginatedLessons = computed(() => {
  if (!filteredLessons.value) return [];
  return filteredLessons.value.slice(
    (page.value - 1) * pageSize,
    page.value * pageSize
  );
});

// Methods
const handleAction = async (id: number, action: () => Promise<void>) => {
  processingIds.value.push(id);
  try {
    await action();
  } finally {
    processingIds.value = processingIds.value.filter((pid) => pid !== id);
  }
};

const reloadLessons = async () => {
  try {
    isLoading.value = true;
    // In a real app, fetch from API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Mock data refresh
  } catch (error) {
    console.error("Failed to load lessons:", error);
    showError("Failed to load lessons");
  } finally {
    isLoading.value = false;
  }
};

const handleViewLesson = (lesson: Lesson) => {
  selectedLesson.value = lesson;
  isViewModalOpen.value = true;
};

const handleEditLesson = (lesson: Lesson) => {
  selectedLessonForEdit.value = { ...lesson }; // Create a copy to avoid reference issues
  isEditModalOpen.value = true;
};

const handleEditFromView = () => {
  // Handle edit request from view modal
  if (selectedLesson.value) {
    isViewModalOpen.value = false;
    setTimeout(() => {
      selectedLessonForEdit.value = { ...selectedLesson.value };
      isEditModalOpen.value = true;
    }, 300); // Small delay for better UX
  }
};

const handleUpdateLesson = async (updatedLessonData: Partial<Lesson>) => {
  if (!updatedLessonData.id) return;

  try {
    await handleAction(updatedLessonData.id, async () => {
      // Mock updating a lesson
      const index = lessons.value.findIndex(
        (l) => l.id === updatedLessonData.id
      );
      if (index !== -1) {
        const updatedLesson: Lesson = {
          ...lessons.value[index],
          ...updatedLessonData,
          updatedAt: new Date().toISOString(),
        };

        lessons.value[index] = updatedLesson;

        // Also update the view modal if it's showing this lesson
        if (
          selectedLesson.value &&
          selectedLesson.value.id === updatedLesson.id
        ) {
          selectedLesson.value = { ...updatedLesson };
        }

        showSuccess("Lesson updated successfully");
      }
    });
  } catch (error) {
    console.error("Failed to update lesson:", error);
    showError("Failed to update lesson");
  }
};

const handleAddLesson = async (lessonData: Partial<Lesson>) => {
  try {
    isLoading.value = true;
    // Mock adding a lesson
    const newLesson: Lesson = {
      id: Math.max(0, ...lessons.value.map((l) => l.id)) + 1,
      title: lessonData.title || "Untitled Lesson",
      description: lessonData.description || "",
      thumbnailUrl:
        lessonData.thumbnailUrl ||
        "https://placehold.co/800x450?text=No+Thumbnail",
      videoUrl: lessonData.videoUrl || "",
      grade: lessonData.grade || 10,
      subject: lessonData.subject || "General Science",
      duration: lessonData.duration || 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    lessons.value.unshift(newLesson);
    showSuccess("Lesson added successfully");
  } catch (error) {
    console.error("Failed to add lesson:", error);
    showError("Failed to add lesson");
  } finally {
    isLoading.value = false;
  }
};

const handleDeleteLesson = async (lesson: Lesson) => {
  await handleAction(lesson.id, async () => {
    // Mock deletion
    lessons.value = lessons.value.filter((l) => l.id !== lesson.id);
    showSuccess("Lesson deleted successfully");
  });
};

const updateFilters = (newFilters: any) => {
  Object.assign(filters.value, newFilters);
  // Reset to first page when filters change
  page.value = 1;
};

// Initialize
onMounted(async () => {
  await reloadLessons();
});
</script>
