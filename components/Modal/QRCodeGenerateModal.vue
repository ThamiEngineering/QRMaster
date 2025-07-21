<script setup lang="ts">
import type { Database } from '~/types/supabase'

interface Props {
  isOpen: boolean
  campaigns: Database['public']['Tables']['campaigns']['Row'][]
  isCreating: boolean
  generatedQRCode: string | null
}

interface QRCodeData {
  name: string
  type: 'statique' | 'dynamique'
  content: string
  campaign_id: number | null
}

interface Emits {
  (e: 'update:isOpen', value: boolean): void

  (e: 'create', data: QRCodeData): void

  (e: 'reset'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const modalOpen = computed({
  get: () => props.isOpen,
  set: (value: boolean) => emit('update:isOpen', value),
})

const qrCodeData = ref<QRCodeData>({
  name: '',
  type: 'statique',
  content: '',
  campaign_id: null,
})

const handleCreate = () => {
  emit('create', qrCodeData.value)
}

const handleReset = () => {
  qrCodeData.value = {
    name: '',
    type: 'statique',
    content: '',
    campaign_id: null,
  }
  emit('reset')
}

watch(
  () => props.isOpen,
  (newValue) => {
    if (!newValue) {
      handleReset()
    }
  }
)
</script>

<template>
  <div v-if="modalOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
    <div
      class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      @click="modalOpen = false"
    />

    <div
      class="relative w-full max-w-2xl rounded-2xl overflow-hidden bg-black border border-white/20 shadow-2xl"
    >
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          class="absolute -top-4 -right-4 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl"
        />
        <div
          class="absolute -bottom-4 -left-4 w-24 h-24 bg-yellow-400/5 rounded-full blur-2xl"
        />
      </div>

      <div class="relative border-b border-white/10 p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-yellow-400/10 border border-yellow-400/20 rounded-xl flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-yellow-400"
              >
                <rect width="5" height="5" x="3" y="3" rx="1" />
                <rect width="5" height="5" x="16" y="3" rx="1" />
                <rect width="5" height="5" x="3" y="16" rx="1" />
                <path d="m21 16-3.5-3.5-1 1-1.5-1.5" />
                <path d="m21 21-3.5-3.5-1 1-1.5-1.5" />
                <path d="M13 13l1.5 1.5L16 13" />
              </svg>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-white tracking-tight">Générer un QR code</h2>
              <p class="text-white/60 text-sm">
                Créez votre QR code personnalisé avec tracking avancé
              </p>
            </div>
          </div>
          <button
            class="w-10 h-10 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200"
            @click="modalOpen = false"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div class="relative p-6">
        <form class="space-y-6" @submit.prevent="handleCreate">
          <div class="space-y-2">
            <label for="qr-name" class="block text-sm font-medium text-white/90">
              Nom du QR code <span class="text-yellow-400">*</span>
            </label>
            <div class="relative">
              <input
                id="qr-name"
                v-model="qrCodeData.name"
                type="text"
                placeholder="Mon QR code"
                required
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300 hover:border-white/20"
              >
              <div
                class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label for="qr-campaign" class="block text-sm font-medium text-white/90">
              Campagne (optionnel)
            </label>
            <div class="relative">
              <select
                id="qr-campaign"
                v-model="qrCodeData.campaign_id"
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300 hover:border-white/20 appearance-none"
              >
                <option value="">Aucune campagne</option>
                <option
                  v-for="campaign in campaigns"
                  :key="campaign.id"
                  :value="campaign.id"
                  class="bg-gray-800 text-white"
                >
                  {{ campaign.name }}
                </option>
              </select>
              <div class="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="text-white/50"
                >
                  <path d="m7 15 5 5 5-5" />
                  <path d="m7 9 5-5 5 5" />
                </svg>
              </div>
              <div
                class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>

          <div class="space-y-3">
            <label class="block text-sm font-medium text-white/90">
              Type de QR code <span class="text-yellow-400">*</span>
            </label>
            <div class="grid grid-cols-2 gap-4">
              <label class="relative cursor-pointer">
                <input
                  v-model="qrCodeData.type"
                  type="radio"
                  name="qr-type"
                  value="statique"
                  class="sr-only"
                >
                <div
                  :class="[
                    'p-4 rounded-xl border-2 transition-all duration-300 group',
                    qrCodeData.type === 'statique'
                      ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400'
                      : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20 hover:bg-white/10',
                  ]"
                >
                  <div class="flex items-center gap-3 mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <rect width="5" height="5" x="3" y="3" rx="1" />
                      <rect width="5" height="5" x="16" y="3" rx="1" />
                      <rect width="5" height="5" x="3" y="16" rx="1" />
                      <path d="m21 16-3.5-3.5-1 1-1.5-1.5" />
                      <path d="m21 21-3.5-3.5-1 1-1.5-1.5" />
                      <path d="M13 13l1.5 1.5L16 13" />
                    </svg>
                    <span class="font-medium">Statique</span>
                  </div>
                  <p class="text-xs opacity-80">Contenu fixe, idéal pour des URL permanentes</p>
                </div>
              </label>

              <label class="relative cursor-pointer">
                <input
                  v-model="qrCodeData.type"
                  type="radio"
                  name="qr-type"
                  value="dynamique"
                  class="sr-only"
                >
                <div
                  :class="[
                    'p-4 rounded-xl border-2 transition-all duration-300 group',
                    qrCodeData.type === 'dynamique'
                      ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400'
                      : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20 hover:bg-white/10',
                  ]"
                >
                  <div class="flex items-center gap-3 mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                      <path d="M16 16h5v5" />
                    </svg>
                    <span class="font-medium">Dynamique</span>
                  </div>
                  <p class="text-xs opacity-80">
                    Modifiable après création, avec analytics avancés
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div class="space-y-2">
            <label for="qr-content" class="block text-sm font-medium text-white/90">
              Contenu <span class="text-yellow-400">*</span>
            </label>
            <div class="relative">
              <textarea
                id="qr-content"
                v-model="qrCodeData.content"
                placeholder="https://example.com"
                required
                rows="3"
                class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300 hover:border-white/20 resize-none"
              />
              <div
                class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent opacity-0 focus-within:opacity-100 transition-opacity duration-300"
              />
            </div>
            <p class="text-xs text-white/50">URL, texte, email, téléphone, WiFi, etc.</p>
          </div>

          <div v-if="generatedQRCode" class="flex flex-col items-center py-6">
            <div class="p-4 bg-white rounded-2xl shadow-2xl mb-4">
              <img :src="generatedQRCode" alt="Generated QR Code" class="w-48 h-48" >
            </div>
            <div
              class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-400/10 border border-green-400/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-green-400"
              >
                <path d="m9 12 2 2 4-4" />
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.35 0 4.48.9 6.08 2.38" />
              </svg>
              <span class="text-sm font-medium text-green-400">QR Code généré avec succès</span>
            </div>
          </div>
        </form>
      </div>

      <div class="relative border-t border-white/10 p-6">
        <div class="flex justify-end gap-4">
          <button
            :disabled="isCreating"
            class="relative h-12 px-6 group overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl text-white/90 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleReset"
          >
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
            />
            <span class="relative font-medium">Annuler</span>
          </button>

          <button
            :disabled="isCreating || !qrCodeData.name || !qrCodeData.content"
            class="relative h-12 px-8 group overflow-hidden bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 hover:from-yellow-500 hover:via-amber-500 hover:to-orange-500 text-black rounded-xl border border-yellow-400/20 shadow-lg hover:shadow-yellow-400/25 transition-all duration-500 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleCreate"
          >
            <div
              class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
            />
            <div class="relative flex items-center justify-center gap-3">
              <span v-if="!isCreating" class="font-semibold">Générer</span>
              <span v-else class="font-semibold">Génération...</span>
              <svg
                v-if="!isCreating"
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="transition-transform group-hover:translate-x-1"
              >
                <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Z" />
                <path
                  d="M13 11h4a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"
                />
                <path d="M9 7V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3" />
              </svg>
              <svg
                v-else
                class="animate-spin"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
