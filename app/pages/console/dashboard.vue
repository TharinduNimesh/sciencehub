<template>
  <div class="">
    <!-- Loading State -->
    <div v-if="loading" class="space-y-6">
      <!-- Skeleton Welcome Banner -->
      <div
        class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6"
      >
        <div class="flex items-center justify-between">
          <div class="space-y-2">
            <USkeleton class="h-6 w-48" />
            <USkeleton class="h-4 w-64" />
          </div>
          <USkeleton class="h-8 w-20 rounded-full" />
        </div>
      </div>

      <!-- Skeleton Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="i in 4"
          :key="`stat-${i}`"
          class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
        >
          <div class="flex items-center space-x-4">
            <USkeleton class="h-12 w-12 rounded-full" />
            <div class="space-y-2">
              <USkeleton class="h-4 w-20" />
              <USkeleton class="h-6 w-16" />
            </div>
          </div>
        </div>
      </div>

      <!-- Skeleton Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          v-for="i in 2"
          :key="`chart-${i}`"
          class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
        >
          <USkeleton class="h-4 w-32 mb-4" />
          <USkeleton class="h-64 w-full" />
        </div>
      </div>

      <!-- Skeleton Table -->
      <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <USkeleton class="h-5 w-40 mb-4" />
        <div class="space-y-3">
          <USkeleton class="h-10 w-full" />
          <div v-for="i in 5" :key="`row-${i}`">
            <USkeleton class="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>

    <template v-else>
      <!-- Welcome Banner -->
      <div
        class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6"
      >
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-semibold">
              Welcome, {{ user?.name || "User" }}
            </h1>
            <p class="text-gray-500 mt-1">{{ welcomeMessage }}</p>
          </div>
          <UBadge :color="roleColor" size="lg">{{
            user?.role || "Guest"
          }}</UBadge>
        </div>
      </div>

      <!-- Admin Dashboard -->
      <div v-if="isAdmin" class="space-y-6">
        <!-- Admin Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <UCard>
            <div class="flex items-center space-x-4">
              <div class="bg-violet-100 p-3 rounded-lg shadow-sm">
                <UIcon
                  name="i-heroicons-users"
                  class="text-violet-500 w-6 h-6"
                />
              </div>
              <div>
                <div class="text-sm text-gray-500">Total Students</div>
                <div class="text-2xl font-semibold">
                  {{ adminStats.totalStudents }}
                </div>
              </div>
            </div>
          </UCard>
          <UCard>
            <div class="flex items-center space-x-4">
              <div class="bg-blue-100 p-3 rounded-lg shadow-sm">
                <UIcon
                  name="i-heroicons-academic-cap"
                  class="text-blue-500 w-6 h-6"
                />
              </div>
              <div>
                <div class="text-sm text-gray-500">Total Classes</div>
                <div class="text-2xl font-semibold">
                  {{ adminStats.totalClasses }}
                </div>
              </div>
            </div>
          </UCard>
          <UCard>
            <div class="flex items-center space-x-4">
              <div class="bg-teal-100 p-3 rounded-lg shadow-sm">
                <UIcon
                  name="i-heroicons-user-group"
                  class="text-teal-500 w-6 h-6"
                />
              </div>
              <div>
                <div class="text-sm text-gray-500">Active Moderators</div>
                <div class="text-2xl font-semibold">
                  {{ adminStats.activeModeratorCount }}
                </div>
              </div>
            </div>
          </UCard>
          <UCard>
            <div class="flex items-center space-x-4">
              <div class="bg-amber-100 p-3 rounded-lg shadow-sm">
                <UIcon
                  name="i-heroicons-bell-alert"
                  class="text-amber-500 w-6 h-6"
                />
              </div>
              <div>
                <div class="text-sm text-gray-500">Join Requests</div>
                <div class="text-2xl font-semibold">
                  {{ adminStats.joinRequestsCount }}
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Admin Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UCard>
            <StudentEnrollmentChart />
          </UCard>
          <UCard>
            <RevenueOverviewChart />
          </UCard>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <UCard class="lg:col-span-1">
            <GradeDistributionChart />
          </UCard>
          <UCard class="lg:col-span-2">
            <!-- Upcoming Classes Table -->
            <h3 class="font-semibold mb-4">Upcoming Classes</h3>
            <div class="overflow-x-auto">
              <UTable :columns="classColumns" :rows="upcomingClasses">
                <template #name-data="{ row }">
                  {{ row.name }}
                </template>
                <template #grade-data="{ row }">
                  Grade {{ row.grade }}
                </template>
                <template #time-data="{ row }">
                  {{ row.time }}
                </template>
                <template #students-data="{ row }">
                  {{ row.students }} students
                </template>
              </UTable>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Moderator Dashboard -->
      <div v-else-if="isModerator" class="space-y-6">
        <!-- Moderator Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UCard>
            <div class="flex items-center space-x-4">
              <div class="bg-violet-100 p-3 rounded-full">
                <UIcon
                  name="i-heroicons-academic-cap"
                  class="text-violet-500 w-6 h-6"
                />
              </div>
              <div>
                <div class="text-sm text-gray-500">Assigned Classes</div>
                <div class="text-2xl font-semibold">
                  {{ moderatorStats.assignedClasses }}
                </div>
              </div>
            </div>
          </UCard>
          <UCard>
            <div class="flex items-center space-x-4">
              <div class="bg-blue-100 p-3 rounded-full">
                <UIcon name="i-heroicons-users" class="text-blue-500 w-6 h-6" />
              </div>
              <div>
                <div class="text-sm text-gray-500">Students</div>
                <div class="text-2xl font-semibold">
                  {{ moderatorStats.studentCount }}
                </div>
              </div>
            </div>
          </UCard>
          <UCard>
            <div class="flex items-center space-x-4">
              <div class="bg-teal-100 p-3 rounded-full">
                <UIcon
                  name="i-heroicons-book-open"
                  class="text-teal-500 w-6 h-6"
                />
              </div>
              <div>
                <div class="text-sm text-gray-500">Lessons Created</div>
                <div class="text-2xl font-semibold">
                  {{ moderatorStats.lessonsCreated }}
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Moderator Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UCard>
            <ClassPerformanceChart />
          </UCard>
          <UCard>
            <StudentActivityChart />
          </UCard>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <UCard class="lg:col-span-1">
            <!-- Student Activity Feed -->
            <h3 class="font-semibold mb-4">Recent Student Activity</h3>
            <div class="space-y-4">
              <div
                v-for="(activity, index) in studentActivities"
                :key="index"
                class="flex items-start space-x-3"
              >
                <UAvatar
                  :text="activity.initials"
                  size="sm"
                  class="flex-shrink-0"
                />
                <div>
                  <p class="text-sm">
                    <span class="font-medium text-gray-900">{{
                      activity.student
                    }}</span>
                    <span class="text-gray-600"> {{ activity.action }}</span>
                  </p>
                  <p class="text-xs text-gray-500">{{ activity.time }}</p>
                </div>
              </div>
            </div>
          </UCard>
          <UCard class="lg:col-span-2">
            <!-- Upcoming Classes Table -->
            <h3 class="font-semibold mb-4">Upcoming Classes</h3>
            <div class="overflow-x-auto">
              <UTable :columns="classColumns" :rows="upcomingClasses">
                <template #name-data="{ row }">
                  {{ row.name }}
                </template>
                <template #grade-data="{ row }">
                  Grade {{ row.grade }}
                </template>
                <template #time-data="{ row }">
                  {{ row.time }}
                </template>
                <template #students-data="{ row }">
                  {{ row.students }} students
                </template>
              </UTable>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Student Dashboard -->
      <div v-else-if="isStudent" class="space-y-6">
        <!-- Student Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UCard>
            <div class="flex items-center space-x-4">
              <div class="bg-violet-100 p-3 rounded-full">
                <UIcon
                  name="i-heroicons-academic-cap"
                  class="text-violet-500 w-6 h-6"
                />
              </div>
              <div>
                <div class="text-sm text-gray-500">Enrolled Classes</div>
                <div class="text-2xl font-semibold">
                  {{ studentStats.enrolledClasses }}
                </div>
              </div>
            </div>
          </UCard>
          <UCard>
            <div class="flex items-center space-x-4">
              <div class="bg-green-100 p-3 rounded-full">
                <UIcon
                  name="i-heroicons-check-badge"
                  class="text-green-500 w-6 h-6"
                />
              </div>
              <div>
                <div class="text-sm text-gray-500">Attendance Rate</div>
                <div class="text-2xl font-semibold">
                  {{ studentStats.attendanceRate }}%
                </div>
              </div>
            </div>
          </UCard>
          <UCard>
            <div class="flex items-center space-x-4">
              <div class="bg-amber-100 p-3 rounded-full">
                <UIcon
                  name="i-heroicons-document-check"
                  class="text-amber-500 w-6 h-6"
                />
              </div>
              <div>
                <div class="text-sm text-gray-500">Completed Quizzes</div>
                <div class="text-2xl font-semibold">
                  {{ studentStats.completedQuizzes }}
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Student Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UCard>
            <ProgressChart />
          </UCard>
          <UCard>
            <SubjectPerformanceChart />
          </UCard>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UCard>
            <!-- Enrolled Classes Table -->
            <h3 class="font-semibold mb-4">Your Classes</h3>
            <div class="overflow-x-auto">
              <UTable :columns="studentClassColumns" :rows="classes">
                <template #name-data="{ row }">
                  {{ row.name }}
                </template>
                <template #grade-data="{ row }">
                  Grade {{ row.grade }}
                </template>
                <template #teacher-data="{ row }">
                  {{ row.teacher }}
                </template>
                <template #status-data="{ row }">
                  <UBadge :color="row.active ? 'green' : 'gray'" size="sm">
                    {{ row.active ? "Active" : "Inactive" }}
                  </UBadge>
                </template>
              </UTable>
            </div>
          </UCard>
          <UCard>
            <!-- Upcoming Lessons -->
            <h3 class="font-semibold mb-4">Upcoming Lessons</h3>
            <div class="space-y-3">
              <div
                v-for="(lesson, index) in upcomingLessons"
                :key="index"
                class="p-3 rounded-lg border border-gray-200 flex items-center justify-between"
              >
                <div>
                  <h4 class="font-medium text-gray-900">{{ lesson.title }}</h4>
                  <p class="text-sm text-gray-500">{{ lesson.class }}</p>
                </div>
                <div class="text-right">
                  <p class="font-medium text-gray-900">{{ lesson.date }}</p>
                  <p class="text-sm text-gray-500">{{ lesson.time }}</p>
                </div>
              </div>
              <div
                v-if="upcomingLessons.length === 0"
                class="text-center text-gray-500 py-4"
              >
                No upcoming lessons scheduled
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <div v-else class="flex justify-center items-center h-64">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin mr-2" />
        <span>Loading dashboard...</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useDashboard } from "~/composables/useDashboard";
import { onMounted, computed } from "vue";
import { useAuthStore } from "~/stores/auth";

// Admin chart components
import StudentEnrollmentChart from "~/components/Common/Charts/Admin/StudentEnrollmentChart.vue";
import RevenueOverviewChart from "~/components/Common/Charts/Admin/RevenueOverviewChart.vue";
import GradeDistributionChart from "~/components/Common/Charts/Admin/GradeDistributionChart.vue";

// Moderator chart components
import ClassPerformanceChart from "~/components/Common/Charts/Moderator/ClassPerformanceChart.vue";
import StudentActivityChart from "~/components/Common/Charts/Moderator/StudentActivityChart.vue";

// Student chart components
import ProgressChart from "~/components/Common/Charts/Student/ProgressChart.vue";
import SubjectPerformanceChart from "~/components/Common/Charts/Student/SubjectPerformanceChart.vue";

// Set page meta
definePageMeta({
  layout: "console",
  middleware: ["auth"],
});

// Initialize the auth store
const authStore = useAuthStore();
const user = computed(() => authStore.user);

// Get dashboard composable
const {
  loading,
  isAdmin,
  isModerator,
  isStudent,
  adminStats,
  moderatorStats,
  studentStats,
  classes,
  upcomingClasses,
  studentActivities,
  upcomingLessons,
  fetchDashboardData,
} = useDashboard();

// Welcome message based on time of day
const welcomeMessage = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning! Here's today's overview";
  if (hour < 18) return "Good afternoon! Here's today's overview";
  return "Good evening! Here's today's overview";
});

// Role color for badge
const roleColor = computed(() => {
  if (isAdmin.value) return "purple";
  if (isModerator.value) return "blue";
  if (isStudent.value) return "green";
  return "gray";
});

// Table columns for upcoming classes
const classColumns = [
  { key: "name", label: "Class Name" },
  { key: "grade", label: "Grade" },
  { key: "time", label: "Time" },
  { key: "students", label: "Students" },
];

// Table columns for student classes
const studentClassColumns = [
  { key: "name", label: "Class Name" },
  { key: "grade", label: "Grade" },
  { key: "teacher", label: "Teacher" },
  { key: "status", label: "Status" },
];

// Load dashboard data on mount
onMounted(async () => {
  await fetchDashboardData();
});
</script>
