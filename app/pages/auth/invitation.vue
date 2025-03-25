<template>
    <div class="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
        <!-- Blob Elements -->
        <div class="absolute inset-0 z-0">
            <div class="absolute top-[20%] left-[5%] w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-3xl animate-blob">
            </div>
            <div class="absolute bottom-[20%] right-[5%] w-[400px] h-[400px] bg-violet-200/30 rounded-full blur-3xl animate-blob animation-delay-2000">
            </div>
        </div>

        <!-- Invitation Container -->
        <Motion :initial="{ opacity: 0, y: 20, scale: 0.95 }" :whileInView="{ opacity: 1, y: 0, scale: 1 }"
            :transition="{ type: 'spring', stiffness: 50, damping: 15 }" class="w-full max-w-md z-10">
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
                    <!-- Dynamic Title based on invitation state -->
                    <div class="text-center mb-8">
                        <template v-if="invitationState === 'active'">
                            <h1 class="text-2xl font-display font-bold bg-gradient-to-r from-violet-700 to-indigo-600 bg-clip-text text-transparent">
                                Complete Your Registration
                            </h1>
                            <p class="text-gray-600 mt-2 text-sm font-medium" v-if="invitationRole === 'STUDENT'">
                                You're invited to join Grade {{ invitationGrade }} as a student
                            </p>
                            <p class="text-gray-600 mt-2 text-sm font-medium" v-else>
                                You're invited to join as a moderator to manage the LMS system
                            </p>
                        </template>
                        <template v-else-if="invitationState === 'used'">
                            <h1 class="text-2xl font-display font-bold text-gray-900">
                                Invitation Already Used
                            </h1>
                            <p class="text-gray-600 mt-2 text-sm">
                                This invitation has already been used to create an account
                            </p>
                        </template>
                        <template v-else-if="invitationState === 'expired'">
                            <h1 class="text-2xl font-display font-bold text-gray-900">
                                Invitation Expired
                            </h1>
                            <p class="text-gray-600 mt-2 text-sm">
                                This invitation has expired. Please request a new one
                            </p>
                        </template>
                        <template v-else>
                            <h1 class="text-2xl font-display font-bold text-gray-900">
                                Invalid Invitation
                            </h1>
                            <p class="text-gray-600 mt-2 text-sm">
                                This invitation link is invalid or has been revoked
                            </p>
                        </template>
                    </div>

                    <!-- Registration Form - Only shown for active invitations -->
                    <template v-if="invitationState === 'active'">
                        <UForm :schema="schema" :state="formState" @submit="handleSubmit" class="space-y-6">
                            <UFormGroup label="Email" name="email">
                                <UInput v-model="formState.email" type="email" :disabled="true"
                                    icon="i-heroicons-envelope" />
                            </UFormGroup>

                            <UFormGroup label="Password" name="password">
                                <UInput v-model="formState.password" type="password"
                                    placeholder="Create your password"
                                    icon="i-heroicons-key" />
                            </UFormGroup>

                            <UFormGroup label="Confirm Password" name="confirmPassword">
                                <UInput v-model="formState.confirmPassword" type="password"
                                    placeholder="Confirm your password"
                                    icon="i-heroicons-key" />
                            </UFormGroup>

                            <div class="pt-2">
                                <PrimaryButton type="submit" class="w-full justify-center" size="md" :loading="isLoading">
                                    Create Account
                                </PrimaryButton>
                            </div>
                        </UForm>
                    </template>

                    <!-- Actions for non-active states -->
                    <template v-else>
                        <div class="space-y-4">
                            <PrimaryButton @click="router.push('/auth/sign-in')" class="w-full justify-center" size="md">
                                Go to Sign In
                            </PrimaryButton>
                            <SecondaryButton @click="router.push('/')" class="w-full justify-center" size="md">
                                Back to Home
                            </SecondaryButton>
                        </div>
                    </template>
                </div>
            </div>
        </Motion>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Motion } from 'motion-v'
import { z } from 'zod'
import PrimaryButton from '@/components/Landing/PrimaryButton.vue'
import SecondaryButton from '@/components/Landing/SecondaryButton.vue'

const supabase = useSupabaseClient()
const router = useRouter()
const route = useRoute()
const toast = useToast()

const isLoading = ref(false)

// Get email and token from URL
const email = ref(route.query.email as string || '')
const token = ref(route.query.token as string || '')

// Invitation state management
const invitationState = ref<'active' | 'used' | 'expired' | 'invalid'>('invalid') // Default to invalid until verified
const invitationRole = ref<'STUDENT' | 'MODERATOR'>('STUDENT')
const invitationGrade = ref<number | null>(null)
const invitationId = ref<number | null>(null)

// Form state
const formState = reactive({
    email: email.value,
    password: '',
    confirmPassword: ''
})

// Form validation schema
const schema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password is too long'),
    confirmPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

// Update invitation validation to use the API
const validateInvitation = async () => {
    if (!email.value || !token.value) {
        invitationState.value = 'invalid'
        return
    }

    try {
        const response = await $fetch('/api/invitations/verify', {
            method: 'POST',
            body: {
                email: email.value,
                token: token.value
            }
        })

        // If we got a successful response
        invitationState.value = 'active'
        const invitation = response.invitation
        invitationRole.value = invitation.role
        invitationId.value = invitation.id
        
        if (invitation.role === 'STUDENT' && invitation.metadata?.grade) {
            invitationGrade.value = Number(invitation.metadata.grade)
        }

        // Pre-fill email in form
        formState.email = invitation.email

    } catch (error: any) {
        console.error('Validation error:', error)
        
        // Get the error message from the response
        const errorMessage = error?.data?.message || ''
        
        if (errorMessage.includes('expired')) {
            invitationState.value = 'expired'
        } else if (errorMessage.includes('used') || errorMessage.includes('accepted')) {
            invitationState.value = 'used'
        } else if (errorMessage.includes('revoked')) {
            invitationState.value = 'invalid'
        } else {
            invitationState.value = 'invalid'
        }
    }
}

const handleSubmit = async (event: any) => {
    try {
        isLoading.value = true

        if (!token.value) {
            throw new Error('Invalid invitation token')
        }

        // Call the sign-up endpoint
        await $fetch('/api/auth/sign-up', {
            method: 'POST',
            body: {
                email: formState.email,
                password: formState.password,
                token: token.value
            }
        })

        toast.add({
            title: 'Account Created',
            description: 'Your account has been created successfully. You can now sign in.',
            color: 'green'
        })

        await router.push('/auth/sign-in')
    } catch (error: any) {
        toast.add({
            title: 'Error',
            description: error?.data?.message || 'An error occurred during registration',
            color: 'red'
        })
    } finally {
        isLoading.value = false
    }
}

// Validate invitation on page load
onMounted(async () => {
    await validateInvitation()
})
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