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
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Centre d'aide</h1>
      <p class="text-gray-600">Trouvez rapidement les réponses à vos questions</p>
    </div>

    <div class="mb-8">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Guides rapides</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="guide in guides"
          :key="guide.title"
          class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
          <div class="flex items-center mb-3">
            <div
              :class="`w-10 h-10 rounded-lg flex items-center justify-center bg-${guide.color}-100`"
            >
              <Icon :name="guide.icon" :class="`w-5 h-5 text-${guide.color}-600`" />
            </div>
          </div>
          <h3 class="font-semibold text-gray-900 mb-2">{{ guide.title }}</h3>
          <p class="text-sm text-gray-600">{{ guide.description }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div class="mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Questions fréquentes</h2>

        <div class="mb-4">
          <UInput
            v-model="searchQuery"
            icon="i-lucide-search"
            size="lg"
            variant="subtle"
            placeholder="Rechercher..."
            class="w-auto"
          />
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="category in categories"
            :key="category.value"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
              selectedCategory === category.value
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200',
            ]"
            @click="selectedCategory = category.value"
          >
            <Icon :name="category.icon" class="w-4 h-4" />
            {{ category.label }}
          </button>
        </div>
      </div>

      <div class="space-y-4">
        <div v-if="filteredFAQ.length === 0" class="text-center py-8">
          <Icon
            name="i-heroicons-question-mark-circle"
            class="w-12 h-12 text-gray-400 mx-auto mb-3"
          />
          <p class="text-gray-500">Aucune question trouvée pour votre recherche.</p>
        </div>

        <div v-else>
          <UAccordion
            :items="
              filteredFAQ.map((item) => ({
                label: item.question,
                content: item.answer,
                defaultOpen: false,
              }))
            "
          />
        </div>
      </div>
    </div>

    <div
      class="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6"
    >
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Besoin d'aide supplémentaire ?</h3>
          <p class="text-gray-600 mb-4">
            Notre équipe support est là pour vous aider à réussir avec QRMaster.
          </p>
          <div class="flex gap-3">
            <UButton color="primary" icon="i-heroicons-envelope"> Contacter le support </UButton>
          </div>
        </div>
        <div class="hidden md:block">
          <Icon name="i-heroicons-chat-bubble-left-ellipsis" class="w-16 h-16 text-blue-400" />
        </div>
      </div>
    </div>

    <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <Icon name="i-heroicons-video-camera" class="w-10 h-10 text-indigo-500 mx-auto mb-3" />
        <h3 class="font-semibold text-gray-900 mb-2">Tutoriels vidéo</h3>
        <p class="text-sm text-gray-600 mb-4">Apprenez avec nos guides vidéo pas à pas</p>
        <UButton variant="soft" size="sm">Voir les vidéos</UButton>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <Icon name="i-heroicons-book-open" class="w-10 h-10 text-green-500 mx-auto mb-3" />
        <h3 class="font-semibold text-gray-900 mb-2">Documentation</h3>
        <p class="text-sm text-gray-600 mb-4">Documentation technique complète</p>
        <UButton variant="soft" size="sm">Lire la doc</UButton>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <Icon name="i-heroicons-users" class="w-10 h-10 text-purple-500 mx-auto mb-3" />
        <h3 class="font-semibold text-gray-900 mb-2">Communauté</h3>
        <p class="text-sm text-gray-600 mb-4">Rejoignez notre communauté d'utilisateurs</p>
        <UButton variant="soft" size="sm">Rejoindre</UButton>
      </div>
    </div>
  </div>
</template>
