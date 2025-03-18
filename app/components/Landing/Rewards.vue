<template>
  <section class="relative min-h-[80vh] flex items-center">
    <!-- Background Image with Overlay -->
    <div class="absolute inset-0">
      <img
        src="/images/image01.jpg"
        alt="Rewards Background"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-r from-black/75 to-black/70 backdrop-blur-sm"></div>
    </div>

    <!-- Content -->
    <div class="container mx-auto px-4 relative z-10">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-16">
          <div class="inline-block font-bold px-6 py-2 rounded-full bg-indigo-100 text-indigo-900 text-sm mb-6 backdrop-blur-md bg-opacity-90">
            Rewards Program
          </div>
          <h2 class="text-5xl font-display font-bold mb-6 text-white">Earn Rewards for Learning</h2>
          <p class="text-gray-200 text-lg max-w-2xl mx-auto">
            Turn your quiz performance into rewards! Earn stars for every quiz you complete
            and redeem them for exciting gifts. The better you perform, the more you earn.
          </p>
        </div>

        <!-- Reward Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <!-- Earn Stars Card -->
          <div class="group">
            <div class="p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 transition-all duration-300 hover:transform hover:-translate-y-2 hover:bg-white/15">
              <div class="mb-6">
                <div class="w-16 h-16 rounded-full bg-indigo-900/30 flex items-center justify-center mx-auto backdrop-blur-lg">
                  <UIcon name="i-heroicons-star" class="text-3xl text-indigo-400" />
                </div>
              </div>
              <h3 class="text-2xl font-bold text-center mb-4 text-white">Earn Stars</h3>
              <p class="text-gray-200 text-center leading-relaxed">
                Complete quizzes to accumulate Science Stars and unlock amazing rewards. Each correct answer brings you closer to your next reward.
              </p>
            </div>
          </div>

          <!-- Redeem Rewards Card -->
          <div class="group">
            <div class="p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 transition-all duration-300 hover:transform hover:-translate-y-2 hover:bg-white/15">
              <div class="mb-6">
                <div class="w-16 h-16 rounded-full bg-indigo-900/30 flex items-center justify-center mx-auto backdrop-blur-lg">
                  <UIcon name="i-heroicons-trophy" class="text-3xl text-indigo-400"/>
                </div>
              </div>
              <h3 class="text-2xl font-bold text-center mb-4 text-white">Redeem Rewards</h3>
              <p class="text-gray-200 text-center leading-relaxed">
                Use your Science Stars to choose from a variety of exciting gifts. From study materials to special privileges, rewards await!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Remove the blob animation as we're using background image with overlay now */
</style>
