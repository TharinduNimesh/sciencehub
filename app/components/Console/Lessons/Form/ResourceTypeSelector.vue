<template>
  <UFormGroup label="Resource Type" required>
    <div class="flex flex-wrap gap-3">
      <UButton
        v-for="type in resourceTypes"
        :key="type.value"
        :color="modelValue === type.value ? 'primary' : 'gray'"
        :variant="modelValue === type.value ? 'solid' : 'soft'"
        :icon="type.icon"
        :label="type.label"
        @click="$emit('update:modelValue', type.value)"
        class="flex-1 min-w-[100px]"
      />
    </div>
  </UFormGroup>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
});

defineEmits(['update:modelValue']);

// Resource types available in the form
const resourceTypes = [
  { value: "video", label: "Video", icon: "i-heroicons-video-camera" },
  { value: "document", label: "Document", icon: "i-heroicons-document-text" },
  { value: "image", label: "Image Gallery", icon: "i-heroicons-photo" },
];
</script>