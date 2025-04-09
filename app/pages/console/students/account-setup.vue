<template>
  <div class="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
    <!-- Blob Elements -->
    <div class="absolute inset-0 z-0">
      <div class="absolute top-[20%] left-[5%] w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-3xl animate-blob"></div>
      <div class="absolute bottom-[20%] right-[5%] w-[400px] h-[400px] bg-violet-200/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
    </div>

    <!-- Loading State -->
    <div v-if="isValidating" class="w-full max-w-2xl z-10">
      <div class="mx-4">
        <div class="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl">
          <div class="flex flex-col items-center justify-center space-y-4">
            <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-violet-600" />
            <p class="text-gray-600 font-medium">Validating your account...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Setup Container -->
    <Motion v-else :initial="{ opacity: 0, y: 20, scale: 0.95 }" :whileInView="{ opacity: 1, y: 0, scale: 1 }"
      :transition="{ type: 'spring', stiffness: 50, damping: 15 }" class="w-full max-w-2xl z-10">
      <!-- Branding Outside Card -->
      <div class="text-center mb-6 mx-4">
        <NuxtLink to="/" class="inline-block">
          <div class="flex items-center justify-center space-x-3 mb-4 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="ScienceHub Logo" class="h-10 w-auto">
            <span class="font-bold text-2xl text-gray-600">SCIENCE<span
                class="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-indigo-300 text-transparent bg-clip-text">HUB</span>
            </span>
          </div>
        </NuxtLink>
      </div>

      <div class="mx-4">
        <div class="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl">
          <!-- Title -->
          <div class="text-center mb-8">
            <h1 class="text-2xl font-display font-bold bg-gradient-to-r from-violet-700 to-indigo-600 bg-clip-text text-transparent">
              Complete Your Profile
            </h1>
            <p class="text-gray-600 mt-2 text-sm font-medium">Let's set up your student account</p>
          </div>

          <!-- Stepper -->
          <div class="mb-8">
            <div class="flex items-center justify-center">
              <div v-for="step in steps" :key="step.number" class="flex items-center">
                <div :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm',
                  currentStep >= step.number ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-500',
                ]">
                  {{ step.number }}
                </div>
                <div v-if="step.number !== steps.length" :class="[
                  'w-20 h-1 mx-2',
                  currentStep > step.number ? 'bg-violet-600' : 'bg-gray-200',
                ]"></div>
              </div>
            </div>
            <div class="flex justify-center mt-2">
              <p class="text-sm font-medium text-gray-600">{{ currentStepTitle }}</p>
            </div>
          </div>

          <!-- Forms -->
          <BasicInfoForm v-if="currentStep === 1" @submit="handleBasicInfoSubmit" />
          <ContactForm v-if="currentStep === 2" @submit="handleContactInfoSubmit" @back="currentStep--" />
          <AddressForm v-if="currentStep === 3" @submit="handleAddressSubmit" @back="currentStep--" :loading="isLoading" />
        </div>
      </div>
    </Motion>
  </div>
</template>

<script setup lang="ts">
import type { Database } from '@/types/supabase'
import { ref, reactive, computed } from 'vue'
import { Motion } from 'motion-v'
import BasicInfoForm from '@/components/Console/Students/AccountSetup/BasicInfoForm.vue'
import ContactForm from '@/components/Console/Students/AccountSetup/ContactForm.vue'
import AddressForm from '@/components/Console/Students/AccountSetup/AddressForm.vue'

const supabase = useSupabaseClient<Database>()
const router = useRouter()
const toast = useToast()
const { data: { user } } = await supabase.auth.getUser()

const isValidating = ref(true)
const currentStep = ref(1)
const isLoading = ref(false)

// Validate user and role
onMounted(async () => {
  isValidating.value = true
  try {
    if (!user) {
      await router.push('/auth/sign-in')
      return
    }

    // Get user profile to check role
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError

    // Check if user is a student
    if (profileData.role?.toUpperCase() !== 'STUDENT') {
      toast.add({
        title: 'Access Denied',
        description: 'This page is only for student account setup',
        color: 'red'
      })
      await router.push('/console/dashboard')
      return
    }

    // Check if student account is already set up
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (studentData) {
      toast.add({
        title: 'Account Setup Complete',
        description: 'Your student profile is already set up',
        color: 'blue'
      })
      await router.push('/console/dashboard')
      return
    }

    // If there's no student record (PGRST116 error) or other setup-related error, allow setup to continue
    if (studentError && studentError.code !== 'PGRST116') {
      throw studentError
    }
  } catch (error: any) {
    console.error('Validation error:', error)
    toast.add({
      title: 'Error',
      description: error.message || 'An error occurred during validation',
      color: 'red'
    })
    await router.push('/auth/sign-in')
  } finally {
    isValidating.value = false
  }
})

const steps = [
  { number: 1, title: 'Basic Information' },
  { number: 2, title: 'Contact Information' },
  { number: 3, title: 'Address Information' }
]

const currentStepTitle = computed(() => {
  return steps.find(step => step.number === currentStep.value)?.title
})

// Form data storage with types
interface BasicInfo {
  birthday: string
  gender: string
  grade: number
  school: string
}

interface Contact {
  relation: string
  name: string
  mobile: string
}

interface ContactInfo {
  contacts: Contact[]
}

interface AddressInfo {
  street: string
  city: string
  postalCode: number
}

const formData = reactive<{
  basicInfo: BasicInfo | null
  contacts: ContactInfo | null
  address: AddressInfo | null
}>({
  basicInfo: null,
  contacts: null,
  address: null
})

const handleBasicInfoSubmit = (data: BasicInfo) => {
  formData.basicInfo = data
  currentStep.value++
}

const handleContactInfoSubmit = (data: ContactInfo) => {
  formData.contacts = data
  currentStep.value++
}

const handleAddressSubmit = async (data: AddressInfo) => {
  formData.address = data
  isLoading.value = true

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user found')

    // Insert student record
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert({
        user_id: user.id,
        current_grade: formData.basicInfo!.grade,
        date_of_birth: formData.basicInfo!.birthday,
        gender: formData.basicInfo!.gender.toUpperCase() as 'MALE' | 'FEMALE'
      })
      .select()
      .single()

    if (studentError) throw studentError

    // Insert contacts
    const contactPromises = formData.contacts!.contacts.map(contact => {
      return supabase
        .from('student_contact')
        .insert({
          student_id: student.id,
          relation: contact.relation,
          contact_name: contact.name,
          details: contact.mobile
        })
    })

    // Insert address if provided
    if (formData.address) {
      const { error: addressError } = await supabase
        .from('student_address')
        .insert({
          student_id: student.id,
          street: formData.address.street,
          city: formData.address.city,
          postal_code: formData.address.postalCode
        })

      if (addressError) throw addressError
    }

    // Wait for all contact insertions
    await Promise.all(contactPromises)

    toast.add({
      title: 'Success',
      description: 'Your profile has been set up successfully',
      color: 'green'
    })

    // Redirect to dashboard
    await router.push('/console/dashboard')

  } catch (error: any) {
    console.error('Setup error:', error)
    toast.add({
      title: 'Error',
      description: error.message || 'An error occurred during setup',
      color: 'red'
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(20px, -30px) scale(1.1);
  }
  50% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  75% {
    transform: translate(20px, 30px) scale(0.95);
  }
}

.animate-blob {
  animation: blob 25s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}
</style>
