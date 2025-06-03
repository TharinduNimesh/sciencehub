<template>
  <USlideover v-model="isOpen" side="right" :ui="{ width: 'md:max-w-[600px]' }">
    <div class="p-6 flex-1 bg-white overflow-y-auto h-full">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">
            {{ isEdit ? 'Edit Quiz' : 'Create New Quiz' }}
          </h2>
          <p class="text-gray-600 mt-1">
            {{ isEdit ? 'Update quiz details' : 'Add a new quiz for your students' }}
          </p>
        </div>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-heroicons-x-mark"
          @click="closeModal"
        />
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Quiz Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Quiz Title *
          </label>
          <UInput
            v-model="form.title"
            placeholder="Enter quiz title..."
            size="lg"
            :error="errors.title"
            class="w-full"
          />
          <p v-if="errors.title" class="text-red-500 text-sm mt-1">
            {{ errors.title }}
          </p>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <UTextarea
            v-model="form.description"
            placeholder="Brief description of the quiz..."
            :rows="3"
            class="w-full"
          />
        </div>

        <!-- Google Form Link -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Google Form Link *
          </label>
          <UInput
            v-model="form.googleFormLink"
            placeholder="https://forms.gle/..."
            size="lg"
            :error="errors.googleFormLink"
            class="w-full"
          />
          <p v-if="errors.googleFormLink" class="text-red-500 text-sm mt-1">
            {{ errors.googleFormLink }}
          </p>
          <p class="text-gray-500 text-sm mt-1">
            Paste the shareable link to your Google Form
          </p>
        </div>

        <!-- Classes and Duration -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Classes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Classes *
            </label>
            <USelectMenu
              v-model="form.selectedClasses"
              :options="classOptions"
              placeholder="Select classes"
              multiple
              option-attribute="label"
              value-attribute="value"
              :error="errors.selectedClasses"
              class="w-full"
            />
            <p v-if="errors.selectedClasses" class="text-red-500 text-sm mt-1">
              {{ errors.selectedClasses }}
            </p>
            <p class="text-gray-500 text-sm mt-1">
              {{ form.selectedClasses.length }} class{{ form.selectedClasses.length !== 1 ? 'es' : '' }} selected
            </p>
          </div>

          <!-- Duration -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Duration (optional)
            </label>
            <USelectMenu
              v-model="form.duration"
              :options="durationOptions"
              placeholder="No time limit"
              option-attribute="label"
              value-attribute="value"
            />
          </div>
        </div>

        <!-- Quiz Schedule -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900">Quiz Schedule</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Start Date Time -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Start Date & Time *
              </label>
              <UInput
                v-model="form.startDateTime"
                type="datetime-local"
                :error="errors.startDateTime"
                class="w-full"
                :min="new Date().toISOString().slice(0, 16)"
              />
              <p v-if="errors.startDateTime" class="text-red-500 text-sm mt-1">
                {{ errors.startDateTime }}
              </p>
            </div>

            <!-- End Date Time -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                End Date & Time *
              </label>
              <UInput
                v-model="form.endDateTime"
                type="datetime-local"
                :error="errors.endDateTime"
                class="w-full"
                :min="form.startDateTime || new Date().toISOString().slice(0, 16)"
              />
              <p v-if="errors.endDateTime" class="text-red-500 text-sm mt-1">
                {{ errors.endDateTime }}
              </p>
            </div>
          </div>
          <p class="text-gray-500 text-sm">
            Set when students can access and submit the quiz
          </p>
        </div>

        <!-- Instructions -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Instructions for Students
          </label>
          <UTextarea
            v-model="form.instructions"
            placeholder="Any special instructions or notes for students..."
            :rows="4"
            class="w-full"
          />
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <UButton
            variant="outline"
            color="gray"
            @click="closeModal"
          >
            Cancel
          </UButton>
          <UButton
            type="submit"
            color="primary"
            :loading="isSubmitting"
            :disabled="!canSubmit"
          >
            {{ isEdit ? 'Update Quiz' : 'Create Quiz' }}
          </UButton>
        </div>
      </form>
    </div>
  </USlideover>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  quiz: {
    type: Object,
    default: null
  },
  availableClasses: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

// Local state
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.quiz)
const isSubmitting = ref(false)

const form = ref({
  title: '',
  description: '',
  googleFormLink: '',
  selectedClasses: [],
  duration: null,
  startDateTime: '',
  endDateTime: '',
  instructions: ''
})

const errors = ref({})

// Options
const classOptions = computed(() => 
  props.availableClasses.map(cls => ({
    label: `${cls.name} (${cls.studentCount} students)`,
    value: cls.id
  }))
)

const durationOptions = [
  { label: 'No time limit', value: null },
  { label: '15 minutes', value: '15' },
  { label: '30 minutes', value: '30' },
  { label: '45 minutes', value: '45' },
  { label: '1 hour', value: '60' },
  { label: '1.5 hours', value: '90' },
  { label: '2 hours', value: '120' }
]

// Computed properties
const canSubmit = computed(() => {
  return form.value.title.trim() &&
         form.value.googleFormLink.trim() &&
         form.value.selectedClasses.length > 0 &&
         form.value.startDateTime &&
         form.value.endDateTime &&
         !isSubmitting.value
})

// Methods
const validateForm = () => {
  errors.value = {}
  
  if (!form.value.title.trim()) {
    errors.value.title = 'Quiz title is required'
  }
  
  if (!form.value.googleFormLink.trim()) {
    errors.value.googleFormLink = 'Google Form link is required'
  } else if (!isValidUrl(form.value.googleFormLink)) {
    errors.value.googleFormLink = 'Please enter a valid URL'
  }
  
  if (form.value.selectedClasses.length === 0) {
    errors.value.selectedClasses = 'Please select at least one class'
  }

  if (!form.value.startDateTime) {
    errors.value.startDateTime = 'Start date and time is required'
  }

  if (!form.value.endDateTime) {
    errors.value.endDateTime = 'End date and time is required'
  } else if (form.value.startDateTime && form.value.endDateTime) {
    const startDate = new Date(form.value.startDateTime)
    const endDate = new Date(form.value.endDateTime)
    if (endDate <= startDate) {
      errors.value.endDateTime = 'End date must be after start date'
    }
  }
  
  return Object.keys(errors.value).length === 0
}

const isValidUrl = (string) => {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

const toggleClass = (classId) => {
  const index = form.value.selectedClasses.indexOf(classId)
  if (index > -1) {
    form.value.selectedClasses.splice(index, 1)
  } else {
    form.value.selectedClasses.push(classId)
  }
}

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    googleFormLink: '',
    selectedClasses: [],
    duration: null,
    startDateTime: '',
    endDateTime: '',
    instructions: ''
  }
  errors.value = {}
}

const loadQuizData = () => {
  if (props.quiz) {
    form.value = {
      title: props.quiz.title || '',
      description: props.quiz.description || '',
      googleFormLink: props.quiz.googleFormLink || '',
      selectedClasses: props.quiz.availableClasses?.map(cls => cls.id) || [],
      duration: props.quiz.duration || null,
      startDateTime: props.quiz.startDateTime || '',
      endDateTime: props.quiz.endDateTime || '',
      instructions: props.quiz.instructions || ''
    }
  } else {
    // Reset form when no quiz is provided (for adding new quiz)
    resetForm()
  }
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  isSubmitting.value = true
  
  try {
    const submitData = {
      ...form.value
    }
    
    await emit('submit', {
      data: submitData,
      isEdit: isEdit.value,
      quiz: props.quiz
    })
    
    closeModal()
  } catch (error) {
    console.error('Error submitting quiz:', error)
  } finally {
    isSubmitting.value = false
  }
}

const closeModal = () => {
  isOpen.value = false
  setTimeout(() => {
    resetForm()
  }, 300)
}

// Watch for quiz changes
watch(() => props.quiz, loadQuizData, { immediate: true })
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    loadQuizData()
  }
})
</script>
