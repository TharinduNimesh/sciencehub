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
          <!-- Loading State -->
          <div v-if="isLoading" class="text-center py-16">
            <Motion
              :initial="{ opacity: 0, y: 30 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.8, ease: 'easeOut' }"
            >
              <div class="mb-8">
                <div class="w-32 h-32 mx-auto mb-6 relative">
                  <div class="absolute inset-0 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full animate-pulse"></div>
                  <div class="absolute inset-4 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-full flex items-center justify-center animate-pulse">
                    <svg class="w-12 h-12 text-purple-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                  </div>
                </div>
                <h3 class="text-3xl font-bold font-display text-gray-800 mb-4">
                  Loading Rankings...
                </h3>
                <p class="text-lg text-gray-600 max-w-md mx-auto font-medium leading-relaxed">
                  Fetching the latest quiz results and top performers
                </p>
              </div>
            </Motion>
          </div>

          <!-- Empty State -->
          <div v-else-if="!isLoading && rankings.length === 0" class="text-center py-16">
            <Motion
              :initial="{ opacity: 0, y: 30 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.8, ease: 'easeOut' }"
            >
              <div class="mb-8">
                <div class="w-32 h-32 mx-auto mb-6 relative">
                  <div class="absolute inset-0 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full"></div>
                  <div class="absolute inset-4 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-full flex items-center justify-center">
                    <svg class="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
                <h3 class="text-3xl font-bold font-display text-gray-800 mb-4">
                  Results Coming Soon!
                </h3>
                <p class="text-lg text-gray-600 max-w-md mx-auto font-medium leading-relaxed">
                  Our weekly quiz champions will be announced here. 
                  <br class="hidden sm:block">
                  Keep studying and be the next top performer!
                </p>
              </div>
              <div class="flex items-center justify-center space-x-2">
                <div class="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                <div class="w-3 h-3 bg-indigo-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                <div class="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
              </div>
            </Motion>
          </div>

          <!-- Ranking Content -->
          <div v-else>
            <!-- Class and Week Header -->
            <Motion
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
                    {{ currentRanking.week }}
                  </span>
                </div>
              </div>
              <p class="text-lg text-gray-600 font-medium">Latest quiz results and top performers</p>
              <div class="w-24 h-1 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full mt-4 mx-auto lg:mx-0"></div>
            </Motion>

            <!-- Rankings List -->
            <div class="space-y-3">
              <Motion
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
              </Motion>
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
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useSupabaseClient } from '#imports';
import { Motion } from 'motion-v';

const supabase = useSupabaseClient();

const rankings = ref([]);
const currentIndex = ref(0);
const isLoading = ref(true);
let intervalId = null;

const currentRanking = computed(() => rankings.value[currentIndex.value] || {});

const fetchRankings = async () => {
  isLoading.value = true;
  const { data, error } = await supabase
    .from('class_latest_quiz_top5_marks')
    .select('*')
    .order('class_id', { ascending: true })
    .order('rank', { ascending: true });
  if (error) {
    // Optionally show notification
    isLoading.value = false;
    return;
  }
  // Group by class_id
  const grouped = {};
  for (const row of data) {
    if (!grouped[row.class_id]) {
      grouped[row.class_id] = {
        className: row.class_name,
        week: formatWeek(row.quiz_date), // Use short code
        students: []
      };
    }
    grouped[row.class_id].students.push({
      id: row.student_id,
      name: row.student_name,
      marks: row.marks
    });
  }
  rankings.value = Object.values(grouped);
  isLoading.value = false;
};

function formatWeek(dateString) {
  const d = new Date(dateString);
  // Short month and year, e.g. 'Jun 2025'
  const monthYear = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
  // Unique code: W + ISO week number
  const week = getISOWeek(d);
  return `W${week} ${monthYear}`;
}

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  return weekNo;
}

onMounted(() => {
  fetchRankings();
  intervalId = setInterval(() => {
    if (rankings.value.length > 1) { // Only rotate if there's more than one ranking
      currentIndex.value = (currentIndex.value + 1) % rankings.value.length;
    }
  }, 6000);
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
