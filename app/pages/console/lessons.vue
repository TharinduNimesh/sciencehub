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
        <!-- Skeletons during loading -->
        <template v-if="isLoading">
          <div v-for="i in 6" :key="`skeleton-${i}`" class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-pulse">
            <!-- Thumbnail skeleton -->
            <div class="aspect-video w-full h-48 bg-gray-200"></div>
            <!-- Content skeleton -->
            <div class="p-4">
              <div class="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div class="h-4 bg-gray-200 rounded w-2/3"></div>
              <!-- Footer skeleton -->
              <div class="flex items-center justify-between mt-4">
                <div class="h-3 bg-gray-200 rounded w-1/4"></div>
                <div class="h-5 bg-gray-200 rounded w-1/5"></div>
              </div>
            </div>
          </div>
        </template>
        
        <!-- Actual lessons -->
        <ConsoleLessonsCard
          v-if="!isLoading"
          v-for="lesson in paginatedLessons"
          :key="lesson.id"
          :lesson="lesson"
          :processing="processingIds.includes(lesson.id)"
          @view="handleViewLesson"
          @edit="handleEditLesson"
          @delete="handleDeleteLesson"
        />
        
        <!-- Empty state -->
        <p
          v-if="
            !isLoading && (paginatedLessons?.length === 0 || !paginatedLessons)
          "
          class="text-gray-500 col-span-full text-center py-12"
        >
          No lessons found.
          {{ showFilters ? "Try adjusting your filters." : "" }}
        </p>
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

// Class data (in a real app, would be fetched from API)
const classes = ref([
  { id: 1, name: "Class A - Physics (Online)", type: "online", grade: 10, subject: "Physics" },
  { id: 2, name: "Class B - Chemistry (Physical)", type: "physical", grade: 10, subject: "Chemistry" },
  { id: 3, name: "Class C - Biology (Online)", type: "online", grade: 9, subject: "Biology" },
  { id: 4, name: "Class D - Mathematics (Physical)", type: "physical", grade: 11, subject: "Mathematics" }
]);

// Filters
const filters = ref({
  search: "",
  grade: undefined,
  subject: undefined,
  dateRange: undefined,
  classId: undefined,
});

// Types
interface Lesson {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  classId?: number; // New field for class association
  grade: number;
  subject: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

// Lessons state - mock data now with classId field
const lessons = ref<Lesson[]>([
  {
    id: 1,
    title: "Introduction to Chemical Bonds",
    description:
      "Learn about the fundamental concepts of chemical bonding and molecular structures.",
    thumbnailUrl: "https://img.youtube.com/vi/LICeBJKjzI0/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=LICeBJKjzI0",
    classId: 2,
    grade: 10,
    subject: "Chemistry",
    duration: 45,
    createdAt: "2023-11-10T14:00:00Z",
    updatedAt: "2023-11-10T14:00:00Z",
  },
  // ...other lessons with same structure
]);

// Mobile responsive handler
if (import.meta.client) {
  window.addEventListener("resize", () => (isMobile.value = isMobileScreen()));
}

// Helper to get class details by id
const getClassById = (classId: number | undefined) => {
  if (!classId) return null;
  return classes.value.find(c => c.id === classId) || null;
};

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
      
    // Class filter
    const matchesClass = 
      !filters.value.classId || lesson.classId === filters.value.classId;

    // Date range filter
    if (!matchesSearch || !matchesGrade || !matchesSubject || !matchesClass) return false;

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
    // In a real app, you would call an API here
    // For the mock, we'll simulate a network delay and refresh with sample data
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Refresh lessons data - in a real app, this would be API data
    // For testing, we'll randomly reorder the sample lessons to simulate refresh
    lessons.value = [...lessons.value].sort(() => Math.random() - 0.5);
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
      // Get class details for grade and subject
      const classInfo = getClassById(updatedLessonData.classId as number);
      
      // Mock updating a lesson
      const index = lessons.value.findIndex(
        (l) => l.id === updatedLessonData.id
      );
      if (index !== -1) {
        // Merge old lesson with updates and class information
        const updatedLesson: Lesson = {
          ...lessons.value[index],
          ...updatedLessonData,
          // If class was selected, update grade and subject from class info
          ...(classInfo ? {
            grade: classInfo.grade,
            subject: classInfo.subject
          } : {}),
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
    
    // Get class details for grade and subject
    const classInfo = getClassById(lessonData.classId as number);
    if (!classInfo) {
      showError("Invalid class selected");
      return;
    }
    
    // Mock adding a lesson
    const newLesson: Lesson = {
      id: Math.max(0, ...lessons.value.map((l) => l.id)) + 1,
      title: lessonData.title || "New Lesson",
      description: lessonData.description || "",
      thumbnailUrl: lessonData.thumbnailUrl || "https://placehold.co/800x450?text=No+Thumbnail",
      videoUrl: lessonData.videoUrl || "https://www.youtube.com/watch?v=example",
      classId: lessonData.classId,
      grade: classInfo.grade,
      subject: classInfo.subject,
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
