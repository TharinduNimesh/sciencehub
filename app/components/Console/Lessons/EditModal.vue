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
    :prevent-close="isSubmitting || isLoadingVideo"
  >
    <!-- Header -->
    <div
      class="flex-none px-6 py-5 border-b border-gray-200 dark:border-gray-800"
    >
      <div class="flex items-center justify-between">
        <div class="flex flex-col gap-1">
          <h3
            class="text-lg font-semibold leading-6 text-gray-900 dark:text-white"
          >
            Edit Lesson
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Update lesson details and resources
          </p>
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
      <UForm :state="form" class="space-y-6" @submit="handleSubmit">
        <!-- Main Video Section -->
        <div class="space-y-6">
          <UFormGroup label="YouTube URL" name="videoUrl" required>
            <div class="relative flex gap-2">
              <UInput
                v-model="form.videoUrl"
                placeholder="Enter YouTube video URL"
                icon="i-heroicons-video-camera"
                :loading="isLoadingVideo"
                class="flex-1"
              />
              <UButton
                color="primary"
                icon="i-heroicons-magnifying-glass"
                :loading="isLoadingVideo"
                @click="loadVideoInfo"
                class="flex-none"
              />
            </div>
            <template v-if="videoError" #help>
              <span class="text-red-500">{{ videoError }}</span>
            </template>
          </UFormGroup>

          <!-- Thumbnail Preview -->
          <div
            v-if="form.thumbnailUrl"
            class="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
          >
            <img
              :src="form.thumbnailUrl"
              :alt="form.title || 'Video thumbnail'"
              class="w-full aspect-video object-cover"
            />
            <div
              class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            >
              <UIcon name="i-heroicons-photo" class="w-8 h-8 text-white" />
            </div>
          </div>

          <UFormGroup label="Title" name="title" required>
            <UInput
              v-model="form.title"
              placeholder="Lesson title"
              icon="i-heroicons-document-text"
              :disabled="isLoadingVideo"
            />
          </UFormGroup>

          <UFormGroup label="Description" name="description">
            <UTextarea
              v-model="form.description"
              placeholder="Enter lesson description"
              :ui="{
                height: 'h-24',
                base: 'block w-full rounded-md text-gray-900 dark:text-white shadow-sm',
              }"
              :disabled="isLoadingVideo"
            />
          </UFormGroup>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UFormGroup label="Class" name="classId" required>
              <USelectMenu
                v-model="form.classId"
                :options="classOptions"
                value-attribute="id"
                option-attribute="name"
                placeholder="Select class"
                icon="i-heroicons-academic-cap"
                :disabled="isLoadingVideo"
                multiple
              />
            </UFormGroup>

            <UFormGroup label="Duration (minutes)" name="duration" required>
              <UInput
                v-model="form.duration"
                placeholder="Duration in minutes"
                icon="i-heroicons-clock"
                :disabled="isLoadingVideo"
              />
            </UFormGroup>
          </div>
        </div>

        <!-- Resources Section -->
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h4 class="text-base font-medium text-gray-900 dark:text-white">
              Additional Resources
            </h4>
          </div>

          <!-- Resource Input Form -->
          <div
            class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div class="space-y-4">
              <UFormGroup label="Resource Type" required>
                <USelectMenu
                  v-model="currentResource.type"
                  :options="resourceTypeOptions"
                  value-attribute="value"
                  option-attribute="label"
                  placeholder="Select resource type"
                  icon="i-heroicons-document"
                />
              </UFormGroup>

              <UFormGroup label="Resource Name" required>
                <UInput
                  v-model="currentResource.name"
                  placeholder="Enter resource name"
                  icon="i-heroicons-document-text"
                />
              </UFormGroup>

              <UFormGroup label="Resource URL" required>
                <UInput
                  v-model="currentResource.url"
                  placeholder="Enter resource URL"
                  icon="i-heroicons-link"
                />
              </UFormGroup>

              <div class="flex justify-end">
                <UButton
                  color="primary"
                  :disabled="!isCurrentResourceValid"
                  label="Save Resource"
                  icon="i-heroicons-plus"
                  @click="saveResource"
                />
              </div>
            </div>
          </div>

          <!-- Resources Summary -->
          <ResourceSummary
            v-if="form.resources.length > 0"
            :resources="form.resources"
            @remove="removeResource"
          />
        </div>
      </UForm>
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
            (form.videoUrl && !videoDetails?.videoId) ||
            isLoadingVideo
          "
          label="Update Lesson"
          icon="i-heroicons-arrow-path"
          @click="handleSubmit"
        />
      </div>
    </div>
  </USlideover>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { useYouTubeVideo } from "~/composables/useYouTubeVideo";
import { useLesson } from "~/composables/useLesson";
import { useClasses } from "~/composables/useClasses";
import ResourceSummary from "./ResourceSummary.vue";
import type { Lesson, EditableLesson, CreateLessonData } from '~/types/lesson'

// Define resource type interface
interface Resource {
  type: string;
  name: string;
  url: string;
}

const props = defineProps<{
  modelValue: boolean;
  lesson: Lesson;
}>();

const emit = defineEmits<{
  'update:model-value': [value: boolean];
  updated: [lesson: Lesson];
}>();

const isSubmitting = ref(false);

// Add refs for focus management
const closeButtonRef = ref<HTMLButtonElement | null>(null);
const submitButtonRef = ref<HTMLButtonElement | null>(null);
const previousFocus = ref<HTMLElement | null>(null);

// Use the YouTube video composable
const {
  videoDetails,
  isLoading: isLoadingVideo,
  error: videoError,
  loadVideoDetails,
  isYoutubeUrl,
} = useYouTubeVideo();

// Use the Lesson composable
const { updateLesson, getLessonResources } = useLesson();

// Form interface
interface LessonForm {
  title: string;
  description: string;
  classId: number[];
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  resources: Resource[];
}

// Form state
const form = ref<LessonForm>({
  title: "",
  description: "",
  classId: [],
  videoUrl: "",
  thumbnailUrl: "",
  duration: "00:00",
  resources: [],
});

// Resource type options
const resourceTypeOptions = [
  { label: "Document", value: "document", icon: "i-heroicons-document-text" },
  { label: "Image", value: "image", icon: "i-heroicons-photo" },
  { label: "Video", value: "video", icon: "i-heroicons-video-camera" },
  { label: "Link", value: "link", icon: "i-heroicons-link" },
];

// Class options state
const classOptions = ref<{ id: number; name: string }[]>([]);
const { getActiveClasses } = useClasses();

// Load classes when component mounts
onMounted(async () => {
  try {
    const classes = await getActiveClasses();
    classOptions.value = classes.map((c) => ({
      id: Number(c.id),
      name: `${c.name} - Grade ${c.grade}`,
    }));
  } catch (error) {
    console.error("Error loading classes:", error);
    useToast().add({
      title: "Error",
      description: "Failed to load classes",
      color: "red",
    });
  }
});

// Focus management handlers
const handleBeforeEnter = () => {
  previousFocus.value = document.activeElement as HTMLElement;
};

const handleAfterLeave = () => {
  if (previousFocus.value && typeof previousFocus.value.focus === "function") {
    nextTick(() => {
      previousFocus.value?.focus();
    });
  }
};

// Resource management
const currentResource = ref<Resource>({
  type: "",
  name: "",
  url: "",
});

const isCurrentResourceValid = computed(() => {
  return (
    currentResource.value.type &&
    currentResource.value.name &&
    currentResource.value.url
  );
});

const saveResource = () => {
  form.value.resources.push({ ...currentResource.value });
  currentResource.value = { type: "", name: "", url: "" };
};

const removeResource = (index: number) => {
  form.value.resources.splice(index, 1);
};

// Load existing resources when the modal opens
const loadExistingResources = async (lessonId: string) => {
  try {
    const resources = await getLessonResources(Number(lessonId));
    if (resources) {
      form.value.resources = resources.map(r => ({
        type: r.type,
        name: r.name || getDefaultName(r.type, r.url),
        url: r.url
      }));
    }
  } catch (error) {
    console.error('Error loading resources:', error);
    useToast().add({
      title: 'Error',
      description: 'Failed to load lesson resources',
      color: 'red'
    });
  }
};

// Helper to generate a default name if none exists
const getDefaultName = (type: string, url: string) => {
  const filename = url.split('/').pop() || '';
  return `${type.charAt(0).toUpperCase() + type.slice(1)} ${filename}`;
};

// Load video information handler
const loadVideoInfo = async () => {
  if (!form.value.videoUrl) {
    useToast().add({
      title: "Error",
      description: "Please enter a YouTube URL",
      color: "red",
    });
    return;
  }

  try {
    const details = await loadVideoDetails(form.value.videoUrl);
    if (details) {
      form.value.title = details.title;
      form.value.description = details.description;
      form.value.thumbnailUrl = details.thumbnailUrl;
      form.value.duration = details.duration;

      useToast().add({
        title: "Success",
        description: "Video information loaded successfully",
        color: "green",
      });
    }
  } catch (error) {
    console.error("Error loading video:", error);
    useToast().add({
      title: "Error",
      description:
        "Failed to load video information. Please enter details manually.",
      color: "red",
    });
  }
};

// Reset or populate form when modal opens/closes
watch(
  () => props.modelValue,
  async (newModelValue) => {
    if (newModelValue && props.lesson) {
      // Extract all class IDs from class_lessons
      const classIds = props.lesson.class_lessons 
        ? props.lesson.class_lessons.map(cl => cl.class_id)
        : [];

      // Populate form with lesson data
      form.value = {
        title: props.lesson.title,
        description: props.lesson.description || "",
        classId: classIds, // Now contains array of all class IDs
        videoUrl: props.lesson.video_url,
        thumbnailUrl: props.lesson.thumbnail_url || "",
        duration: String(props.lesson.duration),
        resources: []
      };

      // Load existing resources
      await loadExistingResources(props.lesson.id);
    }
  },
  { immediate: true }
);

// Form submission handler
const handleSubmit = async () => {
  if (!form.value.classId.length) {
    useToast().add({
      title: "Validation Error",
      description: "Please select at least one class for this lesson",
      color: "red",
    });
    return;
  }

  if (!form.value.videoUrl || !isYoutubeUrl(form.value.videoUrl)) {
    useToast().add({
      title: "Validation Error",
      description: "Please enter a valid YouTube URL",
      color: "red",
    });
    return;
  }

  try {
    isSubmitting.value = true;

    const validResources = form.value.resources.filter(
      (resource) => resource.type && resource.name && resource.url
    );

    await updateLesson({
      id: props.lesson.id,
      title: form.value.title,
      description: form.value.description,
      duration: parseInt(form.value.duration),
      videoUrl: form.value.videoUrl,
      thumbnailUrl: form.value.thumbnailUrl,
      classIds: form.value.classId,
      resources: validResources,
    });

    // Update toast message
    useToast().add({
      title: "Success",
      description: "Lesson updated successfully",
      color: "green",
    });

    // Emit the updated event with the updated lesson data
    emit("updated", {
      ...props.lesson,
      title: form.value.title,
      description: form.value.description,
      duration: parseInt(form.value.duration),
      video_url: form.value.videoUrl,
      thumbnail_url: form.value.thumbnailUrl,
    });

    // Close the modal
    emit("update:model-value", false);
  } catch (error) {
    console.error("Error updating lesson:", error);
    useToast().add({
      title: "Error",
      description: "Failed to update lesson. Please try again.",
      color: "red",
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Add the formatClassNames helper function
const formatClassNames = (classLessons: { classes: { name: string; grade: string } }[]) => {
  if (!classLessons.length) return 'No Class';
  const firstClass = classLessons[0];
  if (!firstClass?.classes?.grade || !firstClass?.classes?.name) return 'No Class';
  
  if (classLessons.length === 1) {
    return `Grade ${firstClass.classes.grade} | ${firstClass.classes.name}`;
  }
  return `Grade ${firstClass.classes.grade} | ${firstClass.classes.name} and ${classLessons.length - 1} more`;
};
</script>