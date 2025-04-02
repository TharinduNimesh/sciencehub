<template>
  <USlideover
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :ui="{
      width: 'sm:max-w-lg',
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
              {{ isEditing ? 'Edit Lesson' : 'Add New Lesson' }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ isEditing ? 'Update the lesson details' : 'Create a new lesson recording or resource' }}
            </p>
          </div>
        </div>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark-20-solid"
          class="flex-none"
          @click="$emit('update:modelValue', false)"
        />
      </div>
    </div>

    <!-- Form Content -->
    <div class="flex-1 px-6 py-5 overflow-y-auto">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Video URL (moved to top for better UX) -->
        <UFormGroup label="Video URL" required>
          <UInput
            v-model="form.videoUrl"
            placeholder="Enter YouTube video URL"
            icon="i-heroicons-link"
            :disabled="isEditing"
            @update:model-value="handleVideoUrlChange"
            :loading="isLoadingVideoData"
          />
          <p v-if="!isEditing" class="text-xs text-gray-500 mt-1">
            Enter a YouTube URL to auto-fill lesson details
          </p>
        </UFormGroup>

        <UFormGroup label="Lesson Title" required>
          <UInput
            v-model="form.title"
            placeholder="Title will be loaded automatically"
            :disabled="isLoadingVideoData"
          />
        </UFormGroup>

        <UFormGroup label="Class" required>
          <USelectMenu
            v-model="form.classId"
            :options="classOptions"
            placeholder="Select class"
            value-attribute="id"
            option-attribute="name"
            icon="i-heroicons-academic-cap"
          />
        </UFormGroup>

        <UFormGroup
          label="Description"
          help="Provide a brief summary of what students will learn"
        >
          <UTextarea
            v-model="form.description"
            placeholder="Enter lesson description"
            :ui="{
              height: 'h-24',
              base: 'block w-full rounded-md text-gray-900 dark:text-white shadow-sm',
            }"
          />
        </UFormGroup>

        <UFormGroup label="Duration (minutes)" required>
          <UInput
            v-model="form.duration"
            type="number"
            placeholder="Duration will be set automatically"
            min="1"
            icon="i-heroicons-clock"
            :disabled="isLoadingVideoData"
          />
        </UFormGroup>

        <!-- Thumbnail preview -->
        <UFormGroup label="Thumbnail">
          <div class="aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
            <img
              :src="form.thumbnailUrl || defaultThumbnail"
              :alt="form.title"
              draggable="false"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
          </div>
          <p class="text-xs text-gray-500 mt-1">Thumbnail is automatically generated from the video</p>
        </UFormGroup>
      </form>
    </div>

    <!-- Footer -->
    <div
      class="flex-none px-6 py-5 border-t border-gray-200 dark:border-gray-800"
    >
      <div class="flex justify-end gap-3">
        <UButton
          color="gray"
          variant="ghost"
          label="Cancel"
          @click="$emit('update:modelValue', false)"
        />
        <UButton
          color="primary"
          :loading="isSubmitting"
          :disabled="isSubmitting || (form.videoUrl && !isYoutubeUrl(form.videoUrl)) || isLoadingVideoData"
          :label="isEditing ? 'Update Lesson' : 'Add Lesson'"
          :icon="isEditing ? 'i-heroicons-check' : 'i-heroicons-plus'"
          @click="handleSubmit"
        />
      </div>
    </div>
  </USlideover>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";

// Define default thumbnail for consistency across the app
const defaultThumbnail = ref("https://placehold.co/800x450?text=No+Thumbnail");

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  editData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'add']);

const isSubmitting = ref(false);
const isLoadingVideoData = ref(false);
const form = ref({
  title: "New Lesson",
  description: "",
  classId: undefined as string | number | undefined,
  videoUrl: "",
  thumbnailUrl: "",
  duration: 30,
});

// Sample class options - In a real app, these would come from an API
const classOptions = ref([
  { id: 1, name: "Class A - Physics (Online)", type: "online" },
  { id: 2, name: "Class B - Chemistry (Physical)", type: "physical" },
  { id: 3, name: "Class C - Biology (Online)", type: "online" },
  { id: 4, name: "Class D - Mathematics (Physical)", type: "physical" }
]);

// Reset or populate form when modal opens/closes or when editData changes
watch(
  [() => props.modelValue, () => props.editData], 
  ([newModelValue, newEditData]) => {
    if (newModelValue && props.isEditing && newEditData) {
      // Populate form with lesson data for editing
      form.value = {
        title: newEditData.title || 'New Lesson',
        description: newEditData.description || '',
        classId: newEditData.classId || undefined,
        videoUrl: newEditData.videoUrl || '',
        thumbnailUrl: newEditData.thumbnailUrl || getYoutubeThumbnail(newEditData.videoUrl),
        duration: newEditData.duration || 30
      };
    } else if (newModelValue && !props.isEditing) {
      // Reset form when opening for new lesson
      form.value = {
        title: "New Lesson",
        description: "",
        classId: undefined,
        videoUrl: "",
        thumbnailUrl: "",
        duration: 30,
      };
    }
  },
  { immediate: true }
);

// Debounce function for URL input
const debounce = (fn, delay) => {
  let timeoutId;
  return function(...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

// Initialize YouTube iframe API
let YT;
onMounted(() => {
  if (import.meta.client && !window.YT) {
    // Add YouTube iframe API script
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }
});

// Handle video URL changes to automatically update thumbnail, title and duration
const handleVideoUrlChange = debounce(async (url: string) => {
  if (!url || !isYoutubeUrl(url)) {
    return;
  }

  try {
    isLoadingVideoData.value = true;

    // Extract video ID
    const videoId = extractYoutubeVideoId(url);
    if (!videoId) return;

    // Set thumbnail immediately
    form.value.thumbnailUrl = getYoutubeThumbnail(url);

    // Fetch video metadata from our API endpoint
    const response = await fetch(`/api/youtube/metadata?url=${encodeURIComponent(url)}`);
    const videoData = await response.json();
    
    if (videoData && !videoData.error) {
      form.value.title = videoData.title;
      
      // Set duration in minutes from the API response
      if (videoData.durationMinutes) {
        form.value.duration = videoData.durationMinutes;
      }
    }
  } catch (error) {
    console.error("Error fetching video data:", error);
    useToast().add({
      title: "Error",
      description: "Failed to fetch video information. Please check the URL and try again.",
      color: "red",
    });
  } finally {
    isLoadingVideoData.value = false;
  }
}, 500);

// Fetch YouTube video metadata using OEmbed API (no API key required)
async function fetchYoutubeMetadata(videoUrl: string) {
  try {
    // Use OEmbed API for title (no API key required)
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
    
    const response = await fetch(oembedUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch OEmbed data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      title: data.title,
      // OEmbed doesn't provide duration, so we don't set it here
      // The application will use a default duration
    };
  } catch (error) {
    console.error('Error fetching YouTube metadata:', error);
    return null;
  }
}

// Check if URL is a YouTube link
const isYoutubeUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be');
};

// Extract YouTube video ID from URL
function extractYoutubeVideoId(url: string): string {
  if (!url) return '';
  
  let videoId = '';
  
  if (url.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    videoId = urlParams.get('v') || '';
  } else if (url.includes('youtu.be')) {
    videoId = url.split('/').pop() || '';
    // Remove any additional parameters
    videoId = videoId.split('?')[0];
  }
  
  return videoId;
}

// Get YouTube thumbnail URL from video URL
function getYoutubeThumbnail(url: string): string {
  if (!url) return defaultThumbnail.value;
  if (!isYoutubeUrl(url)) return defaultThumbnail.value;
  
  const videoId = extractYoutubeVideoId(url);
  if (!videoId) return defaultThumbnail.value;
  
  // Return YouTube thumbnail URL (high quality)
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

const handleImageError = (event: Event) => {
  // Set a fallback image if the provided URL fails to load
  const target = event.target as HTMLImageElement;
  target.src = defaultThumbnail.value;
};

const handleSubmit = async () => {
  if (!form.value.classId) {
    useToast().add({
      title: "Validation Error",
      description: "Please select a class for this lesson",
      color: "red",
    });
    return;
  }

  if (!props.isEditing && !isYoutubeUrl(form.value.videoUrl)) {
    useToast().add({
      title: "Validation Error",
      description: "Please enter a valid YouTube URL",
      color: "red",
    });
    return;
  }

  try {
    isSubmitting.value = true;

    // Make sure to include the automatically generated thumbnail
    if (!form.value.thumbnailUrl && form.value.videoUrl) {
      form.value.thumbnailUrl = getYoutubeThumbnail(form.value.videoUrl);
    }

    // Preserve ID when editing
    const formData = {
      ...form.value,
      id: props.isEditing && props.editData ? props.editData.id : undefined
    };

    emit("add", formData);

    // Close modal
    emit("update:modelValue", false);
  } catch (error) {
    console.error("Error with lesson:", error);
    useToast().add({
      title: "Error",
      description: `Failed to ${props.isEditing ? 'update' : 'add'} lesson. Please try again.`,
      color: "red",
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>
