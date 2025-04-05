<template>
  <UModal
    v-model="isOpen"
    :ui="{
      container: 'flex min-h-full items-center justify-center text-center',
      width: 'sm:max-w-md'
    }"
  >
    <div class="p-6">
      <div class="flex flex-col items-center mb-6">
        <div class="rounded-full bg-red-50 p-3 mb-4">
          <UIcon
            name="i-heroicons-trash"
            class="h-6 w-6 text-red-500"
          />
        </div>
        <h3 class="text-lg font-semibold text-gray-900">
          Delete Lesson
        </h3>
        <p class="mt-2 text-sm text-gray-500 text-center">
          Are you sure you want to delete <span class="font-medium">{{ lesson?.title }}</span>? 
          This action cannot be undone and all associated data will be permanently removed.
        </p>
      </div>

      <div class="flex gap-2 justify-end">
        <UButton
          color="gray"
          variant="soft"
          label="Cancel"
          @click="closeModal"
        />
        <UButton
          color="red"
          :loading="isDeleting"
          :disabled="isDeleting"
          label="Delete"
          @click="confirmDelete"
        />
      </div>
    </div>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps({
  lesson: {
    type: Object,
    default: null
  },
  modelValue: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'delete']);

// Reactive state
const isDeleting = ref(false);

// Computed property for v-model
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Methods
const closeModal = () => {
  isOpen.value = false;
};

const confirmDelete = async () => {
  if (!props.lesson) return;
  
  try {
    isDeleting.value = true;
    
    // Emit delete event to parent component
    emit('delete', props.lesson);
    
    // Close the modal
    closeModal();
  } catch (error) {
    console.error('Error deleting lesson:', error);
  } finally {
    isDeleting.value = false;
  }
};
</script>