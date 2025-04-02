<template>
  <div
    class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
  >
    <div class="p-6 space-y-4">
      <!-- Header Section -->
      <div class="flex justify-between items-start gap-4">
        <div class="space-y-1 flex-1">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ classItem.name }}
          </h3>
          <p class="text-sm text-gray-500 line-clamp-2">
            {{ classItem.description }}
          </p>
        </div>
        <UBadge :color="classItem.is_active ? 'green' : 'gray'" size="sm">
          {{ classItem.is_active ? "Active" : "Inactive" }}
        </UBadge>
      </div>

      <!-- Method & Schedule Section -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <!-- Method Badge -->
          <UBadge
            :color="methodColor"
            :icon="methodIcon"
            size="sm"
            class="font-medium"
            variant="soft"
          >
            {{ formatMethodLabel(classItem.method) }}
          </UBadge>
          <UBadge color="gray" variant="soft" size="sm">
            Grade {{ classItem.grade }}
          </UBadge>
        </div>

        <!-- Schedule -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <div class="i-heroicons-calendar text-lg" />
            <span>{{ formatDisplayDate }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <div class="i-heroicons-clock text-lg" />
            <span
              >{{ formatTime(classItem.start_time) }} -
              {{ formatTime(classItem.end_time) }}</span
            >
          </div>
        </div>
      </div>

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

      <!-- Actions Section -->
      <div class="flex items-center justify-between pt-2">
        <span class="text-xs text-gray-500">
          Created {{ formatDate(classItem.created_at) }}
        </span>
        <div v-if="classItem.is_active" class="flex items-center gap-2">
          <UTooltip text="Edit class details" :popper="{ arrow: true }">
            <UButton
              color="orange"
              variant="soft"
              icon="i-heroicons-pencil-square"
              :ui="{ rounded: 'rounded-full' }"
              size="sm"
              @click="$emit('edit', classItem)"
            />
          </UTooltip>
          <UTooltip text="Manage students" :popper="{ arrow: true }">
            <UButton
              color="blue"
              variant="soft"
              icon="i-heroicons-users"
              :ui="{ rounded: 'rounded-full' }"
              size="sm"
              @click="$emit('view-students', classItem)"
            />
          </UTooltip>
          <UTooltip
            v-if="isRecurringClass"
            text="Cancel this week"
            :popper="{ arrow: true }"
          >
            <UButton
              color="yellow"
              variant="soft"
              icon="i-heroicons-x-circle"
              :ui="{ rounded: 'rounded-full' }"
              size="sm"
              @click="isCancelDialogOpen = true"
            />
          </UTooltip>
          <UTooltip text="End this class permanently" :popper="{ arrow: true }">
            <UButton
              color="red"
              variant="soft"
              icon="i-heroicons-no-symbol"
              :ui="{ rounded: 'rounded-full' }"
              size="sm"
              @click="isEndClassDialogOpen = true"
            />
          </UTooltip>
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

  <!-- End Class Confirmation Dialog -->
  <CommonConfirmationDialog
    v-model="isEndClassDialogOpen"
    title="End Class"
    :description="endClassDialogDescription"
    type="danger"
    confirm-text="Yes, End Class"
    cancel-text="No, Keep Class"
    @confirm="handleConfirmEnd"
  />
</template>

<script setup lang="ts">
import type { DropdownItem } from "#ui/types";

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
  grade: number; // Adding the missing grade property
}

interface MenuItem {
  label: string;
  icon: string;
  click: () => void;
  class?: string;
}

const props = defineProps<{
  classItem: ClassItem;
}>();

const emit = defineEmits<{
  (e: "view-students", classItem: ClassItem): void;
  (e: "edit", classItem: ClassItem): void;
  (e: "delete", classItem: ClassItem): void;
  (e: "cancel-week", classItem: ClassItem): void;
}>();

// Dialog states
const isCancelDialogOpen = ref(false)
const isEndClassDialogOpen = ref(false)

const endClassDialogDescription = computed(() => 
  `Are you sure you want to end the class "${props.classItem.name}"? This action cannot be undone and will permanently deactivate the class. Students will be notified of this change.`
)

const cancelDialogDescription = computed(() => {
  const dates = props.classItem.date
  return `Are you sure you want to cancel this week's class scheduled for ${dates}? Students will be notified of this cancellation.`
})

const handleConfirmCancel = () => {
  emit('cancel-week', props.classItem)
  isCancelDialogOpen.value = false
}

const handleConfirmEnd = () => {
  emit('delete', props.classItem)
  isEndClassDialogOpen.value = false
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

const isRecurringClass = computed(() => {
  return props.classItem.method.endsWith("RecurringSeries");
});

const formatDisplayDate = computed(() => {
  if (isRecurringClass.value) {
    // Handle recurring class date patterns
    const pattern = props.classItem.date;
    switch (pattern) {
      case "MON":
        return "Every Monday";
      case "TUE":
        return "Every Tuesday";
      case "WED":
        return "Every Wednesday";
      case "THU":
        return "Every Thursday";
      case "FRI":
        return "Every Friday";
      case "SAT":
        return "Every Saturday";
      case "SUN":
        return "Every Sunday";
      default:
        return pattern;
    }
  } else {
    // Handle single session dates
    return new Date(props.classItem.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
});

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
    class: 'text-red-600 hover:text-red-700',
    click: () => isEndClassDialogOpen.value = true
  })

  return [items]
})
</script>
