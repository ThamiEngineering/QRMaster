<script setup lang="ts">
import type { Database } from '~/types/supabase';

interface Props {
    qrcodes: Database['public']['Tables']['qrcodes']['Row'][]
    campaigns: Database['public']['Tables']['campaigns']['Row'][]
}

const props = defineProps<Props>()

const getQRCodeCountForCampaign = (campaignId: number) => {
    return props.qrcodes.filter(qr => qr.campaign_id === campaignId).length
}
</script>

<template>
    <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Analyses</h1>

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
                        <p class="text-2xl font-bold text-gray-900">{{qrcodes.reduce((sum, qr) => sum + (qr.scan_count
                            || 0), 0)}}</p>
                    </div>
                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Icon name="heroicons:chart-bar" class="w-6 h-6 text-green-600" />
                    </div>
                </div>
                <div class="mt-4 flex items-center">
                    <span class="text-sm text-green-600 font-medium">+8%</span>
                    <span class="text-sm text-gray-500 ml-2">cette semaine</span>
                </div>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-600">Campagnes Actives</p>
                        <p class="text-2xl font-bold text-gray-900">{{campaigns.filter(c => c.status ===
                            'active').length}}</p>
                    </div>
                    <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Icon name="heroicons:megaphone" class="w-6 h-6 text-yellow-600" />
                    </div>
                </div>
                <div class="mt-4 flex items-center">
                    <span class="text-sm text-blue-600 font-medium">{{ campaigns.length }} total</span>
                </div>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-600">Taux de Scan Moyen</p>
                        <p class="text-2xl font-bold text-gray-900">{{qrcodes.length > 0 ?
                            Math.round(qrcodes.reduce((sum, qr) => sum + (qr.scan_count || 0), 0) / qrcodes.length) : 0
                            }}</p>
                    </div>
                    <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Icon name="heroicons:arrow-trending-up" class="w-6 h-6 text-purple-600" />
                    </div>
                </div>
                <div class="mt-4 flex items-center">
                    <span class="text-sm text-green-600 font-medium">+15%</span>
                    <span class="text-sm text-gray-500 ml-2">vs mois dernier</span>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div class="bg-white rounded-xl border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">QR Codes les plus scannés</h3>
                <div class="space-y-4">
                    <div v-for="qr in qrcodes.slice().sort((a, b) => (b.scan_count || 0) - (a.scan_count || 0)).slice(0, 5)"
                        :key="qr.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                    <div v-for="campaign in campaigns" :key="campaign.id"
                        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Icon name="heroicons:megaphone" class="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p class="font-medium text-gray-900">{{ campaign.name }}</p>
                                <p class="text-sm text-gray-500">{{ getQRCodeCountForCampaign(campaign.id) }} QR codes
                                </p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="font-semibold text-gray-900">{{qrcodes.filter(qr => qr.campaign_id ===
                                campaign.id).reduce((sum, qr) => sum + (qr.scan_count || 0), 0)}}</p>
                            <p class="text-sm text-gray-500">scans</p>
                        </div>
                    </div>
                    <div v-if="campaigns.length === 0" class="text-center py-8 text-gray-500">
                        Aucune campagne à afficher
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Évolution des scans (7 derniers jours)</h3>
            <div class="h-64 flex items-end justify-between space-x-2">
                <div v-for="(day, index) in 7" :key="index" class="flex-1 flex flex-col items-center">
                    <div class="w-full bg-blue-200 rounded-t-lg transition-all duration-300 hover:bg-blue-300"
                        :style="{ height: Math.random() * 200 + 20 + 'px' }"></div>
                    <p class="text-xs text-gray-500 mt-2">{{ new Date(Date.now() - (6 - index) * 24 * 60 * 60 *
                        1000).toLocaleDateString('fr-FR', { weekday: 'short' }) }}</p>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="bg-white rounded-xl border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Répartition par type</h3>
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
                            <span class="text-sm font-medium">Dynamique</span>
                        </div>
                        <span class="text-sm text-gray-600">{{qrcodes.filter(qr => qr.type === 'dynamique').length
                            }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <div class="w-4 h-4 bg-purple-500 rounded-full"></div>
                            <span class="text-sm font-medium">Statique</span>
                        </div>
                        <span class="text-sm text-gray-600">{{qrcodes.filter(qr => qr.type === 'statique').length
                            }}</span>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Statut des campagnes</h3>
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <div class="w-4 h-4 bg-green-500 rounded-full"></div>
                            <span class="text-sm font-medium">Actives</span>
                        </div>
                        <span class="text-sm text-gray-600">{{campaigns.filter(c => c.status === 'active').length
                            }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <div class="w-4 h-4 bg-yellow-500 rounded-full"></div>
                            <span class="text-sm font-medium">En pause</span>
                        </div>
                        <span class="text-sm text-gray-600">{{campaigns.filter(c => c.status === 'paused').length
                            }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <div class="w-4 h-4 bg-gray-500 rounded-full"></div>
                            <span class="text-sm font-medium">Archivées</span>
                        </div>
                        <span class="text-sm text-gray-600">{{campaigns.filter(c => c.status === 'archived').length
                            }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>