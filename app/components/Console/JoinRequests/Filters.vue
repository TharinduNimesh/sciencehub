<template>
  <div class="bg-white p-4 rounded-lg border border-gray-200 mb-6">
    <div class="flex flex-col space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <UInput
          v-model="filters.search"
          placeholder="Search by name or email"
          icon="i-heroicons-magnifying-glass"
          :ui="{ base: 'relative flex w-full', input: 'block w-full bg-gray-50/50' }"
          @input="handleSearchInput"
        />
        
        <USelectMenu
          :model-value="filters.grade"
          @update:model-value="value => handleGradeChange(value)"
          :options="gradeOptions"
          placeholder="Filter by grade"
          value-attribute="value"
          :ui="{ base: 'relative w-full', trigger: { base: 'bg-gray-50/50 w-full' } }"
        />

        <USelectMenu
          :model-value="filters.status"
          @update:model-value="value => handleStatusChange(value)"
          :options="statusOptions"
          placeholder="Filter by status"
          value-attribute="value"
          :ui="{ base: 'relative w-full', trigger: { base: 'bg-gray-50/50 w-full' } }"
        />

        <USelectMenu
          :model-value="filters.invitationStatus"
          @update:model-value="value => handleInvitationStatusChange(value)"
          :options="invitationStatusOptions"
          placeholder="Filter by invitation"
          value-attribute="value"
          :ui="{ base: 'relative w-full', trigger: { base: 'bg-gray-50/50 w-full' } }"
        />
      </div>

      <!-- Active filters bar -->
      <div v-if="isFiltersActive" class="flex items-center justify-between pt-2 border-t">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">Active filters:</span>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-if="filters.search"
              color="gray"
              variant="soft"
              class="items-center"
            >
              Search: {{ filters.search }}
            </UBadge>
            <UBadge
              v-if="filters.grade !== undefined"
              color="gray"
              variant="soft"
              class="items-center"
            >
              Grade {{ filters.grade }}
            </UBadge>
            <UBadge
              v-if="filters.status"
              color="gray"
              variant="soft"
              class="items-center"
            >
              {{ filters.status }}
            </UBadge>
            <UBadge
              v-if="filters.invitationStatus"
              color="gray"
              variant="soft"
              class="items-center"
            >
              Invitation: {{ filters.invitationStatus }}
            </UBadge>
          </div>
        </div>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark"
          size="sm"
          @click="handleClearFilters"
        >
          Clear all
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Option {
  label: string;
  value: string | number;
}

const { filters, isFiltersActive, clearFilters } = useJoinRequestFilters();

const gradeOptions: Option[] = [
  { label: 'Grade 6', value: 6 },
  { label: 'Grade 7', value: 7 },
  { label: 'Grade 8', value: 8 },
  { label: 'Grade 9', value: 9 },
  { label: 'Grade 10', value: 10 },
  { label: 'Grade 11', value: 11 }
];

const statusOptions: Option[] = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Accepted', value: 'Accepted' },
  { label: 'Rejected', value: 'Rejected' }
];

const invitationStatusOptions: Option[] = [
  { label: 'Sent', value: 'Sent' },
  { label: 'Accepted', value: 'Accepted' },
  { label: 'Expired', value: 'Expired' },
  { label: 'Deleted', value: 'Deleted' }
];

const emit = defineEmits(['update:filters']);

// Type-safe handlers for select changes
const handleGradeChange = (value: number | undefined) => {
  filters.grade = value;
  emit('update:filters', filters);
};

const handleStatusChange = (value: string | undefined) => {
  filters.status = value;
  emit('update:filters', filters);
};

const handleInvitationStatusChange = (value: string | undefined) => {
  filters.invitationStatus = value;
  emit('update:filters', filters);
};

const handleSearchInput = () => {
  emit('update:filters', filters);
};

const handleClearFilters = () => {
  clearFilters();
  emit('update:filters', filters);
};
</script>