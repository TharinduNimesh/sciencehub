<template>
  <UForm :schema="schema" :state="formState" @submit="handleSubmit" class="space-y-6">
    <!-- Contact Pairs -->
    <div v-for="(contact, index) in formState.contacts" :key="index" class="p-4 border border-gray-200 rounded-lg space-y-4">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-sm font-semibold text-gray-700">Contact {{ index + 1 }}</h3>
        <UButton v-if="index > 0" color="red" variant="ghost" icon="i-heroicons-trash" @click="removeContact(index)" />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <UFormGroup :label="'Relation'" :name="`contacts.${index}.relation`">
          <USelectMenu
            v-model="contact.relation"
            :options="relationOptions"
            value-attribute="value"
            placeholder="Select relation"
          />
        </UFormGroup>

        <UFormGroup :label="'Contact Name'" :name="`contacts.${index}.name`">
          <UInput v-model="contact.name" placeholder="Enter contact name" />
        </UFormGroup>
      </div>

      <UFormGroup :label="'Mobile Number'" :name="`contacts.${index}.mobile`">
        <UInput v-model="contact.mobile" placeholder="Enter mobile number" />
      </UFormGroup>
    </div>

    <UButton variant="ghost" color="gray" class="w-full" @click="addContact">
      <div class="flex items-center justify-center">
        <Icon name="i-heroicons-plus-circle" class="mr-2" />
        Add Another Contact
      </div>
    </UButton>

    <div class="flex justify-between pt-4">
      <SecondaryButton @click="$emit('back')" size="md">Back</SecondaryButton>
      <PrimaryButton type="submit" size="md">Next</PrimaryButton>
    </div>
  </UForm>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { z } from 'zod'
import PrimaryButton from '@/components/Landing/PrimaryButton.vue'
import SecondaryButton from '@/components/Landing/SecondaryButton.vue'

const emit = defineEmits<{
  submit: [data: {
    contacts: Array<{
      relation: string
      name: string
      mobile: string
    }>
  }]
  back: []
}>()

const contactSchema = z.object({
  relation: z.string().min(1, 'Relation is required'),
  name: z.string().min(1, 'Contact name is required'),
  mobile: z.string().min(10, 'Valid mobile number is required').max(15)
})

const schema = z.object({
  contacts: z.array(contactSchema).min(1, 'At least one contact is required')
})

const formState = reactive({
  contacts: [{ relation: '', name: '', mobile: '' }]
})

const relationOptions = [
  { label: 'Parent', value: 'parent' },
  { label: 'Guardian', value: 'guardian' },
  { label: 'Sibling', value: 'sibling' },
  { label: 'Other', value: 'other' }
]

const addContact = () => {
  formState.contacts.push({ relation: '', name: '', mobile: '' })
}

const removeContact = (index: number) => {
  formState.contacts.splice(index, 1)
}

const handleSubmit = (event: any) => {
  emit('submit', event.data)
}
</script>