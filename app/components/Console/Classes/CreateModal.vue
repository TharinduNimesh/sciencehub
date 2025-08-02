<template>
  <USlideover
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :ui="{
      width: isTablet ? 'sm:max-w-lg' : 'sm:max-w-2xl',
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
        <div class="flex flex-col gap-1">
          <h3
            class="text-lg font-semibold leading-6 text-gray-900 dark:text-white"
          >
            Create New Class
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Fill in the details below to create a new class
          </p>
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
      <UForm
        :state="state"
        :schema="classSchema"
        class="space-y-6"
        @submit="handleCreateClass"
      >
        <UFormGroup label="Class Name" name="name" required>
          <UInput
            v-model="state.name"
            placeholder="Enter class name"
            icon="i-heroicons-academic-cap"
          />
        </UFormGroup>

        <UFormGroup label="Description" name="description">
          <UTextarea
            v-model="state.description"
            placeholder="Enter class description"
            :ui="{
              height: 'h-24',
              base: 'block w-full rounded-md text-gray-900 dark:text-white shadow-sm',
            }"
          />
        </UFormGroup>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormGroup label="Grade" name="grade" required>
            <USelectMenu
              v-model="state.grade"
              :options="gradeOptions"
              value-attribute="value"
              placeholder="Select grade"
              icon="i-heroicons-academic-cap"
            />
          </UFormGroup>

          <UFormGroup label="Class Type" name="method" required>
            <USelectMenu
              v-model="state.method"
              :options="classMethodOptions"
              value-attribute="value"
              placeholder="Select class type"
              icon="i-heroicons-rectangle-stack"
            />
          </UFormGroup>

          <UFormGroup
            :label="isRecurringClass ? 'Schedule Pattern' : 'Date'"
            name="date"
            required
            :help="
              isRecurringClass
                ? 'Select which day the class repeats weekly'
                : 'Select the date for this one-time class'
            "
          >
            <template v-if="isRecurringClass">
              <USelectMenu
                v-model="state.date"
                :options="datePatternOptions"
                value-attribute="value"
                placeholder="Select schedule pattern"
                icon="i-heroicons-calendar"
              />
            </template>
            <template v-else>
              <UInput
                v-model="state.date"
                type="date"
                icon="i-heroicons-calendar"
                :min="new Date().toISOString().split('T')[0]"
                @update:model-value="(val) => (state.date = val)"
              />
            </template>
          </UFormGroup>

          <UFormGroup label="Tags" name="tags" required>
            <USelectMenu
              v-model="state.tags"
              :options="tagOptions"
              multiple
              searchable
              placeholder="Search or add tags"
              icon="i-heroicons-tag"
            />
          </UFormGroup>

          <UFormGroup label="Start Time" name="startTime" required>
            <UInput
              v-model="state.startTime"
              type="time"
              icon="i-heroicons-clock"
            />
          </UFormGroup>

          <UFormGroup label="End Time" name="endTime" required>
            <UInput
              v-model="state.endTime"
              type="time"
              icon="i-heroicons-clock"
            />
          </UFormGroup>
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
          @click="$emit('update:modelValue', false)"
        />
        <UButton
          color="primary"
          :loading="isCreating"
          :disabled="isCreating"
          label="Create Class"
          icon="i-heroicons-plus"
          @click="handleCreateClass"
        />
      </div>
    </div>
  </USlideover>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { useNotification } from "~/composables/useNotification"
import { createClassSchema, datePatternOptions, type ClassMethod } from '~/schemas/class'
import { useClasses } from '~/composables/useClasses'

const { createClass } = useClasses()

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'created'): void
}>()

const notification = useNotification()

// State
const isCreating = ref(false)
const isTablet = ref(window?.innerWidth < 1024)

// Form state
const state = ref({
  name: "",
  description: "",
  grade: undefined as number | undefined,
  method: undefined as ClassMethod | undefined,
  date: "",
  tags: [] as string[],
  startTime: "",
  endTime: "",
})

// Form options
const classMethodOptions = [
  {
    label: "Virtual Recurring Series",
    value: "VirtualRecurringSeries",
    icon: "i-heroicons-computer-desktop",
  },
  {
    label: "Virtual Single Session",
    value: "VirtualSingleSession",
    icon: "i-heroicons-video-camera",
  },
  {
    label: "In-Person Recurring Series",
    value: "InPersonRecurringSeries",
    icon: "i-heroicons-users",
  },
  {
    label: "In-Person Single Session",
    value: "InPersonSingleSession",
    icon: "i-heroicons-academic-cap",
  },
]

const tagOptions = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
  "Geography",
  "ICT",
  "Science",
  "Grade 10",
  "Grade 11",
  "Theory",
  "Practical",
  "Revision",
  "Advanced",
  "Exam Prep",
  "Homework Help",
  "Discussion",
  "Workshop",
  "Lab",
  "Assignment",
  "Project",
  "Group Study",
  "Extra Class"
];

const gradeOptions = [
  { label: "Grade 6", value: 6 },
  { label: "Grade 7", value: 7 },
  { label: "Grade 8", value: 8 },
  { label: "Grade 9", value: 9 },
  { label: "Grade 10", value: 10 },
  { label: "Grade 11", value: 11 },
  { label: "Grade 12", value: 12 },
  { label: "Grade 13", value: 13 },
]

const isRecurringClass = computed(() => {
  return (
    state.value.method === "VirtualRecurringSeries" ||
    state.value.method === "InPersonRecurringSeries"
  )
})

// Use the imported createClassSchema with isRecurringClass
const classSchema = computed(() => createClassSchema(isRecurringClass.value))

const handleCreateClass = async () => {
  try {
    isCreating.value = true;
    
    await createClass({
      name: state.value.name,
      description: state.value.description,
      grade: state.value.grade!,
      method: state.value.method!,
      date: state.value.date,
      startTime: state.value.startTime,
      endTime: state.value.endTime,
      tags: state.value.tags
    });

    notification.showSuccess("Class created successfully");
    emit("update:modelValue", false);
    emit("created");

    // Reset form
    state.value = {
      name: "",
      description: "",
      grade: undefined,
      method: undefined,
      date: "",
      tags: [],
      startTime: "",
      endTime: "",
    };
  } catch (error) {
    console.error("Error creating class:", error);
    notification.showError("Failed to create class");
  } finally {
    isCreating.value = false;
  }
};

// Update isTablet on window resize
if (import.meta.client) {
  window.addEventListener("resize", () => {
    isTablet.value = window.innerWidth < 1024;
  });
}

// Add watch effect to reset date when method changes
watch(
  () => state.value.method,
  () => {
    state.value.date = "";
  }
);
</script>
