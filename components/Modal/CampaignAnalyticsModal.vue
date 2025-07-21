<script setup lang="ts">
import type { Database } from '~/types/supabase'

interface Props {
  isOpen: boolean
  selectedCampaign: Database['public']['Tables']['campaigns']['Row'] | null
  qrcodes: Database['public']['Tables']['qrcodes']['Row'][]
}

interface Emits {
  (e: 'update:isOpen', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const modalOpen = computed({
  get: () => props.isOpen,
  set: (value: boolean) => emit('update:isOpen', value),
})

const campaignQRCodes = computed(() => {
  if (!props.selectedCampaign) return []
  return props.qrcodes.filter((qr) => qr.campaign_id === props.selectedCampaign?.id)
})

const campaignAnalytics = computed(() => {
  if (!props.selectedCampaign) return null

  const qrCodes = campaignQRCodes.value
  const totalScans = qrCodes.reduce((sum, qr) => sum + (qr.scan_count || 0), 0)

  return {
    totalQRCodes: qrCodes.length,
    totalScans,
    averageScansPerQR: qrCodes.length > 0 ? Math.round(totalScans / qrCodes.length) : 0,
    topQRCodes: qrCodes
      .slice()
      .sort((a, b) => (b.scan_count || 0) - (a.scan_count || 0))
      .slice(0, 5),
    qrCodesByType: {
      dynamique: qrCodes.filter((qr) => qr.type === 'dynamique').length,
      statique: qrCodes.filter((qr) => qr.type === 'statique').length,
    },
  }
})

const campaignStatus = computed(() => {
  if (!props.selectedCampaign) return { text: '', color: '' }

  const status = props.selectedCampaign.status
  switch (status) {
    case 'active':
      return { text: 'Active', color: 'text-green-600 bg-green-100' }
    case 'paused':
      return { text: 'En pause', color: 'text-yellow-600 bg-yellow-100' }
    case 'archived':
      return { text: 'Archivée', color: 'text-gray-600 bg-gray-100' }
    default:
      return { text: status, color: 'text-gray-600 bg-gray-100' }
  }
})

const campaignDuration = computed(() => {
  if (!props.selectedCampaign?.start_date || !props.selectedCampaign?.end_date) return null

  const start = new Date(props.selectedCampaign.start_date)
  const end = new Date(props.selectedCampaign.end_date)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
})
</script>

<template>
  <div v-if="modalOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
    <div
      class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      @click="modalOpen = false"
    />

    <div
      class="relative w-full max-w-6xl max-h-[90vh] rounded-2xl overflow-hidden bg-black border border-white/20 shadow-2xl"
    >
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-4 -right-4 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl" />
        <div class="absolute -bottom-4 -left-4 w-24 h-24 bg-blue-400/5 rounded-full blur-2xl" />
      </div>

      <div class="relative border-b border-white/10 p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-blue-400/10 border border-blue-400/20 rounded-xl flex items-center justify-center"
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
                class="text-blue-400"
              >
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-white tracking-tight">Analytics de la campagne</h2>
              <p class="text-white/60 text-sm">{{ selectedCampaign?.name }}</p>
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

      <div
        v-if="selectedCampaign && campaignAnalytics"
        class="relative p-6 overflow-y-auto max-h-[calc(90vh-220px)]"
      >
        <div class="space-y-8">
          <div
            class="p-6 rounded-xl bg-gradient-to-r from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10"
          >
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p class="text-sm text-white/60 mb-1">Statut</p>
                <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  :class="campaignStatus.color"
                >
                  {{ campaignStatus.text }}
                </span>
              </div>
              <div v-if="selectedCampaign.start_date">
                <p class="text-sm text-white/60 mb-1">Date de début</p>
                <p class="font-semibold text-white">
                  {{ new Date(selectedCampaign.start_date).toLocaleDateString('fr-FR') }}
                </p>
              </div>
              <div v-if="selectedCampaign.end_date">
                <p class="text-sm text-white/60 mb-1">Date de fin</p>
                <p class="font-semibold text-white">
                  {{ new Date(selectedCampaign.end_date).toLocaleDateString('fr-FR') }}
                </p>
              </div>
            </div>

            <div v-if="campaignDuration" class="mt-6 pt-6 border-t border-white/10">
              <p class="text-sm text-white/60 mb-1">Durée de la campagne</p>
              <p class="font-semibold text-white">{{ campaignDuration }} jours</p>
            </div>

            <div v-if="selectedCampaign.description" class="mt-6 pt-6 border-t border-white/10">
              <p class="text-sm text-white/60 mb-2">Description</p>
              <p class="text-white/80">{{ selectedCampaign.description }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              class="group relative p-6 rounded-xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div
                class="absolute inset-0 bg-gradient-to-br opacity-20 from-yellow-500/10 via-amber-500/10 to-orange-500/10"
              />
              <div
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
              />
              <div class="relative">
                <div class="flex items-center space-x-3 mb-4">
                  <div
                    class="w-12 h-12 bg-yellow-400/10 border border-yellow-400/20 rounded-xl flex items-center justify-center"
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
                    <p class="text-sm text-white/60">QR Codes</p>
                    <p class="text-3xl font-bold text-white">
                      {{ campaignAnalytics.totalQRCodes }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="group relative p-6 rounded-xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div
                class="absolute inset-0 bg-gradient-to-br opacity-20 from-green-500/10 via-emerald-500/10 to-teal-500/10"
              />
              <div
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
              />
              <div class="relative">
                <div class="flex items-center space-x-3 mb-4">
                  <div
                    class="w-12 h-12 bg-green-400/10 border border-green-400/20 rounded-xl flex items-center justify-center"
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
                      <path d="M3 3v18h18" />
                      <path d="m19 9-5 5-4-4-3 3" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-white/60">Total Scans</p>
                    <p class="text-3xl font-bold text-white">{{ campaignAnalytics.totalScans }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="group relative p-6 rounded-xl overflow-hidden bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div
                class="absolute inset-0 bg-gradient-to-br opacity-20 from-blue-500/10 via-indigo-500/10 to-purple-500/10"
              />
              <div
                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000"
              />
              <div class="relative">
                <div class="flex items-center space-x-3 mb-4">
                  <div
                    class="w-12 h-12 bg-blue-400/10 border border-blue-400/20 rounded-xl flex items-center justify-center"
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
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="m22 2-5 5" />
                      <path d="m17 7 5-5" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-white/60">Moyenne/QR Code</p>
                    <p class="text-3xl font-bold text-white">
                      {{ campaignAnalytics.averageScansPerQR }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              class="p-6 rounded-xl bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10"
            >
              <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                <div
                  class="w-8 h-8 bg-purple-400/10 border border-purple-400/20 rounded-lg flex items-center justify-center"
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
                    class="text-purple-400"
                  >
                    <path
                      d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                    />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                </div>
                Répartition par type
              </h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 bg-blue-400 rounded-full" />
                    <span class="text-white/80">Dynamique</span>
                  </div>
                  <span class="text-white font-semibold">{{
                    campaignAnalytics.qrCodesByType.dynamique
                  }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 bg-gray-400 rounded-full" />
                    <span class="text-white/80">Statique</span>
                  </div>
                  <span class="text-white font-semibold">{{
                    campaignAnalytics.qrCodesByType.statique
                  }}</span>
                </div>
              </div>
            </div>

            <div
              class="p-6 rounded-xl bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10"
            >
              <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                <div
                  class="w-8 h-8 bg-yellow-400/10 border border-yellow-400/20 rounded-lg flex items-center justify-center"
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
                    class="text-yellow-400"
                  >
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    />
                  </svg>
                </div>
                Top QR Codes
              </h3>
              <div class="space-y-3">
                <div
                  v-for="(qr, index) in campaignAnalytics.topQRCodes"
                  :key="qr.id"
                  class="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      :class="{
                        'bg-yellow-400 text-black': index === 0,
                        'bg-gray-300 text-black': index === 1,
                        'bg-amber-600 text-white': index === 2,
                        'bg-white/20 text-white': index > 2,
                      }"
                    >
                      {{ index + 1 }}
                    </div>
                    <div>
                      <p class="text-white/90 text-sm font-medium truncate max-w-[120px]">
                        {{ qr.name }}
                      </p>
                      <p class="text-white/50 text-xs">{{ qr.type }}</p>
                    </div>
                  </div>
                  <span class="text-white font-semibold">{{ qr.scan_count || 0 }}</span>
                </div>
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
            <span class="relative font-medium">Fermer</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
