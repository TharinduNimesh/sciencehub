<template>
  <div class="relative aspect-square rounded-md overflow-hidden group">
    <!-- Image preview -->
    <img
      :src="imageSrc"
      class="w-full h-full object-cover"
      @error="handleImageError"
      loading="lazy"
      :alt="isLinked ? 'Linked image preview' : 'Image preview'"
    />

    <!-- Overlay with delete button -->
    <div
      class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center"
    >
      <UButton
        color="red"
        variant="solid"
        icon="i-heroicons-trash"
        size="xs"
        class="opacity-0 group-hover:opacity-100"
        @click="$emit('remove', index)"
      />
    </div>
    
    <!-- Badge for linked images -->
    <UBadge 
      v-if="isLinked"
      color="blue" 
      size="xs" 
      class="absolute top-1 right-1"
    >
      Linked
    </UBadge>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, onBeforeUnmount } from 'vue';

// Define props
const props = defineProps({
  // For File objects
  image: {
    type: Object as () => File,
    default: null
  },
  // For image URLs
  imageUrl: {
    type: String,
    default: ''
  },
  index: {
    type: Number,
    required: true
  },
  isLinked: {
    type: Boolean,
    default: false
  }
});

// Emit events
defineEmits(['remove']);

// Track object URL to clean up later
const objectUrl = ref('');

// Compute the source for the image
const imageSrc = computed(() => {
  if (props.imageUrl) {
    return props.imageUrl;
  }
  
  if (props.image && objectUrl.value) {
    return objectUrl.value;
  }
  
  return 'https://placehold.co/300x300?text=Loading...';
});

// Create object URL for File objects
onMounted(() => {
  if (props.image instanceof File) {
    try {
      objectUrl.value = URL.createObjectURL(props.image);
    } catch (e) {
      console.error('Error creating object URL', e);
    }
  }
});

// Clean up object URL when component is destroyed
onBeforeUnmount(() => {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value);
  }
});

// Handle image loading errors
function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  target.src = 'https://placehold.co/300x300?text=Invalid+Image';
}
</script>