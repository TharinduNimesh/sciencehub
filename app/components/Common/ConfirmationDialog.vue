<template>
  <UModal
    v-model="isOpen"
    :ui="{
      width: 'w-full sm:max-w-lg',
      container: 'items-center',
      wrapper: 'sm:p-4',
      base: 'relative overflow-hidden sm:rounded-2xl',
      padding: 'p-0',
      background: 'bg-white',
      ring: 'ring-1 ring-gray-200',
      rounded: 'sm:rounded-2xl',
    }"
  >
    <UCard class="shadow-none border-none">
      <template #header>
        <div class="flex items-start gap-4 pb-4 border-gray-100">
          <div
            :class="`w-11 h-11 flex justify-center items-center rounded-full bg-${buttonColorMap[type]}-50`"
          >
            <UIcon
              :name="iconMap[type]"
              class="w-7 h-7"
              :class="iconColorMap[type]"
            />
          </div>
          <div class="flex-1 pt-1">
            <h3 class="text-lg font-semibold tracking-tight">{{ title }}</h3>
            <p class="text-sm text-gray-500 mt-1">
              {{ description }}
              <UButton
                v-if="hasLearnMore"
                variant="link"
                color="primary"
                size="xs"
                @click="$emit('learn-more')"
                class="-mx-1 -my-0.5"
              >
                Learn more
              </UButton>
            </p>
          </div>
        </div>
      </template>

      <template #footer>
        <div
          class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-gray-100"
        >
          <UButton
            color="gray"
            variant="ghost"
            @click="$emit('update:modelValue', false)"
            class="w-full sm:w-auto"
          >
            {{ cancelText }}
          </UButton>
          <UButton
            :color="buttonColorMap[type]"
            :variant="buttonVariantMap[type]"
            @click="$emit('confirm')"
            class="w-full sm:w-auto"
          >
            {{ confirmText }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
type DialogType = "danger" | "warning" | "info" | "success";
type ButtonColor = "primary" | "gray" | "red" | "yellow" | "green";
type ButtonVariant = "solid" | "soft" | "outline" | "ghost";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    description: string;
    type?: DialogType;
    confirmText?: string;
    cancelText?: string;
    hasLearnMore?: boolean;
  }>(),
  {
    type: "info",
    confirmText: "Confirm",
    cancelText: "Cancel",
    hasLearnMore: false,
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  confirm: [];
  "learn-more": [];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const iconMap: Record<DialogType, string> = {
  danger: "i-heroicons-exclamation-triangle",
  warning: "i-heroicons-exclamation-circle",
  info: "i-heroicons-information-circle",
  success: "i-heroicons-check-circle",
};

const iconColorMap: Record<DialogType, string> = {
  danger: "text-red-500",
  warning: "text-yellow-500",
  info: "text-blue-500",
  success: "text-green-500",
};

const buttonColorMap: Record<DialogType, ButtonColor> = {
  danger: "red",
  warning: "yellow",
  info: "primary",
  success: "green",
};

const buttonVariantMap: Record<DialogType, ButtonVariant> = {
  danger: "solid",
  warning: "soft",
  info: "soft",
  success: "soft",
};
</script>
