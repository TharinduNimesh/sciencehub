<template>
  <div class="space-y-6">
    <TransitionGroup 
      name="list" 
      tag="div" 
      class="space-y-4"
    >
      <div
        v-for="resource in resources"
        :key="resource.id"
        class="relative rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
        :class="[
          resource.type === 'notice' ? 'border-primary-200 bg-primary-50/30' : 'border-gray-200 bg-white'
        ]"
      >
        <!-- Background Pattern -->
        <div 
          class="absolute inset-0 overflow-hidden opacity-30"
          :class="{
            'text-primary-200': resource.type === 'notice',
            'text-gray-200': resource.type === 'resource'
          }"
        >
          <!-- Top-right amoeba -->
          <svg 
            class="absolute -right-32 -top-32 w-96 h-96 animate-float-slow"
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M200,50 Q280,50 300,120 Q320,190 300,250 Q280,310 220,330 Q160,350 120,310 Q80,270 60,220 Q40,170 60,120 Q80,70 140,60 Q180,50 200,50" fill="currentColor" opacity="0.6"/>
          </svg>

          <!-- Bottom-left amoeba -->
          <svg 
            class="absolute -left-24 -bottom-24 w-80 h-80 animate-float-medium"
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M180,80 Q250,60 290,100 Q330,140 350,200 Q370,260 330,300 Q290,340 230,340 Q170,340 130,300 Q90,260 90,200 Q90,140 130,100 Q150,80 180,80" fill="currentColor" opacity="0.5"/>
          </svg>
        </div>

        <div class="relative p-6">
          <div class="flex gap-6">
            <!-- Left side with type icon -->
            <div class="flex-shrink-0">
              <div
                class="w-14 h-14 flex items-center justify-center rounded-xl"
                :class="{
                  'bg-primary-100 text-primary-600': resource.type === 'notice',
                  'bg-blue-50 text-blue-500': resource.type === 'resource' && resource.resource_type === 'Document',
                  'bg-red-50 text-red-500': resource.type === 'resource' && resource.resource_type === 'Video',
                  'bg-green-50 text-green-500': resource.type === 'resource' && resource.resource_type === 'Image',
                  'bg-purple-50 text-purple-500': resource.type === 'resource' && resource.resource_type === 'Link'
                }"
              >
                <UIcon
                  :name="getResourceIcon(resource)"
                  class="text-2xl"
                />
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0 space-y-4">
              <!-- Header -->
              <div class="space-y-1">
                <div class="flex items-center justify-between gap-4">
                  <h3 class="text-lg font-semibold text-gray-900">{{ resource.title }}</h3>
                  <UBadge
                    :color="getResourceColor(resource)"
                    variant="soft"
                    size="sm"
                    class="font-medium"
                  >
                    {{ formatResourceType(resource) }}
                  </UBadge>
                </div>
                <p class="text-sm text-gray-500 line-clamp-2">
                  {{ resource.description || 'No description available' }}
                </p>
              </div>

              <!-- Resource specific content -->
              <template v-if="resource.type === 'notice' && resource.url">
                <div class="relative aspect-video w-full overflow-hidden rounded-lg">
                  <img
                    :src="resource.url"
                    :alt="resource.title"
                    class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </template>

              <!-- Footer -->
              <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                <div class="text-sm text-gray-500 flex items-center gap-2">
                  <UIcon name="i-heroicons-calendar" size="sm" />
                  <span>{{ formatDate(resource.createdAt) }}</span>
                </div>

                <UButton
                  :color="getResourceActionColor(resource)"
                  :variant="resource.type === 'notice' ? 'soft' : 'solid'"
                  size="sm"
                  :icon="getResourceActionIcon(resource)"
                  :ui="{ rounded: 'rounded-full' }"
                  class="transition-transform duration-300 group-hover:translate-x-1"
                  @click="handleResourceClick(resource)"
                >
                  {{ getResourceActionLabel(resource) }}
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TransitionGroup>

    <!-- Pagination -->
    <div class="flex justify-between items-center pt-4">
      <div class="text-sm text-gray-500">
        Showing {{ Math.min((currentPage - 1) * itemsPerPage + 1, totalItems) }}
        to {{ Math.min(currentPage * itemsPerPage, totalItems) }}
        of {{ totalItems }} resources
      </div>

      <UPagination
        v-model="currentPage"
        :total="totalItems"
        :page-count="itemsPerPage"
        size="sm"
        :ui="{
          wrapper: 'flex items-center gap-1',
          base: 'min-w-[32px] h-[32px] flex items-center justify-center text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors',
          rounded: 'rounded-lg',
          default: {
            inactive: 'hover:bg-gray-50',
            active: 'bg-primary-50 text-primary-500 font-medium',
          },
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CombinedResource, Resource, Notice, ResourceType } from '~/types/resource'
import type { BadgeColor, ButtonColor } from '#ui/types'

const props = defineProps<{
  resources: CombinedResource[];
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
}>();

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void;
  (e: 'resourceAction', resource: Resource): void;
  (e: 'noticeView', notice: Notice): void;
}>();

// Computed property for total pages
const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage));

// Two-way binding for pagination
const currentPage = computed({
  get: () => props.currentPage,
  set: (value) => emit('update:currentPage', value)
});

const getResourceIcon = (resource: CombinedResource): string => {
  if (resource.type === 'notice') {
    return 'i-heroicons-bell-alert'
  }

  const icons: Record<ResourceType, string> = {
    Document: 'i-heroicons-document-text',
    Image: 'i-heroicons-photo',
    Video: 'i-heroicons-video-camera',
    Link: 'i-heroicons-link',
  };
  return icons[resource.resource_type] || 'i-heroicons-document';
};

const getResourceColor = (resource: CombinedResource): BadgeColor => {
  if (resource.type === 'notice') {
    return 'primary'
  }

  const colors: Record<ResourceType, BadgeColor> = {
    Document: 'blue',
    Image: 'green',
    Video: 'red',
    Link: 'purple',
  };
  return colors[resource.resource_type] || 'gray';
};

const getResourceActionColor = (resource: CombinedResource): ButtonColor => {
  if (resource.type === 'notice') {
    return 'primary'
  }

  const colors: Record<ResourceType, ButtonColor> = {
    Document: 'blue',
    Image: 'green',
    Video: 'red',
    Link: 'purple',
  };
  return colors[resource.resource_type] || 'gray';
};

const getResourceActionIcon = (resource: CombinedResource): string => {
  if (resource.type === 'notice') {
    return 'i-heroicons-eye'
  }

  const icons: Record<ResourceType, string> = {
    Document: 'i-heroicons-arrow-down-tray',
    Image: 'i-heroicons-eye',
    Video: 'i-heroicons-play',
    Link: 'i-heroicons-arrow-top-right-on-square',
  };
  return icons[resource.resource_type] || 'i-heroicons-arrow-right';
};

const getResourceActionLabel = (resource: CombinedResource): string => {
  if (resource.type === 'notice') {
    return 'View Details'
  }

  const labels: Record<ResourceType, string> = {
    Document: 'Download',
    Image: 'View Image',
    Video: 'Watch Video',
    Link: 'Open Link',
  };
  return labels[resource.resource_type] || 'View';
};

const formatResourceType = (resource: CombinedResource): string => {
  if (resource.type === 'notice') {
    return 'Notice'
  }
  return resource.resource_type;
};

const formatDate = (date: string | undefined) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const handleResourceClick = (resource: CombinedResource) => {
  if (resource.type === 'notice') {
    emit('noticeView', resource)
  } else {
    emit('resourceAction', resource)
  }
};
</script>

<style scoped>
@keyframes float-slow {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    transform: translate(15px, -15px) rotate(3deg);
  }
}

@keyframes float-medium {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    transform: translate(-12px, 12px) rotate(-5deg);
  }
}

.animate-float-slow {
  animation: float-slow 15s ease-in-out infinite;
}

.animate-float-medium {
  animation: float-medium 10s ease-in-out infinite;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>