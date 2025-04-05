<template>
  <div
    class="h-full bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
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
            <UIcon name="i-heroicons-calendar" size="lg" />
            <span>{{ formatDisplayDate }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <UIcon name="i-heroicons-clock" size="lg" />
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
        
        <!-- Show different actions based on view mode -->
        <div v-if="classItem.is_active" class="flex items-center gap-2">
          <template v-if="viewMode === 'summary'">
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
                @click="handleViewStudents(classItem)"
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
          </template>
          
          <!-- Cancel option available in both views for recurring classes -->
          <UTooltip
            v-if="isRecurringClass"
            text="Cancel this class"
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
        </div>
      </div>
    </div>
  </div>

  <!-- Cancel Class Confirmation Dialog -->
  <ConfirmationDialog
    v-model="isCancelDialogOpen"
    title="Cancel Class"
    :description="cancelDialogDescription"
    type="warning"
    confirm-text="Yes, Cancel Class"
    cancel-text="No, Keep Class"
    @confirm="handleConfirmCancel"
  />

  <!-- End Class Confirmation Dialog -->
  <ConfirmationDialog
    v-model="isEndClassDialogOpen"
    title="End Class"
    :description="endClassDialogDescription"
    type="danger"
    confirm-text="Yes, End Class"
    cancel-text="No, Keep Class"
    @confirm="handleConfirmEnd"
  />

  <!-- Students Modal -->
  <StudentsModal
    v-model="isStudentsModalOpen"
    :class-data="classItem"
    @updated="$emit('students-updated')"
  />
</template>

<script setup lang="ts">
import type { DropdownItem } from "#ui/types";
import ConfirmationDialog from "~/components/Common/ConfirmationDialog.vue";
import StudentsModal from "./StudentsModal.vue";

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
  viewMode: 'timetable' | 'summary';
}>();

const emit = defineEmits<{
  (e: "view-students", classItem: ClassItem): void;
  (e: "edit", classItem: ClassItem): void;
  (e: "delete", classItem: ClassItem): void;
  (e: "cancel-week", classItem: ClassItem): void;
  (e: "students-updated"): void;
}>();

// Import composables
const { cancelNextSession } = useClasses()
const notification = useNotification()

// Dialog states and loading
const isCancelDialogOpen = ref(false)
const isEndClassDialogOpen = ref(false)
const isCancelling = ref(false)

// Add this state
const isStudentsModalOpen = ref(false)

const getNextClassDate = (pattern: string): string | null => {
  try {
    // Get current date in local timezone and set to midnight
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Map weekday patterns to their day numbers (0 = Sunday, 6 = Saturday)
    const weekdayMap: Record<string, number> = {
      'SUN': 0,
      'MON': 1,
      'TUE': 2,
      'WED': 3,
      'THU': 4,
      'FRI': 5,
      'SAT': 6
    }
    
    const targetDay = weekdayMap[pattern]
    if (targetDay === undefined) return null
    
    // Create a new date object in local timezone
    const result = new Date(today)
    const currentDay = today.getDay()
    
    // Calculate days until next occurrence
    let daysUntilNext = targetDay - currentDay
    if (daysUntilNext <= 0) {
      // If target day is today or already passed this week, move to next week
      daysUntilNext += 7
    }
    
    // If it's the target day, check the time
    if (daysUntilNext === 0) {
      const now = new Date()
      const classTime = new Date(result)
      const [hours = '0', minutes = '0'] = props.classItem.start_time.split(':')
      classTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      
      // If we've passed the class time, move to next week
      if (now > classTime) {
        daysUntilNext = 7
      }
    }
    
    // Add the calculated days to get the next class date
    result.setDate(result.getDate() + daysUntilNext)
    
    // Format the date in YYYY-MM-DD format using local timezone
    const year = result.getFullYear()
    const month = String(result.getMonth() + 1).padStart(2, '0')
    const day = String(result.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
    
  } catch (error) {
    console.error('Error calculating next class date:', error)
    return null
  }
}

const nextClassDate = computed(() => {
  if (!isRecurringClass.value) return null
  return getNextClassDate(props.classItem.date)
})

const cancelDialogDescription = computed(() => {
  if (!nextClassDate.value) return ''
  
  // Create date object in local timezone
  const date = new Date(nextClassDate.value)
  const dateStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Colombo' // Set to Sri Lanka timezone
  }).format(date)
  
  return `Are you sure you want to cancel the class scheduled for ${dateStr}? Students will be notified of this cancellation.`
})

const handleConfirmCancel = async () => {
  if (isCancelling.value) return

  try {
    isCancelling.value = true
    await cancelNextSession(
      props.classItem.id, 
      props.classItem.date // Pass the pattern (e.g., 'MON', 'TUE', etc.)
    )
    notification.showSuccess('Class cancelled successfully')
    emit('cancel-week', props.classItem)
  } catch (error) {
    console.error('Error cancelling class:', error)
    notification.showError('Failed to cancel class')
  } finally {
    isCancelling.value = false
    isCancelDialogOpen.value = false
  }
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
  if (props.viewMode === 'timetable' && isRecurringClass.value) {
    // For timetable view, show the exact next class date
    const nextDate = getNextClassDate(props.classItem.date)
    if (nextDate) {
      return new Date(nextDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  // For summary view or non-recurring classes
  if (isRecurringClass.value) {
    const pattern = props.classItem.date;
    switch (pattern) {
      case "MON": return "Every Monday";
      case "TUE": return "Every Tuesday";
      case "WED": return "Every Wednesday";
      case "THU": return "Every Thursday";
      case "FRI": return "Every Friday";
      case "SAT": return "Every Saturday";
      case "SUN": return "Every Sunday";
      default: return pattern;
    }
  } else {
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

// Update the handleViewStudents function
const handleViewStudents = (classItem: ClassItem) => {
  isStudentsModalOpen.value = true
}

const handleConfirmEnd = () => {
  emit('delete', props.classItem)
  isEndClassDialogOpen.value = false
}

const endClassDialogDescription = computed(() => 
  `Are you sure you want to end the class "${props.classItem.name}"? This action cannot be undone and will permanently deactivate the class. Students will be notified of this change.`
)
</script>
