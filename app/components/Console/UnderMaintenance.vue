<template>
  <div class="relative w-full overflow-hidden bg-white rounded-lg shadow-sm py-20">
    <!-- Decorative blobs -->
    <div class="absolute inset-0 z-0 overflow-hidden">
      <svg class="absolute -top-24 -left-24 w-96 h-96 text-purple-200 opacity-30 blur-3xl" viewBox="0 0 200 200">
        <path fill="currentColor" d="M45.3,-58.8C60.9,-47.3,77.3,-35.5,82.1,-19.5C86.9,-3.4,80.2,16.9,69.3,33.5C58.4,50,43.3,62.7,25.9,69.6C8.5,76.5,-11.2,77.5,-27.4,70.7C-43.6,63.9,-56.2,49.2,-65.1,32.3C-73.9,15.3,-79,-4,-74.2,-20.8C-69.5,-37.6,-54.8,-51.9,-39.3,-63.4C-23.8,-74.9,-7.4,-83.5,4.7,-89.3C16.9,-95,33.8,-97.9,45.3,-58.8Z" transform="translate(100 100)" />
      </svg>
      <svg class="absolute top-1/2 -right-24 w-80 h-80 text-purple-300 opacity-20 blur-2xl" viewBox="0 0 200 200">
        <path fill="currentColor" d="M42.8,-71.3C55.9,-62.8,67.4,-51.6,75.6,-37.5C83.8,-23.4,88.8,-6.5,87.5,10.1C86.2,26.7,78.6,42.9,66.6,54.8C54.6,66.7,38.2,74.2,21.3,78.9C4.4,83.6,-13,85.5,-28.8,80.7C-44.6,75.9,-58.8,64.4,-70.6,50.1C-82.4,35.8,-91.8,18.7,-91.6,1.8C-91.4,-15.1,-81.6,-31,-70.3,-44.9C-59,-58.8,-46.2,-70.7,-32.3,-78.7C-18.3,-86.7,-3.2,-90.8,7.8,-102.8C18.7,-114.8,29.7,-79.8,42.8,-71.3Z" transform="translate(100 100)" />
      </svg>
      <svg class="absolute bottom-20 left-1/3 w-64 h-64 text-purple-400 opacity-25 blur-xl" viewBox="0 0 200 200">
        <path fill="currentColor" d="M38.9,-64.9C51.1,-55.8,62.3,-45.8,69.7,-33C77.1,-20.2,80.7,-4.7,78.6,9.8C76.5,24.3,68.7,37.8,58.4,48.9C48.1,60,35.4,68.8,21.1,73.7C6.9,78.5,-8.9,79.4,-23.9,75.1C-38.9,70.8,-53.2,61.3,-64.6,48.3C-76,35.3,-84.6,18.8,-85.5,1.7C-86.4,-15.4,-79.6,-33.1,-68.2,-46.4C-56.8,-59.7,-40.8,-68.6,-25.8,-75.6C-10.8,-82.6,3.3,-87.7,16.3,-83.4C29.3,-79.1,41.1,-65.4,38.9,-64.9Z" transform="translate(100 100)" />
      </svg>
    </div>

    <!-- Application-like background design -->
    <div class="absolute inset-0 z-0">
      <div class="relative h-full">
        <!-- Top navigation bar -->
        <div class="absolute top-0 left-0 right-0 h-14 bg-gray-50 opacity-50 border-b border-gray-200/20">
          <div class="flex items-center h-full px-4 space-x-4 opacity-30">
            <div class="w-24 h-6 bg-gray-300 rounded"></div>
            <div class="w-32 h-6 bg-gray-300 rounded"></div>
            <div class="w-32 h-6 bg-gray-300 rounded"></div>
          </div>
        </div>
        
        <!-- Sidebar -->
        <div class="absolute left-0 top-14 bottom-0 w-64 bg-gray-50 opacity-50 border-r border-gray-200/20">
          <div class="p-4 space-y-4 opacity-30">
            <div class="w-full h-8 bg-gray-300 rounded"></div>
            <div class="w-full h-8 bg-gray-300 rounded"></div>
            <div class="w-full h-8 bg-gray-300 rounded"></div>
          </div>
        </div>
        
        <!-- Main content area -->
        <div class="absolute left-64 top-14 right-0 bottom-0 bg-gray-50/30">
          <div class="grid grid-cols-3 gap-6 p-6 opacity-30">
            <div v-for="i in 6" :key="i" 
              class="bg-white rounded-lg shadow-sm p-4 h-40 border border-gray-200/40">
              <div class="w-16 h-16 bg-gray-300 rounded mb-3"></div>
              <div class="w-3/4 h-4 bg-gray-300 rounded"></div>
              <div class="w-1/2 h-4 bg-gray-300 rounded mt-2"></div>
            </div>
          </div>
        </div>

        <!-- Overlay gradient -->
        <div class="absolute inset-0 bg-gradient-to-b from-white/0 via-white/60 to-white backdrop-blur-md"></div>
      </div>
    </div>

    <!-- Main content -->
    <div class="relative z-10 flex flex-col items-center justify-center px-4">
      <img 
        src="/images/contruction-side.webp" 
        alt="Under Construction" 
        class="mb-8 w-full max-w-md"
      />
      
      <h1 class="mb-4 text-center text-3xl font-bold text-gray-800">
        Under Construction
      </h1>
      
      <p class="mb-6 max-w-md text-center text-gray-600">
        We're working hard to bring you an amazing new feature. 
        You'll be able to access this page once it's fully implemented.
      </p>

      <div class="flex items-center space-x-2 text-sm text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Coming soon</span>
      </div>
    </div>
  </div>
</template>
