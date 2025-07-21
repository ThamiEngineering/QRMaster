<script setup lang="ts">
import {useHead} from '#app';

useHead({
  title: 'QRMaster - La solution QR Code des entrepreneurs',
  meta: [
    {
      name: 'description',
      content: 'Créez, gérez et analysez vos QR codes avec QRMaster, la solution tout-en-un pour les entrepreneurs.'
    }
  ]
})

</script>

<template>
  <div class="relative min-h-screen bg-black text-white overflow-hidden">

    <div class="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <div
          class="absolute -left-4 top-1/2 -translate-y-1/2 -rotate-180 text-white/[0.03] text-[20rem] font-bold tracking-tighter [writing-mode:vertical-rl] blur-[1px]">
        QRMASTER
      </div>
      <div
          class="absolute -right-4 top-1/2 -translate-y-1/2 -rotate-180 text-white/[0.03] text-[20rem] font-bold tracking-tighter [writing-mode:vertical-rl] blur-[1px]">
        SOLUTION
      </div>
    </div>

    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400/30 rounded-full animate-pulse"></div>
      <div class="absolute top-1/3 right-1/3 w-1 h-1 bg-yellow-400/20 rounded-full animate-ping"
           style="animation-delay: 1s;"></div>
      <div class="absolute bottom-1/4 left-1/3 w-3 h-3 bg-yellow-400/20 rounded-full animate-pulse"
           style="animation-delay: 2s;"></div>
      <div class="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-yellow-400/30 rounded-full animate-ping"
           style="animation-delay: 3s;"></div>
    </div>

    <nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <NuxtLink to="/" class="text-xl font-medium tracking-tight flex items-center gap-2"
                    aria-label="QRMaster Homepage">
            <div class="relative w-8 h-8">
              <div class="absolute inset-0 bg-yellow-400/20 rounded-xl blur-sm"></div>
              <div
                  class="relative w-full h-full rounded-xl bg-black border border-yellow-400/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                     class="h-4 w-4 text-yellow-400">
                  <rect width="5" height="5" x="3" y="3" rx="1"/>
                  <rect width="5" height="5" x="16" y="3" rx="1"/>
                  <rect width="5" height="5" x="3" y="16" rx="1"/>
                  <path d="m21 16-3.5-3.5-1 1-1.5-1.5"/>
                  <path d="m21 21-3.5-3.5-1 1-1.5-1.5"/>
                  <path d="M13 13l1.5 1.5L16 13"/>
                </svg>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span>QRMaster</span>
              <span class="text-xs text-white/50 font-medium hidden md:block">| GÉRER L'AVENIR</span>
            </div>
          </NuxtLink>

          <div class="hidden lg:flex items-center space-x-8">
            <a href="#features" class="text-white/70 hover:text-white transition-colors relative group">
              <span class="relative z-10">Nous découvrir</span>
              <span class="absolute -bottom-1 left-0 w-0 h-px bg-yellow-400 transition-all group-hover:w-full"></span>
            </a>
            <a href="#solutions" class="text-white/70 hover:text-white transition-colors relative group">
              <span class="relative z-10">Nos solutions</span>
              <span class="absolute -bottom-1 left-0 w-0 h-px bg-yellow-400 transition-all group-hover:w-full"></span>
            </a>
            <a href="#pricing" class="text-white/70 hover:text-white transition-colors relative group">
              <span class="relative z-10">Nos tarifs</span>
              <span class="absolute -bottom-1 left-0 w-0 h-px bg-yellow-400 transition-all group-hover:w-full"></span>
            </a>
            <a href="#support" class="text-white/70 hover:text-white transition-colors relative group">
              <span class="relative z-10">Support</span>
              <span class="absolute -bottom-1 left-0 w-0 h-px bg-yellow-400 transition-all group-hover:w-full"></span>
            </a>
          </div>

          <div class="hidden md:flex items-center gap-4">
            <NuxtLink to="/login"
                      class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 h-10 px-4 py-2 text-white/70 hover:text-white hover:bg-white/5"
                      aria-label="Se connecter">
              Se connecter
            </NuxtLink>
            <NuxtLink to="/register"
                      class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 h-10 px-4 py-2 bg-yellow-400 text-black hover:bg-yellow-500 font-medium"
                      aria-label="Commencer">
              Commencer
            </NuxtLink>
          </div>

          <button
              class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 h-10 w-10 lg:hidden text-white/70 hover:text-white hover:bg-white/5"
              aria-label="Menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
              <line x1="4" x2="20" y1="12" y2="12"/>
              <line x1="4" x2="20" y1="6" y2="6"/>
              <line x1="4" x2="20" y1="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <main class="relative z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div class="text-center max-w-6xl mx-auto mb-12">
          <div style="opacity: 1; transform: none;">
            <div
                class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20 mb-8 backdrop-blur-sm">
              <span class="text-sm font-medium text-yellow-400 flex items-center gap-2">
                Solution QR Code Premium
              </span>
            </div>

            <div class="space-y-8">
              <h1 class="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tighter leading-none m-0">
                <span class="hero-line hero-line-2">
                  <span class="text-white">LA SOLUTION QR CODE</span>
                </span>
                <br>
                <span class="hero-line hero-line-3">
                  <span class="text-yellow-400 relative">
                    <span class="relative z-10">DES ENTREPRENEURS</span>
                    <div class="absolute inset-0 bg-yellow-400/10 blur-3xl -z-10 animate-pulse"></div>
                  </span>
                </span>
              </h1>
              <p class="text-xl text-white/60 max-w-3xl mx-auto leading-relaxed" style="opacity: 1; transform: none;">
                Créez, gérez et analysez vos QR codes avec la solution tout-en-un qui révolutionne l'expérience digitale
                des entrepreneurs modernes.
              </p>

              <div class="flex flex-col sm:flex-row gap-6 justify-center mt-12" style="opacity: 1; transform: none;">
                <NuxtLink to="/register"
                          class="relative h-14 px-12 group overflow-hidden bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:via-amber-500 hover:to-orange-500 text-black rounded-xl border border-yellow-400/20 shadow-lg hover:shadow-yellow-400/25 transition-all duration-500 ease-out">
                  <div
                      class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div
                      class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                  <div class="relative flex items-center justify-center gap-3 h-full">
                    <span class="text-lg font-semibold">Commencer gratuitement</span>
                  </div>
                </NuxtLink>

                <button
                    class="relative h-14 px-12 group overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl text-white/90 hover:text-white hover:bg-white/10 hover:border-white/20 shadow-lg hover:shadow-white/10 transition-all duration-500 ease-out">
                  <div
                      class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                  <span class="relative text-lg font-medium">Découvrir la démo</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div id="features" class="w-full max-w-6xl mx-auto">
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div
                class="group relative flex flex-col items-center text-center p-6 rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 shadow-lg hover:shadow-white/10 transition-all duration-500 ease-out cursor-pointer">
              <div
                  class="absolute inset-0 bg-gradient-to-br opacity-20 from-yellow-500/10 via-amber-500/10 to-orange-500/10"></div>
              <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
              <div class="relative">
                <div
                    class="w-16 h-16 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-yellow-400/20 group-hover:border-yellow-400/30 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                       class="text-yellow-400">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="m15 9-6 6"/>
                    <path d="m9 9 6 6"/>
                  </svg>
                </div>
                <span
                    class="text-white font-semibold text-sm group-hover:text-yellow-400 transition-colors">Création</span>
              </div>
            </div>

            <div
                class="group relative flex flex-col items-center text-center p-6 rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 shadow-lg hover:shadow-white/10 transition-all duration-500 ease-out cursor-pointer">
              <div
                  class="absolute inset-0 bg-gradient-to-br opacity-20 from-blue-500/10 via-indigo-500/10 to-purple-500/10"></div>
              <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
              <div class="relative">
                <div
                    class="w-16 h-16 bg-blue-400/10 border border-blue-400/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-400/20 group-hover:border-blue-400/30 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                       class="text-blue-400">
                    <path
                        d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                    <path d="M9 18h6"/>
                    <path d="M10 22h4"/>
                  </svg>
                </div>
                <span
                    class="text-white font-semibold text-sm group-hover:text-blue-400 transition-colors">Innovation</span>
              </div>
            </div>

            <div
                class="group relative flex flex-col items-center text-center p-6 rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 shadow-lg hover:shadow-white/10 transition-all duration-500 ease-out cursor-pointer">
              <div
                  class="absolute inset-0 bg-gradient-to-br opacity-20 from-green-500/10 via-emerald-500/10 to-teal-500/10"></div>
              <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
              <div class="relative">
                <div
                    class="w-16 h-16 bg-green-400/10 border border-green-400/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-400/20 group-hover:border-green-400/30 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                       class="text-green-400">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                  </svg>
                </div>
                <span
                    class="text-white font-semibold text-sm group-hover:text-green-400 transition-colors">Gestion</span>
              </div>
            </div>

            <div
                class="group relative flex flex-col items-center text-center p-6 rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 shadow-lg hover:shadow-white/10 transition-all duration-500 ease-out cursor-pointer">
              <div
                  class="absolute inset-0 bg-gradient-to-br opacity-20 from-purple-500/10 via-pink-500/10 to-rose-500/10"></div>
              <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
              <div class="relative">
                <div
                    class="w-16 h-16 bg-purple-400/10 border border-purple-400/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-400/20 group-hover:border-purple-400/30 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                       class="text-purple-400">
                    <path d="M3 3v18h18"/>
                    <path d="m19 9-5 5-4-4-3 3"/>
                  </svg>
                </div>
                <span
                    class="text-white font-semibold text-sm group-hover:text-purple-400 transition-colors">Analytics</span>
              </div>
            </div>

            <div
                class="group relative flex flex-col items-center text-center p-6 rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 shadow-lg hover:shadow-white/10 transition-all duration-500 ease-out cursor-pointer">
              <div
                  class="absolute inset-0 bg-gradient-to-br opacity-20 from-orange-500/10 via-red-500/10 to-pink-500/10"></div>
              <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
              <div class="relative">
                <div
                    class="w-16 h-16 bg-orange-400/10 border border-orange-400/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-400/20 group-hover:border-orange-400/30 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                       class="text-orange-400">
                    <path d="m3 11 18-5v12L3 14v-3z"/>
                    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
                  </svg>
                </div>
                <span
                    class="text-white font-semibold text-sm group-hover:text-orange-400 transition-colors">Marketing</span>
              </div>
            </div>

            <div
                class="group relative flex flex-col items-center text-center p-6 rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 shadow-lg hover:shadow-white/10 transition-all duration-500 ease-out cursor-pointer">
              <div
                  class="absolute inset-0 bg-gradient-to-br opacity-20 from-cyan-500/10 via-blue-500/10 to-indigo-500/10"></div>
              <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
              <div class="relative">
                <div
                    class="w-16 h-16 bg-cyan-400/10 border border-cyan-400/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-cyan-400/20 group-hover:border-cyan-400/30 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                       class="text-cyan-400">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="m22 2-5 5"/>
                    <path d="m17 7 5-5"/>
                  </svg>
                </div>
                <span
                    class="text-white font-semibold text-sm group-hover:text-cyan-400 transition-colors">Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>

.hero-line {
  animation: fadeInUp 1s ease-out both;
}

.hero-line-1 {
  animation-delay: 0ms;
  font-size: 0.6em;
  font-weight: 700;
}

.hero-line-2 {
  animation-delay: 400ms;
}

.hero-line-3 {
  animation-delay: 800ms;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {

  .hero-line-1 {
    font-size: 0.7em;
  }
}

/* Feature Cards Hover Effects */
.group:hover {
  transform: translateY(-4px);
}

/* Custom Scrollbar for WebKit browsers */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 196, 0, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 196, 0, 0.5);
}

/* Enhanced animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* Smooth transitions for all interactive elements */
* {
  transition-property: transform, opacity, background-color, border-color, color, box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>