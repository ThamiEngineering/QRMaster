<script setup lang="ts">
import type { Database } from '~/types/supabase';

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
    set: (value: boolean) => emit('update:isOpen', value)
})

const campaignQRCodes = computed(() => {
    if (!props.selectedCampaign) return []
    return props.qrcodes.filter(qr => qr.campaign_id === props.selectedCampaign?.id)
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
            dynamique: qrCodes.filter(qr => qr.type === 'dynamique').length,
            statique: qrCodes.filter(qr => qr.type === 'statique').length
        }
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
    <UModal v-model:open="modalOpen" :ui="{ wrapper: 'z-50' }" class="max-w-4xl">
        <template #header>
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Icon name="heroicons:chart-bar" class="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                    <h2 class="text-xl font-bold text-gray-900">Analytics de la campagne</h2>
                    <p class="text-sm text-gray-500">{{ selectedCampaign?.name }}</p>
                </div>
            </div>
        </template>

        <template #body>
            <div v-if="selectedCampaign && campaignAnalytics" class="space-y-6">
                <div class="bg-gray-50 rounded-lg p-4">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p class="text-sm text-gray-600">Statut</p>
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                :class="campaignStatus.color">
                                {{ campaignStatus.text }}
                            </span>
                        </div>
                        <div v-if="selectedCampaign.start_date">
                            <p class="text-sm text-gray-600">Date de début</p>
                            <p class="font-medium">{{ new Date(selectedCampaign.start_date).toLocaleDateString('fr-FR')
                                }}</p>
                        </div>
                        <div v-if="selectedCampaign.end_date">
                            <p class="text-sm text-gray-600">Date de fin</p>
                            <p class="font-medium">{{ new Date(selectedCampaign.end_date).toLocaleDateString('fr-FR') }}
                            </p>
                        </div>
                    </div>
                    <div v-if="campaignDuration" class="mt-4">
                        <p class="text-sm text-gray-600">Durée de la campagne</p>
                        <p class="font-medium">{{ campaignDuration }} jours</p>
                    </div>
                    <div v-if="selectedCampaign.description" class="mt-4">
                        <p class="text-sm text-gray-600">Description</p>
                        <p class="text-gray-800">{{ selectedCampaign.description }}</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-white border border-gray-200 rounded-lg p-4">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Icon name="heroicons:qr-code" class="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">QR Codes</p>
                                <p class="text-2xl font-bold text-gray-900">{{ campaignAnalytics.totalQRCodes }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white border border-gray-200 rounded-lg p-4">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Icon name="heroicons:chart-bar" class="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Total Scans</p>
                                <p class="text-2xl font-bold text-gray-900">{{ campaignAnalytics.totalScans }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white border border-gray-200 rounded-lg p-4">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Icon name="heroicons:arrow-trending-up" class="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Moyenne/QR</p>
                                <p class="text-2xl font-bold text-gray-900">{{ campaignAnalytics.averageScansPerQR }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">QR Codes les plus scannés</h3>
                        <div class="space-y-3">
                            <div v-if="campaignAnalytics.topQRCodes.length > 0">
                                <div v-for="qr in campaignAnalytics.topQRCodes" :key="qr.id"
                                    class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Icon name="heroicons:qr-code" class="w-4 h-4 text-blue-600" />
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
                            </div>
                            <div v-else class="text-center py-6 text-gray-500">
                                Aucun QR code dans cette campagne
                            </div>
                        </div>
                    </div>

                    <div class="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Répartition par type</h3>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-3">
                                    <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
                                    <span class="text-sm font-medium">QR Codes Dynamiques</span>
                                </div>
                                <div class="text-right">
                                    <p class="font-semibold text-gray-900">{{ campaignAnalytics.qrCodesByType.dynamique
                                        }}</p>
                                    <p class="text-sm text-gray-500">
                                        {{ campaignAnalytics.totalQRCodes > 0 ?
                                            Math.round((campaignAnalytics.qrCodesByType.dynamique /
                                                campaignAnalytics.totalQRCodes) * 100) : 0 }}%
                                    </p>
                                </div>
                            </div>

                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-3">
                                    <div class="w-4 h-4 bg-purple-500 rounded-full"></div>
                                    <span class="text-sm font-medium">QR Codes Statiques</span>
                                </div>
                                <div class="text-right">
                                    <p class="font-semibold text-gray-900">{{ campaignAnalytics.qrCodesByType.statique
                                        }}</p>
                                    <p class="text-sm text-gray-500">
                                        {{ campaignAnalytics.totalQRCodes > 0 ?
                                            Math.round((campaignAnalytics.qrCodesByType.statique /
                                                campaignAnalytics.totalQRCodes) * 100) : 0 }}%
                                    </p>
                                </div>
                            </div>

                            <div class="w-full bg-gray-200 rounded-full h-2 mt-4">
                                <div class="bg-blue-500 h-2 rounded-l-full" :style="{
                                    width: campaignAnalytics.totalQRCodes > 0 ?
                                        (campaignAnalytics.qrCodesByType.dynamique / campaignAnalytics.totalQRCodes) * 100 + '%' :
                                        '0%'
                                }"></div>
                            </div>
                        </div>

                        <div class="mt-6 pt-6 border-t border-gray-200">
                            <h4 class="text-sm font-medium text-gray-900 mb-3">Informations temporelles</h4>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Campagne créée</span>
                                    <span class="font-medium">{{ new
                                        Date(selectedCampaign.created_at).toLocaleDateString('fr-FR') }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Dernière mise à jour</span>
                                    <span class="font-medium">{{ new
                                        Date(selectedCampaign.updated_at).toLocaleDateString('fr-FR') }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="text-center py-8 text-gray-500">
                <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Impossible de charger les analytics de cette campagne</p>
            </div>
        </template>

        <template #footer>
            <div class="flex justify-end">
                <UButton color="neutral" variant="soft" label="Fermer" @click="modalOpen = false" />
            </div>
        </template>
    </UModal>
</template>