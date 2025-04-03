<template>
  <div class="h-full space-y-8">
    <div class="bg-white rounded-lg shadow-sm p-6 lg:p-8">
      <!-- Back Button -->
      <div class="mb-6">
        <NuxtLink
          to="/console/lessons"
          class="text-primary-500 hover:underline flex items-center"
        >
          <UIcon name="i-heroicons-arrow-left" class="mr-1" />
          Back to Lessons
        </NuxtLink>
      </div>

      <div v-if="loading" class="space-y-4">
        <USkeleton class="h-[400px] w-full rounded-lg mb-6" />
        <USkeleton class="h-10 w-3/4 mb-4" />
        <USkeleton class="h-6 w-1/2 mb-4" />
        <USkeleton class="h-24 w-full" />
      </div>

      <div v-else>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Column: Video Player and Details -->
          <div class="lg:col-span-2">
            <!-- Video Player Section -->
            <div class="bg-gray-900 rounded-lg overflow-hidden mb-6">
              <!-- <video v-if="lesson" class="h-full w-full rounded-lg" controls>
                <source
                  :src="getYouTubeEmbedUrl(lesson.videoUrl)"
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video> -->
              <iframe
                v-if="lesson"
                :src="getYouTubeEmbedUrl(lesson.videoUrl)"
                class="w-full h-[400px] rounded-lg"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>

            <!-- Lesson Details -->
            <div class="flex justify-between items-start mb-4">
              <div>
                <h1 class="text-2xl font-bold">{{ lesson?.title }}</h1>
                <div class="flex items-center gap-3 mt-2">
                  <UBadge color="primary" variant="soft">
                    {{ lesson?.className }}
                  </UBadge>
                  <UBadge color="gray" variant="soft">
                    {{ formatDuration(lesson?.duration || 0) }}
                  </UBadge>
                  <span class="text-sm text-gray-500 flex items-center">
                    <UIcon name="i-heroicons-calendar" class="mr-1" />
                    {{ formatDate(lesson?.createdAt || "") }}
                  </span>
                </div>
              </div>
              <UButton
                v-if="lesson"
                color="gray"
                variant="soft"
                icon="i-heroicons-pencil-square"
                @click="navigateToEdit(lesson)"
                :ui="{ rounded: 'rounded-full' }"
              >
                Edit
              </UButton>
            </div>
          </div>

          <!-- Right Column: Related Lessons and Data -->
          <div class="lg:col-span-1">
            <!-- Description Card -->
            <div class="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-6">
              <h3 class="font-medium mb-4">Description</h3>
              <div class="space-y-3">
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-gray-700">{{ lesson?.description }}</p>
                </div>
              </div>
            </div>

            <!-- Related Lessons -->
            <div class="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <h3 class="font-medium mb-4">Related Lessons</h3>
              <div v-if="relatedLessons.length" class="space-y-3">
                <div
                  v-for="relatedLesson in relatedLessons"
                  :key="relatedLesson.id"
                  class="flex gap-3 group cursor-pointer bg-white p-2 rounded-lg hover:bg-gray-100 transition"
                  @click="navigateToLesson(relatedLesson.id)"
                >
                  <div
                    class="w-20 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0"
                  >
                    <img
                      :src="relatedLesson.thumbnailUrl"
                      :alt="relatedLesson.title"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4
                      class="font-medium text-sm line-clamp-2 group-hover:text-primary-500"
                    >
                      {{ relatedLesson.title }}
                    </h4>
                    <p class="text-xs text-gray-500">
                      {{ formatDuration(relatedLesson.duration) }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-else class="text-sm text-gray-500 text-center py-4">
                No related lessons found
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

const route = useRoute();
const router = useRouter();
const lessonId = computed(() => Number(route.params.id));
const loading = ref(true);
const lesson = ref<Lesson | null>(null);
const allLessons = ref<Lesson[]>([]);

// Get related lessons from the same class
const relatedLessons = computed(() => {
  if (!lesson.value) return [];
  return allLessons.value
    .filter(
      (l) => l.classId === lesson.value?.classId && l.id !== lesson.value?.id
    )
    .slice(0, 3);
});

// Fetch data
onMounted(async () => {
  try {
    // Simulate API call - in a real app you'd fetch from an API
    setTimeout(() => {
      const mockLessons = [
        {
          id: 1,
          title: "Introduction to Acids and Bases",
          description:
            "Learn the fundamentals of acids and bases in chemistry. This lesson covers pH scale, neutralization reactions, and examples of common acids and bases in everyday life.",
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
            "Comprehensive overview of Newton's three laws of motion and how they apply to everyday situations. This lesson includes practical examples and demonstrations.",
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
          description:
            "Explore the basic unit of life - the cell. This lesson covers cell organelles, cell membrane, and differences between plant and animal cells.",
          duration: 55,
          classId: 3,
          className: "Biology Class C",
          thumbnailUrl: "https://img.youtube.com/vi/8IlzKri08kk/hqdefault.jpg",
          videoUrl: "https://www.youtube.com/watch?v=8IlzKri08kk",
          createdAt: "2023-10-01T09:15:00",
        },
        {
          id: 4,
          title: "Chemical Bonding Basics",
          description:
            "Introduction to chemical bonds, types of bonds, and how they affect the properties of substances.",
          duration: 40,
          classId: 2,
          className: "Chemistry Class B",
          thumbnailUrl: "https://img.youtube.com/vi/V6lMdlPGDsY/hqdefault.jpg",
          videoUrl: "https://www.youtube.com/watch?v=V6lMdlPGDsY",
          createdAt: "2023-09-29T13:15:00",
        },
        {
          id: 5,
          title: "Understanding pH and Indicators",
          description:
            "Deeper dive into pH measurement, acid-base indicators and their color changes.",
          duration: 35,
          classId: 2,
          className: "Chemistry Class B",
          thumbnailUrl: "https://img.youtube.com/vi/ckbsHM2igT0/hqdefault.jpg",
          videoUrl: "https://www.youtube.com/watch?v=ckbsHM2igT0",
          createdAt: "2023-10-06T11:20:00",
        },
      ];

      allLessons.value = mockLessons;
      lesson.value = mockLessons.find((l) => l.id === lessonId.value) || null;
      loading.value = false;
    }, 1000);
  } catch (error) {
    console.error("Error fetching lesson:", error);
    loading.value = false;
  }
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

const navigateToLesson = (id: number) => {
  router.push(`/console/lessons/${id}`);
};

const navigateToEdit = (lesson: Lesson) => {
  // You could either implement in-page editing or navigate to an edit page
  // For now, we'll just log it
  console.log("Editing lesson:", lesson);
  // In a real implementation, you might do:
  // router.push(`/console/lessons/${lesson.id}/edit`);
};
</script>
