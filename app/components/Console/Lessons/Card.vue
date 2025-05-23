<template>
  <div
    class="relative rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden h-full flex flex-col bg-white group"
  >
    <!-- Background Pattern -->
    <div
      class="absolute inset-0 overflow-hidden"
      :class="
        lesson.is_hidden
          ? 'opacity-30 text-yellow-200'
          : 'opacity-30 text-purple-200'
      "
    >
      <!-- Top-right amoeba -->
      <svg
        class="absolute -right-32 -top-32 w-96 h-96 animate-float-slow"
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M200,50 Q280,50 300,120 Q320,190 300,250 Q280,310 220,330 Q160,350 120,310 Q80,270 60,220 Q40,170 60,120 Q80,70 140,60 Q180,50 200,50"
          fill="currentColor"
          opacity="0.6"
        />
      </svg>

      <!-- Bottom-left amoeba -->
      <svg
        class="absolute -left-24 -bottom-24 w-80 h-80 animate-float-medium"
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M180,80 Q250,60 290,100 Q330,140 350,200 Q370,260 330,300 Q290,340 230,340 Q170,340 130,300 Q90,260 90,200 Q90,140 130,100 Q150,80 180,80"
          fill="currentColor"
          opacity="0.5"
        />
      </svg>

      <!-- Middle floating shapes -->
      <svg
        class="absolute left-1/4 top-1/4 w-32 h-32 animate-float-fast"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M80,40 Q110,30 130,50 Q150,70 150,100 Q150,130 130,150 Q110,170 80,160 Q50,150 40,120 Q30,90 50,60 Q70,30 80,40"
          fill="currentColor"
          opacity="0.4"
        />
      </svg>
    </div>

    <!-- Content wrapper -->
    <div class="p-6 flex flex-col flex-1 space-y-6">
      <!-- Thumbnail with overlay -->
      <NuxtLink :to="`/console/lessons/${lesson.id}`" class="block">
        <div class="relative aspect-video w-full overflow-hidden rounded-lg">
          <img
            :src="thumbnailUrl"
            :alt="lesson.title"
            class="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            @error="handleImageError"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-purple-200/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <div class="w-full h-full flex items-center justify-center">
              <UButton
                size="lg"
                variant="soft"
                icon="heroicons-play-20-solid"
                :ui="{ rounded: 'rounded-full' }"
              />
            </div>
          </div>
        </div>
      </NuxtLink>

      <div class="flex-1 space-y-4">
        <div class="flex items-center justify-between mb-2">
          <UBadge
            :color="lesson.is_hidden ? 'yellow' : 'purple'"
            variant="soft"
            size="sm"
            class="font-medium"
          >
            {{ classDisplay }}
          </UBadge>
          <div class="flex items-center gap-2 text-gray-500">
            <UIcon name="i-heroicons-clock" size="sm" />
            <span>{{ formatDuration(lesson.duration) }}</span>
          </div>
        </div>

        <NuxtLink
          :to="`/console/lessons/${lesson.id}`"
          class="block group/title"
        >
          <h3
            class="font-semibold text-lg mb-2 line-clamp-2 text-gray-900 group-hover/title:text-gray-600 transition-colors"
          >
            {{ lesson.title }}
          </h3>
        </NuxtLink>

        <p class="text-sm line-clamp-2 text-gray-500">
          {{ lesson.description || "No description available." }}
        </p>
      </div>

      <div
        class="flex justify-between items-center pt-4 border-t border-gray-100"
      >
        <div class="text-xs text-gray-500 flex items-center gap-2">
          <UIcon name="i-heroicons-calendar" size="lg" />
          Created {{ formatDate(lesson.createdAt) }}
        </div>

        <div class="flex gap-2" v-if="isAdmin()">
          <UTooltip text="Edit lesson">
            <UButton
              size="sm"
              color="orange"
              variant="soft"
              icon="i-heroicons-pencil-square"
              :ui="{ rounded: 'rounded-full' }"
              @click="showEditModal = true"
              square
            />
          </UTooltip>
          <UTooltip :text="lesson.is_hidden ? 'Unhide lesson' : 'Hide lesson'">
            <UButton
              size="sm"
              color="yellow"
              variant="soft"
              :icon="
                lesson.is_hidden ? 'i-heroicons-eye' : 'i-heroicons-eye-slash'
              "
              :ui="{ rounded: 'rounded-full' }"
              @click="showHideConfirmation = true"
              square
            />
          </UTooltip>
        </div>
      </div>
    </div>

    <!-- Hide/Unhide Confirmation Dialog -->
    <ConfirmationDialog
      v-model="showHideConfirmation"
      :title="lesson.is_hidden ? 'Unhide Lesson' : 'Hide Lesson'"
      :description="
        lesson.is_hidden
          ? 'This lesson will be visible to everyone in the assigned classes. Are you sure you want to unhide this lesson?'
          : 'This lesson will not be shown to anyone in the assigned classes. Are you sure you want to hide this lesson?'
      "
      type="warning"
      :confirm-text="lesson.is_hidden ? 'Unhide Lesson' : 'Hide Lesson'"
      @confirm="handleHideLesson"
    />

    <!-- Edit Modal -->
    <EditModal
      v-model="showEditModal"
      :lesson="lesson"
      @updated="handleEditLesson"
    />
  </div>
</template>

<script setup lang="ts">
import ConfirmationDialog from "~/components/Common/ConfirmationDialog.vue";
import EditModal from "./EditModal.vue";
import type { Lesson } from "~/types/lesson";
import type { Database } from "~/types/supabase";

const props = defineProps<{
  lesson: Lesson;
}>();

const emit = defineEmits<{
  edit: [lesson: Lesson];
  view: [lesson: Lesson];
  delete: [lesson: Lesson];
  hide: [lesson: Lesson];
}>();

const showHideConfirmation = ref(false);
const showEditModal = ref(false);
const { hideLesson } = useLesson();

const handleHideLesson = async () => {
  try {
    const supabase = useSupabaseClient<Database>();
    const { error } = await supabase
      .from("lessons")
      .update({ is_hidden: !props.lesson.is_hidden })
      .eq("id", props.lesson.id);

    if (error) throw error;

    showHideConfirmation.value = false;
    emit("hide", { ...props.lesson, is_hidden: !props.lesson.is_hidden });

    useNotification().showSuccess(
      !props.lesson.is_hidden
        ? "Lesson has been hidden"
        : "Lesson is now visible"
    );
  } catch (error) {
    console.error("Error updating lesson visibility:", error);
    useNotification().showError("Failed to update lesson visibility");
  }
};

const handleEditLesson = (updatedLesson: Lesson) => {
  showEditModal.value = false;
  emit("edit", updatedLesson);
};

// Format duration (minutes) to readable format
const formatDuration = (minutes: number): string => {
  if (!minutes) return '0 min';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
};

// Update formatDate to handle optional createdAt
const formatDate = (date: string | undefined) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Add default thumbnail path
const defaultThumbnail = "/images/thumbnail.webp";

// Add computed property for thumbnail URL with fallback
const thumbnailUrl = computed(() => {
  if (
    !props.lesson.thumbnailUrl ||
    props.lesson.thumbnailUrl.includes("undefined")
  ) {
    return defaultThumbnail;
  }
  return props.lesson.thumbnailUrl;
});

// Add computed property for class display
const classDisplay = computed(() => {
  if (!props.lesson.class_lessons?.length) return "No Class";
  
  const firstClass = props.lesson.class_lessons[0];
  if (!firstClass?.classes) return "No Class";
  
  if (props.lesson.class_lessons.length === 1) {
    return `Grade ${firstClass.classes.grade} | ${firstClass.classes.name}`;
  }
  
  return `Grade ${firstClass.classes.grade} | ${firstClass.classes.name} and ${props.lesson.class_lessons.length - 1} more`;
});

// Add error handler for images
const handleImageError = (event: Event) => {
  const imgElement = event.target as HTMLImageElement;
  imgElement.src = defaultThumbnail;
};
</script>

<style scoped>
@keyframes float-slow {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    transform: translate(15px, -15px) rotate(3deg);
  }
}

@keyframes float-medium {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    transform: translate(-12px, 12px) rotate(-5deg);
  }
}

@keyframes float-fast {
  0%,
  100% {
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
