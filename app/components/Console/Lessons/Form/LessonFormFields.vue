<template>
  <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
    <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
      <UIcon name="i-heroicons-information-circle" class="mr-2 text-primary-500" />
      Lesson Information
    </h3>

    <div class="space-y-4">
      <UFormGroup label="Lesson Title" required>
        <UInput
          v-model="localTitle"
          placeholder="Enter lesson title"
          :disabled="loading"
          icon="i-heroicons-pencil"
        />
        <p v-if="loading" class="text-xs text-primary-500 mt-1">
          Loading title...
        </p>
        <p v-else-if="error" class="text-xs text-red-500 mt-1">
          {{ error }}
        </p>
      </UFormGroup>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormGroup label="Class" required>
          <USelectMenu
            v-model="localClassId"
            :options="classOptions"
            placeholder="Select class"
            value-attribute="id"
            option-attribute="name"
            icon="i-heroicons-academic-cap"
          />
        </UFormGroup>

        <UFormGroup label="Duration (minutes)" required>
          <UInput
            v-model="localDuration"
            type="number"
            placeholder="Enter duration in minutes"
            min="1"
            icon="i-heroicons-clock"
            :disabled="loading"
          />
          <p v-if="loading" class="text-xs text-primary-500 mt-1">
            Loading duration...
          </p>
        </UFormGroup>
      </div>

      <UFormGroup
        label="Description"
        help="Provide a brief summary of what students will learn"
      >
        <UTextarea
          v-model="localDescription"
          placeholder="Enter lesson description"
          :ui="{
            height: 'h-24',
            base: 'block w-full rounded-md text-gray-900 dark:text-white shadow-sm',
          }"
        />
      </UFormGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { PropType } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: 'New Lesson'
  },
  description: {
    type: String,
    default: ''
  },
  classId: {
    type: [String, Number],
    default: undefined
  },
  duration: {
    type: [String, Number],
    default: 30
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  classOptions: {
    type: Array as PropType<Array<{ id: string | number; name: string; [key: string]: any }>>,
    default: () => []
  }
});

const emit = defineEmits([
  'update:title',
  'update:description',
  'update:classId',
  'update:duration'
]);

// Local state for v-model binding
const localTitle = ref(props.title);
const localDescription = ref(props.description);
const localClassId = ref(props.classId);
const localDuration = ref(props.duration);

// Watch for changes in props
watch(() => props.title, (newTitle) => {
  localTitle.value = newTitle;
});

watch(() => props.description, (newDescription) => {
  localDescription.value = newDescription;
});

watch(() => props.classId, (newClassId) => {
  localClassId.value = newClassId;
});

watch(() => props.duration, (newDuration) => {
  localDuration.value = newDuration;
});

// Watch local changes and emit to parent
watch(localTitle, (newTitle) => {
  emit('update:title', newTitle);
});

watch(localDescription, (newDescription) => {
  emit('update:description', newDescription);
});

watch(localClassId, (newClassId) => {
  emit('update:classId', newClassId);
});

watch(localDuration, (newDuration) => {
  emit('update:duration', newDuration);
});
</script>