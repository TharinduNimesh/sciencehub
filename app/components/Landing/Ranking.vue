<template>
  <section class="py-20 bg-gradient-to-br from-slate-50 to-indigo-50 relative overflow-hidden">
    <!-- Background decoration -->
    <div class="absolute inset-0 bg-grid-pattern opacity-5"></div>
    <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-purple-200 to-transparent rounded-full blur-3xl opacity-30"></div>
    <div class="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-200 to-transparent rounded-full blur-3xl opacity-30"></div>
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-bold font-display bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Weekly Champions
        </h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
          Celebrating our top performers who excel in their weekly quizzes and lead by example
        </p>
      </div>

      <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <!-- Left side - Image -->
        <div class="relative group">
          <div class="absolute -inset-4 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
          <div class="relative">
            <img 
              src="/images/boy-on -rocket.jpeg" 
              alt="Student Achievement"
              class="w-full h-auto rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
            >
            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
          </div>
        </div>

        <!-- Right side - Rankings -->
        <div class="space-y-8">
          <!-- Class and Week Header -->
          <MotionDiv
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.6, ease: 'easeOut' }"
            :key="`header-${currentIndex}`"
            class="text-center lg:text-left"
          >
            <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
              <h3 class="text-3xl lg:text-4xl font-bold font-display text-gray-800 mb-2 lg:mb-0">
                {{ currentRanking.className }}
              </h3>
              <div class="inline-flex items-center justify-center lg:justify-start">
                <span class="px-6 py-3 bg-gradient-to-r from-purple-400 to-indigo-400 text-white rounded-full text-sm font-semibold shadow-lg">
                  Week {{ currentRanking.week }}
                </span>
              </div>
            </div>
            <p class="text-lg text-gray-600 font-medium">Latest quiz results and top performers</p>
            <div class="w-24 h-1 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full mt-4 mx-auto lg:mx-0"></div>
          </MotionDiv>

          <!-- Rankings List -->
          <div class="space-y-3">
            <MotionDiv
              v-for="(student, index) in currentRanking.students" 
              :key="`${currentIndex}-${student.id}`"
              :initial="{ opacity: 0, x: -30 }"
              :animate="{ opacity: 1, x: 0 }"
              :transition="{ 
                duration: 0.5, 
                delay: index * 0.1,
                ease: 'easeOut'
              }"
              class="group hover:transform hover:translate-x-2 transition-all duration-300 ease-out"
            >
              <div class="flex items-center justify-between py-3 px-2">
                <div class="flex items-center space-x-5">
                  <!-- Rank Badge -->
                  <div class="relative">
                    <div :class="[
                      'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md transform group-hover:scale-110 transition-transform duration-300',
                      index === 0 ? 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-400' : 
                      index === 1 ? 'bg-gradient-to-br from-slate-300 via-gray-300 to-slate-400' :
                      index === 2 ? 'bg-gradient-to-br from-orange-300 via-amber-400 to-orange-400' :
                      'bg-gradient-to-br from-indigo-300 via-purple-400 to-indigo-400'
                    ]">
                      {{ index + 1 }}
                    </div>
                    <!-- Crown for #1 -->
                    <div v-if="index === 0" class="absolute -top-2 -right-2 animate-pulse">
                      <svg class="w-6 h-6 text-amber-400 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    </div>
                  </div>
                  
                  <!-- Student Info -->
                  <div>
                    <h4 class="text-lg font-bold text-gray-800 group-hover:text-purple-500 transition-colors duration-300">
                      {{ student.name }}
                    </h4>
                    <p class="text-sm text-gray-500 font-medium mt-1">Excellence in Science</p>
                  </div>
                </div>
                
                <!-- Score -->
                <div class="text-right">
                  <div class="text-2xl font-black font-display bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                    {{ student.marks }}%
                  </div>
                  <div class="text-xs text-gray-500 font-semibold uppercase tracking-wide">Score</div>
                </div>
              </div>
              <!-- Subtle separator line -->
              <div v-if="index < currentRanking.students.length - 1" class="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-50"></div>
            </MotionDiv>
          </div>

          <!-- Carousel Dots -->
          <div class="flex justify-center lg:justify-end space-x-3 pt-8">
            <button
              v-for="(ranking, index) in rankings"
              :key="index"
              @click="currentIndex = index"
              :class="[
                'h-3 rounded-full transition-all duration-500 ease-out transform hover:scale-125',
                currentIndex === index 
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 w-12 shadow-lg' 
                  : 'bg-gray-300 hover:bg-gray-400 w-3'
              ]"
            ></button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { MotionDiv } from 'motion-v';

// Sample data - replace with actual API call
const rankings = ref([
  {
    className: "Advanced Physics A/L",
    week: 42,
    students: [
      { id: 1, name: "Amara Perera", marks: 98 },
      { id: 2, name: "Dilshan Fernando", marks: 95 },
      { id: 3, name: "Kavitha Silva", marks: 92 },
      { id: 4, name: "Ruwan Jayasinghe", marks: 89 },
      { id: 5, name: "Nimesha Rathnayake", marks: 87 }
    ]
  },
  {
    className: "Chemistry O/L",
    week: 42,
    students: [
      { id: 6, name: "Saman Wijeratne", marks: 96 },
      { id: 7, name: "Thilini Kumari", marks: 94 },
      { id: 8, name: "Kasun Mendis", marks: 91 },
      { id: 9, name: "Maleesha De Silva", marks: 88 },
      { id: 10, name: "Chamara Gunasekara", marks: 85 }
    ]
  },
  {
    className: "Biology A/L",
    week: 42,
    students: [
      { id: 11, name: "Isuru Wickramasinghe", marks: 97 },
      { id: 12, name: "Hansika Perera", marks: 93 },
      { id: 13, name: "Danushka Silva", marks: 90 },
      { id: 14, name: "Sachini Fernando", marks: 87 },
      { id: 15, name: "Mahesh Jayawardena", marks: 84 }
    ]
  }
]);

const currentIndex = ref(0);
let intervalId = null;

const currentRanking = computed(() => rankings.value[currentIndex.value]);

// Auto-rotate carousel with better timing
onMounted(() => {
  intervalId = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % rankings.value.length;
  }, 6000); // Change every 6 seconds for better readability
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>
.bg-grid-pattern {
  background-image: radial-gradient(circle, rgba(99, 102, 241, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
