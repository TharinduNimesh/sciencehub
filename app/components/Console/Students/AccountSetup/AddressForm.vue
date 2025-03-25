<template>
  <UForm :schema="schema" :state="formState" @submit="handleSubmit" class="space-y-6">
    <div class="space-y-4">
      <UFormGroup label="Street Address" name="street">
        <UTextarea v-model="formState.street" placeholder="Enter street address" />
      </UFormGroup>

      <div class="grid grid-cols-2 gap-4">
        <UFormGroup label="City" name="city">
          <UInput v-model="formState.city" placeholder="Enter city" />
        </UFormGroup>

        <UFormGroup label="Postal Code" name="postalCode">
          <UInput v-model="formState.postalCode" placeholder="Enter postal code" type="number" />
        </UFormGroup>
      </div>
    </div>

    <div class="flex justify-between pt-4">
      <SecondaryButton @click="$emit('back')" size="md">Back</SecondaryButton>
      <PrimaryButton type="submit" size="md" :loading="loading">Complete Setup</PrimaryButton>
    </div>
  </UForm>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { z } from 'zod'
import PrimaryButton from '@/components/Landing/PrimaryButton.vue'
import SecondaryButton from '@/components/Landing/SecondaryButton.vue'

const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [data: {
    street: string
    city: string
    postalCode: number
  }]
  back: []
}>()

const schema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.number().min(1, 'Postal code is required')
})

const formState = reactive({
  street: '',
  city: '',
  postalCode: undefined as number | undefined
})

const handleSubmit = (event: any) => {
  emit('submit', event.data)
}
</script>