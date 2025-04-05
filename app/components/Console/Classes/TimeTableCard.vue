<template>
  <div 
    class="relative rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
    :class="[
      entry.is_cancelled ? 'border-red-200 bg-red-50' : isToday ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-white',
    ]"
  >
    <!-- Background Pattern -->
    <div 
      class="absolute inset-0 overflow-hidden opacity-50"
      :class="{
        'text-red-200': entry.is_cancelled,
        'text-purple-200': isToday && !entry.is_cancelled,
        'text-gray-100': !entry.is_cancelled && !isToday
      }"
    >
      <!-- Top-left amoeba -->
      <svg 
        class="absolute -left-32 -top-32 w-96 h-96 animate-float-slow"
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M200,50 Q280,50 300,120 Q320,190 300,250 Q280,310 220,330 Q160,350 120,310 Q80,270 60,220 Q40,170 60,120 Q80,70 140,60 Q180,50 200,50" fill="currentColor" opacity="0.6"/>
      </svg>
      
      <!-- Bottom-right amoeba -->
      <svg 
        class="absolute -right-24 -bottom-24 w-80 h-80 animate-float-medium"
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M180,80 Q250,60 290,100 Q330,140 350,200 Q370,260 330,300 Q290,340 230,340 Q170,340 130,300 Q90,260 90,200 Q90,140 130,100 Q150,80 180,80" fill="currentColor" opacity="0.5"/>
      </svg>

      <!-- Middle floating shapes -->
      <svg 
        class="absolute left-1/4 top-1/4 w-32 h-32 animate-float-fast"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M80,40 Q110,30 130,50 Q150,70 150,100 Q150,130 130,150 Q110,170 80,160 Q50,150 40,120 Q30,90 50,60 Q70,30 80,40" fill="currentColor" opacity="0.4"/>
      </svg>

      <!-- Small floating amoeba -->
      <svg 
        class="absolute right-1/3 bottom-1/3 w-24 h-24 animate-float-medium"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M90,50 Q120,40 140,60 Q160,80 150,110 Q140,140 110,150 Q80,160 60,140 Q40,120 50,90 Q60,60 90,50" fill="currentColor" opacity="0.3"/>
      </svg>

      <!-- Tiny floating shapes -->
      <svg 
        class="absolute right-1/4 top-1/2 w-16 h-16 animate-float-fast"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M100,60 Q120,50 135,65 Q150,80 145,100 Q140,120 120,130 Q100,140 85,125 Q70,110 75,90 Q80,70 100,60" fill="currentColor" opacity="0.4"/>
      </svg>
    </div>

    <div class="relative flex p-6 gap-6">
      <!-- Left side with method icon -->
      <div class="flex-shrink-0">
        <div
          class="w-14 h-14 flex items-center justify-center rounded-xl"
          :class="{
            'bg-purple-300 text-purple-800': isToday && !entry.is_cancelled,
            'bg-red-200 text-red-700': entry.is_cancelled,
            'bg-purple-50 text-purple-500': !entry.is_cancelled && !isToday && entry.method?.startsWith('Virtual'),
            'bg-blue-50 text-blue-500': !entry.is_cancelled && !isToday && entry.method?.startsWith('InPerson'),
          }"
        >
          <UIcon
            :name="entry.method?.startsWith('Virtual') ? 'i-heroicons-computer-desktop' : 'i-heroicons-building-office-2'"
            class="text-2xl"
          />
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0 space-y-4">
        <!-- Header -->
        <div class="flex justify-between items-start gap-4">
          <div class="space-y-1">
            <h3 class="text-lg font-semibold" :class="{
              'text-red-900': entry.is_cancelled,
              'text-purple-900': isToday && !entry.is_cancelled,
              'text-gray-900': !entry.is_cancelled && !isToday
            }">
              {{ entry.name }}
            </h3>
            <p class="text-sm" :class="{
              'text-red-500': entry.is_cancelled,
              'text-purple-500': isToday && !entry.is_cancelled,
              'text-gray-500': !entry.is_cancelled && !isToday
            }">
              {{ entry.description }}
            </p>
          </div>
          <UBadge
            :color="entry.is_cancelled ? 'red' : isToday ? 'purple' : 'green'"
            size="sm"
            :variant="entry.is_cancelled || (isToday && !entry.is_cancelled) ? 'solid' : 'soft'"
            class="flex-shrink-0"
          >
            {{ entry.is_cancelled ? "Cancelled" : "Scheduled" }}
          </UBadge>
        </div>

        <!-- Schedule info -->
        <div class="flex flex-wrap gap-6 text-sm">
          <div class="flex items-center gap-2" :class="{
            'text-red-600': entry.is_cancelled,
            'text-purple-600': isToday && !entry.is_cancelled,
            'text-gray-600': !entry.is_cancelled && !isToday
          }">
            <UIcon name="i-heroicons-calendar" size="lg" />
            <span>{{ formatDate(entry.date) }}</span>
          </div>
          <div class="flex items-center gap-2" :class="{
            'text-red-600': entry.is_cancelled,
            'text-purple-600': isToday && !entry.is_cancelled,
            'text-gray-600': !entry.is_cancelled && !isToday
          }">
            <UIcon name="i-heroicons-clock" size="lg" />
            <span>{{ formatTime(entry.start_time) }} - {{ formatTime(entry.end_time) }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-2" v-if="isAdmin()">
          <template v-if="entry.is_cancelled">
            <UButton
              color="red"
              variant="soft"
              icon="i-heroicons-calendar"
              :ui="{ rounded: 'rounded-full' }"
              size="sm"
              @click="handleReschedule"
            >
              Reschedule
            </UButton>
          </template>
          <template v-else>
            <UButton
              :color="isToday ? 'purple' : 'yellow'"
              variant="soft"
              icon="i-heroicons-x-circle"
              :ui="{ rounded: 'rounded-full' }"
              size="sm"
              @click="handleCancel"
            >
              Cancel Session
            </UButton>
          </template>
        </div>
      </div>
    </div>

    <!-- Add the ConfirmationDialog component -->
    <ConfirmationDialog
      v-model="isCancelDialogOpen"
      title="Cancel Class"
      :description="cancelDialogDescription"
      type="warning"
      confirm-text="Yes, Cancel Class"
      cancel-text="No, Keep Class"
      @confirm="handleConfirmCancel"
    />
    <ConfirmationDialog
      v-model="isRescheduleDialogOpen"
      title="Reschedule Class"
      :description="rescheduleDialogDescription"
      type="info"
      confirm-text="Yes, Reschedule Class"
      cancel-text="No, Keep Cancelled"
      @confirm="handleConfirmReschedule"
    />
  </div>
</template>

<script setup lang="ts">
import ConfirmationDialog from "~/components/Common/ConfirmationDialog.vue";
const notification = useNotification();

interface TimeTableEntry {
  id: number;
  class_id: number;  // Adding this property
  name: string;
  description: string | null;
  date: string;
  start_time: string;
  end_time: string;
  method: string;
  is_cancelled: boolean;
}

const props = defineProps<{
  entry: TimeTableEntry;
}>();

const emit = defineEmits<{
  (e: "cancel"): void;
  (e: "reschedule", entry: TimeTableEntry): void;
  (e: "refresh"): void;
}>();

const { cancelClassByDate, rescheduleClassByDate } = useClasses();

const isCancelDialogOpen = ref(false);
const cancelDialogDescription = computed(() => `Are you sure you want to cancel the class "${props.entry.name}" scheduled on ${formatDate(props.entry.date)}?`);

const handleCancel = () => {
  isCancelDialogOpen.value = true;
};

const handleConfirmCancel = async () => {
  try {
    await cancelClassByDate(props.entry.class_id, props.entry.date);
    notification.showSuccess('Class cancelled successfully');
    emit('refresh');
    isCancelDialogOpen.value = false;
  } catch (error) {
    console.error('Error cancelling class:', error);
    notification.showError('Failed to cancel class');
  }
};

const handleReschedule = () => {
  isRescheduleDialogOpen.value = true;
};

const handleConfirmReschedule = async () => {
  try {
    await rescheduleClassByDate(props.entry.class_id, props.entry.date);
    notification.showSuccess('Class rescheduled successfully');
    emit('refresh');
    isRescheduleDialogOpen.value = false;
  } catch (error) {
    console.error('Error rescheduling class:', error);
    notification.showError('Failed to reschedule class');
  }
};

// Add dialog state
const isRescheduleDialogOpen = ref(false);

// Add reschedule dialog description
const rescheduleDialogDescription = computed(() => 
  `Are you sure you want to reschedule the class "${props.entry.name}" from ${formatDate(props.entry.date)}? This will mark this session as active again.`
);

// Utility functions for date/time formatting
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (time: string) => {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Add computed property for checking if the class is today
const isToday = computed(() => {
  const today = new Date();
  const classDate = new Date(props.entry.date);
  return (
    classDate.getDate() === today.getDate() &&
    classDate.getMonth() === today.getMonth() &&
    classDate.getFullYear() === today.getFullYear()
  );
});
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

@keyframes float-fast {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    transform: translate(8px, -8px) rotate(8deg);
  }
}

.animate-float-slow {
  animation: float-slow 15s ease-in-out infinite;
}

.animate-float-medium {
  animation: float-medium 10s ease-in-out infinite;
}

.animate-float-fast {
  animation: float-fast 8s ease-in-out infinite;
}
</style>