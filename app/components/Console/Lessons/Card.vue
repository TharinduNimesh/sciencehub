<template>
  <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md group">
    <!-- Thumbnail with overlay -->
    <div class="relative aspect-video overflow-hidden">
      <img 
        :src="lesson.thumbnailUrl || defaultThumbnail" 
        :alt="lesson.title" 
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
        @error="handleImageError"
      />
      
      <!-- Overlay with play button -->
      <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <UButton 
          color="white" 
          variant="solid"
          icon="i-heroicons-play"
          :ui="{ rounded: 'rounded-full' }"
          class="scale-90 group-hover:scale-100 transition-transform duration-300"
          @click="$emit('view', lesson)"
        />
      </div>

      <!-- Duration badge -->
      <div class="absolute bottom-2 right-2 bg-black/70 text-white text-xs py-1 px-2 rounded-md">
        {{ formatDuration(lesson.duration) }}
      </div>

      <!-- Grade badge -->
      <div class="absolute top-2 left-2 bg-primary-500/90 text-white text-xs py-1 px-2 rounded-md">
        Grade {{ lesson.grade }}
      </div>
    </div>
    
    <!-- Content -->
    <div class="p-4">
      <div class="flex justify-between items-start mb-2">
        <h3 class="font-medium text-gray-900 line-clamp-1">{{ lesson.title }}</h3>
        <UDropdown :items="dropdownItems" :disabled="processing">
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-ellipsis-vertical"
            :ui="{ rounded: 'rounded-full' }"
            :disabled="processing"
            :loading="processing"
          />
        </UDropdown>
      </div>
      <p class="text-sm text-gray-500 line-clamp-2 mb-3">{{ lesson.description }}</p>
      
      <!-- Footer -->
      <div class="flex items-center justify-between text-xs text-gray-500 mt-2">
        <span>{{ formatDate(lesson.createdAt) }}</span>
        <UBadge color="gray" variant="soft" size="xs">{{ lesson.subject }}</UBadge>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

// Define a default thumbnail image URL to use when no image is available or when the image fails to load
const defaultThumbnail = ref('https://placehold.co/800x450?text=No+Thumbnail');

const props = defineProps({
  lesson: {
    type: Object,
    required: true
  },
  processing: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits<{
  view: [lesson: any]
  edit: [lesson: any]
  delete: [lesson: any]
}>();

// Handle image loading error
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  // Set fallback image for broken/missing images
  target.src = defaultThumbnail.value;
};

// Format duration from minutes to MM:SS
const formatDuration = (minutes: number) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}`;
  }
  return `${mins}:00`;
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Dropdown menu items
const dropdownItems = computed(() => {
  return [
    [
      {
        label: 'View Lesson',
        icon: 'i-heroicons-eye',
        click: () => emit('view', props.lesson)
      }
    ],
    [
      {
        label: 'Edit',
        icon: 'i-heroicons-pencil-square',
        click: () => emit('edit', props.lesson)
      },
      {
        label: 'Delete',
        icon: 'i-heroicons-trash',
        color: 'red',
        click: () => emit('delete', props.lesson)
      }
    ]
  ]
});
</script>
