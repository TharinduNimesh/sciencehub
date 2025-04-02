<template>
  <USlideover
    :model-value="isOpen"
    @update:model-value="emit('update:modelValue', $event)"
    :ui="{
      width: 'sm:max-w-3xl',
      overlay: { background: 'bg-gray-950/50' },
      background: 'bg-white dark:bg-gray-900',
      padding: 'p-0',
      base: 'relative z-50 flex flex-col h-screen shadow-xl',
    }"
  >
    <!-- Header -->
    <div
      class="flex-none px-6 py-5 border-b border-gray-200 dark:border-gray-800"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-video-camera" class="w-6 h-6 text-primary-500" />
          <div>
            <h3 class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
              {{ lesson?.title }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(lesson?.createdAt) }}
            </p>
          </div>
        </div>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark-20-solid"
          class="flex-none"
          @click="isOpen = false"
        />
      </div>
    </div>

    <!-- Content Section -->
    <div class="flex-1 px-6 py-5 overflow-y-auto space-y-6">
      <!-- Video/Preview Section -->
      <div v-if="lesson" class="aspect-video w-full bg-black rounded-lg overflow-hidden">
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
            <div class="text-center p-6">
              <img 
                :src="lesson.thumbnailUrl || defaultThumbnail" 
                alt="Lesson thumbnail" 
                class="mx-auto max-h-full rounded-lg"
                @error="handleImageError"
              />
              <UButton
                class="mt-4"
                color="primary"
                icon="i-heroicons-arrow-top-right-on-square"
                @click="openExternalVideo(lesson.videoUrl)"
              >
                Open Video
              </UButton>
            </div>
          </div>
        </template>
      </div>

      <!-- Lesson Details -->
      <div v-if="lesson" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="col-span-2 space-y-4">
          <div>
            <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</h4>
            <p class="text-gray-700 dark:text-gray-300">{{ lesson.description }}</p>
          </div>
        </div>
        
        <div class="space-y-4">
          <div>
            <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Details</h4>
            <dl class="divide-y divide-gray-100 dark:divide-gray-800">
              <div class="grid grid-cols-3 gap-1 py-2">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Subject</dt>
                <dd class="text-sm text-gray-900 dark:text-gray-200 col-span-2">{{ lesson.subject }}</dd>
              </div>
              <div class="grid grid-cols-3 gap-1 py-2">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Grade</dt>
                <dd class="text-sm text-gray-900 dark:text-gray-200 col-span-2">{{ lesson.grade }}</dd>
              </div>
              <div class="grid grid-cols-3 gap-1 py-2">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</dt>
                <dd class="text-sm text-gray-900 dark:text-gray-200 col-span-2">{{ formatDuration(lesson.duration) }}</dd>
              </div>
              <div class="grid grid-cols-3 gap-1 py-2">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
                <dd class="text-sm text-gray-900 dark:text-gray-200 col-span-2">{{ formatDate(lesson.createdAt) }}</dd>
              </div>
              <div class="grid grid-cols-3 gap-1 py-2">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Updated</dt>
                <dd class="text-sm text-gray-900 dark:text-gray-200 col-span-2">{{ formatDate(lesson.updatedAt) }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div
      class="flex-none px-6 py-5 border-t border-gray-200 dark:border-gray-800"
    >
      <div class="flex justify-between">
        <UButton 
          color="gray" 
          variant="ghost" 
          label="Close" 
          @click="isOpen = false"
        />
        <div class="flex gap-2">
          <UButton 
            v-if="isAdmin || isModerator" 
            color="gray" 
            icon="i-heroicons-pencil-square"
            label="Edit"
            @click="handleEdit"
          >
          </UButton>
          <UButton 
            color="primary" 
            icon="i-heroicons-bookmark"
            label="Save"
          >
          </UButton>
        </div>
      </div>
    </div>
  </USlideover>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

// Define a default thumbnail image URL to use when no image is available
const defaultThumbnail = ref('https://placehold.co/800x450?text=No+Thumbnail');

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  lesson: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'edit']);
const authStore = useAuthStore();

// Handle image loading error
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = defaultThumbnail.value;
};

// Get user role from auth store
const userRole = computed(() => authStore.getCurrentUserRole());

const isAdmin = computed(() => userRole.value === 'ADMIN');
const isModerator = computed(() => userRole.value === 'MODERATOR');

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Handle edit button click
const handleEdit = () => {
  if (props.lesson) {
    emit('edit', props.lesson);
  }
};

// Format date
const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format duration from minutes to HH:MM
const formatDuration = (minutes?: number) => {
  if (!minutes) return 'N/A';
  
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hrs > 0) {
    return `${hrs} hour${hrs > 1 ? 's' : ''} ${mins > 0 ? `${mins} minute${mins > 1 ? 's' : ''}` : ''}`;
  }
  return `${mins} minute${mins > 1 ? 's' : ''}`;
};

// Helper methods for video embeds
const isYoutubeUrl = (url?: string) => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
};

const getYoutubeEmbedUrl = (url?: string) => {
  if (!url) return '';
  
  // Extract video ID
  let videoId = '';
  if (url.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    videoId = urlParams.get('v') || '';
  } else if (url.includes('youtu.be')) {
    videoId = url.split('/').pop() || '';
  }
  
  return `https://www.youtube.com/embed/${videoId}`;
};

const isVimeoUrl = (url?: string) => {
  if (!url) return false;
  return url.includes('vimeo.com');
};

const getVimeoEmbedUrl = (url?: string) => {
  if (!url) return '';
  
  // Extract video ID
  const videoId = url.split('/').pop() || '';
  return `https://player.vimeo.com/video/${videoId}`;
};

const openExternalVideo = (url?: string) => {
  if (url) {
    window.open(url, '_blank');
  }
};
</script>
