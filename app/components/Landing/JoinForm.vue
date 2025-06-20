<template>
  <section class="relative py-24 overflow-hidden">
    <!-- Background Elements -->
    <div class="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/40"></div>
    <div class="absolute top-1/2 left-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
    <div class="absolute top-1/2 right-0 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
    <div class="absolute bottom-0 left-1/4 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

    <div class="container mx-auto px-4 relative">
      <div class="max-w-7xl mx-auto">
        <!-- Glass Card Container -->
        <div class="backdrop-blur-sm bg-white/60 rounded-3xl shadow-2xl shadow-indigo-500/10 overflow-hidden border border-white/20">
          <div class="grid lg:grid-cols-5 gap-0">
            <!-- Image Section - Takes 2 columns -->
            <div class="lg:col-span-2 relative h-full">
              <div class="h-full">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80"
                  alt="Join our classes"
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 mix-blend-overlay"></div>
                <!-- Floating Card -->
                <div class="absolute bottom-8 left-8 right-8 backdrop-blur-md bg-white/90 p-6 rounded-2xl shadow-xl hidden lg:block" data-aos="fade-up">
                  <div class="flex items-start space-x-4">
                    <UIcon name="i-heroicons-academic-cap" class="text-indigo-600 w-8 h-8" />
                    <div>
                      <h3 class="text-lg font-semibold mb-1">Join Our Community</h3>
                      <p class="text-gray-600 text-sm">Start your learning journey with expert guidance and support</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Form Section - Takes 3 columns -->
            <div class="lg:col-span-3 p-8 lg:p-12">
              <div class="max-w-2xl" data-aos="fade-left">
                <span class="inline-block px-4 py-2 bg-purple-100 text-purple-600 rounded-full text-sm font-bold mb-6">
                  Begin Your Journey
                </span>
                <h2 class="text-4xl font-display font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  Ready to Transform Your Learning?
                </h2>
                <p class="text-gray-600 mb-8">Take the first step towards academic excellence. Join our innovative learning platform today.</p>

                <UForm :schema="joinFormSchema" :state="formState" @submit="handleSubmit" class="space-y-6">
                  <div class="grid md:grid-cols-2 gap-6">
                    <UFormGroup label="Full Name" name="fullName">
                      <UInput
                        v-model="formState.fullName"
                        placeholder="Enter your full name"
                        icon="i-heroicons-user"
                        class="bg-white/50"
                      />
                    </UFormGroup>

                    <UFormGroup label="Email" name="email">
                      <UInput
                        v-model="formState.email"
                        type="email"
                        placeholder="Enter your email"
                        icon="i-heroicons-envelope"
                        class="bg-white/50"
                      />
                    </UFormGroup>
                  </div>

                  <div class="grid md:grid-cols-2 gap-6">
                    <UFormGroup label="Contact Number" name="contactNumber">
                      <UInput
                        v-model="formState.contactNumber"
                        type="tel"
                        placeholder="Enter your contact number"
                        icon="i-heroicons-phone"
                        class="bg-white/50"
                      />
                    </UFormGroup>

                    <UFormGroup label="Grade" name="grade">
                      <USelectMenu
                        v-model="formState.grade"
                        :options="[...Array(6)].map((_, i) => ({
                          label: `Grade ${i + 6}`,
                          value: i + 6
                        }))"
                        placeholder="Select your grade"
                        class="bg-white/50"
                        value-attribute="value"
                      />
                    </UFormGroup>
                  </div>

                  <UFormGroup label="How did you find about us?" name="referralSource">
                    <USelectMenu
                      v-model="formState.referralSource"
                      :options="[
                        { label: 'Social Media', value: 'social' },
                        { label: 'Friend/Family', value: 'friend' },
                        { label: 'Search Engine', value: 'search' },
                        { label: 'Advertisement', value: 'advertisement' },
                        { label: 'Hand Bill', value: 'hand-bill' },
                        { label: 'Other', value: 'other' }
                      ]"
                      placeholder="Please select"
                      value-attribute="value"
                      class="bg-white/50"
                    />
                  </UFormGroup>

                  <div class="flex flex-col sm:flex-row items-center gap-4 sm:justify-between pt-6">
                    <p class="text-sm text-gray-500 order-2 sm:order-1">* All fields are required</p>
                    <PrimaryButton type="submit" size="lg" class="w-full sm:w-auto order-1 sm:order-2" :loading="isLoading">
                      Submit Application
                      <UIcon name="i-heroicons-arrow-right" class="ml-2" />
                    </PrimaryButton>
                  </div>
                </UForm>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive } from 'vue';
import PrimaryButton from './PrimaryButton.vue';
import { joinFormSchema } from '@/schemas';

const { createJoinRequest } = useJoinRequests();
const toast = useToast();
const isLoading = ref(false);

const formState = reactive({
  fullName: '',
  email: '',
  contactNumber: '',
  grade: null,
  referralSource: ''
});

const handleSubmit = async (event) => {
  isLoading.value = true;
  
  try {
    const validatedData = event.data;
    
    await createJoinRequest({
      name: validatedData.fullName,
      email: validatedData.email,
      mobile: validatedData.contactNumber,
      grade: validatedData.grade,
      how_did_find_us: validatedData.referralSource
    });
    
    // Show success message
    toast.add({
      title: 'Success',
      description: 'Your application has been submitted successfully. We will contact you soon.',
      color: 'green'
    });
    
    // Clear form
    Object.keys(formState).forEach(key => {
      formState[key] = key === 'grade' ? null : '';
    });
    
  } catch (error) {
    // Handle duplicate email error
    if (error?.code === '23505' && error?.message?.includes('duplicate key value')) {
      toast.add({
        title: 'Already Applied',
        description: 'You have already submitted a join request with this email. If you believe this is a mistake, please contact the administrator.',
        color: 'yellow'
      });
    } else {
      toast.add({
        title: 'Error',
        description: 'An error occurred while submitting your application. Please try again.',
        color: 'red'
      });
    }
    console.error('Form submission error:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style>
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}

@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}
</style>
