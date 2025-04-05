<template>
  <div class="h-full space-y-8">
    <div class="bg-white rounded-lg shadow-sm p-6 lg:p-8">
      <!-- Back Button -->
      <div class="mb-6 flex items-center gap-4">
        <UButton
          to="/console/lessons"
          icon="i-heroicons-arrow-left"
          class="rounded-full"
          variant="soft"
        />
        <div>
          <span class="text-sm text-gray-500 block">Back to</span>
          <span class="font-medium">Lessons Dashboard</span>
        </div>
      </div>

      <div v-if="loading" class="space-y-4">
        <USkeleton class="h-[600px] w-full rounded-lg mb-6" />
        <USkeleton class="h-10 w-3/4 mb-4" />
        <USkeleton class="h-24 w-full" />
      </div>

      <div v-else class="space-y-8">
        <!-- Video Player Section -->
        <div class="w-full rounded-lg overflow-hidden bg-gray-900">
          <div class="relative w-full pb-[56.25%]">
            <iframe
              v-if="lesson"
              :src="getYouTubeEmbedUrl(lesson.videoUrl)"
              class="absolute top-0 left-0 w-full h-full"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </div>

        <!-- Lesson Header & Description -->
        <div class="space-y-6">
          <!-- Title and Meta Info -->
          <div>
            <h1 class="text-2xl font-bold mb-3">{{ lesson?.title }}</h1>
            <div class="flex flex-wrap items-center gap-4">
              <div class="flex items-center gap-4 text-gray-500">
                <span class="flex items-center">
                  <UIcon name="i-heroicons-clock" class="mr-1.5" />
                  {{ formatDuration(lesson?.duration || 0) }}
                </span>
                <span class="flex items-center">
                  <UIcon name="i-heroicons-calendar" class="mr-1.5" />
                  {{ formatDate(lesson?.createdAt || "") }}
                </span>
              </div>
            </div>
          </div>

          <!-- Description Card -->
          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <UIcon name="i-heroicons-information-circle" />
              About this lesson
            </h3>
            <p class="text-gray-700 whitespace-pre-wrap">
              {{ lesson?.description }}
            </p>
          </div>

          <!-- Student Materials Section -->
          <div
            v-if="hasStudentMaterials"
            class="border border-gray-200 rounded-lg overflow-hidden"
          >
            <!-- Materials Header -->
            <div
              class="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-lg font-medium text-gray-900">
                    Student Materials
                  </h2>
                  <p class="text-sm text-gray-500 mt-1">
                    Additional resources for this lesson
                  </p>
                </div>
                <UBadge color="primary" variant="subtle" size="lg">
                  {{ materialsCount }} Resources
                </UBadge>
              </div>
            </div>

            <!-- Resources List -->
            <div class="divide-y divide-gray-200">
              <div class="p-6">
                <div class="grid gap-4">
                  <div
                    v-for="(resource, index) in lesson?.documentLinks"
                    :key="index"
                    class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <!-- Resource Icon -->
                    <div
                      class="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center transition-all duration-200 group-hover:shadow-md group-hover:scale-105"
                    >
                      <UIcon
                        :name="getResourceIcon(resource.type)"
                        class="w-6 h-6 transition-colors duration-200"
                        :class="[
                          getResourceIconColor(resource.type),
                          'group-hover:scale-110',
                        ]"
                      />
                    </div>

                    <!-- Resource Info -->
                    <div class="flex-1 min-w-0">
                      <h4 class="font-medium text-gray-900 truncate">
                        {{ resource.name || getFileNameFromUrl(resource.url) }}
                      </h4>
                      <div class="flex items-center gap-2 mt-1">
                        <UBadge
                          :color="getResourceColor(resource.type)"
                          variant="subtle"
                          size="xs"
                        >
                          {{ formatResourceType(resource.type) }}
                        </UBadge>
                        <span class="text-xs text-gray-500">
                          {{ getLinkProviderName(resource.url) }}
                        </span>
                      </div>
                    </div>

                    <!-- Action Button -->
                    <UButton
                      tag="a"
                      :to="resource.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      color="gray"
                      variant="ghost"
                      icon="i-heroicons-arrow-top-right-on-square"
                      :ui="{ rounded: 'rounded-full' }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLesson } from "@/composables/useLesson";

definePageMeta({
  layout: "console",
});

interface DocumentLink {
  url: string;
  name: string;
  type: string;
  lessonId: number;
}

interface Lesson {
  id: string; // Changed from number to string to match transformed data
  title: string;
  description?: string;
  duration: number;
  classId: number[]; // Changed from number to number[] to match the database structure
  className: string;
  thumbnailUrl?: string; // Made optional
  videoUrl: string;
  createdAt: string;
  resourceType?: string;
  documents?: File[];
  documentLinks?: DocumentLink[];
  images?: File[];
  imageLinks?: string[];
  is_hidden: boolean;
}

interface LessonWithClasses extends Lesson {
  class_lessons?: Array<{
    class_id: number;
    classes: {
      id: number;
      name: string;
      grade: string;
    };
  }>;
}

const route = useRoute();
const router = useRouter();
const lessonId = computed(() => Number(route.params.id));
const loading = ref(true);
const lesson = ref<Lesson | null>(null);
const allLessons = ref<Lesson[]>([]);
const activeTab = ref("documents");

// Use the composable
const { getLessonById, getLessonResources, getAllLessons } = useLesson();

// Load lesson data
const loadLesson = async () => {
  try {
    loading.value = true;
    const [lessonData, resources] = await Promise.all([
      getLessonById(lessonId.value),
      getLessonResources(lessonId.value),
    ]);

    // Transform lesson data to match component's expected format
    lesson.value = {
      ...lessonData,
      id: lessonData.id.toString(),
      videoUrl: lessonData.video_url,
      thumbnailUrl: lessonData.thumbnail_url || undefined,
      createdAt: lessonData.created_at,
      classId:
        (lessonData as unknown as LessonWithClasses).class_lessons?.map(
          (cl) => cl.class_id
        ) || [],
      // Transform resources without createdAt
      documentLinks: resources.map((r) => ({
        type: r.type,
        name: r.name || getFileNameFromUrl(r.url),
        url: r.url,
        lessonId: r.lesson_id,
      })),
    };

    // Load all lessons for related lessons section
    const allLessonsData = await getAllLessons();
    allLessons.value = allLessonsData.map((l) => ({
      ...l,
      videoUrl: l.video_url,
      thumbnailUrl: l.thumbnail_url || undefined,
      createdAt: l.created_at,
    }));
  } catch (error) {
    console.error("Error loading lesson:", error);
    useNotification().showError("Failed to load lesson");
  } finally {
    loading.value = false;
  }
};

// Material tabs for the student materials section
const materialTabs = [
  {
    label: "Documents",
    slot: "documents",
    icon: "i-heroicons-document-text",
  },
  {
    label: "Images",
    slot: "images",
    icon: "i-heroicons-photo",
  },
];

// Check if lesson has any student materials
const hasStudentMaterials = computed(() => {
  return lesson.value?.documentLinks && lesson.value.documentLinks.length > 0;
});

// Get total count of materials
const materialsCount = computed(() => {
  return lesson.value?.documentLinks?.length || 0;
});

// Check if lesson has documents
const hasDocuments = computed(() => {
  if (!lesson.value) return false;
  return lesson.value.documentLinks && lesson.value.documentLinks.length > 0;
});

// Check if lesson has images
const hasImages = computed(() => {
  if (!lesson.value) return false;
  return lesson.value.imageLinks && lesson.value.imageLinks.length > 0;
});

// Get related lessons from the same class
const relatedLessons = computed(() => {
  if (!lesson.value) return [];
  return allLessons.value
    .filter(
      (l) =>
        l.classId?.some((id) => lesson.value?.classId?.includes(id)) &&
        l.id !== lesson.value?.id
    )
    .slice(0, 3);
});

// Load data when component mounts
onMounted(() => {
  loadLesson();
});

// Helper functions
const getYouTubeEmbedUrl = (url: string): string => {
  if (!url) return "";

  const videoId = extractYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
};

const extractYouTubeVideoId = (url: string): string => {
  if (!url) return "";

  let videoId = "";
  if (url.includes("youtube.com/watch")) {
    const urlParams = new URLSearchParams(url.split("?")[1]);
    videoId = urlParams.get("v") || "";
  } else if (url.includes("youtu.be")) {
    videoId = url.split("/").pop() || "";
  }

  return videoId;
};

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}`;
  }
  return `${mins} min`;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return "";

  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const navigateToLesson = (id: string) => {
  router.push(`/console/lessons/${id}`);
};

const navigateToEdit = (lesson: Lesson) => {
  // You could either implement in-page editing or navigate to an edit page
  // For now, we'll just log it
  console.log("Editing lesson:", lesson);
  // In a real implementation, you might do:
  // router.push(`/console/lessons/${lesson.id}/edit`);
};

// Document and image helper functions
const getDocumentIcon = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf":
      return "i-heroicons-document-text";
    case "doc":
    case "docx":
      return "i-heroicons-document";
    case "ppt":
    case "pptx":
      return "i-heroicons-presentation-chart-bar";
    case "xls":
    case "xlsx":
      return "i-heroicons-table-cells";
    default:
      return "i-heroicons-paper-clip";
  }
};

const getDocumentType = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf":
      return "PDF";
    case "doc":
    case "docx":
      return "Word";
    case "ppt":
    case "pptx":
      return "PowerPoint";
    case "xls":
    case "xlsx":
      return "Excel";
    default:
      return ext?.toUpperCase() || "File";
  }
};

// Return only valid color values for UBadge component
const getDocumentColor = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf":
      return "red";
    case "doc":
    case "docx":
      return "blue";
    case "ppt":
    case "pptx":
      return "orange";
    case "xls":
    case "xlsx":
      return "green";
    default:
      return "gray";
  }
};

// Get icon based on link provider
const getLinkProviderIcon = (url: string): string => {
  if (!url) return "i-heroicons-link";

  if (url.includes("drive.google.com")) return "i-heroicons-cloud";
  if (url.includes("dropbox.com")) return "i-heroicons-cloud";
  if (url.includes("onedrive")) return "i-heroicons-cloud";
  if (url.includes("sharepoint")) return "i-heroicons-cloud";

  return "i-heroicons-link";
};

// Get provider name based on URL
const getLinkProviderName = (url: string): string => {
  if (!url) return "Link";

  if (url.includes("drive.google.com")) return "Google Drive";
  if (url.includes("dropbox.com")) return "Dropbox";
  if (url.includes("onedrive")) return "OneDrive";
  if (url.includes("sharepoint")) return "SharePoint";
  if (url.includes("box.com")) return "Box";

  return "Web Link";
};

// Extract filename from URL
const getFileNameFromUrl = (url: string): string => {
  if (!url) return "Unknown File";

  try {
    // Try to extract filename from URL
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split("/").pop();

    if (filename) {
      // Remove query parameters
      return filename.split("?")[0] ?? filename;
    }
  } catch (e) {
    // Silent fail for invalid URLs
  }

  return "Document Link";
};

// Get image source from File object
const getImageSrc = (image: File): string => {
  // In a real app, you would have a URL for the uploaded file
  // For this demo, we'll return a placeholder
  return "https://placehold.co/300x300?text=Image+Content";
};

const getDocumentIconColor = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf":
      return "text-red-500";
    case "doc":
    case "docx":
      return "text-blue-500";
    case "ppt":
    case "pptx":
      return "text-orange-500";
    case "xls":
    case "xlsx":
      return "text-green-500";
    default:
      return "text-gray-500";
  }
};

const getResourceIcon = (type: string): string => {
  switch (type?.toLowerCase()) {
    case "document":
      return "i-heroicons-document-text";
    case "image":
      return "i-heroicons-photo";
    case "video":
      return "i-heroicons-video-camera";
    case "link":
      return "i-heroicons-link";
    default:
      return "i-heroicons-paper-clip";
  }
};

const getResourceIconColor = (type: string): string => {
  switch (type?.toLowerCase()) {
    case "document":
      return "text-blue-500";
    case "image":
      return "text-green-500";
    case "video":
      return "text-red-500";
    case "link":
      return "text-purple-500";
    default:
      return "text-gray-500";
  }
};

const getResourceColor = (
  type: string
): "red" | "blue" | "green" | "yellow" | "purple" | "gray" => {
  switch (type?.toLowerCase()) {
    case "document":
      return "blue";
    case "image":
      return "green";
    case "video":
      return "red";
    case "link":
      return "purple";
    default:
      return "gray";
  }
};

const formatResourceType = (type: string): string => {
  return (
    type?.charAt(0).toUpperCase() + type?.slice(1).toLowerCase() || "Resource"
  );
};
</script>
