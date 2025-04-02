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
        <UFormGroup label="Lesson Title" required>
          <UInput
            v-model="form.title"
            placeholder="Enter a descriptive title"
          />
        </UFormGroup>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormGroup label="Grade" required>
            <USelectMenu
              v-model="form.grade"
              :options="gradeOptions"
              placeholder="Select grade"
              value-attribute="value"
              icon="i-heroicons-academic-cap"
            />
          </UFormGroup>

          <UFormGroup label="Subject" required>
            <USelectMenu
              v-model="form.subject"
              :options="subjectOptions"
              placeholder="Select subject"
              value-attribute="value"
              icon="i-heroicons-book-open"
            />
          </UFormGroup>
        </div>

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

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormGroup label="Video URL" required>
            <UInput
              v-model="form.videoUrl"
              placeholder="Enter video URL (YouTube, Vimeo, etc.)"
              icon="i-heroicons-link"
            />
          </UFormGroup>

          <UFormGroup label="Duration (minutes)" required>
            <UInput
              v-model="form.duration"
              type="number"
              placeholder="Enter lesson duration in minutes"
              min="1"
              icon="i-heroicons-clock"
            />
          </UFormGroup>
        </div>

        <UFormGroup label="Thumbnail Image URL">
          <UInput
            v-model="form.thumbnailUrl"
            placeholder="Enter thumbnail image URL"
            icon="i-heroicons-photo"
          />
        </UFormGroup>

        <!-- Thumbnail preview -->
        <div v-if="form.thumbnailUrl" class="mt-2">
          <p class="text-sm font-medium text-gray-700 mb-2">
            Thumbnail Preview:
          </p>
          <div
            class="aspect-video max-w-xs overflow-hidden rounded-lg bg-gray-100"
          >
            <img
              :src="form.thumbnailUrl"
              :alt="form.title"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
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
          @click="$emit('update:modelValue', false)"
        />
        <UButton
          color="primary"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          :label="isEditing ? 'Update Lesson' : 'Add Lesson'"
          :icon="isEditing ? 'i-heroicons-check' : 'i-heroicons-plus'"
          @click="handleSubmit"
        />
      </div>
    </div>
  </USlideover>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

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
const form = ref({
  title: "",
  description: "",
  grade: undefined as number | undefined,
  subject: "",
  videoUrl: "",
  thumbnailUrl: "",
  duration: 30,
});

// Reset or populate form when modal opens/closes or when editData changes
watch(
  [() => props.modelValue, () => props.editData], 
  ([newModelValue, newEditData]) => {
    if (newModelValue && props.isEditing && newEditData) {
      // Populate form with lesson data for editing
      form.value = {
        title: newEditData.title || '',
        description: newEditData.description || '',
        grade: newEditData.grade,
        subject: newEditData.subject || '',
        videoUrl: newEditData.videoUrl || '',
        thumbnailUrl: newEditData.thumbnailUrl || '',
        duration: newEditData.duration || 30
      };
    } else if (newModelValue && !props.isEditing) {
      // Reset form when opening for new lesson
      form.value = {
        title: "",
        description: "",
        grade: undefined,
        subject: "",
        videoUrl: "",
        thumbnailUrl: "",
        duration: 30,
      };
    }
  },
  { immediate: true }
);

const gradeOptions = [
  { label: "Grade 6", value: 6 },
  { label: "Grade 7", value: 7 },
  { label: "Grade 8", value: 8 },
  { label: "Grade 9", value: 9 },
  { label: "Grade 10", value: 10 },
  { label: "Grade 11", value: 11 },
];

const subjectOptions = [
  { label: "Biology", value: "Biology" },
  { label: "Chemistry", value: "Chemistry" },
  { label: "Physics", value: "Physics" },
  { label: "General Science", value: "General Science" },
];

const handleImageError = (event: Event) => {
  // Set a fallback image if the provided URL fails to load
  const target = event.target as HTMLImageElement;
  target.src = defaultThumbnail.value;
};

const handleSubmit = async () => {
  if (
    !form.value.title ||
    !form.value.videoUrl ||
    !form.value.grade ||
    !form.value.subject ||
    !form.value.duration
  ) {
    useToast().add({
      title: "Validation Error",
      description: "Please fill in all required fields",
      color: "red",
    });
    return;
  }

  try {
    isSubmitting.value = true;

    // Default thumbnail if none provided - use the consistent placeholder
    if (!form.value.thumbnailUrl) {
      form.value.thumbnailUrl = defaultThumbnail.value;
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
