<template>
  <div class="max-w-5xl mx-auto px-4 py-6 space-y-6">
    <!-- Loading state -->
    <div v-if="isLoading" class="flex justify-center">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center">
      <h3 class="text-lg font-medium text-gray-900">{{ error }}</h3>
      <UButton class="mt-4" icon="i-heroicons-arrow-left" @click="router.push('/console/lessons')">
        Back to Lessons
      </UButton>
    </div>

    <!-- Lesson content -->
    <div v-else-if="lesson">
      <!-- Header with navigation -->
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-semibold text-gray-900">{{ lesson.title }}</h1>
        <UButton 
          color="gray" 
          variant="ghost" 
          icon="i-heroicons-arrow-left" 
          @click="router.push('/console/lessons')"
        >
          Back to Lessons
        </UButton>
      </div>

      <!-- Video Player -->
      <div class="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-lg">
        <template v-if="isYoutubeUrl(lesson.videoUrl)">
          <iframe 
            :src="getYoutubeEmbedUrl(lesson.videoUrl)" 
            class="w-full h-full"
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
          ></iframe>
        </template>
        <template v-else-if="isVimeoUrl(lesson.videoUrl)">
          <iframe 
            :src="getVimeoEmbedUrl(lesson.videoUrl)" 
            class="w-full h-full"
            frameborder="0" 
            allow="autoplay; fullscreen; picture-in-picture" 
            allowfullscreen
          ></iframe>
        </template>
        <template v-else>
          <div class="w-full h-full flex items-center justify-center bg-gray-900">
            <UButton
              color="primary"
              icon="i-heroicons-arrow-top-right-on-square"
              @click="openExternalVideo(lesson.videoUrl)"
            >
              Open Video
            </UButton>
          </div>
        </template>
      </div>

      <!-- Lesson details -->
      <div class="mt-6 space-y-4">
        <!-- Description if available -->
        <div v-if="lesson.description" class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-lg font-medium mb-2">Description</h3>
          <p class="text-gray-700">{{ lesson.description }}</p>
        </div>
        
        <!-- Metadata -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="lesson.subject" class="bg-white border rounded-lg p-4">
            <div class="text-sm text-gray-500">Subject</div>
            <div class="font-medium">{{ lesson.subject }}</div>
          </div>
          
          <div v-if="lesson.grade" class="bg-white border rounded-lg p-4">
            <div class="text-sm text-gray-500">Grade</div>
            <div class="font-medium">{{ lesson.grade }}</div>
          </div>
          
          <div v-if="lesson.duration" class="bg-white border rounded-lg p-4">
            <div class="text-sm text-gray-500">Duration</div>
            <div class="font-medium">{{ lesson.duration }} minutes</div>
          </div>
          
          <div v-if="lesson.createdAt" class="bg-white border rounded-lg p-4">
            <div class="text-sm text-gray-500">Created</div>
            <div class="font-medium">{{ formatDate(lesson.createdAt) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Page meta
definePageMeta({ layout: "console" });

// Types
interface Lesson {
  id: number;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl: string;
  classId?: number;
  grade?: number;
  subject?: string;
  duration?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Composables
const route = useRoute();
const router = useRouter();
const { showSuccess, showError } = useNotification();

// States
const isLoading = ref(true);
const error = ref('');
const lesson = ref<Lesson | null>(null);
const defaultThumbnail = ref("https://placehold.co/800x450?text=No+Thumbnail");

// Computed
const lessonId = computed(() => {
  const id = route.params.id;
  if (!id || Array.isArray(id)) {
    return null;
  }
  return parseInt(id as string, 10);
});

// Mock lessons data (in a real app, fetch from API)
const mockLessons: Lesson[] = [
  {
    id: 1,
    title: "Introduction to Chemical Bonds",
    description: "Learn about the fundamental concepts of chemical bonding and molecular structures.",
    videoUrl: "https://www.youtube.com/watch?v=LICeBJKjzI0",
    thumbnailUrl: "https://img.youtube.com/vi/LICeBJKjzI0/hqdefault.jpg",
    subject: "Chemistry",
    grade: 10,
    duration: 45,
    createdAt: "2023-11-10T14:00:00Z",
  },
  {
    id: 2,
    title: "Physics 101: Forces and Motion",
    description: "An introduction to Newton's laws of motion and fundamental forces.",
    videoUrl: "https://www.youtube.com/watch?v=ZM8ECpBuQYE",
    thumbnailUrl: "https://img.youtube.com/vi/ZM8ECpBuQYE/hqdefault.jpg",
    subject: "Physics",
    grade: 10,
    duration: 52,
    createdAt: "2023-11-15T10:30:00Z",
  }
];

// Methods
const fetchLesson = async () => {
  isLoading.value = true;
  error.value = '';
  
  try {
    // Validate lesson ID
    if (!lessonId.value) {
      error.value = 'Invalid lesson ID';
      return;
    }
    
    // In a real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find lesson by ID from mock data
    const foundLesson = mockLessons.find(l => l.id === lessonId.value);
    
    if (foundLesson) {
      lesson.value = { ...foundLesson };
    } else {
      error.value = 'Lesson not found';
    }
  } catch (err) {
    console.error('Error fetching lesson:', err);
    error.value = 'Failed to load lesson data';
  } finally {
    isLoading.value = false;
  }
};

// Video helpers
const isYoutubeUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
};

const getYoutubeEmbedUrl = (url: string): string => {
  if (!url) return '';
  
  let videoId = '';
  if (url.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    videoId = urlParams.get('v') || '';
  } else if (url.includes('youtu.be')) {
    videoId = url.split('/').pop() || '';
  }
  
  return `https://www.youtube.com/embed/${videoId}`;
};

const isVimeoUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes('vimeo.com');
};

const getVimeoEmbedUrl = (url: string): string => {
  if (!url) return '';
  
  const videoId = url.split('/').pop() || '';
  return `https://player.vimeo.com/video/${videoId}`;
};

const openExternalVideo = (url: string): void => {
  if (url) {
    window.open(url, '_blank');
  }
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Lifecycle
onMounted(() => {
  try {
    fetchLesson();
  } catch (err) {
    console.error('Error in lesson page initialization:', err);
    error.value = 'An unexpected error occurred';
  }
});
</script>
