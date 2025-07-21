<script setup lang="ts">
import type { Database } from '~/types/supabase'

interface Props {
  isOpen: boolean
  selectedQR: Database['public']['Tables']['qrcodes']['Row'] | null
  qrCodeImage: string | null
}

interface Emits {
  (e: 'update:isOpen', value: boolean): void
  (e: 'copyToClipboard', content: string): void
  (e: 'downloadQRCode'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const modalOpen = computed({
  get: () => props.isOpen,
  set: (value: boolean) => emit('update:isOpen', value),
})

const handleCopyToClipboard = () => {
  if (props.selectedQR?.id) {
    const config = useRuntimeConfig()
    const baseUrl =
      config.public.baseUrl ||
      (import.meta.client ? window.location.origin : 'https://qrmaster-ten.vercel.app')
    const trackingUrl = `${baseUrl}/scan/${props.selectedQR.id}`
    emit('copyToClipboard', trackingUrl)
  }
}

const handleDownload = () => {
  emit('downloadQRCode')
}
</script>

<template>
  <div v-if="modalOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
    <div
      class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      @click="modalOpen = false"
    />

    <div
      class="relative w-full max-w-lg rounded-2xl overflow-hidden bg-black border border-white/20 shadow-2xl"
    >
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          class="absolute -top-4 -right-4 w-32 h-32 bg-indigo-400/10 rounded-full blur-3xl"
        />
        <div
          class="absolute -bottom-4 -left-4 w-24 h-24 bg-indigo-400/5 rounded-full blur-2xl"
        />
      </div>

      <div class="relative border-b border-white/10 p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-indigo-400/10 border border-indigo-400/20 rounded-xl flex items-center justify-center"
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
                class="text-indigo-400"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-white tracking-tight">Partager le QR code</h2>
              <p class="text-white/60 text-sm">{{ selectedQR?.name }}</p>
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

      <div class="relative p-6 space-y-8 overflow-auto max-h-[70vh]">
        <div v-if="selectedQR && qrCodeImage" class="flex flex-col items-center">
          <div class="p-4 bg-white rounded-2xl shadow-2xl mb-4 relative group">
            <img :src="qrCodeImage" alt="QR Code" class="w-48 h-48" >
            <div
              class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
            />
          </div>

          <div class="text-center space-y-2">
            <h3 class="text-lg font-semibold text-white">{{ selectedQR.name }}</h3>
            <div class="flex items-center justify-center gap-4 text-sm text-white/60">
              <span class="inline-flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
                {{ selectedQR.scan_count || 0 }} scans
              </span>
              <span
                class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-blue-400/10 text-blue-400 border border-blue-400/20':
                    selectedQR.type === 'dynamique',
                  'bg-gray-400/10 text-gray-400 border border-gray-400/20':
                    selectedQR.type === 'statique',
                }"
              >
                {{ selectedQR.type }}
              </span>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="text-center">
            <p class="text-white/80 mb-1">Partagez ce QR code via :</p>
            <p class="text-xs text-white/50">Choisissez votre méthode de partage préférée</p>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <button
              class="group relative p-4 rounded-xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300"
              @click="handleCopyToClipboard"
            >
              <div
                class="absolute inset-0 bg-gradient-to-br opacity-20 from-blue-500/10 via-indigo-500/10 to-purple-500/10"
              />
              <div
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
              />
              <div class="relative flex items-center gap-4">
                <div
                  class="w-12 h-12 bg-blue-400/10 border border-blue-400/20 rounded-xl flex items-center justify-center flex-shrink-0"
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
                    class="text-blue-400"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <div class="flex-1 text-left">
                  <h4 class="font-medium text-white group-hover:text-blue-400 transition-colors">
                    Copier le lien
                  </h4>
                  <p class="text-sm text-white/60">Partagez l'URL de tracking directement</p>
                </div>
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
                  class="text-white/40 group-hover:text-blue-400 transition-all group-hover:translate-x-1"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </button>

            <button
              class="group relative p-4 rounded-xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300"
              @click="handleDownload"
            >
              <div
                class="absolute inset-0 bg-gradient-to-br opacity-20 from-green-500/10 via-emerald-500/10 to-teal-500/10"
              />
              <div
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
              />
              <div class="relative flex items-center gap-4">
                <div
                  class="w-12 h-12 bg-green-400/10 border border-green-400/20 rounded-xl flex items-center justify-center flex-shrink-0"
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
                    class="text-green-400"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7,10 12,15 17,10" />
                    <line x1="12" x2="12" y1="15" y2="3" />
                  </svg>
                </div>
                <div class="flex-1 text-left">
                  <h4 class="font-medium text-white group-hover:text-green-400 transition-colors">
                    Télécharger le QR code
                  </h4>
                  <p class="text-sm text-white/60">Sauvegardez l'image en haute qualité</p>
                </div>
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
                  class="text-white/40 group-hover:text-green-400 transition-all group-hover:translate-x-1"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </button>
          </div>

          <div class="pt-4 border-t border-white/10">
            <p class="text-sm text-white/60 mb-4 text-center">Ou partagez via :</p>
            <div class="grid grid-cols-4 gap-3">
              <button
                class="group relative p-3 rounded-xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
                />
                <div class="relative flex flex-col items-center gap-2">
                  <div
                    class="w-8 h-8 bg-red-400/10 border border-red-400/20 rounded-lg flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="text-red-400"
                    >
                      <path
                        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                      />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <span class="text-xs text-white/70 group-hover:text-red-400 transition-colors"
                    >Email</span
                  >
                </div>
              </button>

              <button
                class="group relative p-3 rounded-xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
                />
                <div class="relative flex flex-col items-center gap-2">
                  <div
                    class="w-8 h-8 bg-emerald-400/10 border border-emerald-400/20 rounded-lg flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="text-emerald-400"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <span class="text-xs text-white/70 group-hover:text-emerald-400 transition-colors"
                    >WhatsApp</span
                  >
                </div>
              </button>

              <button
                class="group relative p-3 rounded-xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
                />
                <div class="relative flex flex-col items-center gap-2">
                  <div
                    class="w-8 h-8 bg-blue-600/10 border border-blue-600/20 rounded-lg flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="text-blue-400"
                    >
                      <path
                        d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
                      />
                      <rect width="4" height="12" x="2" y="9" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </div>
                  <span class="text-xs text-white/70 group-hover:text-blue-400 transition-colors"
                    >LinkedIn</span
                  >
                </div>
              </button>

              <button
                class="group relative p-3 rounded-xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
                />
                <div class="relative flex flex-col items-center gap-2">
                  <div
                    class="w-8 h-8 bg-sky-400/10 border border-sky-400/20 rounded-lg flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="text-sky-400"
                    >
                      <path
                        d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"
                      />
                    </svg>
                  </div>
                  <span class="text-xs text-white/70 group-hover:text-sky-400 transition-colors"
                    >Twitter</span
                  >
                </div>
              </button>
            </div>
          </div>

          <div
            class="p-4 rounded-xl bg-gradient-to-r from-indigo-400/5 to-purple-400/5 border border-indigo-400/20"
          >
            <div class="flex items-start gap-3">
              <div
                class="w-6 h-6 bg-indigo-400/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="text-indigo-400"
                >
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <div class="flex-1">
                <h4 class="text-sm font-medium text-indigo-400 mb-1">Conseils d'utilisation</h4>
                <ul class="text-xs text-white/70 space-y-1">
                  <li>• Le lien inclut un système de tracking automatique</li>
                  <li>• Téléchargez en PNG pour une qualité optimale</li>
                  <li>• Testez le QR code avant de le distribuer</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="relative border-t border-white/10 p-6">
        <div class="flex justify-end">
          <button
            class="relative h-12 px-6 group overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl text-white/90 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="modalOpen = false"
          >
            <div
              class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
            />
            <span class="relative font-medium">Annuler</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
