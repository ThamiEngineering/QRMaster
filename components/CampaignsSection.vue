<script setup lang="ts">
import type { Database } from '~/types/supabase';

interface Props {
    campaigns: Database['public']['Tables']['campaigns']['Row'][]
    qrcodes: Database['public']['Tables']['qrcodes']['Row'][]
    loadingCampaigns: boolean
    showCreateCampaignModal: boolean
    newCampaignData: {
        name: string
        description: string
        status: 'active' | 'paused' | 'archived'
        start_date: string
        end_date: string
    }
    isCreatingCampaign: boolean
}

interface Emits {
    (e: 'update:showCreateCampaignModal', value: boolean): void
    (e: 'update:newCampaignData', value: Props['newCampaignData']): void
    (e: 'createCampaign'): void
    (e: 'resetCampaignModal'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const getQRCodeCountForCampaign = (campaignId: number) => {
    return props.qrcodes.filter(qr => qr.campaign_id === campaignId).length
}

const handleCreateCampaign = () => {
    emit('createCampaign')
}

const resetCampaignModal = () => {
    emit('resetCampaignModal')
}
</script>

<template>
    <div>
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-gray-900">Campagnes</h1>
            <button @click="$emit('update:showCreateCampaignModal', true)"
                class="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-6 py-3 rounded-lg font-medium flex items-center gap-2">
                <Icon name="heroicons:plus" class="w-5 h-5" />
                Nouvelle campagne
            </button>
        </div>

        <div v-if="loadingCampaigns" class="text-center text-gray-500">
            Chargement des campagnes...
        </div>

        <div v-else-if="campaigns.length === 0" class="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Icon name="heroicons:megaphone" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune campagne créée</h3>
            <p class="text-gray-600 mb-6">Créez votre première campagne pour organiser vos QR codes</p>
            <button @click="$emit('update:showCreateCampaignModal', true)"
                class="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-6 py-3 rounded-lg font-medium">
                Créer ma première campagne
            </button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="campaign in campaigns" :key="campaign.id"
                class="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                        <h3 class="font-bold text-lg text-gray-900">{{ campaign.name }}</h3>
                        <p v-if="campaign.description" class="text-sm text-gray-500 mt-1">{{
                            campaign.description }}</p>
                    </div>
                    <span class="text-xs font-semibold px-2.5 py-1 rounded-full" :class="{
                        'bg-green-100 text-green-800': campaign.status === 'active',
                        'bg-yellow-100 text-yellow-800': campaign.status === 'paused',
                        'bg-gray-100 text-gray-800': campaign.status === 'archived'
                    }">
                        <span v-if="campaign.status === 'active'">Active</span>
                        <span v-else-if="campaign.status === 'paused'">En pause</span>
                        <span v-else>Archivée</span>
                    </span>
                </div>

                <div class="space-y-2 text-sm text-gray-600 mb-4">
                    <div v-if="campaign.start_date" class="flex items-center gap-2">
                        <Icon name="heroicons:calendar" class="w-4 h-4" />
                        Début: {{ new Date(campaign.start_date).toLocaleDateString() }}
                    </div>
                    <div v-if="campaign.end_date" class="flex items-center gap-2">
                        <Icon name="heroicons:calendar" class="w-4 h-4" />
                        Fin: {{ new Date(campaign.end_date).toLocaleDateString() }}
                    </div>
                    <div class="flex items-center gap-2">
                        <Icon name="heroicons:qr-code" class="w-4 h-4" />
                        {{ getQRCodeCountForCampaign(campaign.id) }} QR codes
                    </div>
                </div>

                <div class="flex gap-2">
                    <button
                        class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                        <Icon name="heroicons:chart-bar" class="w-4 h-4" />
                        Analytics
                    </button>
                    <button
                        class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                        <Icon name="heroicons:pencil" class="w-4 h-4" />
                        Modifier
                    </button>
                </div>
            </div>
        </div>

        <UModal :model-value="showCreateCampaignModal"
            @update:model-value="$emit('update:showCreateCampaignModal', $event)" :ui="{ wrapper: 'z-50' }">
            <template #header>
                <div class="text-xl font-bold text-gray-900">Créer une campagne</div>
            </template>

            <template #body>
                <form @submit.prevent="handleCreateCampaign" class="space-y-4">
                    <div>
                        <label for="campaign-name" class="block text-sm font-medium text-gray-700 mb-1">
                            Nom de la campagne
                        </label>
                        <UInput id="campaign-name" :model-value="newCampaignData.name"
                            @update:model-value="$emit('update:newCampaignData', { ...newCampaignData, name: $event })"
                            placeholder="Ma campagne marketing" required />
                    </div>

                    <div>
                        <label for="campaign-description" class="block text-sm font-medium text-gray-700 mb-1">
                            Description (optionnel)
                        </label>
                        <UTextarea id="campaign-description" :model-value="newCampaignData.description"
                            @update:model-value="$emit('update:newCampaignData', { ...newCampaignData, description: $event })"
                            placeholder="Description de la campagne..." />
                    </div>

                    <div>
                        <label for="campaign-status" class="block text-sm font-medium text-gray-700 mb-1">
                            Statut
                        </label>
                        <USelect id="campaign-status" :model-value="newCampaignData.status"
                            @update:model-value="$emit('update:newCampaignData', { ...newCampaignData, status: $event as 'active' | 'paused' | 'archived' })"
                            :items="[
                                { label: 'Active', value: 'active' },
                                { label: 'En pause', value: 'paused' },
                                { label: 'Archivée', value: 'archived' }
                            ]" />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="campaign-start" class="block text-sm font-medium text-gray-700 mb-1">
                                Date de début (optionnel)
                            </label>
                            <input type="date" id="campaign-start" :value="newCampaignData.start_date"
                                @input="$emit('update:newCampaignData', { ...newCampaignData, start_date: ($event.target as HTMLInputElement)?.value || '' })"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
                        </div>
                        <div>
                            <label for="campaign-end" class="block text-sm font-medium text-gray-700 mb-1">
                                Date de fin (optionnel)
                            </label>
                            <input type="date" id="campaign-end" :value="newCampaignData.end_date"
                                @input="$emit('update:newCampaignData', { ...newCampaignData, end_date: ($event.target as HTMLInputElement)?.value || '' })"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
                        </div>
                    </div>
                </form>
            </template>

            <template #footer>
                <div class="flex justify-end gap-3">
                    <UButton color="neutral" variant="soft" label="Annuler" @click="resetCampaignModal" />
                    <UButton color="primary" :loading="isCreatingCampaign" :disabled="isCreatingCampaign"
                        :label="isCreatingCampaign ? 'Création...' : 'Créer'" @click="handleCreateCampaign" />
                </div>
            </template>
        </UModal>
    </div>
</template>