<template>
  <div class="space-y-4">
    <TransitionGroup 
      name="list" 
      tag="div" 
      class="space-y-3"
    >
      <div
        v-for="(resource, index) in resources"
        :key="index"
        class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 group"
      >
        <div class="flex items-center gap-4 min-w-0 flex-1">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
              <UIcon
                :name="getResourceIcon(resource.type)"
                class="w-5 h-5 text-primary-600 dark:text-primary-400"
              />
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ resource.name }}
              </h4>
              <UBadge
                :color="getResourceColor(resource.type)"
                variant="soft"
                size="xs"
                class="hidden sm:inline-flex"
              >
                {{ formatResourceType(resource.type) }}
              </UBadge>
            </div>
            <div class="mt-1 flex items-center gap-2">
              <UIcon
                name="i-heroicons-link-20-solid"
                class="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0"
              />
              <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
                {{ resource.url }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 ml-4">
          <UTooltip text="Open resource">
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-arrow-top-right-on-square"
              size="xs"
              class="opacity-0 group-hover:opacity-100 transition-opacity"
              :href="resource.url"
              target="_blank"
            />
          </UTooltip>
          <UTooltip text="Remove resource">
            <UButton
              color="red"
              variant="ghost"
              icon="i-heroicons-trash"
              size="xs"
              class="opacity-0 group-hover:opacity-100 transition-opacity"
              @click="$emit('remove', index)"
            />
          </UTooltip>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import type { BadgeColor } from '#ui/types';

interface Resource {
  type: string;
  name: string;
  url: string;
}

defineProps<{
  resources: Resource[];
}>();

defineEmits<{
  (e: 'remove', index: number): void;
}>();

const getResourceIcon = (type: string) => {
  const icons = {
    document: 'i-heroicons-document-text',
    image: 'i-heroicons-photo',
    video: 'i-heroicons-video-camera',
    link: 'i-heroicons-link',
  };
  return icons[type as keyof typeof icons] || 'i-heroicons-document';
};

const getResourceColor = (type: string): BadgeColor => {
  const colors: Record<string, BadgeColor> = {
    document: 'blue',
    image: 'emerald',
    video: 'purple',
    link: 'amber',
  };
  return colors[type as keyof typeof colors] || 'gray';
};

const formatResourceType = (type: string) => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>