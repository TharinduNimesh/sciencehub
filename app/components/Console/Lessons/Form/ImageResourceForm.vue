<template>
  <UFormGroup label="Image Gallery" required>
    <!-- Toggle between upload and link modes -->
    <div class="flex mb-3 border rounded-md overflow-hidden">
      <UButton
        class="flex-1 rounded-none"
        :color="imageInputMode === 'upload' ? 'primary' : 'gray'"
        :variant="imageInputMode === 'upload' ? 'solid' : 'ghost'"
        label="Upload Images"
        icon="i-heroicons-arrow-up-tray"
        @click="imageInputMode = 'upload'"
      />
      <UButton
        class="flex-1 rounded-none"
        :color="imageInputMode === 'link' ? 'primary' : 'gray'"
        :variant="imageInputMode === 'link' ? 'solid' : 'ghost'"
        label="Add Links"
        icon="i-heroicons-link"
        @click="imageInputMode = 'link'"
      />
    </div>

    <!-- File Upload Section -->
    <div v-if="imageInputMode === 'upload'" class="space-y-4">
      <!-- User-friendly upload area -->
      <div
        class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        @click="triggerFileInputClick"
        @dragover.prevent
        @dragleave.prevent
        @drop.prevent="handleImageDrop"
      >
        <input
          ref="imageFileInput"
          type="file"
          multiple
          class="hidden"
          accept="image/*"
          @change="handleImageSelect"
          :disabled="!imageUploadReady"
        />
        <UIcon
          name="i-heroicons-photo"
          class="mx-auto h-12 w-12 text-gray-400"
        />
        <div class="mt-2">
          <span class="font-medium text-primary-600 dark:text-primary-400">Click to upload</span> or drag and drop
        </div>
        <p class="text-xs text-gray-500">
          JPG, PNG, GIF, etc. (max 5MB each)
        </p>
      </div>

      <template v-if="imageUploadReady">
        <p class="text-sm text-center text-gray-500">
          Or use the standard uploader below:
        </p>
        <UUpload
          v-model="localImages"
          :ui="{ base: 'w-full' }"
          accept="image/*"
          label="Drop images or click to upload"
          description="JPG, PNG, GIF, etc. (max 5MB each)"
          :max-file-size="5 * 1024 * 1024"
          :multiple="true"
          lazy
        />
      </template>
    </div>

    <!-- Image Link Section -->
    <div v-else class="space-y-3">
      <div
        v-for="(link, index) in localImageLinks"
        :key="index"
        class="flex items-center gap-2"
      >
        <UInput
          v-model="localImageLinks[index]"
          placeholder="Enter image URL"
          icon="i-heroicons-photo"
          class="flex-1"
          @blur="validateImageLinkInput(index)"
          lazy
        />
        <UButton
          v-if="index === localImageLinks.length - 1"
          color="primary"
          variant="soft"
          icon="i-heroicons-plus"
          @click="addImageLink"
        />
        <UButton
          v-else
          color="red"
          variant="ghost"
          icon="i-heroicons-trash"
          @click="removeImageLink(index)"
        />
      </div>

      <UAlert
        v-if="localImageLinks.length === 0"
        color="blue"
        icon="i-heroicons-information-circle"
      >
        <template #title>Add Images from Cloud Storage or Web</template>
        <template #default>
          Add links to images from Google Drive, Dropbox, OneDrive, or
          direct image URLs.
          <div class="mt-2">
            <UButton
              color="primary"
              variant="soft"
              icon="i-heroicons-plus"
              size="sm"
              label="Add Image Link"
              @click="addImageLink"
            />
          </div>
        </template>
      </UAlert>
    </div>

    <!-- Image Preview Grid (conditionally rendered) -->
    <div
      v-if="
        (imageUploadReady && localImages.length > 0) || 
        localImageLinks.some((link) => link)
      "
      class="mt-4"
    >
      <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Image Gallery:
      </p>
      
      <!-- Preview grid with lazy loading images -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <!-- Uploaded Images -->
        <template v-if="imageUploadReady">
          <LazyImagePreview
            v-for="(img, index) in localImages"
            :key="`file-${index}`"
            :image="img"
            :index="index"
            @remove="removeImage"
          />
        </template>

        <!-- Linked Images -->
        <LazyImagePreview
          v-for="(link, index) in filteredImageLinks"
          :key="`link-${index}`"
          :image-url="link"
          :index="index"
          is-linked
          @remove="removeImageLink"
        />
      </div>
    </div>
  </UFormGroup>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, markRaw, onMounted, defineAsyncComponent } from 'vue';

// Lazy-loaded component for image previews to improve first render
const LazyImagePreview = defineAsyncComponent(() => import('./ImagePreview.vue'));

const props = defineProps({
  images: {
    type: Array as () => File[],
    default: () => []
  },
  imageLinks: {
    type: Array as () => string[],
    default: () => ['']
  }
});

const emit = defineEmits(['update:images', 'update:imageLinks', 'thumbnail-update']);

// Compute filtered image links for better performance
const filteredImageLinks = computed(() => {
  return localImageLinks.value.filter(link => link.trim());
});

// Local state for v-model binding
const imageInputMode = ref<'upload' | 'link'>('upload');
const localImages = ref<File[]>([]);
const localImageLinks = ref<string[]>([]);
const imageFileInput = ref<HTMLInputElement | null>(null);
const imageUploadReady = ref(false);

// Use mounted lifecycle to defer heavy operations
onMounted(async () => {
  // Use nextTick to ensure the component is fully rendered first
  await nextTick();
  
  // Initialize arrays after component is rendered - this prevents first-load lag
  // Delay slightly for smoother UI rendering
  setTimeout(() => {
    localImages.value = [...props.images];
    localImageLinks.value = [...props.imageLinks];
    imageUploadReady.value = true;
  }, 10);
});

// Wait until component is mounted before reacting to prop changes
watch(() => props.images, (newImages) => {
  if (imageUploadReady.value) {
    localImages.value = [...newImages];
  }
}, { deep: true });

watch(() => props.imageLinks, (newLinks) => {
  if (imageUploadReady.value) {
    localImageLinks.value = [...newLinks];
  }
}, { deep: true });

// Use debounced updates to improve performance
let imagesUpdateTimeout: number | null = null;
watch(localImages, (newImages) => {
  if (!imageUploadReady.value) return;
  
  if (imagesUpdateTimeout) {
    clearTimeout(imagesUpdateTimeout);
  }
  
  imagesUpdateTimeout = window.setTimeout(() => {
    emit('update:images', markRaw(structuredClone(newImages)));
    updateThumbnail();
  }, 300);
}, { deep: true });

let imageLinksUpdateTimeout: number | null = null;
watch(localImageLinks, (newLinks) => {
  if (!imageUploadReady.value) return;
  
  if (imageLinksUpdateTimeout) {
    clearTimeout(imageLinksUpdateTimeout);
  }
  
  imageLinksUpdateTimeout = window.setTimeout(() => {
    emit('update:imageLinks', markRaw([...newLinks]));
    updateThumbnail();
  }, 300);
}, { deep: true });

// Optimized image link handlers
function addImageLink() {
  // Only add if the last link has content
  const lastLink = localImageLinks.value[localImageLinks.value.length - 1];
  if (lastLink && !lastLink.trim()) {
    // Focus on the last input instead
    return;
  }
  
  localImageLinks.value.push('');
  
  // Focus the new input on the next render cycle
  nextTick(() => {
    const inputs = document.querySelectorAll('input[placeholder="Enter image URL"]');
    const lastInput = inputs[inputs.length - 1];
    if (lastInput) {
      (lastInput as HTMLInputElement).focus();
    }
  });
}

function removeImageLink(index: number) {
  localImageLinks.value.splice(index, 1);
  if (localImageLinks.value.length === 0) {
    addImageLink(); // Always keep at least one empty link input
  }
  updateThumbnail();
}

// Optimized image handling with batch processing
function removeImage(index: number) {
  localImages.value.splice(index, 1);
  updateThumbnail();
}

// Process files in batches for better performance
function handleImageSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  
  // Show processing indicator for many files
  const files = Array.from(target.files);
  if (files.length > 5) {
    useToast().add({
      title: "Processing Images",
      description: `Processing ${files.length} images...`,
      color: "blue",
      timeout: 2000
    });
  }
  
  // Process files in batches for better UI responsiveness
  processFiles(files);
  
  // Reset input for next selection
  target.value = '';
}

function handleImageDrop(event: DragEvent) {
  if (!event.dataTransfer) return;
  
  const files = Array.from(event.dataTransfer.files);
  processFiles(files);
}

// Process files in batches to prevent UI freezing
function processFiles(files: File[]) {
  // Use a small batch size for smoother processing
  const batchSize = 3;
  
  // Process each batch with a small delay between them
  const processBatch = (startIndex: number) => {
    const batch = files.slice(startIndex, startIndex + batchSize);
    
    if (batch.length === 0) return;
    
    // Filter valid images
    const validFiles = batch.filter(isValidImage);
    
    if (validFiles.length > 0) {
      // Add to local files
      localImages.value = [...localImages.value, ...validFiles];
    }
    
    // Process next batch if there are more files
    if (startIndex + batchSize < files.length) {
      // Use small timeout to prevent UI freezing
      setTimeout(() => processBatch(startIndex + batchSize), 10);
    }
  };
  
  // Start with the first batch
  processBatch(0);
}

// Fast validation for better performance
function isValidImage(file: File): boolean {
  // Quick check file type
  const isImage = file.type.startsWith('image/');
  
  // Check file size
  const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
  
  // Show errors for invalid files
  if (!isImage) {
    useToast().add({
      title: "Invalid File Type",
      description: `${file.name} is not an image file.`,
      color: "red"
    });
  }
  
  if (!isValidSize) {
    useToast().add({
      title: "File Too Large",
      description: `${file.name} exceeds the 5MB size limit.`,
      color: "red"
    });
  }
  
  return isImage && isValidSize;
}

// Validate links only on blur to improve performance
function validateImageLinkInput(index: number) {
  const link = localImageLinks.value[index] ?? '';
  
  if (link.trim() && !isValidImageLink(link)) {
    useToast().add({
      title: "Invalid URL format",
      description: "Please enter a valid image URL starting with http:// or https://",
      color: "yellow",
    });
  }
}

// Simple URL validation
function isValidImageLink(url: string): boolean {
  if (!url.trim()) return false;
  return url.includes('://') || 
         url.startsWith('http://') || 
         url.startsWith('https://') || 
         url.startsWith('data:image/');
}

// Optimized thumbnail update with throttling to reduce overhead
// Completely disabled - we no longer want images to affect the thumbnail
function updateThumbnail() {
  // Disabled - all thumbnails now come from YouTube videos only
  // No longer emitting thumbnail-update events
  return;
}

// Safe method to trigger file input click with proper typing
function triggerFileInputClick() {
  if (imageUploadReady.value && imageFileInput.value) {
    imageFileInput.value.click();
  }
}
</script>