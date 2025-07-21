<script setup lang="ts">
const faqItems = ref([
  {
    id: 1,
    question: 'Comment créer mon premier QR code ?',
    answer:
      "Cliquez sur le bouton 'Générer' en haut de la page, remplissez les informations requises (nom, contenu) et cliquez sur 'Générer'. Votre QR code sera créé instantanément.",
    category: 'getting-started',
  },
  {
    id: 2,
    question: 'Quelle est la différence entre QR code statique et dynamique ?',
    answer:
      "Un QR code statique contient directement l'information finale (URL, texte). Un QR code dynamique redirige vers une URL que vous pouvez modifier sans changer le QR code physique.",
    category: 'qr-codes',
  },
  {
    id: 3,
    question: 'Comment organiser mes QR codes en campagnes ?',
    answer:
      "Les campagnes vous permettent de grouper vos QR codes par projet ou thématique. Créez une campagne via le bouton 'Nouvelle campagne', puis assignez vos QR codes à cette campagne lors de leur création.",
    category: 'campaigns',
  },
  {
    id: 4,
    question: 'Comment voir les statistiques de mes QR codes ?',
    answer:
      "Rendez-vous dans la section 'Analyses' pour voir les statistiques détaillées de vos QR codes : nombre de scans, géolocalisation, appareils utilisés, etc.",
    category: 'analytics',
  },
  {
    id: 5,
    question: 'Puis-je télécharger mes QR codes ?',
    answer:
      "Oui ! Dans la section 'Mes QR codes', cliquez sur le bouton de partage de n'importe quel QR code, puis sur 'Télécharger' pour sauvegarder l'image.",
    category: 'qr-codes',
  },
  {
    id: 6,
    question: 'Comment modifier un QR code existant ?',
    answer:
      "Seuls les QR codes dynamiques peuvent être modifiés. Cliquez sur l'icône de modification dans la liste de vos QR codes pour changer le contenu, le nom ou la campagne associée.",
    category: 'qr-codes',
  },
])

const selectedCategory = ref('all')
const searchQuery = ref('')

const categories = [
  { value: 'all', label: 'Toutes', icon: 'i-heroicons-squares-2x2' },
  { value: 'getting-started', label: 'Premiers pas', icon: 'i-heroicons-play' },
  { value: 'qr-codes', label: 'QR Codes', icon: 'i-heroicons-qr-code' },
  { value: 'campaigns', label: 'Campagnes', icon: 'i-heroicons-megaphone' },
  { value: 'analytics', label: 'Analyses', icon: 'i-heroicons-chart-bar' },
]

const filteredFAQ = computed(() => {
  let filtered = faqItems.value

  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter((item) => item.category === selectedCategory.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (item) =>
        item.question.toLowerCase().includes(query) || item.answer.toLowerCase().includes(query)
    )
  }

  return filtered
})

const guides = [
  {
    title: 'Guide de démarrage rapide',
    description: 'Apprenez les bases de QRMaster en 5 minutes',
    icon: 'i-heroicons-rocket-launch',
    color: 'blue',
  },
  {
    title: 'Optimiser vos campagnes',
    description: 'Meilleures pratiques pour organiser vos QR codes',
    icon: 'i-heroicons-light-bulb',
    color: 'yellow',
  },
  {
    title: 'Analyser vos performances',
    description: 'Comprendre et utiliser les statistiques',
    icon: 'i-heroicons-chart-bar-square',
    color: 'green',
  },
  {
    title: 'Partager et télécharger',
    description: 'Comment distribuer vos QR codes efficacement',
    icon: 'i-heroicons-share',
    color: 'purple',
  },
]
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-6">

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="guide in guides" :key="guide.title" class="group relative p-6 rounded-xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 shadow-lg hover:shadow-white/10 transition-all duration-500 cursor-pointer">
          <div :class="`absolute inset-0 bg-gradient-to-br opacity-20 from-${guide.color}-500/10 via-${guide.color}-500/5 to-${guide.color}-500/10`"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>

          <div class="relative">
            <div :class="`w-12 h-12 bg-${guide.color}-400/10 border border-${guide.color}-400/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-${guide.color}-400/20 group-hover:border-${guide.color}-400/30 transition-all duration-300`">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="`text-${guide.color}-400`">
                <template v-if="guide.icon === 'i-heroicons-play'">
                  <polygon points="6,3 20,12 6,21"/>
                </template>
                <template v-else-if="guide.icon === 'i-heroicons-light-bulb'">
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                  <path d="M9 18h6"/>
                  <path d="M10 22h4"/>
                </template>
                <template v-else-if="guide.icon === 'i-heroicons-chart-bar-square'">
                  <path d="M3 3v18h18"/>
                  <path d="m19 9-5 5-4-4-3 3"/>
                </template>
                <template v-else-if="guide.icon === 'i-heroicons-share'">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16,6 12,2 8,6"/>
                  <line x1="12" x2="12" y1="2" y2="15"/>
                </template>
              </svg>
            </div>
            <h3 class="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">{{ guide.title }}</h3>
            <p class="text-white/60 text-sm">{{ guide.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="group relative p-6 rounded-xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300">
      <div class="absolute inset-0 bg-gradient-to-br opacity-20 from-blue-500/10 via-indigo-500/10 to-purple-500/10"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>

      <div class="relative space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-semibold text-white flex items-center gap-3">
            <div class="w-8 h-8 bg-blue-400/10 border border-blue-400/20 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <path d="M12 17h.01"/>
              </svg>
            </div>
            Questions fréquentes
          </h2>
        </div>

        <div class="relative">
          <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher dans la FAQ..."
              class="w-full py-3 pr-4 pl-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 hover:border-white/20"
          />
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <div class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300"></div>
        </div>

        <div class="flex flex-wrap gap-3">
          <button
              v-for="category in categories"
              :key="category.value"
              @click="selectedCategory = category.value"
              :class="[
                            'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 border',
                            selectedCategory === category.value
                                ? 'bg-blue-400/20 text-blue-400 border-blue-400/30'
                                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border-white/10 hover:border-white/20'
                        ]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <template v-if="category.icon === 'i-heroicons-sparkles'">
                <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Z"/>
                <path d="M13 11h4a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"/>
                <path d="M9 7V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3"/>
              </template>
              <template v-else-if="category.icon === 'i-heroicons-chart-bar'">
                <path d="M3 3v18h18"/>
                <path d="m19 9-5 5-4-4-3 3"/>
              </template>
              <template v-else-if="category.icon === 'i-heroicons-cog-6-tooth'">
                <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/>
                <path d="m15 9-6 6"/>
                <path d="M9 9h.01"/>
                <path d="M15 15h.01"/>
              </template>
              <template v-else>
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
              </template>
            </svg>
            {{ category.label }}
          </button>
        </div>

        <div class="space-y-4">
          <div v-if="filteredFAQ.length === 0" class="flex flex-col items-center justify-center py-16">
            <div class="w-16 h-16 bg-gray-400/10 border border-gray-400/20 rounded-2xl flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <path d="M12 17h.01"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-white mb-2">Aucune question trouvée</h3>
            <p class="text-white/60 text-center max-w-md">Essayez de modifier votre recherche ou sélectionnez une autre catégorie.</p>
          </div>

          <div v-else class="space-y-3">
            <div v-for="(item, index) in filteredFAQ" :key="index" class="group">
              <button @click="toggleFAQ(index)" class="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 text-left">
                <div class="flex items-center justify-between">
                  <h4 class="font-medium text-white group-hover:text-blue-400 transition-colors">{{ item.question }}</h4>
                  <svg :class="['w-5 h-5 text-white/60 transition-transform duration-200', openFAQ === index ? 'rotate-180' : '']" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </div>
              </button>
              <div v-if="openFAQ === index" class="mt-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <p class="text-white/80 leading-relaxed">{{ item.answer }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-6">
      <h2 class="text-2xl font-semibold text-white flex items-center gap-3">
        <div class="w-8 h-8 bg-green-400/10 border border-green-400/20 rounded-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-400">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" x2="8" y1="13" y2="13"/>
            <line x1="16" x2="8" y1="17" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
        </div>
        Ressources supplémentaires
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="group relative p-6 rounded-xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 shadow-lg hover:shadow-white/10 transition-all duration-500 cursor-pointer text-center">
          <div class="absolute inset-0 bg-gradient-to-br opacity-20 from-indigo-500/10 via-purple-500/10 to-pink-500/10"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>

          <div class="relative">
            <div class="w-16 h-16 bg-indigo-400/10 border border-indigo-400/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-400/20 group-hover:border-indigo-400/30 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-400">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
            </div>
            <h3 class="font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">Tutoriels vidéo</h3>
            <p class="text-white/60 text-sm mb-4">Apprenez avec nos guides vidéo pas à pas</p>
            <button class="relative h-10 px-4 group/btn overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl text-white/90 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover/btn:opacity-100 -translate-x-full group-hover/btn:translate-x-full transition-all duration-1000"></div>
              <span class="relative text-sm font-medium">Voir les vidéos</span>
            </button>
          </div>
        </div>

        <div class="group relative p-6 rounded-xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 shadow-lg hover:shadow-white/10 transition-all duration-500 cursor-pointer text-center">
          <div class="absolute inset-0 bg-gradient-to-br opacity-20 from-green-500/10 via-emerald-500/10 to-teal-500/10"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>

          <div class="relative">
            <div class="w-16 h-16 bg-green-400/10 border border-green-400/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-400/20 group-hover:border-green-400/30 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-400">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" x2="8" y1="13" y2="13"/>
                <line x1="16" x2="8" y1="17" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </div>
            <h3 class="font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">Documentation</h3>
            <p class="text-white/60 text-sm mb-4">Documentation technique complète</p>
            <button class="relative h-10 px-4 group/btn overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl text-white/90 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover/btn:opacity-100 -translate-x-full group-hover/btn:translate-x-full transition-all duration-1000"></div>
              <span class="relative text-sm font-medium">Lire la doc</span>
            </button>
          </div>
        </div>

        <div class="group relative p-6 rounded-xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 shadow-lg hover:shadow-white/10 transition-all duration-500 cursor-pointer text-center">
          <div class="absolute inset-0 bg-gradient-to-br opacity-20 from-purple-500/10 via-pink-500/10 to-rose-500/10"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>

          <div class="relative">
            <div class="w-16 h-16 bg-purple-400/10 border border-purple-400/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-400/20 group-hover:border-purple-400/30 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-400">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="m22 2-5 5"/>
                <path d="m17 7 5-5"/>
              </svg>
            </div>
            <h3 class="font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">Communauté</h3>
            <p class="text-white/60 text-sm mb-4">Rejoignez notre communauté d'utilisateurs</p>
            <button class="relative h-10 px-4 group/btn overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl text-white/90 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300">
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover/btn:opacity-100 -translate-x-full group-hover/btn:translate-x-full transition-all duration-1000"></div>
              <span class="relative text-sm font-medium">Rejoindre</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="group relative p-8 rounded-xl overflow-hidden bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 hover:border-blue-500/30 transition-all duration-300">
      <div class="absolute inset-0 bg-gradient-to-br opacity-20 from-blue-500/10 via-indigo-500/10 to-purple-500/10"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>

      <div class="relative">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h3 class="text-2xl font-bold text-white mb-3">Besoin d'aide supplémentaire ?</h3>
            <p class="text-white/80 mb-6 text-lg">Notre équipe support est là pour vous aider à réussir avec QRMaster.</p>
            <button class="relative h-12 px-8 group/contact overflow-hidden bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white rounded-xl border border-blue-400/20 shadow-lg hover:shadow-blue-400/25 transition-all duration-500 ease-out">
              <div class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/contact:opacity-100 transition-opacity duration-500"></div>
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/contact:opacity-100 -translate-x-full group-hover/contact:translate-x-full transition-all duration-1000"></div>
              <div class="relative flex items-center justify-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span class="font-semibold">Contacter le support</span>
              </div>
            </button>
          </div>
          <div class="hidden md:block ml-8">
            <div class="w-24 h-24 bg-blue-400/10 border border-blue-400/20 rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <path d="M13 8H7"/>
                <path d="M17 12H7"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>