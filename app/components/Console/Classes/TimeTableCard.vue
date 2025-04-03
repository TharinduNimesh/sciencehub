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
        <div class="flex justify-end gap-2">
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

// Blob paths object with new tiny blobs
const blobPaths = {
  large1: "M120.7,-97.2C152.9,-67.7,173.5,-21.5,169.8,24.5C166,70.6,137.8,116.5,97.7,136.3C57.5,156.1,5.4,149.8,-40.5,131.5C-86.4,113.2,-126.1,82.9,-143.5,39.8C-160.9,-3.3,-156,-59.3,-129.6,-90.2C-103.1,-121.2,-55.1,-127.2,-6.8,-122.1C41.5,-117,88.5,-126.8,120.7,-97.2Z",
  large2: "M137.1,-116.5C170.1,-74.8,183.9,-12.9,168.9,40.1C153.9,93,110.1,137,58.9,156.3C7.8,175.6,-50.7,170.2,-94.8,144.1C-138.9,118,-168.6,71.2,-175.4,19.9C-182.3,-31.4,-166.2,-87.1,-130.3,-128.4C-94.4,-169.6,-38.7,-196.3,9.6,-203.4C57.9,-210.4,104.1,-158.2,137.1,-116.5Z",
  medium1: "M84.2,-70.4C103.6,-45.8,109.3,-11.1,103.2,20.8C97.2,52.8,79.4,81.9,52.4,98.1C25.3,114.2,-11,117.4,-40.9,104.5C-70.8,91.6,-94.3,62.6,-103.4,28.8C-112.5,-5,-107.2,-43.6,-87,-69.8C-66.8,-96,-33.4,-109.8,-0.5,-109.4C32.4,-109,64.8,-94.9,84.2,-70.4Z",
  medium2: "M67.5,-56.5C83.4,-36.1,89.7,-7.2,85.5,20.1C81.3,47.4,66.6,73.1,43.1,87.1C19.6,101.1,-12.6,103.3,-38.6,91.7C-64.5,80,-84.1,54.4,-91.6,24.4C-99.1,-5.6,-94.5,-40,-76.1,-60.7C-57.8,-81.3,-25.9,-88.3,1.2,-89.2C28.3,-90.1,51.6,-76.9,67.5,-56.5Z",
  small1: "M44.1,-30.1C55.4,-15.7,61.5,4.9,56.3,23.1C51.1,41.3,34.6,57.1,14.7,62.2C-5.2,67.3,-28.5,61.7,-45.1,47.4C-61.8,33,-71.8,9.9,-67.3,-10.2C-62.8,-30.3,-43.7,-47.4,-24.9,-60.1C-6.1,-72.7,12.4,-80.8,25.2,-72.5C38,-64.1,45.1,-39.2,44.1,-30.1Z",
  small2: "M31.4,-25.1C39.1,-13.4,42.7,1.5,39.1,14.9C35.4,28.3,24.5,40.2,10.2,45.2C-4,50.1,-21.6,48.1,-34.8,38.7C-48,29.3,-56.8,12.5,-55.4,-3.5C-54,-19.5,-42.3,-34.7,-28.4,-45.6C-14.4,-56.4,1.8,-63,11.5,-56.8C21.2,-50.6,23.6,-36.8,31.4,-25.1Z",
  tiny1: "M20.5,-19.3C25.5,-14.1,27.9,-7,27.4,-0.5C26.9,6,23.6,12,18.8,16.8C14,21.6,7,25.2,-0.2,25.4C-7.4,25.6,-14.8,22.4,-19.9,17.6C-25,12.8,-27.8,6.4,-27.4,0.4C-27,-5.6,-23.4,-11.2,-18.4,-16.4C-13.4,-21.6,-6.7,-26.4,0.2,-26.6C7.1,-26.8,14.1,-22.4,20.5,-19.3Z",
  tiny2: "M15.8,-13.2C20.6,-11.7,24.7,-9.8,27.4,-5.8C30.1,-1.9,31.3,4.1,31.1,11C30.9,17.9,29.3,25.7,26.2,28.7C23.2,31.7,18.7,29.9,13.5,28.8C8.3,27.7,2.3,27.3,-3.7,26.7C-9.7,26.1,-15.7,25.4,-20.8,21.8C-25.8,18.2,-29.9,11.7,-32.3,4.2C-34.7,-3.3,-35.4,-11.8,-33.4,-20C-31.4,-28.2,-26.8,-36.1,-21.3,-35.9C-15.8,-35.7,-9.4,-27.4,-3.2,-23.7C3,-20,11,-14.8,15.8,-13.2Z",
  tiny3: "M12.5,-11.3C15.9,-6.5,18.1,-1.6,17.4,3.1C16.8,7.8,13.3,12.4,8.5,14.7C3.7,17,-2.4,17,-7.2,14.8C-12,12.6,-15.5,8.2,-16.6,3.1C-17.7,-2,-16.4,-7.8,-13,-11.9C-9.6,-16.1,-4.8,-18.5,0.2,-18.7C5.2,-18.8,9.1,-16.1,12.5,-11.3Z",
  tiny4: "M14.4,-12.8C17.4,-7.7,18.1,-2.1,17.1,3.4C16.1,8.9,13.5,14.4,9.1,16.7C4.7,19.1,-1.5,18.4,-6.9,16.1C-12.3,13.8,-16.9,9.9,-18.3,4.8C-19.7,-0.3,-17.9,-6.6,-14.4,-11.7C-10.9,-16.8,-5.5,-20.7,0,-20.7C5.4,-20.7,11.3,-17.9,14.4,-12.8Z"
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