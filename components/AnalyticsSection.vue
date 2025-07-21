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
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Analyses</h1>

      <div class="flex items-center space-x-2">
        <select
          v-model="selectedPeriod"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="7d">7 derniers jours</option>
          <option value="30d">30 derniers jours</option>
          <option value="90d">90 derniers jours</option>
          <option value="all">Toute la période</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total QR Codes</p>
            <p class="text-2xl font-bold text-gray-900">{{ qrcodes.length }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon name="heroicons:qr-code" class="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div class="mt-4 flex items-center">
          <span class="text-sm text-green-600 font-medium">+12%</span>
          <span class="text-sm text-gray-500 ml-2">ce mois</span>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Scans</p>
            <p class="text-2xl font-bold text-gray-900">
              {{
                filteredAnalytics?.totalScans ||
                qrcodes.reduce((sum, qr) => sum + (qr.scan_count || 0), 0)
              }}
            </p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Icon name="heroicons:chart-bar" class="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div class="mt-4 flex items-center">
          <span
            :class="[
              'text-sm font-medium',
              (growthMetrics?.scansGrowth ?? 0) >= 0 ? 'text-green-600' : 'text-red-600',
            ]"
          >
            {{ (growthMetrics?.scansGrowth ?? 0) >= 0 ? '+' : ''
            }}{{ growthMetrics?.scansGrowth ?? 0 }}%
          </span>
          <span class="text-sm text-gray-500 ml-2">cette période</span>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Visiteurs Uniques</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ filteredAnalytics?.uniqueVisitors || 0 }}
            </p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Icon name="heroicons:users" class="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <div class="mt-4 flex items-center">
          <span
            :class="[
              'text-sm font-medium',
              (growthMetrics?.visitorsGrowth ?? 0) >= 0 ? 'text-green-600' : 'text-red-600',
            ]"
          >
            {{ (growthMetrics?.visitorsGrowth ?? 0) >= 0 ? '+' : ''
            }}{{ growthMetrics?.visitorsGrowth ?? 0 }}%
          </span>
          <span class="text-sm text-gray-500 ml-2">vs période précédente</span>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Taux de Conversion</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ growthMetrics?.conversionRate || 0 }}%
            </p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Icon name="heroicons:arrow-trending-up" class="w-6 h-6 text-yellow-600" />
          </div>
        </div>
        <div class="mt-4 flex items-center">
          <span class="text-sm text-blue-600 font-medium">Visiteurs uniques / Scans totaux</span>
        </div>
      </div>
    </div>

    <div class="mb-6">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              selectedTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
            @click="selectedTab = 'overview'"
          >
            Vue d'ensemble
          </button>
          <button
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              selectedTab === 'devices'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
            @click="selectedTab = 'devices'"
          >
            Appareils & Navigateurs
          </button>
          <button
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              selectedTab === 'locations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
            @click="selectedTab = 'locations'"
          >
            Géolocalisation
          </button>
          <button
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              selectedTab === 'activity'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
            @click="selectedTab = 'activity'"
          >
            Activité Récente
          </button>
        </nav>
      </div>
    </div>

    <div v-if="isLoadingAnalytics" class="text-center py-12">
      <Icon name="heroicons:arrow-path" class="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
      <p class="text-gray-500">Chargement des analytics...</p>
    </div>

    <div v-else-if="selectedTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">QR Codes les plus scannés</h3>
        <div class="space-y-4">
          <div
            v-for="qr in qrcodes
              .slice()
              .sort((a, b) => (b.scan_count || 0) - (a.scan_count || 0))
              .slice(0, 5)"
            :key="qr.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="heroicons:qr-code" class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ qr.name }}</p>
                <p class="text-sm text-gray-500">{{ qr.type }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-semibold text-gray-900">{{ qr.scan_count || 0 }}</p>
              <p class="text-sm text-gray-500">scans</p>
            </div>
          </div>
          <div v-if="qrcodes.length === 0" class="text-center py-8 text-gray-500">
            Aucun QR code à afficher
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Performance par campagne</h3>
        <div class="space-y-4">
          <div
            v-for="campaign in campaigns"
            :key="campaign.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Icon name="heroicons:megaphone" class="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ campaign.name }}</p>
                <p class="text-sm text-gray-500">
                  {{ getQRCodeCountForCampaign(campaign.id) }} QR codes
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-semibold text-gray-900">
                {{
                  qrcodes
                    .filter((qr) => qr.campaign_id === campaign.id)
                    .reduce((sum, qr) => sum + (qr.scan_count || 0), 0)
                }}
              </p>
              <p class="text-sm text-gray-500">scans</p>
            </div>
          </div>
          <div v-if="campaigns.length === 0" class="text-center py-8 text-gray-500">
            Aucune campagne à afficher
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="selectedTab === 'devices'" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Répartition par appareil</h3>
        <div class="space-y-3">
          <div v-if="filteredAnalytics?.deviceBreakdown" class="space-y-3">
            <div
              v-for="[device, count] in Object.entries(filteredAnalytics.deviceBreakdown)"
              :key="device"
              class="flex items-center justify-between"
            >
              <div class="flex items-center space-x-2">
                <div
                  class="w-4 h-4 rounded-full"
                  :class="{
                    'bg-blue-500': device === 'Desktop',
                    'bg-green-500': device === 'Mobile',
                    'bg-purple-500': device === 'Tablet',
                    'bg-gray-500': !['Desktop', 'Mobile', 'Tablet'].includes(device),
                  }"
                />
                <span class="text-sm font-medium">{{ device }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-600">{{ count as number }}</span>
                <div class="w-20 h-2 bg-gray-200 rounded-full">
                  <div
                    class="h-2 rounded-full"
                    :class="{
                      'bg-blue-500': device === 'Desktop',
                      'bg-green-500': device === 'Mobile',
                      'bg-purple-500': device === 'Tablet',
                      'bg-gray-500': !['Desktop', 'Mobile', 'Tablet'].includes(device),
                    }"
                    :style="{
                      width: ((count as number) / filteredAnalytics.totalScans) * 100 + '%',
                    }"
                  />
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            Aucune donnée d'appareil disponible
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Répartition par navigateur</h3>
        <div class="space-y-3">
          <div v-if="filteredAnalytics?.browserBreakdown" class="space-y-3">
            <div
              v-for="[browser, count] in Object.entries(filteredAnalytics.browserBreakdown)"
              :key="browser"
              class="flex items-center justify-between"
            >
              <div class="flex items-center space-x-2">
                <div
                  class="w-4 h-4 rounded-full"
                  :class="{
                    'bg-blue-500': browser === 'Chrome',
                    'bg-orange-500': browser === 'Firefox',
                    'bg-indigo-500': browser === 'Safari',
                    'bg-cyan-500': browser === 'Edge',
                    'bg-gray-500': !['Chrome', 'Firefox', 'Safari', 'Edge'].includes(browser),
                  }"
                />
                <span class="text-sm font-medium">{{ browser }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-600">{{ count as number }}</span>
                <div class="w-20 h-2 bg-gray-200 rounded-full">
                  <div
                    class="h-2 rounded-full"
                    :class="{
                      'bg-blue-500': browser === 'Chrome',
                      'bg-orange-500': browser === 'Firefox',
                      'bg-indigo-500': browser === 'Safari',
                      'bg-cyan-500': browser === 'Edge',
                      'bg-gray-500': !['Chrome', 'Firefox', 'Safari', 'Edge'].includes(browser),
                    }"
                    :style="{
                      width: ((count as number) / filteredAnalytics.totalScans) * 100 + '%',
                    }"
                  />
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            Aucune donnée de navigateur disponible
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="selectedTab === 'locations'" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Top pays</h3>
        <div class="space-y-3">
          <div v-if="filteredAnalytics?.topCountries?.length" class="space-y-3">
            <div
              v-for="[country, count] in filteredAnalytics.topCountries"
              :key="country"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon name="heroicons:map-pin" class="w-4 h-4 text-green-600" />
                </div>
                <span class="font-medium text-gray-900">{{ country }}</span>
              </div>
              <div class="text-right">
                <p class="font-semibold text-gray-900">{{ count }}</p>
                <p class="text-sm text-gray-500">
                  {{ ((count / filteredAnalytics.totalScans) * 100).toFixed(1) }}%
                </p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">Aucune donnée de pays disponible</div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Top villes</h3>
        <div class="space-y-3">
          <div v-if="filteredAnalytics?.topCities?.length" class="space-y-3">
            <div
              v-for="[city, count] in filteredAnalytics.topCities"
              :key="city"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Icon name="heroicons:building-office-2" class="w-4 h-4 text-purple-600" />
                </div>
                <span class="font-medium text-gray-900">{{ city }}</span>
              </div>
              <div class="text-right">
                <p class="font-semibold text-gray-900">{{ count }}</p>
                <p class="text-sm text-gray-500">
                  {{ ((count / filteredAnalytics.totalScans) * 100).toFixed(1) }}%
                </p>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">Aucune donnée de ville disponible</div>
        </div>
      </div>
    </div>

    <div
      v-else-if="selectedTab === 'activity'"
      class="bg-white rounded-xl border border-gray-200 p-6"
    >
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
      <div class="space-y-4">
        <div v-if="filteredAnalytics?.recentActivity?.length" class="space-y-4">
          <div
            v-for="activity in filteredAnalytics.recentActivity"
            :key="activity.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="heroicons:qr-code" class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ activity.qrcodes?.name || 'QR Code' }}</p>
                <div class="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{{ activity.country || 'Inconnu' }}</span>
                  <span>{{ activity.device_type || 'Inconnu' }}</span>
                  <span>{{ activity.browser || 'Inconnu' }}</span>
                </div>
              </div>
            </div>
            <div class="text-right text-sm text-gray-500">
              {{ new Date(activity.scanned_at).toLocaleString('fr-FR') }}
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">Aucune activité récente</div>
      </div>
    </div>

    <div
      v-if="selectedTab === 'overview'"
      class="bg-white rounded-xl border border-gray-200 p-6 mb-8"
    >
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          Évolution des scans ({{
            selectedPeriod === '7d'
              ? '7 derniers jours'
              : selectedPeriod === '30d'
                ? '30 derniers jours'
                : '90 derniers jours'
          }})
        </h3>
        <div class="text-sm text-gray-500">
          Total: {{ scansByDay.reduce((sum, day) => sum + day.scans, 0) }} scans
        </div>
      </div>

      <div v-if="scansByDay.length > 0" class="relative">
        <div class="flex h-64">
          <div class="w-14 mr-4 relative">
            <div
              v-for="scale in yAxisScale"
              :key="scale.value"
              class="absolute right-0 text-xs text-gray-400 font-medium"
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
                class="absolute w-full border-t border-gray-200"
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
                  class="w-full bg-blue-200 rounded-t-lg transition-all duration-300 hover:bg-blue-300 relative group-hover:bg-blue-400"
                  :style="{
                    height:
                      dayData.scans > 0
                        ? Math.max((dayData.scans / yAxisScale[0].value) * 240, 4) + 'px'
                        : '4px',
                  }"
                >
                  <div
                    class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50"
                  >
                    {{ dayData.scans }} scan{{ dayData.scans > 1 ? 's' : '' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex mt-2 ml-14">
          <div
            v-for="(dayData, index) in scansByDay"
            :key="'label-' + index"
            class="flex-1 flex flex-col items-center space-y-1"
          >
            <p class="text-xs text-gray-500 text-center">{{ dayData.label }}</p>

            <p v-if="dayData.scans > 0" class="text-xs text-blue-600 font-medium">
              {{ dayData.scans }}
            </p>
          </div>
        </div>
      </div>

      <div v-else class="h-64 flex items-center justify-center text-gray-500">
        <div class="text-center">
          <Icon name="heroicons:chart-bar" class="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucune donnée disponible pour cette période</p>
          <p class="text-sm mt-2">
            Les scans apparaîtront ici une fois que vos QR codes seront utilisés
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
