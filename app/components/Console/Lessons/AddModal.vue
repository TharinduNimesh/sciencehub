<template>
  <USlideover
    :model-value="modelValue"
    @update:model-value="$emit('update:model-value', $event)"
    :ui="{
      width: 'sm:max-w-2xl',
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
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Main YouTube Video Section with Clear Heading -->
        <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <UIcon
              name="i-heroicons-video-camera"
              class="mr-2 text-primary-500"
            />
            Main Lesson Content (Required)
          </h3>

          <VideoResourceForm
            v-model:video-url="form.videoUrl"
            :thumbnail-url="form.thumbnailUrl"
            :title="form.title"
            :disabled="isEditing"
            :loading="isLoadingVideoData"
            @video-url-change="handleVideoUrlChange"
          />
        </div>

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

        <!-- Optional Student Materials Section -->
        <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <UIcon name="i-heroicons-book-open" class="mr-2 text-primary-500" />
            Student Materials (Optional)
          </h3>

          <!-- Simple Material Type Selector -->
          <UFormGroup>
            <div class="flex flex-wrap gap-3">
              <UButton
                v-for="type in materialTypes"
                :key="type.value"
                :color="form.resourceType === type.value ? 'primary' : 'gray'"
                :variant="form.resourceType === type.value ? 'solid' : 'soft'"
                :icon="type.icon"
                :label="type.label"
                @click="handleResourceTypeChange(type.value)"
                class="flex-1 min-w-[100px]"
              />
            </div>
          </UFormGroup>

          <!-- Material Type Forms -->
          <div class="mt-4">
            <template v-if="form.resourceType === 'document'">
              <DocumentResourceForm
                v-model:documents="form.documents"
                v-model:document-links="form.documentLinks"
              />
            </template>

            <template v-else-if="form.resourceType === 'image'">
              <ImageResourceForm
                v-model:images="form.images"
                v-model:image-links="form.imageLinks"
              />
            </template>

            <template v-else>
              <div class="p-6 text-center bg-white border rounded-lg">
                <UIcon
                  name="i-heroicons-document-plus"
                  class="mx-auto h-12 w-12 text-gray-400"
                />
                <h3 class="mt-2 text-sm font-medium text-gray-900">
                  No additional materials selected
                </h3>
                <p class="mt-1 text-sm text-gray-500">
                  Select "Documents" or "Images" above to add optional resources
                  for students
                </p>
              </div>
            </template>
          </div>
        </div>
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
            (form.resourceType === 'video' &&
              form.videoUrl &&
              !isYoutubeUrl(form.videoUrl)) ||
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
import VideoResourceForm from "./Form/VideoResourceForm.vue";
import DocumentResourceForm from "./Form/DocumentResourceForm.vue";
import ImageResourceForm from "./Form/ImageResourceForm.vue";
import LessonFormFields from "./Form/LessonFormFields.vue";
import {
  isYoutubeUrl,
  extractYoutubeVideoId,
  getYoutubeThumbnail,
  getResourceTypeThumbnail,
  debounce,
  fetchYoutubeMetadata,
  estimateVideoDuration,
} from "../../../composables/useLesson";

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
const metadataError = ref<string | undefined>(undefined);

// Add refs for focus management
const closeButtonRef = ref<HTMLButtonElement | null>(null);
const submitButtonRef = ref<HTMLButtonElement | null>(null);
const previousFocus = ref<HTMLElement | null>(null);

// Define interface for form data including cache properties
interface LessonFormData {
  title: string;
  description: string;
  classId: string | number | undefined;
  resourceType: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  documents: File[];
  documentLinks: { url: string; name: string }[];
  images: File[];
  imageLinks: string[];
  _cachedDocuments?: File[];
  _cachedDocumentLinks?: { url: string; name: string }[];
  _cachedImages?: File[];
  _cachedImageLinks?: string[];
}

// Enhanced form with link support
const form = ref<LessonFormData>({
  title: "New Lesson",
  description: "",
  classId: undefined,
  resourceType: "video", // Default to video type
  videoUrl: "",
  thumbnailUrl: "",
  duration: 30,
  documents: [] as File[], // For document uploads
  documentLinks: [{ url: "", name: "" }], // For document links
  images: [] as File[], // For image uploads
  imageLinks: [""], // For image links
  _cachedDocuments: [],
  _cachedDocumentLinks: [],
  _cachedImages: [],
  _cachedImageLinks: [],
});

// Sample class options - In a real app, these would come from an API
const classOptions = ref([
  { id: 1, name: "Class A - Physics (Online)", type: "online" },
  { id: 2, name: "Class B - Chemistry (Physical)", type: "physical" },
  { id: 3, name: "Class C - Biology (Online)", type: "online" },
  { id: 4, name: "Class D - Mathematics (Physical)", type: "physical" },
]);

// Define material types for the simplified UI
const materialTypes = [
  { value: "document", label: "Documents", icon: "i-heroicons-document-text" },
  { value: "image", label: "Images", icon: "i-heroicons-photo" },
];

// Focus management handlers
const handleBeforeEnter = () => {
  // Store the currently focused element before opening the modal
  previousFocus.value = document.activeElement as HTMLElement;
};

const handleAfterLeave = () => {
  // Return focus to the previously focused element
  if (previousFocus.value && typeof previousFocus.value.focus === "function") {
    nextTick(() => {
      previousFocus.value?.focus();
    });
  }
};

// Set initial focus when modal opens
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      nextTick(() => {
        // Focus on close button after modal is opened
        if (closeButtonRef.value) {
          closeButtonRef.value.focus();
        }
      });
    }
  },
  { immediate: true }
);

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
        resourceType: newEditData.resourceType || "document", // Default to document type
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
        resourceType: "document", // Default to document type
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
    metadataError.value = undefined; // Reset error state

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
      metadataError.value =
        "Could not fetch video details. Please enter manually.";
      form.value.title = `YouTube Video (${videoId})`;
    }
  } catch (error) {
    console.error("Error fetching video data:", error);
    metadataError.value = "Failed to process video URL";

    useToast().add({
      title: "Error",
      description:
        "Failed to fetch video information. Please enter details manually.",
      color: "red",
    });
  } finally {
    isLoadingVideoData.value = false;
  }
}, 500);

// Change handler for resource type selection
function handleResourceTypeChange(type: string) {
  const previousType = form.value.resourceType;

  // Cache the current resource files before switching
  if (previousType === "document") {
    // Save document data to cache
    form.value._cachedDocuments = [...form.value.documents];
    form.value._cachedDocumentLinks = [...form.value.documentLinks];
  } else if (previousType === "image") {
    // Save image data to cache
    form.value._cachedImages = [...form.value.images];
    form.value._cachedImageLinks = [...form.value.imageLinks];
  }

  // Update the resource type
  form.value.resourceType = type;

  // Reset error states when switching resource types
  metadataError.value = undefined;

  // Restore cached data if switching back to a previous tab
  if (type === "document") {
    form.value.documents = [...(form.value._cachedDocuments || [])];
    form.value.documentLinks =
      form.value._cachedDocumentLinks &&
      form.value._cachedDocumentLinks.length > 0
        ? [...form.value._cachedDocumentLinks]
        : [{ url: "", name: "" }];
  } else if (type === "image") {
    form.value.images = [...(form.value._cachedImages || [])];
    form.value.imageLinks =
      form.value._cachedImageLinks && form.value._cachedImageLinks.length > 0
        ? [...form.value._cachedImageLinks]
        : [""];
  }

  // Always use YouTube thumbnail regardless of resource type
  if (form.value.videoUrl && isYoutubeUrl(form.value.videoUrl)) {
    form.value.thumbnailUrl = getYoutubeThumbnail(form.value.videoUrl);
  }
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

  // Video is required - YouTube video is now mandatory for all lessons
  if (!form.value.videoUrl || !isYoutubeUrl(form.value.videoUrl)) {
    useToast().add({
      title: "Validation Error",
      description: "Please enter a valid YouTube URL",
      color: "red",
    });
    return;
  }

  // Document and image validations are now optional
  // Only validate if user selected those resource types
  if (form.value.resourceType === "document") {
    const hasDocuments = form.value.documents.length > 0;
    const hasDocumentLinks = form.value.documentLinks.some((link) =>
      link.url.trim()
    );

    if (!hasDocuments && !hasDocumentLinks) {
      useToast().add({
        title: "Validation Error",
        description:
          "Please upload at least one document or add a document link",
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

    // Always use the YouTube thumbnail regardless of resource type
    // This is the key change - we always use the YouTube thumbnail
    form.value.thumbnailUrl = getYoutubeThumbnail(form.value.videoUrl);

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
