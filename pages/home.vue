<script setup lang="ts">
import { useHead } from '#app';

useHead({
  title: 'QRMaster - La solution QR Code des entrepreneurs',
  meta: [
    { name: 'description', content: 'Créez, gérez et analysez vos QR codes avec QRMaster, la solution tout-en-un pour les entrepreneurs.' }
  ]
})

</script>

<template>
  <div class="min-h-screen relative overflow-hidden" style="background-color: #ffcd00">
    <AppHeader />

    <main class="relative z-10 flex flex-col items-center justify-center px-4 py-16 min-h-[calc(100vh-7rem)]">
      <div class="desc-wrapper text-left mb-20 relative w-full max-w-4xl mx-auto">
        <div class="absolute inset-0 w-full h-full pointer-events-none">
          <img src="/images/background/hero-img-bg.png" alt="Hero Background"
            class="absolute inset-0 h-full w-auto object-contain left-1/2 transform -translate-x-1/2">
        </div>

        <div class="desc relative z-10 px-4 sm:px-6 lg:px-8" style="max-width: 1200px;">
          <h1 class="DJ__homepagePagetitleAnimation__processed visible leading-none">
            <span class="animated small"
              style="color: #071a39; animation-delay: 0ms; font-size: 3rem; font-weight: 700;">QRMASTER,</span><br>
            <span class="animated"
              style="color: #071a39; animation-delay: 400ms; font-size: 4.5rem; font-weight: 900; line-height: 0.9;">LA
              SOLUTION QR CODE</span><br>
            <span class="animated"
              style="color: #071a39; animation-delay: 800ms; font-size: 4.5rem; font-weight: 900; line-height: 0.9;">DES
              ENTREPRENEURS</span>
          </h1>
        </div>
      </div>

      <div class="w-full max-w-6xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mt-16">
        <div class="flex flex-col items-center text-center group cursor-pointer">
          <div
            class="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mb-3 group-hover:bg-white/50 transition-colors">
            <Icon name="heroicons:plus-circle" class="w-8 h-8 text-gray-800" />
          </div>
          <span class="text-gray-800 font-semibold text-sm">Création</span>
        </div>

        <div class="flex flex-col items-center text-center group cursor-pointer">
          <div
            class="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mb-3 group-hover:bg-white/50 transition-colors">
            <Icon name="heroicons:light-bulb" class="w-8 h-8 text-gray-800" />
          </div>
          <span class="text-gray-800 font-semibold text-sm">Innovation</span>
        </div>

        <div class="flex flex-col items-center text-center group cursor-pointer">
          <div
            class="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mb-3 group-hover:bg-white/50 transition-colors">
            <Icon name="heroicons:cog-6-tooth" class="w-8 h-8 text-gray-800" />
          </div>
          <span class="text-gray-800 font-semibold text-sm">Gestion</span>
        </div>

        <div class="flex flex-col items-center text-center group cursor-pointer">
          <div
            class="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mb-3 group-hover:bg-white/50 transition-colors">
            <Icon name="heroicons:chart-bar" class="w-8 h-8 text-gray-800" />
          </div>
          <span class="text-gray-800 font-semibold text-sm">Analytics</span>
        </div>

        <div class="flex flex-col items-center text-center group cursor-pointer">
          <div
            class="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mb-3 group-hover:bg-white/50 transition-colors">
            <Icon name="heroicons:megaphone" class="w-8 h-8 text-gray-800" />
          </div>
          <span class="text-gray-800 font-semibold text-sm">Marketing</span>
        </div>

        <div class="flex flex-col items-center text-center group cursor-pointer">
          <div
            class="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mb-3 group-hover:bg-white/50 transition-colors">
            <Icon name="heroicons:users" class="w-8 h-8 text-gray-800" />
          </div>
          <span class="text-gray-800 font-semibold text-sm">Support</span>
        </div>
      </div>
    </main>

    <div class="fixed bottom-8 right-8 z-50">
      <button
        class="w-16 h-16 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group">
        <div class="flex items-center justify-center">
          <img src="/images/tchat/chat-bubble.svg" alt="Chat" class="w-8 h-8 text-white">
        </div>

        <div
          class="absolute right-20 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-4 py-2 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span class="text-sm font-medium">Vous avez un projet ?</span>
          <div class="absolute right-0 top-1/2 transform translate-x-2 -translate-y-1/2">
            <div
              class="w-0 h-0 border-l-4 border-l-gray-800 border-t-4 border-b-4 border-t-transparent border-b-transparent">
            </div>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 768px) {
  .text-4xl {
    font-size: 2rem;
  }

  .text-6xl {
    font-size: 2.5rem;
  }

  .text-7xl {
    font-size: 3rem;
  }
}

.group:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease-in-out;
}

.hero-bg {
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.desc-wrapper {
  position: relative;
  width: 100%;
}

.desc h1 {
  line-height: 0.9;
  margin: 0;
}

.desc h1 .small {
  font-size: 0.5em;
  font-weight: 700;
}

.desc h1 .animated {
  display: inline-block;
  animation: fadeInUp 1s ease-out both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.desc-wrapper .absolute {
  transform: scale(1.3);
}
</style>
