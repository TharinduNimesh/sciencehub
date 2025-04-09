<template>
  <div class="space-y-8">
    <!-- Welcome Banner -->
    <div class="relative bg-gradient-to-br from-white to-purple-50 rounded-xl border border-gray-200 shadow-sm p-8">
      <!-- Background Pattern -->
      <div class="absolute inset-0 overflow-hidden">
        <!-- Large decorative blob -->
        <svg class="absolute -right-24 -top-24 w-96 h-96 text-purple-100 animate-float-slow" viewBox="0 0 400 400"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M200,100 Q260,80 300,120 Q340,160 340,220 Q340,280 300,320 Q260,360 200,340 Q140,320 100,280 Q60,240 80,180 Q100,120 160,100 Q180,90 200,100"
            fill="currentColor" opacity="0.6">
            <animate attributeName="d" dur="20s" repeatCount="indefinite"
              values="M200,100 Q260,80 300,120 Q340,160 340,220 Q340,280 300,320 Q260,360 200,340 Q140,320 100,280 Q60,240 80,180 Q100,120 160,100 Q180,90 200,100;
             M200,100 Q280,120 300,180 Q320,240 280,300 Q240,360 180,340 Q120,320 80,260 Q40,200 80,140 Q120,80 180,80 Q220,80 200,100;
             M200,100 Q260,80 300,120 Q340,160 340,220 Q340,280 300,320 Q260,360 200,340 Q140,320 100,280 Q60,240 80,180 Q100,120 160,100 Q180,90 200,100" />
          </path>
        </svg>

        <!-- Small decorative blob -->
        <svg class="absolute -left-16 -bottom-16 w-64 h-64 text-blue-100 animate-float-medium" viewBox="0 0 400 400"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M200,140 Q240,120 280,140 Q320,160 320,200 Q320,240 280,280 Q240,320 200,300 Q160,280 140,240 Q120,200 140,160 Q160,120 200,140"
            fill="currentColor" opacity="0.5">
            <animate attributeName="d" dur="15s" repeatCount="indefinite"
              values="M200,140 Q240,120 280,140 Q320,160 320,200 Q320,240 280,280 Q240,320 200,300 Q160,280 140,240 Q120,200 140,160 Q160,120 200,140;
             M200,140 Q260,160 280,200 Q300,240 260,280 Q220,320 180,300 Q140,280 120,240 Q100,200 120,160 Q140,120 200,140;
             M200,140 Q240,120 280,140 Q320,160 320,200 Q320,240 280,280 Q240,320 200,300 Q160,280 140,240 Q120,200 140,160 Q160,120 200,140" />
          </path>
        </svg>
      </div>

      <div class="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="space-y-2">
          <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Welcome, {{ user?.name || "User" }}
          </h1>
          <p class="text-gray-600 text-lg">{{ welcomeMessage }}</p>
        </div>
        <UBadge :color="roleColor" size="lg" class="text-sm font-medium shadow-sm"
          :ui="{ rounded: 'rounded-full', padding: { sm: 'px-4 py-2' } }">
          {{ user?.role || "Guest" }}
        </UBadge>
      </div>
    </div>

    <!-- Admin Dashboard -->
    <div v-if="isAdmin()" class="space-y-6">
      <!-- Admin Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <template v-if="loading">
          <div v-for="i in 4" :key="i" class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <USkeleton class="h-12 w-12 rounded-lg mb-4" />
            <USkeleton class="h-4 w-24 mb-2" />
            <USkeleton class="h-8 w-16" />
          </div>
        </template>
        <template v-else>
          <div v-for="(stat, index) in enhancedAdminStats" :key="index"
            class="relative bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-hidden group hover:shadow-md transition-all duration-200">
            <!-- Background Pattern -->
            <div class="absolute inset-0 overflow-hidden opacity-30" :class="stat.bgClass">
              <svg class="absolute -right-16 -bottom-16 w-48 h-48 animate-float-slow" viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M100,50 Q150,50 170,90 Q190,130 170,160 Q150,190 110,190 Q70,190 50,160 Q30,130 50,90 Q70,50 100,50"
                  fill="currentColor" opacity="0.6" />
              </svg>
            </div>

            <div class="relative flex items-center space-x-4">
              <div class="w-12 h-12 grid place-items-center rounded-lg" :class="stat.iconBgClass">
                <UIcon :name="stat.icon" class="w-6 h-6" :class="stat.iconClass" />
              </div>
              <div>
                <div class="text-sm text-gray-500">{{ stat.label }}</div>
                <div class="text-2xl font-semibold">{{ stat.value }}</div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Grid layout for Upcoming Classes and Join Requests -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Upcoming Classes Table -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Upcoming Classes</h2>
              <p class="text-sm text-gray-500">Overview of scheduled classes</p>
            </div>
            <UButton color="primary" variant="soft" icon="i-heroicons-calendar" label="View Schedule"
              :ui="{ rounded: 'rounded-full' }" to="/console/classes" />
          </div>

          <div class="space-y-4">
            <template v-if="loading">
              <div v-for="i in 3" :key="i" class="bg-white rounded-xl border border-gray-200 p-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <USkeleton class="h-12 w-12 rounded-lg" />
                    <div>
                      <USkeleton class="h-5 w-32 mb-2" />
                      <USkeleton class="h-4 w-24" />
                    </div>
                  </div>
                  <div class="text-right">
                    <USkeleton class="h-5 w-24 mb-2" />
                    <USkeleton class="h-6 w-20" />
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div v-for="classItem in upcomingClasses" :key="classItem.name"
                class="relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
                <!-- Background Pattern -->
                <div class="absolute inset-0 overflow-hidden opacity-30 text-gray-200">
                  <svg class="absolute -right-16 -bottom-16 w-48 h-48 animate-float-medium" viewBox="0 0 200 200"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M100,50 Q150,50 170,90 Q190,130 170,160 Q150,190 110,190 Q70,190 50,160 Q30,130 50,90 Q70,50 100,50"
                      fill="currentColor" opacity="0.6" />
                  </svg>
                </div>

                <div class="relative p-4 flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 flex items-center justify-center rounded-lg bg-purple-50 text-purple-500">
                      <UIcon
                        :name="classItem.method?.startsWith('Virtual') ? 'i-heroicons-computer-desktop' : 'i-heroicons-building-office-2'"
                        class="w-6 h-6" />
                    </div>
                    <div>
                      <h3 class="font-medium text-gray-900">{{ classItem.name }}</h3>
                      <p class="text-sm text-gray-500">Grade {{ classItem.grade }}
                        <!-- • {{ classItem.students }} students -->
                      </p>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm font-medium text-gray-900">{{ classItem.time }}</div>
                    <UBadge color="purple" variant="soft" size="sm">Scheduled</UBadge>
                  </div>
                </div>
              </div>

              <!-- Empty state for upcoming classes -->
              <div v-if="!upcomingClasses.length && !loading" class="text-center py-6">
                <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-purple-50">
                  <UIcon name="i-heroicons-calendar" class="h-6 w-6 text-purple-500" />
                </div>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No upcoming classes</h3>
                <p class="mt-1 text-sm text-gray-500">There are no classes scheduled for today or tomorrow.</p>
                <UButton color="primary" variant="soft" icon="i-heroicons-plus" label="Add New Class"
                  :ui="{ rounded: 'rounded-full' }" class="mt-4" to="/console/classes" />
              </div>
            </template>
          </div>
        </div>

        <!-- Latest Join Requests -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Latest Join Requests</h2>
              <p class="text-sm text-gray-500">Recent student registration requests</p>
            </div>
            <UButton color="primary" variant="soft" icon="i-heroicons-user-group" label="View All"
              :ui="{ rounded: 'rounded-full' }" to="/console/join-requests" />
          </div>

          <div class="space-y-4">
            <template v-if="loading">
              <div v-for="i in 3" :key="i" class="bg-white rounded-xl border border-gray-200 p-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <USkeleton class="h-12 w-12 rounded-lg" />
                    <div>
                      <USkeleton class="h-5 w-32 mb-2" />
                      <USkeleton class="h-4 w-36" />
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <USkeleton class="h-8 w-8 rounded-full" />
                    <USkeleton class="h-8 w-8 rounded-full" />
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div v-for="request in latestJoinRequests" :key="request.id"
                class="relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
                <!-- Background Pattern -->
                <div class="absolute inset-0 overflow-hidden opacity-30 text-blue-200">
                  <svg class="absolute -right-16 -bottom-16 w-48 h-48 animate-float-medium" viewBox="0 0 200 200"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M100,50 Q150,50 170,90 Q190,130 170,160 Q150,190 110,190 Q70,190 50,160 Q30,130 50,90 Q70,50 100,50"
                      fill="currentColor" opacity="0.6" />
                  </svg>
                </div>

                <div class="relative p-4 flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 flex items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                      <UIcon name="i-heroicons-user-circle" class="w-6 h-6" />
                    </div>
                    <div>
                      <h3 class="font-medium text-gray-900">{{ request.name }}</h3>
                      <p class="text-sm text-gray-500">Grade {{ request.grade }} • {{ $timeAgo(request.requestedAt) }}
                      </p>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <UButton color="primary" variant="soft" size="xs" icon="i-heroicons-check"
                      :ui="{ rounded: 'rounded-full' }" @click="handleApproveRequest(request)" />
                    <UButton color="red" variant="soft" size="xs" icon="i-heroicons-x-mark"
                      :ui="{ rounded: 'rounded-full' }" @click="handleRejectRequest(request)" />
                  </div>
                </div>
              </div>

              <!-- Empty state for join requests -->
              <div v-if="!latestJoinRequests.length && !loading" class="text-center py-6">
                <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-50">
                  <UIcon name="i-heroicons-user-group" class="h-6 w-6 text-blue-500" />
                </div>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
                <p class="mt-1 text-sm text-gray-500">All student join requests have been handled.</p>
                <UButton color="primary" variant="soft" icon="i-heroicons-user-plus" label="Invite Students"
                  :ui="{ rounded: 'rounded-full' }" class="mt-4" to="/console/students" />
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Student Dashboard -->
    <div v-else-if="isStudent()" class="space-y-6">
      <!-- Student Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <template v-if="loading">
          <div v-for="i in 2" :key="i" class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <USkeleton class="h-12 w-12 rounded-lg mb-4" />
            <USkeleton class="h-4 w-24 mb-2" />
            <USkeleton class="h-8 w-16" />
          </div>
        </template>
        <template v-else>
          <div v-for="(stat, index) in enhancedStudentStats" :key="index"
            class="relative bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-hidden group hover:shadow-md transition-all duration-200">
            <!-- Background Pattern -->
            <div class="absolute inset-0 overflow-hidden opacity-30" :class="stat.bgClass">
              <svg class="absolute -right-16 -bottom-16 w-48 h-48 animate-float-slow" viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M100,50 Q150,50 170,90 Q190,130 170,160 Q150,190 110,190 Q70,190 50,160 Q30,130 50,90 Q70,50 100,50"
                  fill="currentColor" opacity="0.6" />
              </svg>
            </div>

            <div class="relative flex items-center space-x-4">
              <div class="w-12 h-12 grid place-items-center rounded-lg" :class="stat.iconBgClass">
                <UIcon :name="stat.icon" class="w-6 h-6" :class="stat.iconClass" />
              </div>
              <div>
                <div class="text-sm text-gray-500">{{ stat.label }}</div>
                <div class="text-2xl font-semibold">{{ stat.value }}</div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left Column -->
        <div class="space-y-6">
          <!-- Upcoming Classes -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-lg font-semibold text-gray-900">Upcoming Classes</h2>
                <p class="text-sm text-gray-500">Your upcoming class schedule</p>
              </div>
            </div>

            <div class="space-y-4">
              <template v-if="loading">
                <div v-for="i in 3" :key="i" class="bg-white rounded-xl border border-gray-200 p-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <USkeleton class="h-12 w-12 rounded-lg" />
                      <div>
                        <USkeleton class="h-5 w-32 mb-2" />
                        <USkeleton class="h-4 w-24" />
                      </div>
                    </div>
                    <div class="text-right">
                      <USkeleton class="h-5 w-24 mb-2" />
                      <USkeleton class="h-6 w-20" />
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div v-for="classItem in upcomingClasses" :key="classItem.name"
                  class="relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
                  <!-- Background Pattern -->
                  <div class="absolute inset-0 overflow-hidden opacity-30 text-gray-200">
                    <svg class="absolute -right-16 -bottom-16 w-48 h-48 animate-float-medium" viewBox="0 0 200 200"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M100,50 Q150,50 170,90 Q190,130 170,160 Q150,190 110,190 Q70,190 50,160 Q30,130 50,90 Q70,50 100,50"
                        fill="currentColor" opacity="0.6" />
                    </svg>
                  </div>

                  <div class="relative p-4 flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <div class="w-12 h-12 flex items-center justify-center rounded-lg bg-purple-50 text-purple-500">
                        <UIcon
                          :name="classItem.method?.startsWith('Virtual') ? 'i-heroicons-computer-desktop' : 'i-heroicons-building-office-2'"
                          class="w-6 h-6" />
                      </div>
                      <div>
                        <h3 class="font-medium text-gray-900">{{ classItem.name }}</h3>
                        <p class="text-sm text-gray-500">Grade {{ classItem.grade }}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-sm font-medium text-gray-900">{{ classItem.time }}</div>
                      <UBadge color="purple" variant="soft" size="sm">Scheduled</UBadge>
                    </div>
                  </div>
                </div>

                <!-- Empty state -->
                <div v-if="!upcomingClasses.length" class="text-center py-6">
                  <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-purple-50">
                    <UIcon name="i-heroicons-calendar" class="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 class="mt-2 text-sm font-medium text-gray-900">No upcoming classes</h3>
                  <p class="mt-1 text-sm text-gray-500">You have no classes scheduled for today or tomorrow.</p>
                </div>
              </template>
            </div>
          </div>

          <!-- Latest Lessons -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-lg font-semibold text-gray-900">Latest Lessons</h2>
                <p class="text-sm text-gray-500">Recently added lessons in your classes</p>
              </div>
            </div>

            <div class="space-y-4">
              <template v-if="loading">
                <div v-for="i in 3" :key="i" class="bg-white rounded-xl border border-gray-200 p-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <USkeleton class="h-12 w-12 rounded-lg" />
                      <div>
                        <USkeleton class="h-5 w-32 mb-2" />
                        <USkeleton class="h-4 w-36" />
                      </div>
                    </div>
                    <USkeleton class="h-5 w-24" />
                  </div>
                </div>
              </template>
              <template v-else>
                <div v-for="lesson in upcomingLessons" :key="lesson.id"
                  class="relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
                  <!-- Background Pattern -->
                  <div class="absolute inset-0 overflow-hidden opacity-30 text-blue-200">
                    <svg class="absolute -right-16 -bottom-16 w-48 h-48 animate-float-fast" viewBox="0 0 200 200"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M100,50 Q150,50 170,90 Q190,130 170,160 Q150,190 110,190 Q70,190 50,160 Q30,130 50,90 Q70,50 100,50"
                        fill="currentColor" opacity="0.6" />
                    </svg>
                  </div>

                  <div class="relative p-4 flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <div class="w-12 h-12 flex items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                        <UIcon name="i-heroicons-play" class="w-6 h-6" />
                      </div>
                      <div>
                        <h3 class="font-medium text-gray-900">{{ lesson.title }}</h3>
                        <p class="text-sm text-gray-500">{{ lesson.className }}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-sm text-gray-500">{{ formatDateShort(lesson.created_at) }}</div>
                    </div>
                  </div>
                </div>

                <!-- Empty state -->
                <div v-if="!upcomingLessons.length" class="text-center py-6">
                  <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-50">
                    <UIcon name="i-heroicons-play" class="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 class="mt-2 text-sm font-medium text-gray-900">No recent lessons</h3>
                  <p class="mt-1 text-sm text-gray-500">No new lessons have been added recently.</p>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <!-- Latest Notices -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-lg font-semibold text-gray-900">Latest Notices</h2>
                <p class="text-sm text-gray-500">Important announcements from your classes</p>
              </div>
            </div>

            <div class="space-y-4">
              <template v-if="loading">
                <div v-for="i in 3" :key="i" class="bg-white rounded-xl border border-gray-200 p-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <USkeleton class="h-12 w-12 rounded-lg" />
                      <div>
                        <USkeleton class="h-5 w-32 mb-2" />
                        <USkeleton class="h-4 w-28" />
                      </div>
                    </div>
                    <USkeleton class="h-5 w-24" />
                  </div>
                </div>
              </template>
              <template v-else>
                <div v-for="notice in latestNotices" :key="notice.id"
                  class="relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
                  <!-- Background Pattern -->
                  <div class="absolute inset-0 overflow-hidden opacity-30 text-amber-200">
                    <svg class="absolute -right-16 -bottom-16 w-48 h-48 animate-float-medium" viewBox="0 0 200 200"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M100,50 Q150,50 170,90 Q190,130 170,160 Q150,190 110,190 Q70,190 50,160 Q30,130 50,90 Q70,50 100,50"
                        fill="currentColor" opacity="0.6" />
                    </svg>
                  </div>

                  <div class="relative p-4 flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <div class="w-12 h-12 flex items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                        <UIcon name="i-heroicons-megaphone" class="w-6 h-6" />
                      </div>
                      <div>
                        <h3 class="font-medium text-gray-900">{{ notice.title }}</h3>
                        <p class="text-sm text-gray-500">{{ notice.classes?.[0] || 'All Classes' }}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-sm text-gray-500">{{ formatDateShort(notice.created_at) }}</div>
                    </div>
                  </div>
                </div>

                <!-- Empty state -->
                <div v-if="!latestNotices.length" class="text-center py-6">
                  <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-amber-50">
                    <UIcon name="i-heroicons-megaphone" class="h-6 w-6 text-amber-500" />
                  </div>
                  <h3 class="mt-2 text-sm font-medium text-gray-900">No notices</h3>
                  <p class="mt-1 text-sm text-gray-500">There are no recent notices to display.</p>
                </div>
              </template>
            </div>
          </div>

          <!-- Latest Notes -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-lg font-semibold text-gray-900">Latest Notes</h2>
                <p class="text-sm text-gray-500">Recently shared notes and resources</p>
              </div>
            </div>

            <div class="space-y-4">
              <template v-if="loading">
                <div v-for="i in 3" :key="i" class="bg-white rounded-xl border border-gray-200 p-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <USkeleton class="h-12 w-12 rounded-lg" />
                      <div>
                        <USkeleton class="h-5 w-32 mb-2" />
                        <USkeleton class="h-4 w-28" />
                      </div>
                    </div>
                    <USkeleton class="h-5 w-24" />
                  </div>
                </div>
              </template>
              <template v-else>
                <div v-for="note in latestNotes" :key="note.id"
                  class="relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
                  <!-- Background Pattern -->
                  <div class="absolute inset-0 overflow-hidden opacity-30 text-teal-200">
                    <svg class="absolute -right-16 -bottom-16 w-48 h-48 animate-float-fast" viewBox="0 0 200 200"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M100,50 Q150,50 170,90 Q190,130 170,160 Q150,190 110,190 Q70,190 50,160 Q30,130 50,90 Q70,50 100,50"
                        fill="currentColor" opacity="0.6" />
                    </svg>
                  </div>

                  <div class="relative p-4 flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <div class="w-12 h-12 flex items-center justify-center rounded-lg bg-teal-50 text-teal-500">
                        <UIcon name="i-heroicons-document-text" class="w-6 h-6" />
                      </div>
                      <div>
                        <h3 class="font-medium text-gray-900">{{ note.title }}</h3>
                        <p class="text-sm text-gray-500">{{ note.classes?.[0] || 'All Classes' }}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-sm text-gray-500">{{ formatDateShort(note.created_at) }}</div>
                    </div>
                  </div>
                </div>

                <!-- Empty state -->
                <div v-if="!latestNotes.length" class="text-center py-6">
                  <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-teal-50">
                    <UIcon name="i-heroicons-document-text" class="h-6 w-6 text-teal-500" />
                  </div>
                  <h3 class="mt-2 text-sm font-medium text-gray-900">No notes</h3>
                  <p class="mt-1 text-sm text-gray-500">There are no recent notes to display.</p>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDashboard } from "~/composables/useDashboard";
import { onMounted, computed } from "vue";
import { useAuthStore } from "~/stores/auth";
import isAdmin from "~/utils/is-admin";
import isModerator from "~/utils/is-moderator";
import isStudent from "~/utils/is-student";

// Get the timeAgo plugin
const { $timeAgo } = useNuxtApp();

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
  adminStats,
  moderatorStats,
  studentStats,
  classes,
  upcomingClasses,
  studentActivities,
  upcomingLessons,
  latestJoinRequests,
  latestNotices,
  latestNotes,
  fetchDashboardData,
  handleApproveRequest,
  handleRejectRequest,
  formatDateShort
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
  if (isAdmin()) return "purple";
  if (isModerator()) return "blue";
  if (isStudent()) return "green";
  return "gray";
});

// Enhanced admin stats with visual properties
const enhancedAdminStats = computed(() => [
  {
    label: "Total Students",
    value: adminStats.value.totalStudents,
    icon: "i-heroicons-users",
    iconClass: "text-violet-500",
    iconBgClass: "bg-violet-100",
    bgClass: "text-violet-200"
  },
  {
    label: "Total Classes",
    value: adminStats.value.totalClasses,
    icon: "i-heroicons-academic-cap",
    iconClass: "text-blue-500",
    iconBgClass: "bg-blue-100",
    bgClass: "text-blue-200"
  },
  {
    label: "Active Moderators",
    value: adminStats.value.activeModeratorCount,
    icon: "i-heroicons-user-group",
    iconClass: "text-teal-500",
    iconBgClass: "bg-teal-100",
    bgClass: "text-teal-200"
  },
  {
    label: "Join Requests",
    value: adminStats.value.joinRequestsCount,
    icon: "i-heroicons-bell-alert",
    iconClass: "text-amber-500",
    iconBgClass: "bg-amber-100",
    bgClass: "text-amber-200"
  }
]);

// Enhanced student stats with visual properties
const enhancedStudentStats = computed(() => [
  {
    label: "Enrolled Classes",
    value: studentStats.value.enrolledClasses,
    icon: "i-heroicons-academic-cap",
    iconClass: "text-purple-500",
    iconBgClass: "bg-purple-100",
    bgClass: "text-purple-200"
  },
  {
    label: "Active Lessons",
    value: upcomingLessons.value.length,
    icon: "i-heroicons-play",
    iconClass: "text-blue-500",
    iconBgClass: "bg-blue-100",
    bgClass: "text-blue-200"
  }
]);

// Load dashboard data on mount
onMounted(async () => {
  await fetchDashboardData();
});
</script>

<style scoped>
@keyframes float-slow {

  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }

  50% {
    transform: translate(15px, -15px) rotate(3deg);
  }
}

@keyframes float-medium {

  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }

  50% {
    transform: translate(-12px, 12px) rotate(-5deg);
  }
}

@keyframes float-fast {

  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }

  50% {
    transform: translate(8px, -8px) rotate(8deg);
  }
}

.animate-float-slow {
  animation: float-slow 15s ease-in-out infinite;
}

.animate-float-medium {
  animation: float-medium 10s ease-in-out infinite;
}

.animate-float-fast {
  animation: float-fast 8s ease-in-out infinite;
}
</style>
