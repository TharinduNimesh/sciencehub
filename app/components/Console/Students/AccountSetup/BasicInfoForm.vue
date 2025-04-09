<template>
  <UForm :schema="schema" :state="formState" @submit="handleSubmit" class="space-y-6">
    <div class="grid grid-cols-2 gap-4">
      <UFormGroup label="Date of Birth" name="birthday">
        <UInput v-model="formState.birthday" type="date" />
      </UFormGroup>

      <UFormGroup label="Gender" name="gender">
        <USelectMenu
          v-model="formState.gender"
          :options="genderOptions"
          value-attribute="value"
          placeholder="Select Your Gender"
        />
      </UFormGroup>
    </div>

    <UFormGroup label="School" name="school">
      <UInput v-model="formState.school" placeholder="Enter your school name" />
    </UFormGroup>

    <UFormGroup label="Grade" name="grade">
      <USelectMenu
        v-model="formState.grade"
        :options="gradeOptions"
        value-attribute="value"
        placeholder="Select your grade"
      />
    </UFormGroup>

    <div class="flex justify-end pt-4">
      <PrimaryButton type="submit" size="md">Next</PrimaryButton>
    </div>
  </UForm>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { z } from 'zod'
import PrimaryButton from '@/components/Landing/PrimaryButton.vue'

const emit = defineEmits<{
  submit: [data: {
    birthday: string
    gender: string
    grade: number
    school: string
  }]
}>()

const schema = z.object({
  birthday: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  grade: z.number().min(1, 'Grade is required'),
  school: z.string().min(1, 'School name is required'),
})

const formState = reactive({
  birthday: '',
  gender: '',
  grade: undefined as number | undefined,
  school: '',
})

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
]

const gradeOptions = Array.from({ length: 6 }, (_, i) => ({
  label: `Grade ${i + 6}`,
  value: i + 6,
}))

const handleSubmit = (event: any) => {
  emit('submit', event.data)
}
</script>