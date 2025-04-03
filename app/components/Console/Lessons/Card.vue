<template>
  <div
    class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col"
  >
    <!-- Thumbnail with overlay -->
    <div class="relative aspect-video w-full overflow-hidden group">
      <img
        :src="lesson.thumbnailUrl"
        :alt="lesson.title"
        class="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div
        class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <NuxtLink
          :to="`/console/lessons/${lesson.id}`"
          class="w-full h-full flex items-center justify-center"
        >
          <UButton
            size="lg"
            color="white"
            variant="solid"
            icon="i-heroicons-play-circle"
            :ui="{ rounded: 'rounded-full' }"
          />
        </NuxtLink>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4 flex flex-col flex-1">
      <div class="flex-1">
        <div class="flex items-center justify-between mb-2">
          <UBadge color="primary" variant="subtle" size="sm">
            {{ lesson.className }}
          </UBadge>
          <UBadge color="gray" variant="subtle" size="sm">
            {{ formatDuration(lesson.duration) }}
          </UBadge>
        </div>

        <NuxtLink
          :to="`/console/lessons/${lesson.id}`"
          class="hover:text-primary-500"
        >
          <h3 class="font-semibold text-lg mb-2 line-clamp-2">
            {{ lesson.title }}
          </h3>
        </NuxtLink>

        <p class="text-gray-500 text-sm line-clamp-2 mb-3">
          {{ lesson.description || "No description available." }}
        </p>
      </div>

      <div class="flex justify-between items-center mt-2">
        <NuxtLink :to="`/console/lessons/${lesson.id}`">
          <UButton
            size="sm"
            color="primary"
            variant="soft"
            icon="i-heroicons-play-circle"
            label="Play Lesson"
          />
        </NuxtLink>

        <div class="flex gap-1">
          <UTooltip text="Edit lesson">
            <UButton
              size="xs"
              color="gray"
              variant="ghost"
              icon="i-heroicons-pencil-square"
              @click="$emit('edit', lesson)"
              square
            />
          </UTooltip>
          <UTooltip text="Delete lesson">
            <UButton
              size="xs"
              color="red"
              variant="ghost"
              icon="i-heroicons-trash"
              @click="$emit('delete', lesson)"
              square
            />
          </UTooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  lesson: {
    type: Object,
    required: true,
  },
});

defineEmits(["edit", "view", "delete"]);

// Format duration (minutes) to readable format
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}`;
  }
  return `${mins} min`;
};
</script>
