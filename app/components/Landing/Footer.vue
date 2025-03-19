<template>
  <div class="container mx-auto px-4 py-16">
    <div class="backdrop-blur-sm bg-white/60 rounded-3xl shadow-2xl shadow-indigo-500/10 overflow-hidden border border-white/20">
      <div class="relative overflow-hidden">
        <!-- Decorative Background Elements -->
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/40"></div>
        <div class="absolute top-1/2 left-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div class="absolute top-1/2 right-0 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <!-- Footer Content -->
        <div class="relative px-8 py-12">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <!-- Logo & Info -->
            <div class="col-span-1 md:col-span-2">
              <div class="flex items-center space-x-2 mb-6">
                <img src="/logo.png" alt="ScienceHub Logo" class="h-8 w-auto">
                <span class="font-bold text-xl">SCIENCE<span
                    class="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-400 text-transparent bg-clip-text">HUB</span></span>
              </div>
              <p class="text-gray-600 mb-6">
                Empowering students with quality science education through innovative teaching methods and personalized attention.
              </p>
              <div class="flex space-x-4">
                <a href="#" class="w-10 h-10 rounded-lg bg-purple-50 hover:bg-purple-100 flex items-center justify-center transition-colors">
                  <UIcon name="i-simple-icons-facebook" class="text-purple-600 text-xl" />
                </a>
                <a href="#" class="w-10 h-10 rounded-lg bg-purple-50 hover:bg-purple-100 flex items-center justify-center transition-colors">
                  <UIcon name="i-simple-icons-youtube" class="text-purple-600 text-xl" />
                </a>
                <a href="#" class="w-10 h-10 rounded-lg bg-purple-50 hover:bg-purple-100 flex items-center justify-center transition-colors">
                  <UIcon name="i-simple-icons-instagram" class="text-purple-600 text-xl" />
                </a>
              </div>
            </div>

            <!-- Quick Links -->
            <div>
              <h4 class="font-display font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">Quick Links</h4>
              <ul class="space-y-3">
                <li><a href="#" class="text-gray-600 hover:text-purple-600 transition-colors">About Us</a></li>
                <li><a href="#" class="text-gray-600 hover:text-purple-600 transition-colors">Classes</a></li>
                <li><a href="#" class="text-gray-600 hover:text-purple-600 transition-colors">Resources</a></li>
                <li><a href="#" class="text-gray-600 hover:text-purple-600 transition-colors">Contact</a></li>
              </ul>
            </div>

            <!-- Contact -->
            <div>
              <h4 class="font-display font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">Contact Us</h4>
              <ul class="space-y-4">
                <li class="group">
                  <a href="mailto:info@sciencehub.com" class="flex items-center gap-3">
                  <span class="w-10 h-10 rounded-lg bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                    <UIcon name="i-heroicons-envelope" class="text-purple-600 w-6 h-6" />
                  </span>
                  <span class="text-gray-600 group-hover:text-purple-600 transition-colors">info@sciencehub.com</span>
                  </a>
                </li>
                <li class="group">
                  <a href="tel:+94123456789" class="flex items-center gap-3">
                    <span class="w-10 h-10 rounded-lg bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                      <UIcon name="i-heroicons-phone" class="text-purple-600 w-6 h-6" />
                    </span>
                    <span class="text-gray-600 group-hover:text-purple-600 transition-colors">+94 12 345 6789</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div class="border-t border-gray-200 mt-12 pt-8">
            <div class="flex flex-col md:flex-row md:justify-between md:items-center text-sm text-gray-400">
              <p>&copy; {{ new Date().getFullYear() }} ScienceHub. All rights reserved.</p>
              <div class="flex items-center gap-2 mt-2 md:mt-0">
                <span>Developed by</span>
                <a href="https://eversoft.lk" target="_blank" rel="noopener noreferrer" class="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                  Eversoft
                  <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
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
