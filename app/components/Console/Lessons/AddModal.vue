<template>
  <USlideover
    :model-value="modelValue"
    @update:model-value="$emit('update:model-value', $event)"
    :ui="{
      width: 'sm:max-w-lg',
      overlay: { background: 'bg-gray-950/50' },
      background: 'bg-white dark:bg-gray-900',
      padding: 'p-0',
      base: 'relative z-50 flex flex-col h-screen shadow-xl',
    }"
    @before-enter="handleBeforeEnter"
    @after-leave="handleAfterLeave"
    :prevent-close="isSubmitting || isLoadingVideoData"
  >
    <!-- Header -->
    <div
      class="flex-none px-6 py-5 border-b border-gray-200 dark:border-gray-800"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <UIcon
            name="i-heroicons-video-camera"
            class="w-6 h-6 text-primary-500"
          />
          <div>
            <h3
              class="text-lg font-semibold leading-6 text-gray-900 dark:text-white"
            >
              {{ isEditing ? "Edit Lesson" : "Add New Lesson" }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{
                isEditing
                  ? "Update the lesson details"
                  : "Create a new lesson recording or resource"
              }}
            </p>
          </div>
        </div>
        <UButton
          ref="closeButtonRef"
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark-20-solid"
          class="flex-none"
          @click="$emit('update:model-value', false)"
        />
      </div>
    </div>

    <!-- Form Content -->
    <div class="flex-1 px-6 py-5 overflow-y-auto">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Resource Type Selection -->
        <ResourceTypeSelector
          v-model="form.resourceType"
          @update:model-value="handleResourceTypeChange"
        />

        <!-- Resource-specific Forms -->
        <VideoResourceForm
          v-if="form.resourceType === 'video'"
          v-model:video-url="form.videoUrl"
          :thumbnail-url="form.thumbnailUrl"
          :title="form.title"
          :disabled="isEditing"
          :loading="isLoadingVideoData"
          @video-url-change="handleVideoUrlChange"
        />

        <DocumentResourceForm
          v-if="form.resourceType === 'document'"
          v-model:documents="form.documents"
          v-model:document-links="form.documentLinks"
        />

        <ImageResourceForm
          v-if="form.resourceType === 'image'"
          v-model:images="form.images"
          v-model:image-links="form.imageLinks"
          @thumbnail-update="updateImageThumbnail"
        />

        <!-- Common Form Fields -->
        <LessonFormFields
          v-model:title="form.title"
          v-model:description="form.description"
          v-model:class-id="form.classId"
          v-model:duration="form.duration"
          :loading="isLoadingVideoData"
          :error="metadataError"
          :class-options="classOptions"
        />
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
          @click="$emit('update:model-value', false)"
        />
        <UButton
          ref="submitButtonRef"
          color="primary"
          :loading="isSubmitting"
          :disabled="
            isSubmitting ||
            (form.resourceType === 'video' && form.videoUrl && !isYoutubeUrl(form.videoUrl)) ||
            isLoadingVideoData
          "
          :label="isEditing ? 'Update Lesson' : 'Add Lesson'"
          :icon="isEditing ? 'i-heroicons-check' : 'i-heroicons-plus'"
          @click="handleSubmit"
        />
      </div>
    </div>
  </USlideover>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from "vue";
import ResourceTypeSelector from './Form/ResourceTypeSelector.vue';
import VideoResourceForm from './Form/VideoResourceForm.vue';
import DocumentResourceForm from './Form/DocumentResourceForm.vue';
import ImageResourceForm from './Form/ImageResourceForm.vue';
import LessonFormFields from './Form/LessonFormFields.vue';
import { 
  isYoutubeUrl, 
  extractYoutubeVideoId, 
  getYoutubeThumbnail, 
  getResourceTypeThumbnail, 
  debounce, 
  fetchYoutubeMetadata, 
  estimateVideoDuration 
} from '../../../composables/useLesson';

// Define default thumbnail for consistency across the app
const defaultThumbnail = "https://placehold.co/800x450?text=No+Thumbnail";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
  editData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:model-value", "add"]);

const isSubmitting = ref(false);
const isLoadingVideoData = ref(false);
const metadataError = ref<string | null>(null);

// Add refs for focus management
const closeButtonRef = ref<HTMLButtonElement | null>(null);
const submitButtonRef = ref<HTMLButtonElement | null>(null);
const previousFocus = ref<HTMLElement | null>(null);

// Enhanced form with link support
const form = ref({
  title: "New Lesson",
  description: "",
  classId: undefined as string | number | undefined,
  resourceType: "video", // Default to video type
  videoUrl: "",
  thumbnailUrl: "",
  duration: 30,
  documents: [] as File[], // For document uploads
  documentLinks: [{ url: "", name: "" }], // For document links
  images: [] as File[], // For image uploads
  imageLinks: [""], // For image links
});

// Sample class options - In a real app, these would come from an API
const classOptions = ref([
  { id: 1, name: "Class A - Physics (Online)", type: "online" },
  { id: 2, name: "Class B - Chemistry (Physical)", type: "physical" },
  { id: 3, name: "Class C - Biology (Online)", type: "online" },
  { id: 4, name: "Class D - Mathematics (Physical)", type: "physical" },
]);

// Focus management handlers
const handleBeforeEnter = () => {
  // Store the currently focused element before opening the modal
  previousFocus.value = document.activeElement as HTMLElement;
};

const handleAfterLeave = () => {
  // Return focus to the previously focused element
  if (previousFocus.value && typeof previousFocus.value.focus === 'function') {
    nextTick(() => {
      previousFocus.value?.focus();
    });
  }
};

// Set initial focus when modal opens
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      // Focus on close button after modal is opened
      if (closeButtonRef.value) {
        closeButtonRef.value.focus();
      }
    });
  }
}, { immediate: true });

// Reset or populate form when modal opens/closes or when editData changes
watch(
  [() => props.modelValue, () => props.editData],
  ([newModelValue, newEditData]) => {
    if (newModelValue && props.isEditing && newEditData) {
      // Populate form with lesson data for editing
      form.value = {
        title: newEditData.title || "New Lesson",
        description: newEditData.description || "",
        classId: newEditData.classId || undefined,
        resourceType: newEditData.resourceType || "video",
        videoUrl: newEditData.videoUrl || "",
        thumbnailUrl:
          newEditData.thumbnailUrl ||
          (newEditData.resourceType === "video"
            ? getYoutubeThumbnail(newEditData.videoUrl)
            : getResourceTypeThumbnail(newEditData.resourceType || "video")),
        duration: newEditData.duration || 30,
        documents: newEditData.documents || [],
        documentLinks: newEditData.documentLinks || [{ url: "", name: "" }],
        images: newEditData.images || [],
        imageLinks: newEditData.imageLinks || [""],
      };
    } else if (newModelValue && !props.isEditing) {
      // Reset form when opening for new lesson
      form.value = {
        title: "New Lesson",
        description: "",
        classId: undefined,
        resourceType: "video",
        videoUrl: "",
        thumbnailUrl: "",
        duration: 30,
        documents: [],
        documentLinks: [{ url: "", name: "" }],
        images: [],
        imageLinks: [""],
      };
    }
  },
  { immediate: true }
);

// Handle video URL changes to automatically update thumbnail, title and duration
const handleVideoUrlChange = debounce(async (url: string) => {
  if (!url || !isYoutubeUrl(url)) {
    return;
  }

  try {
    isLoadingVideoData.value = true;
    metadataError.value = null; // Reset error state

    // Extract video ID
    const videoId = extractYoutubeVideoId(url);
    if (!videoId) {
      metadataError.value = "Could not extract video ID from URL";
      return;
    }

    // Set thumbnail immediately
    form.value.thumbnailUrl = getYoutubeThumbnail(url);

    try {
      // Fetch metadata using the utility function
      const data = await fetchYoutubeMetadata(url);

      if (data && data.title) {
        form.value.title = data.title;

        // Estimate duration since oEmbed doesn't provide it
        const estimatedDuration = await estimateVideoDuration(videoId);
        form.value.duration = estimatedDuration;
      } else {
        metadataError.value = "No title found in the response";
        form.value.title = `YouTube Video (${videoId})`;
      }
    } catch (apiError) {
      console.error("API error:", apiError);
      metadataError.value = "Could not fetch video details. Please enter manually.";
      form.value.title = `YouTube Video (${videoId})`;
    }
  } catch (error) {
    console.error("Error fetching video data:", error);
    metadataError.value = "Failed to process video URL";

    useToast().add({
      title: "Error",
      description: "Failed to fetch video information. Please enter details manually.",
      color: "red",
    });
  } finally {
    isLoadingVideoData.value = false;
  }
}, 500);

// Change handler for resource type selection
function handleResourceTypeChange(type: string) {
  form.value.resourceType = type;

  // Reset error states when switching resource types
  metadataError.value = null;

  // Update thumbnail based on resource type
  if (type !== "video") {
    form.value.thumbnailUrl = getResourceTypeThumbnail(type);
  } else if (form.value.videoUrl) {
    form.value.thumbnailUrl = getYoutubeThumbnail(form.value.videoUrl);
  }
}

// Handle image thumbnail updates from the ImageResourceForm component
function updateImageThumbnail(thumbnailUrl: string) {
  if (form.value.resourceType === "image") {
    form.value.thumbnailUrl = thumbnailUrl;
  }
}

// Handle image loading errors
function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  target.src = defaultThumbnail;
}

// Updated submit handler to handle different resource types including links
const handleSubmit = async () => {
  if (!form.value.classId) {
    useToast().add({
      title: "Validation Error",
      description: "Please select a class for this lesson",
      color: "red",
    });
    return;
  }

  // Validate based on resource type
  if (
    form.value.resourceType === "video" &&
    !props.isEditing &&
    !isYoutubeUrl(form.value.videoUrl)
  ) {
    useToast().add({
      title: "Validation Error",
      description: "Please enter a valid YouTube URL",
      color: "red",
    });
    return;
  } else if (form.value.resourceType === "document") {
    const hasDocuments = form.value.documents.length > 0;
    const hasDocumentLinks = form.value.documentLinks.some((link) =>
      link.url.trim()
    );

    if (!hasDocuments && !hasDocumentLinks) {
      useToast().add({
        title: "Validation Error",
        description: "Please upload at least one document or add a document link",
        color: "red",
      });
      return;
    }
  } else if (form.value.resourceType === "image") {
    const hasImages = form.value.images.length > 0;
    const hasImageLinks = form.value.imageLinks.some((link) => link.trim());

    if (!hasImages && !hasImageLinks) {
      useToast().add({
        title: "Validation Error",
        description: "Please upload at least one image or add an image link",
        color: "red",
      });
      return;
    }
  }

  try {
    isSubmitting.value = true;

    // Filter out empty links before submitting
    const filteredDocumentLinks = form.value.documentLinks.filter((link) =>
      link.url.trim()
    );
    const filteredImageLinks = form.value.imageLinks.filter((link) =>
      link.trim()
    );

    // Make sure thumbnail is set based on resource type
    if (!form.value.thumbnailUrl) {
      if (form.value.resourceType === "video" && form.value.videoUrl) {
        form.value.thumbnailUrl = getYoutubeThumbnail(form.value.videoUrl);
      } else if (form.value.resourceType === "image") {
        // Will be handled by ImageResourceForm
      } else {
        form.value.thumbnailUrl = getResourceTypeThumbnail(
          form.value.resourceType
        );
      }
    }

    // Prepare form data with filtered links
    const formData = {
      ...form.value,
      documentLinks: filteredDocumentLinks,
      imageLinks: filteredImageLinks,
      // Get class name from the selected class ID for display purposes
      className:
        classOptions.value.find((c) => c.id === form.value.classId)?.name || "",
    };

    emit("add", formData);

    // Close modal
    emit("update:model-value", false);
  } catch (error) {
    console.error("Error with lesson:", error);
    useToast().add({
      title: "Error",
      description: `Failed to ${
        props.isEditing ? "update" : "add"
      } lesson. Please try again.`,
      color: "red",
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>
