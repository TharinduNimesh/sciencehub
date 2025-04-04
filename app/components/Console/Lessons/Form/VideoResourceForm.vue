<template>
  <div>
    <UFormGroup label="YouTube Video URL" required>
      <UInput
        v-model="videoUrl"
        placeholder="Enter YouTube video URL"
        icon="i-heroicons-link"
        :disabled="disabled"
        @update:model-value="handleVideoUrlChange"
        :loading="loading"
      />
      <p v-if="!disabled" class="text-xs text-gray-500 mt-1">
        Enter a YouTube URL to auto-fill lesson details and set the thumbnail
      </p>
    </UFormGroup>

    <!-- Enhanced Thumbnail preview -->
    <UFormGroup label="Lesson Thumbnail">
      <div class="relative">
        <div class="aspect-video w-full overflow-hidden rounded-lg bg-gray-100 shadow-sm border border-gray-200">
          <img
            :src="thumbnailUrl || defaultThumbnail"
            :alt="title"
            draggable="false"
            class="w-full h-full object-cover"
            @error="handleImageError"
          />
        </div>
      </div>
      
      <p class="text-xs text-gray-700 mt-2 flex items-center">
        <UIcon name="i-heroicons-information-circle" class="mr-1 text-primary-500" />
        This thumbnail will be displayed on the lesson card
      </p>
    </UFormGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  videoUrl: {
    type: String,
    default: ''
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: 'Video'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  defaultThumbnail: {
    type: String,
    default: 'https://placehold.co/800x450?text=No+Thumbnail'
  }
});

const emit = defineEmits(['update:videoUrl', 'video-url-change']);

// Local videoUrl ref for v-model binding - define before the watch
const videoUrl = ref(props.videoUrl);

// Watch for videoUrl changes from parent
watch(() => props.videoUrl, (newUrl) => {
  if (newUrl !== videoUrl.value) {
    videoUrl.value = newUrl;
  }
}, { immediate: true });

// Watch for local changes and emit to parent
watch(videoUrl, (newUrl) => {
  emit('update:videoUrl', newUrl);
});

// Emit video url change for parent to handle metadata fetching
const handleVideoUrlChange = (url: string) => {
  emit('video-url-change', url);
};

// Handle image loading errors
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = props.defaultThumbnail;
};
</script>