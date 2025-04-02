<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div class="p-6 space-y-4">
      <!-- Header Section -->
      <div class="flex justify-between items-start">
        <div class="space-y-1">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ classItem.name }}
          </h3>
          <p class="text-sm text-gray-600 line-clamp-2">
            {{ classItem.description }}
          </p>
        </div>
        <UDropdown
          :popper="{ arrow: true }"
          :items="menuItems"
          :ui="{
            item: {
              base: 'flex items-center gap-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100',
            },
          }"
        >
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-ellipsis-horizontal"
            :ui="{ rounded: 'rounded-full' }"
          />
        </UDropdown>
      </div>

      <UDivider />

      <!-- Method & Schedule Section -->
      <div class="space-y-3">
        <!-- Method Badge -->
        <div class="flex items-center gap-2">
          <UBadge
            :color="methodColor"
            :icon="methodIcon"
            size="sm"
            class="font-medium"
          >
            {{ formatMethodLabel(classItem.method) }}
          </UBadge>
        </div>

        <!-- Schedule -->
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <div class="i-heroicons-calendar text-lg" />
          <span>{{ classItem.date }}</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <div class="i-heroicons-clock text-lg" />
          <span
            >{{ formatTime(classItem.start_time) }} -
            {{ formatTime(classItem.end_time) }}</span
          >
        </div>
      </div>

      <UDivider />

      <!-- Tags Section -->
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="tag in classItem.tags"
          :key="tag"
          color="gray"
          variant="soft"
          size="xs"
        >
          {{ tag }}
        </UBadge>
      </div>

      <UDivider />

      <!-- Footer Section -->
      <div class="space-y-3">
        <!-- Status & Creation Date -->
        <div class="flex items-center justify-between">
          <UBadge :color="classItem.is_active ? 'green' : 'gray'" size="sm">
            {{ classItem.is_active ? "Active" : "Inactive" }}
          </UBadge>
          <span class="text-xs text-gray-500">
            Created {{ formatDate(classItem.created_at) }}
          </span>
        </div>

        <!-- Student Count & Actions -->
        <div class="flex items-center justify-between">
          <div class="flex items-baseline gap-1 text-sm">
            <div class="i-heroicons-users text-lg text-gray-600" />
            <span class="text-gray-600">{{ classItem.student_count }}</span>
            <span class="text-xs text-gray-500">
              {{
                classItem.max_students ? `/ ${classItem.max_students}` : ""
              }}
              students
            </span>
            <UBadge
              v-if="
                classItem.max_students &&
                classItem.student_count >= classItem.max_students
              "
              color="red"
              variant="soft"
              size="xs"
            >
              Full
            </UBadge>
            <UBadge
              v-else-if="
                classItem.max_students &&
                classItem.student_count >= classItem.max_students * 0.9
              "
              color="yellow"
              variant="soft"
              size="xs"
            >
              Almost Full
            </UBadge>
          </div>

          <UButton
            size="sm"
            color="gray"
            variant="soft"
            icon="i-heroicons-user-group"
            :ui="{ rounded: 'rounded-full' }"
            @click="$emit('view-students', classItem)"
          >
            Students
          </UButton>
        </div>
      </div>
    </div>
  </div>

  <!-- Cancel Class Confirmation Dialog -->
  <CommonConfirmationDialog
    v-model="isCancelDialogOpen"
    title="Cancel Class"
    :description="cancelDialogDescription"
    type="warning"
    confirm-text="Yes, Cancel Class"
    cancel-text="No, Keep Class"
    @confirm="handleConfirmCancel"
  />
</template>

<script setup lang="ts">
import type { DropdownItem } from '#ui/types'

type ClassMethod =
  | "InPersonSingleSession"
  | "VirtualSingleSession"
  | "InPersonRecurringSeries"
  | "VirtualRecurringSeries";

interface ClassItem {
  id: number;
  name: string;
  description: string | null;
  date: string;
  start_time: string;
  end_time: string;
  method: ClassMethod;
  is_active: boolean;
  tags: string[];
  created_at: string;
  student_count: number;
  max_students: number | null;
}

interface MenuItem {
  label: string
  icon: string
  click: () => void
  class?: string
}

const props = defineProps<{
  classItem: ClassItem;
}>();

const emit = defineEmits<{
  (e: 'view-students', classItem: ClassItem): void
  (e: 'edit', classItem: ClassItem): void
  (e: 'delete', classItem: ClassItem): void
  (e: 'cancel-week', classItem: ClassItem): void
}>()

// Dialog state
const isCancelDialogOpen = ref(false)
const cancelDialogDescription = computed(() => {
  const dates = props.classItem.date
  return `Are you sure you want to cancel this week's class scheduled for ${dates}? Students will be notified of this cancellation.`
})

const handleConfirmCancel = () => {
  emit('cancel-week', props.classItem)
  isCancelDialogOpen.value = false
}

const methodColor = computed(() => {
  switch (props.classItem.method) {
    case "InPersonSingleSession":
    case "InPersonRecurringSeries":
      return "blue";
    case "VirtualSingleSession":
    case "VirtualRecurringSeries":
      return "purple";
    default:
      return "gray";
  }
});

const methodIcon = computed(() => {
  switch (props.classItem.method) {
    case "InPersonSingleSession":
    case "InPersonRecurringSeries":
      return "i-heroicons-building-office-2";
    case "VirtualSingleSession":
    case "VirtualRecurringSeries":
      return "i-heroicons-computer-desktop";
    default:
      return "";
  }
});

const formatMethodLabel = (method: ClassMethod) => {
  switch (method) {
    case "InPersonSingleSession":
      return "In-Person (Single)";
    case "VirtualSingleSession":
      return "Virtual (Single)";
    case "InPersonRecurringSeries":
      return "In-Person (Series)";
    case "VirtualRecurringSeries":
      return "Virtual (Series)";
  }
};

const formatTime = (time: string) => {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const menuItems = computed(() => {
  const items: DropdownItem[] = [
    {
      label: 'Edit Class',
      icon: 'i-heroicons-pencil-square',
      click: () => emit('edit', props.classItem)
    }
  ]

  // Add cancel week option only for recurring series classes
  if (props.classItem.method.endsWith('RecurringSeries') && props.classItem.is_active) {
    items.push({
      label: 'Cancel this week',
      icon: 'i-heroicons-x-circle',
      click: () => isCancelDialogOpen.value = true
    })
  }

  items.push({
    label: 'End Class',
    icon: 'i-heroicons-no-symbol',
    click: () => emit('delete', props.classItem)
  })

  return [items]
})
</script>
