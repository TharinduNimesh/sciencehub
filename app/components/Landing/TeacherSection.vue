<template>
    <section class="relative py-20 overflow-hidden bg-gray-50">
        <div class="container mx-auto px-4">
            <div class="flex flex-col lg:flex-row items-center gap-12">
                <!-- Image Section -->
                <div class="lg:w-1/2 relative" data-aos="fade-right">
                    <div class="relative">
                        <!-- Main Image -->
                        <div class="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-2xl rotate-3">
                        </div>
                        <img src="/images/chathura-nellampitiya.jpg"
                            alt="Chathura Nellampitiya"
                            class="relative z-10 rounded-2xl shadow-2xl w-full max-w-md mx-auto" />
                        <!-- Secondary Image - Visible on all screens -->
                        <div
                            class="absolute -left-12 bottom-12 z-20 w-48 h-64 rounded-xl overflow-hidden shadow-2xl border-4 border-white transform -rotate-6">
                            <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=400&h=500&fit=crop"
                                alt="Teaching in action" class="w-full h-full object-cover" />
                        </div>
                        <!-- Decorative Elements - Made visible on all screen sizes -->
                        <div
                            class="absolute -bottom-6 -right-6 w-72 h-72 bg-indigo-100 rounded-full blur-3xl opacity-30 -z-0">
                        </div>
                        <div 
                            class="absolute -left-4 top-1/3 w-20 h-20 bg-purple-100 rounded-full blur-2xl opacity-40 -z-0">
                        </div>
                    </div>
                </div>

                <!-- Content Section -->
                <div class="lg:w-1/2" data-aos="fade-left">
                    <div
                        class="inline-block px-4 py-2 bg-purple-100 text-purple-600 rounded-full text-sm font-bold mb-6">
                        Meet Your Instructor
                    </div>
                    <h2 class="text-4xl font-display font-bold mb-6">
                        Chathura Nellampitiya
                    </h2>

                    <!-- Enhanced Content with Two Paragraphs -->
                    <div class="space-y-6 text-gray-600">
                        <p class="leading-relaxed">
                            With over a decade of experience in science education, Mr. Chathura Nellampitiya has
                            established himself as a
                            leading figure in transforming complex scientific concepts into easily digestible knowledge.
                            His innovative
                            teaching methodology combines traditional techniques with modern technological tools to
                            create an engaging
                            learning environment.
                        </p>
                    </div>

                    <!-- Enhanced Stats Grid - New Layout -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
                        <!-- Main Stats Row -->
                        <div class="stats-card group" data-aos="fade-up" data-aos-delay="100">
                            <div class="flex items-center gap-4">
                                <div class="stats-icon-container">
                                    <UIcon name="i-heroicons-academic-cap" class="stats-icon" />
                                </div>
                                <div>
                                    <div class="stats-number group-hover:text-purple-600">10+</div>
                                    <div class="stats-label">Years of Experience</div>
                                </div>
                            </div>
                        </div>

                        <div class="stats-card group" data-aos="fade-up" data-aos-delay="200">
                            <div class="flex items-center gap-4">
                                <div class="stats-icon-container">
                                    <UIcon name="i-heroicons-users" class="stats-icon" />
                                </div>
                                <div>
                                    <div class="stats-number group-hover:text-purple-600">1000+</div>
                                    <div class="stats-label">Students Taught</div>
                                </div>
                            </div>
                        </div>

                        <div class="stats-card group" data-aos="fade-up" data-aos-delay="300">
                            <div class="flex items-center gap-4">
                                <div class="stats-icon-container">
                                    <UIcon name="i-heroicons-trophy" class="stats-icon" />
                                </div>
                                <div>
                                    <div class="stats-number group-hover:text-purple-600">95%</div>
                                    <div class="stats-label">Pass Rate</div>
                                </div>
                            </div>
                        </div>

                        <div class="stats-card group" data-aos="fade-up" data-aos-delay="400">
                            <div class="flex items-center gap-4">
                                <div class="stats-icon-container">
                                    <UIcon name="i-heroicons-star" class="stats-icon" />
                                </div>
                                <div>
                                    <div class="stats-number group-hover:text-purple-600">4.9/5</div>
                                    <div class="stats-label">Student Rating</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import PrimaryButton from './PrimaryButton.vue';
</script>

<style scoped>
.rotating-border {
    animation: rotate 20s linear infinite;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.stats-card {
    @apply p-4 rounded-xl border border-gray-100 bg-white;
}

.stats-icon-container {
    @apply w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-all;
}

.stats-icon {
    @apply text-2xl text-purple-600;
}

.stats-number {
    @apply font-bold text-2xl text-gray-800 transition-colors;
}

.stats-label {
    @apply text-sm text-gray-600;
}
</style>
