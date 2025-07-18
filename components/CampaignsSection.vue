<script setup lang="ts">
import CampaignAnalyticsModal from '~/components/Modal/CampaignAnalyticsModal.vue';
import CampaignDeleteModal from '~/components/Modal/CampaignDeleteModal.vue';
import CampaignEditModal from '~/components/Modal/CampaignEditModal.vue';
import type { Database } from '~/types/supabase';

interface Props {
    campaigns: Database['public']['Tables']['campaigns']['Row'][]
    qrcodes: Database['public']['Tables']['qrcodes']['Row'][]
    loadingCampaigns: boolean
}

interface EditForm {
    name: string
    description: string | null
    status: 'active' | 'paused' | 'archived'
    start_date: string | null
    end_date: string | null
}

interface Emits {
    (e: 'editCampaign', campaignId: number, form: EditForm): void
    (e: 'deleteCampaign', campaignId: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isEditModalOpen = ref(false)
const selectedCampaign = ref<Database['public']['Tables']['campaigns']['Row'] | null>(null)
const isEditing = ref(false)

const isDeleteModalOpen = ref(false)
const selectedCampaignForDelete = ref<Database['public']['Tables']['campaigns']['Row'] | null>(null)
const isDeleting = ref(false)

const isAnalyticsModalOpen = ref(false)
const selectedCampaignForAnalytics = ref<Database['public']['Tables']['campaigns']['Row'] | null>(null)

const getQRCodeCountForCampaign = (campaignId: number) => {
    return props.qrcodes.filter(qr => qr.campaign_id === campaignId).length
}

const openEditModal = (campaign: Database['public']['Tables']['campaigns']['Row']) => {
    selectedCampaign.value = campaign
    isEditModalOpen.value = true
}

const handleEditCampaign = async (form: EditForm) => {
    if (!selectedCampaign.value) return

    isEditing.value = true
    try {
        emit('editCampaign', selectedCampaign.value.id, form)
        isEditModalOpen.value = false
    } finally {
        isEditing.value = false
    }
}

const openDeleteModal = (campaign: Database['public']['Tables']['campaigns']['Row']) => {
    selectedCampaignForDelete.value = campaign
    isDeleteModalOpen.value = true
}

const handleDeleteCampaign = async () => {
    if (!selectedCampaignForDelete.value) return

    isDeleting.value = true
    try {
        emit('deleteCampaign', selectedCampaignForDelete.value.id)
        isDeleteModalOpen.value = false
    } finally {
        isDeleting.value = false
    }
}

const openAnalyticsModal = (campaign: Database['public']['Tables']['campaigns']['Row']) => {
    selectedCampaignForAnalytics.value = campaign
    isAnalyticsModalOpen.value = true
}
</script>

<template>
    <div>
        <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900">Campagnes</h1>
        </div>

        <div v-if="loadingCampaigns" class="text-center text-gray-500">
            Chargement des campagnes...
        </div>

        <div v-else-if="campaigns.length === 0" class="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Icon name="heroicons:megaphone" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune campagne créée</h3>
            <p class="text-gray-600 mb-6">Créez votre première campagne pour organiser vos QR codes</p>
            <p class="text-sm text-gray-500">Utilisez le bouton "Nouvelle campagne" en haut de la page</p>
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
                    <button @click="openAnalyticsModal(campaign)"
                        class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                        <Icon name="heroicons:chart-bar" class="w-4 h-4" />
                        Analytics
                    </button>
                    <button @click="openEditModal(campaign)"
                        class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                        <Icon name="heroicons:pencil" class="w-4 h-4" />
                        Modifier
                    </button>
                    <button @click="openDeleteModal(campaign)"
                        class="flex-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                        <Icon name="heroicons:trash" class="w-4 h-4" />
                        Supprimer
                    </button>
                </div>
            </div>
        </div>

        <CampaignEditModal v-model:is-open="isEditModalOpen" :selected-campaign="selectedCampaign"
            :is-editing="isEditing" @edit="handleEditCampaign" />

        <CampaignDeleteModal v-model:is-open="isDeleteModalOpen" :selected-campaign="selectedCampaignForDelete"
            :is-deleting="isDeleting" @confirm-delete="handleDeleteCampaign" />

        <CampaignAnalyticsModal v-model:is-open="isAnalyticsModalOpen" :selected-campaign="selectedCampaignForAnalytics"
            :qrcodes="qrcodes" />
    </div>
</template>