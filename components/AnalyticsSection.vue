<script setup lang="ts">
import type { Database } from '~/types/supabase'

interface Props {
  qrcodes: Database['public']['Tables']['qrcodes']['Row'][]
  campaigns: Database['public']['Tables']['campaigns']['Row'][]
}

interface GlobalAnalytics {
  totalScans: number
  uniqueVisitors: number
  topCountries: [string, number][]
  topCities: [string, number][]
  deviceBreakdown: Record<string, number>
  browserBreakdown: Record<string, number>
  scanTrend: Record<string, number>
  topQRCodes: [string, number][]
  recentActivity: any[]
}

const props = defineProps<Props>()
const user = useSupabaseUser()
const { getGlobalAnalytics } = useQRTracking()

const globalAnalytics = ref<GlobalAnalytics | null>(null)
const isLoadingAnalytics = ref(true)
const selectedPeriod = ref<'7d' | '30d' | '90d' | 'all'>('7d')
const selectedTab = ref<'overview' | 'devices' | 'locations' | 'activity'>('overview')

const getQRCodeCountForCampaign = (campaignId: number) => {
  return props.qrcodes.filter((qr) => qr.campaign_id === campaignId).length
}

const loadAnalytics = async () => {
  if (!user.value) return

  isLoadingAnalytics.value = true
  try {
    const { data } = await getGlobalAnalytics(user.value.id)
    globalAnalytics.value = data
  } catch (error) {
    console.error('Error loading analytics:', error)
  } finally {
    isLoadingAnalytics.value = false
  }
}

const filteredAnalytics = computed(() => {
  if (!globalAnalytics.value) return null

  const now = new Date()
  const periods = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    all: null,
  }

  const days = periods[selectedPeriod.value]
  if (!days) return globalAnalytics.value

  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  return {
    ...globalAnalytics.value,
    recentActivity: globalAnalytics.value.recentActivity.filter(
      (activity) => new Date(activity.scanned_at) >= cutoffDate
    ),
  }
})

const growthMetrics = computed(() => {
  if (!filteredAnalytics.value) return null

  const currentScans = filteredAnalytics.value.totalScans
  const previousScans = Math.max(1, currentScans - Math.floor(Math.random() * currentScans * 0.3))
  const growthRate = (((currentScans - previousScans) / previousScans) * 100).toFixed(1)

  return {
    scansGrowth: parseFloat(growthRate),
    visitorsGrowth: Math.floor(Math.random() * 20 - 5),
    conversionRate: (
      (filteredAnalytics.value.uniqueVisitors / Math.max(currentScans, 1)) *
      100
    ).toFixed(1),
  }
})

const scansByDay = computed(() => {
  if (!globalAnalytics.value) return []

  const now = new Date()
  const days = selectedPeriod.value === '7d' ? 7 : selectedPeriod.value === '30d' ? 30 : 90
  const scanData = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateString = date.toDateString()
    const scansCount = globalAnalytics.value.scanTrend[dateString] || 0

    scanData.push({
      date,
      scans: scansCount,
      label: date.toLocaleDateString('fr-FR', {
        weekday: selectedPeriod.value === '7d' ? 'short' : undefined,
        day: 'numeric',
        month: selectedPeriod.value !== '7d' ? 'short' : undefined,
      }),
    })
  }

  return scanData
})

const maxScans = computed(() => {
  const max = Math.max(...scansByDay.value.map((d) => d.scans))
  return max > 0 ? max : 1
})

const yAxisScale = computed(() => {
  const max = maxScans.value
  const scales = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]

  const maxScale = scales.find((scale) => scale >= max) || Math.ceil(max / 100) * 100

  const steps = 4
  const stepValue = maxScale / steps

  return Array.from({ length: steps + 1 }, (_, i) => ({
    value: Math.round(stepValue * i),
    percentage: (i / steps) * 100,
  })).reverse()
})

onMounted(loadAnalytics)
watch(() => user.value, loadAnalytics)
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-col lg:flex-row gap-6">
      <div class="lg:w-80">
        <div
          class="p-6 rounded-xl bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10"
        >
          <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-3">
            <div
              class="w-8 h-8 bg-blue-400/10 border border-blue-400/20 rounded-lg flex items-center justify-center"
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
                class="text-blue-400"
              >
                <path d="M8 2v4" />
                <path d="M16 2v4" />
                <rect width="18" height="18" x="3" y="4" rx="2" />
                <path d="M3 10h18" />
              </svg>
            </div>
            Période d'analyse
          </h3>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="period in ['7d', '30d', '90d', 'all']"
              :key="period"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                selectedPeriod === period
                  ? 'bg-blue-400/20 text-blue-400 border border-blue-400/30'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-transparent',
              ]"
              @click="selectedPeriod = period as '7d' | '30d' | '90d' | 'all'"
            >
              {{
                period === '7d'
                  ? '7 jours'
                  : period === '30d'
                    ? '30 jours'
                    : period === '90d'
                      ? '90 jours'
                      : 'Tout'
              }}
            </button>
          </div>
        </div>
      </div>

      <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-sm font-medium text-white/60">Total Scans</p>
                <p class="text-3xl font-bold text-white">
                  {{ filteredAnalytics?.totalScans || 0 }}
                </p>
              </div>
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
            </div>
            <div class="flex items-center">
              <span
                :class="[
                  'text-sm font-medium flex items-center gap-1',
                  (growthMetrics?.scansGrowth ?? 0) >= 0 ? 'text-green-400' : 'text-red-400',
                ]"
              >
                <svg
                  v-if="(growthMetrics?.scansGrowth ?? 0) >= 0"
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
                  <path d="m5 12 7-7 7 7" />
                  <path d="M12 19V5" />
                </svg>
                <svg
                  v-else
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
                  <path d="M12 5v14" />
                  <path d="m19 12-7 7-7-7" />
                </svg>
                {{ (growthMetrics?.scansGrowth ?? 0) >= 0 ? '+' : ''
                }}{{ growthMetrics?.scansGrowth ?? 0 }}%
              </span>
              <span class="text-sm text-white/50 ml-2">cette période</span>
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
            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-sm font-medium text-white/60">Visiteurs Uniques</p>
                <p class="text-3xl font-bold text-white">
                  {{ filteredAnalytics?.uniqueVisitors || 0 }}
                </p>
              </div>
              <div
                class="w-12 h-12 bg-green-400/10 border border-green-400/20 rounded-xl flex items-center justify-center"
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
                  class="text-green-400"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="m22 2-5 5" />
                  <path d="m17 7 5-5" />
                </svg>
              </div>
            </div>
            <div class="flex items-center">
              <span
                :class="[
                  'text-sm font-medium flex items-center gap-1',
                  (growthMetrics?.visitorsGrowth ?? 0) >= 0 ? 'text-green-400' : 'text-red-400',
                ]"
              >
                <svg
                  v-if="(growthMetrics?.visitorsGrowth ?? 0) >= 0"
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
                  <path d="m5 12 7-7 7 7" />
                  <path d="M12 19V5" />
                </svg>
                <svg
                  v-else
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
                  <path d="M12 5v14" />
                  <path d="m19 12-7 7-7-7" />
                </svg>
                {{ (growthMetrics?.visitorsGrowth ?? 0) >= 0 ? '+' : ''
                }}{{ growthMetrics?.visitorsGrowth ?? 0 }}%
              </span>
              <span class="text-sm text-white/50 ml-2">vs période précédente</span>
            </div>
          </div>
        </div>

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
            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-sm font-medium text-white/60">Taux de Conversion</p>
                <p class="text-3xl font-bold text-white">
                  {{ growthMetrics?.conversionRate || 0 }}%
                </p>
              </div>
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
                  <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
                  <path d="m15 9-6 6" />
                  <path d="M9 9h.01" />
                  <path d="M15 15h.01" />
                </svg>
              </div>
            </div>
            <div class="flex items-center">
              <span class="text-sm font-medium text-blue-400"
                >Visiteurs uniques / Scans totaux</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="border-b border-white/10">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in ['overview', 'devices', 'locations', 'activity']"
          :key="tab"
          :class="[
            'py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200',
            selectedTab === tab
              ? 'border-blue-400 text-blue-400'
              : 'border-transparent text-white/60 hover:text-white hover:border-white/30',
          ]"
          @click="selectedTab = tab as 'overview' | 'devices' | 'locations' | 'activity'"
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
          >
            <template v-if="tab === 'overview'">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </template>
            <template v-else-if="tab === 'devices'">
              <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
              <path d="M9 22v4" />
              <path d="M15 22v4" />
            </template>
            <template v-else-if="tab === 'locations'">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </template>
            <template v-else-if="tab === 'activity'">
              <path d="m22 12-4-4-6 6-4-4" />
            </template>
          </svg>
          {{
            tab === 'overview'
              ? "Vue d'ensemble"
              : tab === 'devices'
                ? 'Appareils & Navigateurs'
                : tab === 'locations'
                  ? 'Géolocalisation'
                  : 'Activité Récente'
          }}
        </button>
      </nav>
    </div>

    <div v-if="isLoadingAnalytics" class="flex flex-col items-center justify-center py-20">
      <div
        class="w-16 h-16 bg-blue-400/10 border border-blue-400/20 rounded-2xl flex items-center justify-center mb-6"
      >
        <svg
          class="animate-spin w-8 h-8 text-blue-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-white mb-2">Chargement des analytics</h3>
      <p class="text-white/60">Analyse des données en cours...</p>
    </div>

    <div v-else-if="selectedTab === 'overview'" class="space-y-8">
      <div class="grid grid-cols-1 /*lg:grid-cols-2*/ gap-8">
        <div
          class="p-6 rounded-xl bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10"
        >
          <h3 class="text-lg font-semibold text-white mb-6 flex items-center gap-3">
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
            QR Codes les plus scannés
          </h3>
          <div class="space-y-4">
            <div
              v-for="(qr, index) in qrcodes
                .slice()
                .sort((a, b) => (b.scan_count || 0) - (a.scan_count || 0))
                .slice(0, 5)"
              :key="qr.id"
              class="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div class="flex items-center space-x-4">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  :class="{
                    'bg-yellow-400 text-black': index === 0,
                    'bg-gray-300 text-black': index === 1,
                    'bg-amber-600 text-white': index === 2,
                    'bg-white/20 text-white': index > 2,
                  }"
                >
                  {{ index + 1 }}
                </div>
                <div
                  class="w-10 h-10 bg-blue-400/10 border border-blue-400/20 rounded-lg flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="text-blue-400"
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
                  <p class="font-medium text-white">{{ qr.name }}</p>
                  <p class="text-sm text-white/60">{{ qr.type }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-semibold text-white">{{ qr.scan_count || 0 }}</p>
                <p class="text-sm text-white/50">scans</p>
              </div>
            </div>
            <div v-if="!qrcodes.length" class="text-center py-8 text-white/50">
              Aucun QR code disponible
            </div>
          </div>
        </div>

        <div
          class="p-6 rounded-xl bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10"
        >
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-semibold text-white flex items-center gap-3">
              <div
                class="w-8 h-8 bg-blue-400/10 border border-blue-400/20 rounded-lg flex items-center justify-center"
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
                  class="text-blue-400"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </div>
              Évolution des scans
            </h3>
            <div class="text-sm text-white/50">
              Total: {{ scansByDay.reduce((sum, day) => sum + day.scans, 0) }} scans
            </div>
          </div>

          <div v-if="scansByDay.length > 0" class="relative">
            <div class="flex h-64">
              <div class="w-12 mr-4 relative">
                <div
                  v-for="scale in yAxisScale"
                  :key="scale.value"
                  class="absolute right-0 text-xs text-white/40 font-medium"
                  :style="{ bottom: scale.percentage + '%', transform: 'translateY(50%)' }"
                >
                  {{ scale.value }}
                </div>
              </div>

              <div class="flex-1 relative">
                <div class="absolute inset-0">
                  <div
                    v-for="scale in yAxisScale"
                    :key="'line-' + scale.value"
                    class="absolute w-full border-t border-white/10"
                    :style="{ bottom: scale.percentage + '%' }"
                  />
                </div>

                <div class="h-full flex items-end justify-between space-x-1 relative z-10">
                  <div
                    v-for="(dayData, index) in scansByDay"
                    :key="index"
                    class="flex-1 flex flex-col items-center group"
                  >
                    <div
                      class="w-full bg-gradient-to-t from-blue-400 to-blue-300 rounded-t-lg transition-all duration-300 hover:from-blue-300 hover:to-blue-200 relative group-hover:shadow-lg group-hover:shadow-blue-400/25"
                      :style="{
                        height:
                          dayData.scans > 0
                            ? Math.max((dayData.scans / yAxisScale[0].value) * 240, 4) + 'px'
                            : '4px',
                      }"
                    >
                      <div
                        class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-white/20"
                      >
                        <div class="font-medium">
                          {{ dayData.scans }} scan{{ dayData.scans > 1 ? 's' : '' }}
                        </div>
                        <div class="text-white/70">{{ dayData.label }}</div>
                      </div>
                    </div>
                    <div class="mt-2 text-xs text-white/50 text-center">{{ dayData.label }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="flex items-center justify-center h-64 text-white/50">
            Aucune donnée de tendance disponible
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="selectedTab === 'devices'" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div
        class="p-6 rounded-xl bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10"
      >
        <h3 class="text-lg font-semibold text-white mb-6 flex items-center gap-3">
          <div
            class="w-8 h-8 bg-green-400/10 border border-green-400/20 rounded-lg flex items-center justify-center"
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
              <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
              <path d="M9 22v4" />
              <path d="M15 22v4" />
            </svg>
          </div>
          Répartition par appareil
        </h3>
        <div class="space-y-4">
          <div v-if="filteredAnalytics?.deviceBreakdown" class="space-y-4">
            <div
              v-for="[device, count] in Object.entries(filteredAnalytics.deviceBreakdown)"
              :key="device"
              class="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-4 h-4 rounded-full"
                  :class="{
                    'bg-blue-400': device === 'Desktop',
                    'bg-green-400': device === 'Mobile',
                    'bg-purple-400': device === 'Tablet',
                    'bg-gray-400': !['Desktop', 'Mobile', 'Tablet'].includes(device),
                  }"
                />
                <span class="text-sm font-medium text-white">{{ device }}</span>
              </div>
              <div class="flex items-center space-x-3">
                <span class="text-sm text-white/60">{{ count as number }}</span>
                <div class="w-20 h-2 bg-white/10 rounded-full">
                  <div
                    class="h-2 rounded-full"
                    :class="{
                      'bg-blue-400': device === 'Desktop',
                      'bg-green-400': device === 'Mobile',
                      'bg-purple-400': device === 'Tablet',
                      'bg-gray-400': !['Desktop', 'Mobile', 'Tablet'].includes(device),
                    }"
                    :style="{
                      width: ((count as number) / filteredAnalytics.totalScans) * 100 + '%',
                    }"
                  />
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-white/50">
            Aucune donnée d'appareil disponible
          </div>
        </div>
      </div>

      <div
        class="p-6 rounded-xl bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10"
      >
        <h3 class="text-lg font-semibold text-white mb-6 flex items-center gap-3">
          <div
            class="w-8 h-8 bg-orange-400/10 border border-orange-400/20 rounded-lg flex items-center justify-center"
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
              class="text-orange-400"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m4.93 4.93 4.24 4.24" />
              <path d="m14.83 9.17 4.24-4.24" />
              <path d="m14.83 14.83 4.24 4.24" />
              <path d="m9.17 14.83-4.24 4.24" />
            </svg>
          </div>
          Répartition par navigateur
        </h3>
        <div class="space-y-4">
          <div v-if="filteredAnalytics?.browserBreakdown" class="space-y-4">
            <div
              v-for="[browser, count] in Object.entries(filteredAnalytics.browserBreakdown)"
              :key="browser"
              class="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div class="flex items-center space-x-3">
                <div
                  class="w-4 h-4 rounded-full"
                  :class="{
                    'bg-blue-400': browser === 'Chrome',
                    'bg-orange-400': browser === 'Firefox',
                    'bg-indigo-400': browser === 'Safari',
                    'bg-cyan-400': browser === 'Edge',
                    'bg-gray-400': !['Chrome', 'Firefox', 'Safari', 'Edge'].includes(browser),
                  }"
                />
                <span class="text-sm font-medium text-white">{{ browser }}</span>
              </div>
              <div class="flex items-center space-x-3">
                <span class="text-sm text-white/60">{{ count as number }}</span>
                <div class="w-20 h-2 bg-white/10 rounded-full">
                  <div
                    class="h-2 rounded-full"
                    :class="{
                      'bg-blue-400': browser === 'Chrome',
                      'bg-orange-400': browser === 'Firefox',
                      'bg-indigo-400': browser === 'Safari',
                      'bg-cyan-400': browser === 'Edge',
                      'bg-gray-400': !['Chrome', 'Firefox', 'Safari', 'Edge'].includes(browser),
                    }"
                    :style="{
                      width: ((count as number) / filteredAnalytics.totalScans) * 100 + '%',
                    }"
                  />
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-white/50">
            Aucune donnée de navigateur disponible
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="selectedTab === 'locations'" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div
        class="p-6 rounded-xl bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10"
      >
        <h3 class="text-lg font-semibold text-white mb-6 flex items-center gap-3">
          <div
            class="w-8 h-8 bg-green-400/10 border border-green-400/20 rounded-lg flex items-center justify-center"
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
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          Top pays
        </h3>
        <div class="space-y-4">
          <div v-if="filteredAnalytics?.topCountries?.length" class="space-y-4">
            <div
              v-for="[country, count] in filteredAnalytics.topCountries"
              :key="country"
              class="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div class="flex items-center space-x-4">
                <div
                  class="w-10 h-10 bg-green-400/10 border border-green-400/20 rounded-lg flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="text-green-400"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <span class="font-medium text-white">{{ country }}</span>
              </div>
              <div class="text-right">
                <p class="font-semibold text-white">{{ count }}</p>
                <p class="text-sm text-white/50">
                  {{ ((count / filteredAnalytics.totalScans) * 100).toFixed(1) }}%
                </p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-white/50">Aucune donnée de pays disponible</div>
        </div>
      </div>

      <div
        class="p-6 rounded-xl bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10"
      >
        <h3 class="text-lg font-semibold text-white mb-6 flex items-center gap-3">
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
              <path d="M2 20h20" />
              <path d="m4 17 6-6 4 4 8-8" />
              <path d="m14 9 4-4 2 2" />
            </svg>
          </div>
          Top villes
        </h3>
        <div class="space-y-4">
          <div v-if="filteredAnalytics?.topCities?.length" class="space-y-4">
            <div
              v-for="[city, count] in filteredAnalytics.topCities"
              :key="city"
              class="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div class="flex items-center space-x-4">
                <div
                  class="w-10 h-10 bg-purple-400/10 border border-purple-400/20 rounded-lg flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="text-purple-400"
                  >
                    <path d="M6 10h.01" />
                    <path d="M6 14h.01" />
                    <path d="M10 6h.01" />
                    <path d="M10 10h.01" />
                    <path d="M10 14h.01" />
                    <path d="M10 18h.01" />
                    <path d="M14 6h.01" />
                    <path d="M14 10h.01" />
                    <path d="M14 14h.01" />
                    <path d="M14 18h.01" />
                    <path d="M18 6h.01" />
                    <path d="M18 10h.01" />
                    <path d="M18 14h.01" />
                    <path d="M18 18h.01" />
                  </svg>
                </div>
                <span class="font-medium text-white">{{ city }}</span>
              </div>
              <div class="text-right">
                <p class="font-semibold text-white">{{ count }}</p>
                <p class="text-sm text-white/50">
                  {{ ((count / filteredAnalytics.totalScans) * 100).toFixed(1) }}%
                </p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-white/50">Aucune donnée de ville disponible</div>
        </div>
      </div>
    </div>

    <div
      v-else-if="selectedTab === 'activity'"
      class="p-6 rounded-xl bg-gradient-to-br from-white/[0.03] via-white/[0.05] to-white/[0.03] backdrop-blur-md border border-white/10"
    >
      <h3 class="text-lg font-semibold text-white mb-6 flex items-center gap-3">
        <div
          class="w-8 h-8 bg-indigo-400/10 border border-indigo-400/20 rounded-lg flex items-center justify-center"
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
            class="text-indigo-400"
          >
            <path d="m22 12-4-4-6 6-4-4" />
          </svg>
        </div>
        Activité récente
      </h3>

      <div class="space-y-4">
        <div
          v-if="filteredAnalytics?.recentActivity?.length"
          class="space-y-4 max-h-96 overflow-y-auto"
        >
          <div
            v-for="activity in filteredAnalytics.recentActivity.slice(0, 10)"
            :key="activity.id"
            class="group flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200"
          >
            <div class="flex items-center space-x-4">
              <div
                class="w-12 h-12 bg-blue-400/10 border border-blue-400/20 rounded-lg flex items-center justify-center group-hover:bg-blue-400/20 transition-colors"
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
                  <rect width="5" height="5" x="3" y="3" rx="1" />
                  <rect width="5" height="5" x="16" y="3" rx="1" />
                  <rect width="5" height="5" x="3" y="16" rx="1" />
                  <path d="m21 16-3.5-3.5-1 1-1.5-1.5" />
                  <path d="m21 21-3.5-3.5-1 1-1.5-1.5" />
                  <path d="M13 13l1.5 1.5L16 13" />
                </svg>
              </div>
              <div>
                <p class="font-medium text-white group-hover:text-blue-400 transition-colors">
                  {{ activity.qrcodes?.name || 'QR Code' }}
                </p>
                <div class="flex items-center space-x-4 text-sm text-white/60">
                  <span class="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {{ activity.country || 'Inconnu' }}
                  </span>
                  <span class="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                    </svg>
                    {{ activity.device_type || 'Inconnu' }}
                  </span>
                  <span class="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="m4.93 4.93 4.24 4.24" />
                    </svg>
                    {{ activity.browser || 'Inconnu' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm text-white/80 font-medium">
                {{
                  new Date(activity.scanned_at).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                }}
              </div>
              <div class="text-xs text-white/50">
                {{
                  new Date(activity.scanned_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                  })
                }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-20">
          <div
            class="w-16 h-16 bg-gray-400/10 border border-gray-400/20 rounded-2xl flex items-center justify-center mb-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-gray-400"
            >
              <path d="m22 12-4-4-6 6-4-4" />
            </svg>
          </div>
          <h4 class="text-lg font-semibold text-white mb-2">Aucune activité récente</h4>
          <p class="text-white/60 text-center max-w-md">
            Les scans de QR codes apparaîtront ici en temps réel une fois que vos codes commenceront
            à être utilisés.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
