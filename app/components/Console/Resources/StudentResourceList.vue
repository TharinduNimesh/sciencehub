<template>
  <div class="border border-gray-100 rounded-xl overflow-hidden">
    <div class="bg-gray-50 px-4 py-3 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <h3 class="font-medium">All Resources</h3>
        <UBadge color="primary" variant="soft" size="sm">{{ resources.length }}</UBadge>
      </div>
    </div>
    <div class="divide-y divide-gray-100">
      <div v-for="resource in resources" :key="resource.id" 
        class="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
        @click="resource.type ? handleResourceAction(resource) : handleNoticeView(resource)"
      >
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0">
            <UAvatar
              v-if="!resource.type"
              :src="resource.image"
              :alt="resource.title"
              size="lg"
            />
            <UIcon 
              v-else
              :name="getResourceTypeIcon(resource.type)" 
              class="w-10 h-10"
              :class="getResourceTypeIconClass(resource.type)"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h4 class="font-medium text-gray-900">{{ resource.title }}</h4>
                <p class="text-sm text-gray-500">{{ formatDate(resource.createdAt) }}</p>
              </div>
              <UBadge
                v-if="resource.type"
                :color="getResourceTypeColor(resource.type)"
                variant="soft"
                size="sm"
                class="flex items-center gap-1"
              >
                <UIcon :name="getResourceTypeIcon(resource.type)" class="w-4 h-4" />
                {{ resource.type }}
              </UBadge>
              <UBadge
                v-else
                color="amber"
                variant="soft"
                size="sm"
                class="flex items-center gap-1"
              >
                <UIcon name="i-heroicons-bell-alert" class="w-4 h-4" />
                Notice
              </UBadge>
            </div>
            <p class="mt-1 text-sm text-gray-600 line-clamp-2">{{ resource.description }}</p>
            <div class="mt-2 flex items-center gap-4">
              <div class="flex flex-wrap gap-2">
                <UBadge v-for="className in resource.classes" :key="className" 
                  :color="getClassBadgeColor(className)" 
                  variant="soft" 
                  size="xs"
                >
                  {{ formatClassName(className) }}
                </UBadge>
              </div>
              <UButton
                v-if="resource.type"
                :color="getResourceTypeColor(resource.type)"
                variant="soft"
                size="xs"
                :icon="getResourceActionIcon(resource.type)"
                class="ml-auto"
              >
                {{ getResourceActionLabel(resource.type) }}
              </UButton>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!resources.length" class="p-4 text-center text-gray-500">
        No resources available
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Resource {
  id: number
  title: string
  description: string
  type?: string
  createdAt: string
  classes: string[]
  image?: string
  url?: string
}

const props = defineProps<{
  resources: Resource[]
}>()

const emit = defineEmits<{
  (e: 'resourceAction', resource: Resource): void
  (e: 'noticeView', resource: Resource): void
}>()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatClassName = (className: string): string => {
  const parts = className.split(' - ')
  if (parts.length === 2) {
    const grade = parts[0].match(/\d+/)?.[0] || ''
    return `G${grade} ${parts[1]}`
  }
  return className
}

const getClassBadgeColor = (className: string): string => {
  if (className.includes('Physics')) return 'blue'
  if (className.includes('Chemistry')) return 'green'
  if (className.includes('Biology')) return 'yellow'
  if (className.includes('Mathematics')) return 'purple'
  return 'gray'
}

const getResourceTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    'Document': 'i-heroicons-document-text',
    'Video': 'i-heroicons-video-camera',
    'Image': 'i-heroicons-photo',
    'Link': 'i-heroicons-link'
  }
  return icons[type] || 'i-heroicons-document'
}

const getResourceTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    'Document': 'blue',
    'Video': 'red',
    'Image': 'green',
    'Link': 'purple'
  }
  return colors[type] || 'gray'
}

const getResourceTypeIconClass = (type: string): string => {
  const classes: Record<string, string> = {
    'Document': 'text-blue-500',
    'Video': 'text-red-500',
    'Image': 'text-green-500',
    'Link': 'text-purple-500'
  }
  return classes[type] || 'text-gray-500'
}

const getResourceActionIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'Document': 'i-heroicons-arrow-down-tray',
    'Video': 'i-heroicons-play',
    'Image': 'i-heroicons-eye',
    'Link': 'i-heroicons-arrow-top-right-on-square'
  }
  return icons[type] || 'i-heroicons-arrow-right'
}

const getResourceActionLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'Document': 'Download',
    'Video': 'Watch Video',
    'Image': 'View Image',
    'Link': 'Open Link'
  }
  return labels[type] || 'View'
}

const handleResourceAction = (resource: Resource) => {
  emit('resourceAction', resource)
}

const handleNoticeView = (resource: Resource) => {
  emit('noticeView', resource)
}
</script>