<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useClassStudents, type StudentDetails } from '~/composables/useClassStudents'
import { useNotification } from '~/composables/useNotification'

type Student = StudentDetails

const props = defineProps<{
  modelValue: boolean
  classId?: number
  grade?: number
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'added': [studentId: number]
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const search = ref('');
const availableStudents = ref<Student[]>([]);
const isLoading = ref(false);
const processingIds = ref<number[]>([]);

// Add constants for pagination
const INITIAL_DISPLAY_LIMIT = 5;
const showAllResults = ref(false);

const { getAvailableStudents, addStudentToClass } = useClassStudents();
const notification = useNotification();

const filteredStudents = computed(() => {
  if (!search.value && !showAllResults.value) {
    // Show only first 5 students when not searching
    return availableStudents.value.slice(0, INITIAL_DISPLAY_LIMIT);
  }
  
  if (search.value) {
    const searchTerm = search.value.toLowerCase();
    return availableStudents.value.filter(student => 
      student.name.toLowerCase().includes(searchTerm) || 
      student.email.toLowerCase().includes(searchTerm)
    );
  }

  // Show all students when showAllResults is true
  return availableStudents.value;
});

const hasMoreStudents = computed(() => {
  return !search.value && availableStudents.value.length > INITIAL_DISPLAY_LIMIT;
});

const loadAvailableStudents = async () => {
  if (!props.classId || !props.grade) {
    notification.showError('Missing required class information');
    return;
  }

  try {
    isLoading.value = true;
    const students = await getAvailableStudents(props.classId, props.grade);
    availableStudents.value = students;
  } catch (error) {
    console.error('Error loading available students:', error);
    notification.showError('Failed to load available students');
  } finally {
    isLoading.value = false;
  }
};

const handleAddStudent = async (student: Student) => {
  if (!props.classId) return;

  try {
    processingIds.value.push(student.id);
    await addStudentToClass(props.classId, student.id);
    emit('added', student.id);
    notification.showSuccess(`${student.name} has been added to the class`);
    
    // Remove student from available list
    availableStudents.value = availableStudents.value.filter(s => s.id !== student.id);
  } catch (error) {
    console.error('Error adding student:', error);
    notification.showError(`Failed to add ${student.name} to the class`);
  } finally {
    processingIds.value = processingIds.value.filter(id => id !== student.id);
  }
};

// Load students when modal opens
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    loadAvailableStudents();
  }
});
</script>

<template>
  <UModal v-model="isOpen" :ui="{
    width: 'w-full sm:max-w-xl',
    container: 'items-center',
    padding: 'p-0'
  }">
    <UCard class="shadow-none border-none">
      <template #header>
        <div class="flex items-center gap-3 pb-4 border-b border-gray-100">
          <UIcon name="i-heroicons-user-plus" class="w-6 h-6 text-primary-500" />
          <div>
            <h3 class="text-lg font-semibold tracking-tight">Add Students to Class</h3>
            <p class="text-sm text-gray-500">Add existing students to this class</p>
          </div>
        </div>
      </template>

      <div class="py-4 px-6">
        <!-- Search Input -->
        <UInput
          v-model="search"
          icon="i-heroicons-magnifying-glass"
          placeholder="Search students to add..."
          class="mb-4"
        />

        <!-- Available Students List -->
        <div class="space-y-2 max-h-[300px] overflow-y-auto">
          <div v-if="isLoading" class="flex justify-center py-4">
            <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin text-gray-400" />
          </div>
          
          <template v-else>
            <div
              v-for="student in filteredStudents"
              :key="student.id"
              class="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              <div class="flex items-center space-x-3">
                <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span class="text-sm font-medium text-gray-600">
                    {{ student.name.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ student.name }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ student.email }}
                  </div>
                </div>
              </div>
              <UButton
                size="sm"
                color="primary"
                variant="soft"
                :loading="processingIds.includes(student.id)"
                icon="i-heroicons-plus"
                @click="handleAddStudent(student)"
              />
            </div>
            
            <!-- Show View More button when there are more students -->
            <div v-if="hasMoreStudents && !showAllResults" class="pt-2">
              <UButton
                color="gray"
                variant="ghost"
                block
                @click="showAllResults = true"
              >
                View All Students
              </UButton>
            </div>
            
            <div
              v-if="filteredStudents.length === 0"
              class="p-4 text-center text-sm text-gray-500"
            >
              {{ search ? "No students match your search" : "No students available to add" }}
            </div>
          </template>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <UButton color="gray" variant="ghost" @click="isOpen = false">
            Done
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>